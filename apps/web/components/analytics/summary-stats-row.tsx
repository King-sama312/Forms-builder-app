"use client";

import { StatCard } from "./stat-card";

interface SummaryStat {
  label: string;
  value: string | number;
  icon?: string;
}

interface SummaryStatsRowProps {
  stats: SummaryStat[];
}

export function SummaryStatsRow({ stats }: SummaryStatsRowProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {stats.map((stat) => (
        <StatCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
        />
      ))}
    </div>
  );
}
