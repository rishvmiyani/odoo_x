## **Table of Content**

- [Solution](#Solution)
- [Tech Stack](#tech-stack)
- [Roles](#Roles)
- [Setup Guide](#setup-guide)
- [Folder Structure](#folder-structure)
- [Future Scope](#future-scope)

demo video: - https://youtu.be/lXcF5c3WZ-8?si=4cXr1DJUOPfkvwxi

🚀 Live Demo Credentials
Role	Email	Password

| Role                                  | Email                   | Password       |
| ------------------------------------- | ----------------------- | -------------- |
| Fleet Manager (Full Access)           | manager@fleetflow.ai    | FleetFlow@2025 |
| Dispatcher (Trips/Vehicles)           | dispatcher@fleetflow.ai | FleetFlow@2025 |
| Safety Officer (Drivers/Trips)        | safety@fleetflow.ai     | FleetFlow@2025 |
| Financial Analyst (Analytics/Exports) | analyst@fleetflow.ai    | FleetFlow@2025 |

Demo Flow: Login → Dashboard KPIs → Create Trip (with capacity/license checks) → View AI Predictions → Export PDF Report.

📱 Key Features – Enterprise-Ready
Module	Core Features	AI Integration
Command Center	Live KPIs, donut/line charts, recent trips	AI alerts panel
Vehicles	CRUD + status lifecycle, capacity checks	Maintenance predictions
Trips	Multi-step dispatch, transaction safety	Safety scoring triggers
Drivers	License expiry blocking, performance metrics	Real-time safety recalc
Maintenance	Service logs + shop status toggle	Predictive alerts
Fuel	Auto-total calc + history	Anomaly warnings
Analytics	4 Recharts + filters/exports	Cost predictions + ROI
Auth	4 roles, middleware protection	Role-specific dashboards

🚀 Quickstart (5 Minutes to Demo)
Clone & Install

bash
git clone <your-repo> fleetflow-ai
cd fleetflow-ai
npm install
Database Setup (Local PostgreSQL)

bash
cp .env.example .env.local
# Edit DATABASE_URL with your postgres://... creds
npm run db:push
npm run db:seed  # Realistic data: 8 vehicles, 20 trips, etc.
Run Development

bash
npm run dev
Open http://localhost:3000 → Login with demo creds!

Production Build

bash
npm run build
npm start
Docker Support: docker-compose up.

✅ Complete End-to-End: No mocks – full CRUD + business logic + transactions
✅ AI Differentiators: 4 custom engines (statistical + rule-based)
✅ Production Polish: RBAC, optimistic UI, error boundaries, exports
✅ Scalable Arch: Singleton Prisma, SWR caching, strict TS
✅ Hackathon-Ready: Seed data, multi-role demo, 1-click deploy
✅ Zero Fluff: No emojis, no any, no console.logs

## **FleetFlow AI**

FleetFlow AI is a centralized, rule-based digital fleet management platform built to replace inefficient manual logbooks with a scalable, AI-powered logistics command center. The system optimizes the complete lifecycle of a delivery fleet — from vehicle registry and trip dispatching to predictive maintenance, fuel anomaly detection, and financial performance tracking.

Designed for a competitive hackathon environment, FleetFlow AI goes beyond CRUD operations by embedding rule-based AI engines that enhance operational decision-making, improve driver safety compliance, and provide real-time business intelligence. Every layer of the application is production-ready, modular, and built using modern full-stack best practices.

## **Core Objectives**
- Replace manual fleet logbooks with a centralized digital hub

- Optimize vehicle lifecycle and operational cost tracking

- Monitor and improve driver safety performance

- Provide AI-driven predictive insights

- Deliver enterprise-grade analytics and reporting

## **Solution**

FleetFlow AI replaces inefficient manual fleet logbooks with a centralized, rule-based digital platform that intelligently manages vehicles, drivers, trips, maintenance, fuel expenses, and financial performance in one unified system.

The platform enforces strict business rules to prevent operational errors — such as overloading vehicles, assigning expired licenses, or dispatching unavailable assets — ensuring data accuracy and accountability. Real-time dashboards provide complete visibility into fleet utilization, maintenance status, and cargo movement.

What differentiates FleetFlow AI is its built-in AI engines. It predicts upcoming maintenance needs, calculates driver safety scores, detects fuel anomalies using statistical analysis, and forecasts operational costs using trend-based regression. These insights transform fleet management from reactive tracking to proactive decision-making.

## **Tech Stack**

### Frontend

  - Next.js 14 (App Router)
  
  - TypeScript (strict mode)
  
  - Tailwind CSS
  
  - shadcn/ui
  
  - Lucide React (icons only)
  
  - React Hook Form
  
  - Zod validation
  
  - Recharts
  
  - SWR (server state management)
  
  - next-themes (dark mode)

### Backend

  - NextAuth.js v5 (JWT strategy + RBAC)
  
  - PostgreSQL
  
  - Prisma ORM
  
  - REST API via App Router route handlers

### AI & Business Logic

  - Rule-based Predictive Maintenance Engine
  
  - Driver Safety Scoring Algorithm
  
  - Fuel Anomaly Detection (Z-score statistical model)
  
  - Cost Prediction using Linear Regression

### Export & Reporting

  - jsPDF + jspdf-autotable
  
  - papaparse (CSV export)

### Tooling

  - ESLint
  
  - Prettier
  
  - Prisma Studio
  
  - tsx (for seed script)

## **Folder Structure**

```bash
fleetflow-ai/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── public/
│   └── logo.svg
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   ├── api/
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── dashboard/
│   │   ├── vehicles/
│   │   ├── trips/
│   │   ├── drivers/
│   │   ├── maintenance/
│   │   ├── analytics/
│   │   └── shared/
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── validations/
│   │   ├── ai/
│   │   ├── export/
│   │   └── utils.ts
│   ├── hooks/
│   ├── types/
│   └── middleware.ts
├── .env.local
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## **Roles**

- Fleet Managers: Oversee vehicle health, asset lifecycle, and scheduling.
  
- Dispatchers: Create trips, assign drivers, and validate cargo loads.
  
- Safety Officers: Monitor driver compliance, license expirations, and safety scores.
  
- Financial Analysts: Audit fuel spend, maintenance ROI, and operational costs


## **Setup guide**

1. Clone the Repository
```bash
    git clone https://github.com/your-username/fleetflow-ai.git
    
    cd fleetflow-ai
```
2. Install Dependencies
```bash
    npm install
```
3. Configure Environment Variables

  Create a .env.local file using .env.example:
```bash
  DATABASE_URL="postgresql://postgres:password@localhost:5432/fleetflow"
  
  NEXTAUTH_SECRET="your-secret-key-here"
  
  NEXTAUTH_URL="http://localhost:3000"
```
4. Setup Database

- Push Prisma schema:
```bash
  npm run db:push
```
- Seed database with realistic data:
```bash
  npm run db:seed
```
- Open Prisma Studio (optional):
```bash
  npm run db:studio
```
5. Run Development Server
```bash
  npm run dev
```
Application will run at:
```bash
  http://localhost:3000
```
## **Demo Login Credentials**

All seeded users use the password:

FleetFlow@2025

- Fleet Manager	fleet.manager@fleetflow.ai

- Dispatcher	dispatcher@fleetflow.ai

- Safety Officer	safety@fleetflow.ai

- Financial Analyst	finance@fleetflow.ai

## **Core Modules**

- Command Center
    Live KPI dashboard with:
    
    - Fleet utilization
    
    - Maintenance alerts
    
    - Cargo pipeline
    
    - Activity charts

- Vehicle Registry

    - Capacity-aware dispatch eligibility
    
    - Lifecycle tracking
    
    - Maintenance & fuel aggregation

- Trip Dispatcher

    - Multi-step trip creation
    
    - Capacity validation (client + server)
    
    - Transaction-based dispatch logic

- Maintenance Logs

    - Auto status update to IN_SHOP
    
    - Predictive alerts

- Fuel & Expenses

    - Real-time cost aggregation
    
    - Per-vehicle operational totals

- Driver Profiles

    - License expiry monitoring
    
    - Safety score visualization
    
    - Assignment blocking logic

- Analytics & Reports

    - Fuel efficiency analysis
    
    - ROI tracking
    
    - Monthly cost breakdown
    
    - PDF & CSV export
 
## **Future Scope**

FleetFlow AI is designed with a modular and extensible architecture, allowing it to evolve into a full enterprise-grade logistics intelligence platform. Future enhancements can include:

1. Real-Time GPS & Telematics Integration

  - Live vehicle tracking
  
  - Route optimization
  
  - Geo-fencing alerts
  
  - Real-time speed and driver behavior monitoring

2. IoT-Based Predictive Maintenance

  - Direct integration with vehicle sensors
  
  - Real-time engine diagnostics
  
  - Automatic maintenance ticket generation
  
  - Breakdown probability prediction using advanced ML models

3. Advanced AI & Machine Learning

  - Demand forecasting for fleet allocation
  
  - Dynamic pricing and revenue optimization
  
  - Risk-based driver scoring using behavioral analytics
  
  - Predictive fuel consumption modeling

4. Mobile Application

  - Driver mobile app for trip updates
  
  - Offline trip logging
  
  - Real-time document uploads (invoices, fuel bills)
  
  - Push notifications for assignments and alerts

5. Multi-Tenant SaaS Model

  - Support for multiple companies
  
  - Subscription-based billing
  
  - Organization-level isolation
  
  - Custom branding and configuration

6. ERP & Accounting Integration

  - Integration with accounting software
  
  - Automated invoice generation
  
  - GST/tax reporting
  
  - Vendor payment tracking

7. Compliance & Regulatory Automation

  - Automated compliance reminders
  
  - Digital document vault
  
  - Audit-ready reporting system
