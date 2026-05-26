"use client";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
}

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="border-2 border-t-[#ffffff] border-l-[#ffffff] border-r-[#404040] border-b-[#404040] bg-[#c0c0c0] px-3 py-2 min-w-[120px] flex items-center gap-2">
      {icon && <span className="text-lg">{icon}</span>}
      <div className="flex flex-col">
        <span className="text-[10px] text-gray-600 uppercase">{label}</span>
        <span className="text-lg font-bold text-[#000080]" style={{ fontFamily: '"MS Sans Serif", "Segoe UI", sans-serif' }}>
          {value}
        </span>
      </div>
    </div>
  );
}
