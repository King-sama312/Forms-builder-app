"use client";

import { FieldDistributionChart } from "./field-distribution-chart";

interface DistributionValue {
  value: string;
  count: number;
}

interface FieldDistribution {
  fieldId: string;
  fieldLabel: string;
  values: DistributionValue[];
}

interface FieldDistributionsPanelProps {
  distributions: FieldDistribution[];
}

export function FieldDistributionsPanel({
  distributions,
}: FieldDistributionsPanelProps) {
  if (!distributions || distributions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-500">
        No categorical fields with data
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 h-full overflow-y-auto">
      {distributions.map((dist) => (
        <div
          key={dist.fieldId}
          className="border border-[#808080] bg-white shrink-0"
          style={{ height: 200 }}
        >
          <FieldDistributionChart
            fieldLabel={dist.fieldLabel}
            data={dist.values}
          />
        </div>
      ))}
    </div>
  );
}
