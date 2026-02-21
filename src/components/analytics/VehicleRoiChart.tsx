"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import type { VehicleRoiData } from "@/types";

export function VehicleRoiChart({ data }: { data: VehicleRoiData[] }) {
  const chartData = data.map((d) => ({ ...d, roiPercent: Number((d.roi * 100).toFixed(2)) }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="vehicleName" tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
          tickFormatter={(v: string) => v.split(" ").slice(-1)[0]} />
        <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} unit="%" />
        <ReferenceLine y={0} stroke="#e5e7eb" />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
          formatter={(v: number) => [`${v}%`, "ROI"]} />
        <Bar dataKey="roiPercent" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.roiPercent >= 0 ? "#10b981" : "#ef4444"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
