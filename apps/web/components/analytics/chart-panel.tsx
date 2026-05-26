"use client";

interface ChartPanelProps {
  title: string;
  children: React.ReactNode;
}

export function ChartPanel({ title, children }: ChartPanelProps) {
  return (
    <div className="flex flex-col w-full h-full border-2 border-t-[#ffffff] border-l-[#ffffff] border-r-[#404040] border-b-[#404040] bg-[#c0c0c0]">
      <div className="bg-[#000080] text-white text-xs font-bold px-2 py-1 flex items-center">
        <span className="truncate">{title}</span>
      </div>
      <div className="flex-1 p-2 min-h-0">{children}</div>
    </div>
  );
}
