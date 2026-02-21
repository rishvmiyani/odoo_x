"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface FleetStatusChartProps {
  data: { status: string; count: number }[];
}

const COLORS: Record<string, string> = {
  AVAILABLE:      "#10b981",
  ON_TRIP:        "#3b82f6",
  IN_SHOP:        "#f59e0b",
  OUT_OF_SERVICE: "#ef4444",
};

export function FleetStatusChart({ data }: FleetStatusChartProps) {
  if (!data || data.length === 0) return (
    <div className="h-48 flex items-center justify-center text-sm text-gray-400">No data</div>
  );

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
          dataKey="count" nameKey="status" paddingAngle={3}>
          {data.map((entry) => (
            <Cell key={entry.status} fill={COLORS[entry.status] ?? "#94a3b8"} />
          ))}
        </Pie>
        <Tooltip formatter={(value, name) => [value, String(name).replace("_", " ")]} />
        <Legend formatter={(v) => v.replace("_", " ")} />
      </PieChart>
    </ResponsiveContainer>
  );
}
