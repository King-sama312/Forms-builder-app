"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { WIN98_CHART_COLORS, chartDefaults } from "~/lib/analytics-theme";

interface TimelinePoint {
  date: string;
  count: number;
}

interface SubmissionTimelineChartProps {
  data: TimelinePoint[];
}

export function SubmissionTimelineChart({ data }: SubmissionTimelineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-500">
        No submission activity yet
      </div>
    );
  }

  const formatted = data.map((pt) => ({
    ...pt,
    label: pt.date,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={formatted} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="submissionGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={WIN98_CHART_COLORS.navy} stopOpacity={0.3} />
            <stop offset="95%" stopColor={WIN98_CHART_COLORS.navy} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid {...chartDefaults.grid} />
        <XAxis
          dataKey="label"
          {...chartDefaults.axis}
          tick={{ ...chartDefaults.axis.tick, fontSize: 10 }}
          angle={-20}
          textAnchor="end"
          height={40}
        />
        <YAxis {...chartDefaults.axis} allowDecimals={false} />
        <Tooltip {...chartDefaults.tooltip} />
        <Area
          type="monotone"
          dataKey="count"
          stroke={WIN98_CHART_COLORS.navy}
          strokeWidth={2}
          fill="url(#submissionGradient)"
          dot={{ r: 3, fill: WIN98_CHART_COLORS.navy }}
          activeDot={{ r: 5, fill: WIN98_CHART_COLORS.navy }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
