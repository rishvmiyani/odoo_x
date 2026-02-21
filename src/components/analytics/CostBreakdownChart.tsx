"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { CostBreakdownData } from "@/types";

export function CostBreakdownChart({ data }: { data: CostBreakdownData[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -5, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
          tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
          formatter={(v: number, n: string) => [`₹${v.toLocaleString("en-IN")}`, n === "fuelCost" ? "Fuel" : "Maintenance"]} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }}
          formatter={(v) => v === "fuelCost" ? "Fuel Cost" : "Maintenance Cost"} />
        <Bar dataKey="fuelCost"        stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
        <Bar dataKey="maintenanceCost" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
