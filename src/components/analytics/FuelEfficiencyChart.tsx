"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { FuelEfficiencyData } from "@/types";

export function FuelEfficiencyChart({ data }: { data: FuelEfficiencyData[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="vehicleName" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={0}
          tickFormatter={(v: string) => v.split(" ").slice(-1)[0]} />
        <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} unit=" km/L" />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
          formatter={(v: number) => [`${v} km/L`, "Efficiency"]} />
        <Bar dataKey="kmPerLiter" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.kmPerLiter >= 10 ? "#10b981" : entry.kmPerLiter >= 7 ? "#f59e0b" : "#ef4444"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
