import "dotenv/config";

import { PrismaPg }     from "@prisma/adapter-pg";
import { PrismaClient, VehicleType, TripStatus } from "@prisma/client";
import bcrypt           from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding FleetFlow AI database...\n");

  // ── Users ──────────────────────────────────────────────
  const password = await bcrypt.hash("FleetFlow@2025", 12);

const users = await Promise.all([
  prisma.user.upsert({
    where:  { email: "manager@fleetflow.com" },
    update: {},
    create: { email: "manager@fleetflow.com",  name: "Aryan Shah",  passwordHash: password, role: "FLEET_MANAGER"    },
  }),
  prisma.user.upsert({
    where:  { email: "dispatch@fleetflow.com" },
    update: {},
    create: { email: "dispatch@fleetflow.com", name: "Priya Patel", passwordHash: password, role: "DISPATCHER"        },
  }),
  prisma.user.upsert({
    where:  { email: "safety@fleetflow.com" },
    update: {},
    create: { email: "safety@fleetflow.com",   name: "Rohan Mehta", passwordHash: password, role: "SAFETY_OFFICER"    },
  }),
  prisma.user.upsert({
    where:  { email: "finance@fleetflow.com" },
    update: {},
    create: { email: "finance@fleetflow.com",  name: "Sneha Desai", passwordHash: password, role: "FINANCIAL_ANALYST" },
  }),
]);

  console.log(`✅ ${users.length} users created`);

  // ── Vehicles ───────────────────────────────────────────
  const vehicleData = [
    { name: "Truck Alpha",  model: "Tata LPT 1613",     licensePlate: "GJ01AA1001", type: "TRUCK" as VehicleType, maxCapacity: 8000,  currentOdometer: 48000, region: "North",   acquisitionCost: 1800000 },
    { name: "Truck Beta",   model: "Ashok Leyland 1616", licensePlate: "GJ01AB2002", type: "TRUCK" as VehicleType, maxCapacity: 10000, currentOdometer: 72500, region: "South",   acquisitionCost: 2100000 },
    { name: "Van Gamma",    model: "TATA Ace Gold",      licensePlate: "GJ05CD3003", type: "VAN"   as VehicleType, maxCapacity: 1500,  currentOdometer: 23000, region: "East",    acquisitionCost: 650000  },
    { name: "Van Delta",    model: "Mahindra Supro",     licensePlate: "GJ05CE4004", type: "VAN"   as VehicleType, maxCapacity: 1200,  currentOdometer: 15000, region: "West",    acquisitionCost: 580000  },
    { name: "Bike Epsilon", model: "Hero Splendor+",     licensePlate: "GJ06EF5005", type: "BIKE"  as VehicleType, maxCapacity: 50,    currentOdometer: 9500,  region: "Central", acquisitionCost: 85000   },
    { name: "Truck Zeta",   model: "Eicher Pro 3015",    licensePlate: "GJ01GH6006", type: "TRUCK" as VehicleType, maxCapacity: 6000,  currentOdometer: 61000, region: "North",   acquisitionCost: 1500000 },
  ];

  const vehicles = await Promise.all(
    vehicleData.map((v) =>
      prisma.vehicle.upsert({
        where:  { licensePlate: v.licensePlate },
        update: {},
        create: { ...v, acquisitionDate: new Date("2023-01-15"), status: "AVAILABLE" },
      })
    )
  );
  console.log(`✅ ${vehicles.length} vehicles created`);

  // ── Drivers ────────────────────────────────────────────
  const driverData = [
    { name: "Ramesh Patel", email: "ramesh@fleet.com", phone: "9876543210", licenseNumber: "GJ0120190023456", licenseCategory: ["TRUCK","VAN"],          licenseExpiry: new Date("2027-06-30"), safetyScore: 88.5 },
    { name: "Suresh Kumar", email: "suresh@fleet.com", phone: "9876543211", licenseNumber: "GJ0120200034567", licenseCategory: ["TRUCK"],                 licenseExpiry: new Date("2026-03-15"), safetyScore: 72.0 },
    { name: "Mahesh Shah",  email: "mahesh@fleet.com", phone: "9876543212", licenseNumber: "GJ0520210045678", licenseCategory: ["VAN","BIKE"],            licenseExpiry: new Date("2028-09-20"), safetyScore: 94.2 },
    { name: "Dinesh Yadav", email: "dinesh@fleet.com", phone: "9876543213", licenseNumber: "GJ0520220056789", licenseCategory: ["VAN"],                   licenseExpiry: new Date("2025-12-31"), safetyScore: 61.5 },
    { name: "Rajesh Verma", email: "rajesh@fleet.com", phone: "9876543214", licenseNumber: "GJ0620230067890", licenseCategory: ["BIKE"],                  licenseExpiry: new Date("2029-01-10"), safetyScore: 91.0 },
    { name: "Naresh Joshi", email: "naresh@fleet.com", phone: "9876543215", licenseNumber: "GJ0120180078901", licenseCategory: ["TRUCK","VAN","BIKE"],     licenseExpiry: new Date("2026-08-25"), safetyScore: 78.3 },
  ];

  const drivers = await Promise.all(
    driverData.map((d) =>
      prisma.driver.upsert({
        where:  { email: d.email },
        update: {},
        create: { ...d, status: "OFF_DUTY", totalTrips: 0, completedTrips: 0 },
      })
    )
  );
  console.log(`✅ ${drivers.length} drivers created`);

  // ── Maintenance Logs ───────────────────────────────────
  await prisma.maintenanceLog.createMany({
    skipDuplicates: true,
    data: [
      { vehicleId: vehicles[0].id, type: "OIL_CHANGE",    description: "Changed engine oil 15W-40, replaced oil filter",   cost: 3500,  serviceDate: new Date("2025-11-10"), isResolved: true,  nextServiceKm: 53000, vendorName: "Tata Service Center",  invoiceRef: "INV-2025-001" },
      { vehicleId: vehicles[1].id, type: "BRAKE_SERVICE", description: "Replaced front brake pads and adjusted rear drums", cost: 8500,  serviceDate: new Date("2025-12-05"), isResolved: true,  vendorName: "Ashok Motors Surat",    invoiceRef: "INV-2025-002" },
      { vehicleId: vehicles[2].id, type: "TIRE_ROTATION", description: "Rotated all 4 tires, checked pressure",            cost: 1200,  serviceDate: new Date("2026-01-15"), isResolved: true,  vendorName: "Rapid Tyres Surat"                              },
      { vehicleId: vehicles[3].id, type: "INSPECTION",    description: "Annual fitness inspection — passed with remarks",   cost: 2000,  serviceDate: new Date("2026-02-01"), isResolved: false, vendorName: "RTO Surat"                                      },
      { vehicleId: vehicles[5].id, type: "ENGINE_REPAIR", description: "Injector cleaning, turbocharger checkup",          cost: 15000, serviceDate: new Date("2026-02-10"), isResolved: false, vendorName: "Eicher Service Hub"                             },
    ],
  });

  // Set IN_SHOP for vehicles with unresolved maintenance
  await prisma.vehicle.update({ where: { id: vehicles[3].id }, data: { status: "IN_SHOP" } });
  await prisma.vehicle.update({ where: { id: vehicles[5].id }, data: { status: "IN_SHOP" } });
  console.log("✅ Maintenance logs created");

  // ── Completed Trips ────────────────────────────────────
  const tripSeed = [
    { vi: 0, di: 0, origin: "Surat Warehouse, Ring Road",   dest: "Ahmedabad Distribution Hub", kg: 5000, rev: 25000, dist: 265 },
    { vi: 1, di: 1, origin: "Surat Port, Hazira",           dest: "Mumbai APMC, Vashi",          kg: 8000, rev: 42000, dist: 285 },
    { vi: 2, di: 2, origin: "Surat Textile Market",         dest: "Navsari Depot",               kg: 900,  rev: 4500,  dist: 36  },
    { vi: 4, di: 4, origin: "Surat City Office",            dest: "Olpad Branch",                kg: 30,   rev: 800,   dist: 28  },
    { vi: 0, di: 5, origin: "Kamrej Industrial Area",       dest: "Vadodara Cold Storage",       kg: 6500, rev: 32000, dist: 112 },
  ];

  for (const t of tripSeed) {
    const vehicle     = vehicles[t.vi];
    const driver      = drivers[t.di];
    const tripCode    = `TRP-${Date.now()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
    const scheduledAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);

    await prisma.trip.create({
      data: {
        tripCode,
        vehicleId:          vehicle.id,
        driverId:           driver.id,
        originAddress:      t.origin,
        destinationAddress: t.dest,
        cargoWeight:        t.kg,
        scheduledAt,
        startOdometer:      vehicle.currentOdometer,
        endOdometer:        vehicle.currentOdometer + t.dist,
        distanceKm:         t.dist,
        revenue:            t.rev,
        status:             "COMPLETED" as TripStatus,
        completedAt:        new Date(scheduledAt.getTime() + t.dist * 3 * 60 * 1000),
      },
    });

    await prisma.driver.update({
      where: { id: driver.id },
      data:  { totalTrips: { increment: 1 }, completedTrips: { increment: 1 } },
    });

    await prisma.vehicle.update({
      where: { id: vehicle.id },
      data:  { currentOdometer: { increment: t.dist } },
    });
  }
  console.log("✅ Sample trips created");

  // ── Fuel Expenses ──────────────────────────────────────
  const fuelData = [
    { vi: 0, liters: 80,  costPerLiter: 95.50,  odometerAtFuel: 48200, station: "Indian Oil, NH-48, Surat" },
    { vi: 1, liters: 120, costPerLiter: 94.80,  odometerAtFuel: 72800, station: "BPCL Pump, Sachin GIDC"   },
    { vi: 2, liters: 30,  costPerLiter: 93.20,  odometerAtFuel: 23200, station: "HP Petrol Pump, Adajan"   },
    { vi: 0, liters: 75,  costPerLiter: 96.10,  odometerAtFuel: 48500, station: "Indian Oil, NH-48, Surat" },
    { vi: 4, liters: 4.5, costPerLiter: 103.50, odometerAtFuel: 9600,  station: "Reliance Fuel, Vesu"      },
  ];

  await Promise.all(
    fuelData.map((f) =>
      prisma.fuelExpense.create({
        data: {
          vehicleId:      vehicles[f.vi].id,
          fuelDate:       new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000),
          liters:         f.liters,
          costPerLiter:   f.costPerLiter,
          totalCost:      parseFloat((f.liters * f.costPerLiter).toFixed(2)),
          odometerAtFuel: f.odometerAtFuel,
          station:        f.station,
        },
      })
    )
  );
  console.log("✅ Fuel expenses created");

  console.log("\n🎉 Seed complete! Login: manager@fleetflow.com / FleetFlow@2025");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
