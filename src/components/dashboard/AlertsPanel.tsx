"use client";

import { AlertTriangle, Clock, Wrench } from "lucide-react";
import { getLicenseExpiryDays }         from "@/lib/utils";

interface AlertsPanelProps {
  expiringLicenses?: { name: string; licenseExpiry: Date | string }[];
  vehiclesInShop?:   { name: string; licensePlate: string }[];
}

export function AlertsPanel({
  expiringLicenses = [],
  vehiclesInShop   = [],
}: AlertsPanelProps) {
  const hasAlerts = expiringLicenses.length > 0 || vehiclesInShop.length > 0;

  if (!hasAlerts) return (
    <div className="flex items-center gap-2 text-sm text-emerald-600 py-4">
      <AlertTriangle className="h-4 w-4" />
      <span>No active alerts — fleet is healthy!</span>
    </div>
  );

  return (
    <div className="space-y-2">
      {expiringLicenses.map((d) => {
        const days = getLicenseExpiryDays(d.licenseExpiry);
        return (
          <div key={d.name} className="flex items-start gap-2.5 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
            <Clock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-amber-800">{d.name}</p>
              <p className="text-xs text-amber-600">
                {days < 0 ? "License EXPIRED" : `License expires in ${days} days`}
              </p>
            </div>
          </div>
        );
      })}
      {vehiclesInShop.map((v) => (
        <div key={v.licensePlate} className="flex items-start gap-2.5 p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
          <Wrench className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-blue-800">{v.name}</p>
            <p className="text-xs text-blue-600">{v.licensePlate} — Currently in shop</p>
          </div>
        </div>
      ))}
    </div>
  );
}
