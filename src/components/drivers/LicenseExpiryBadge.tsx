"use client";

import { getLicenseExpiryStatus, getLicenseExpiryDays } from "@/lib/utils";

interface LicenseExpiryBadgeProps {
  expiryDate: Date | string;
}

export function LicenseExpiryBadge({ expiryDate }: LicenseExpiryBadgeProps) {
  const status = getLicenseExpiryStatus(expiryDate);
  const days   = getLicenseExpiryDays(expiryDate);
  const date   = new Date(expiryDate).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });

  const styles = {
    VALID:          "bg-emerald-50 text-emerald-700 border-emerald-200",
    EXPIRING_SOON:  "bg-amber-50 text-amber-700 border-amber-200",
    EXPIRED:        "bg-red-50 text-red-700 border-red-200",
  };

  const labels = {
    VALID:         `Valid until ${date}`,
    EXPIRING_SOON: `Expires in ${days} days (${date})`,
    EXPIRED:       `Expired on ${date}`,
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
