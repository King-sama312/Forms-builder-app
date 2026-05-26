"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { WIN98_CHART_COLORS, chartDefaults } from "~/lib/analytics-theme";

interface FormRanked {
  formId: string;
  title: string;
  submissionCount: number;
}

interface FormsLeaderboardChartProps {
  data: FormRanked[];
}

export function FormsLeaderboardChart({ data }: FormsLeaderboardChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-500">
        No submissions across any form yet
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => b.submissionCount - a.submissionCount);

  const formatted = sorted.map((f) => ({
    name: f.title.length > 20 ? f.title.slice(0, 20) + "..." : f.title,
    submissions: f.submissionCount,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={formatted}
        layout="vertical"
        margin={{ top: 10, right: 30, left: 60, bottom: 10 }}
      >
        <CartesianGrid {...chartDefaults.grid} />
        <XAxis type="number" {...chartDefaults.axis} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="name"
          {...chartDefaults.axis}
          tick={{ ...chartDefaults.axis.tick, fontSize: 10 }}
          width={80}
        />
        <Tooltip {...chartDefaults.tooltip} />
        <Bar
          dataKey="submissions"
          fill={WIN98_CHART_COLORS.navy}
          radius={[0, 2, 2, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
