"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { WIN98_PIE_COLORS, chartDefaults } from "~/lib/analytics-theme";

interface DistributionValue {
  value: string;
  count: number;
}

interface FieldDistributionChartProps {
  fieldLabel: string;
  data: DistributionValue[];
}

export function FieldDistributionChart({
  fieldLabel,
  data,
}: FieldDistributionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-500">
        No data for &ldquo;{fieldLabel}&rdquo;
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="flex flex-col h-full">
      <p className="text-xs font-semibold text-center text-[#000080] truncate px-1 py-0.5 border-b border-[#808080]">
        {fieldLabel}
      </p>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="value"
              cx="50%"
              cy="50%"
              outerRadius={60}
              innerRadius={20}
              paddingAngle={2}
              stroke="#404040"
              strokeWidth={1}
              label={({ name, percent }) =>
                `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
              }
              labelLine={false}
            >
              {data.map((_, idx) => (
                <Cell
                  key={idx}
                  fill={WIN98_PIE_COLORS[idx % WIN98_PIE_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              {...chartDefaults.tooltip}
              formatter={(value) => {
                const num = Number(value) || 0;
                return [`${num} (${((num / total) * 100).toFixed(0)}%)`, "Count"];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
