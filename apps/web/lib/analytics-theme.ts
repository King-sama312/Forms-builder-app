export const WIN98_CHART_COLORS = {
  navy: "#000080",
  silver: "#c0c0c0",
  gray: "#808080",
  darkGray: "#404040",
  white: "#ffffff",
  teal: "#008080",
  maroon: "#800000",
  green: "#008000",
  purple: "#400080",
  olive: "#808000",
};

export const WIN98_PIE_COLORS = [
  "#000080",
  "#008080",
  "#808080",
  "#400080",
  "#800000",
  "#008000",
  "#808000",
  "#c0c0c0",
];

export const chartDefaults = {
  grid: { stroke: WIN98_CHART_COLORS.gray, strokeDasharray: "3 3" },
  axis: {
    fontSize: 11,
    fontFamily: '"MS Sans Serif", "Segoe UI", sans-serif',
    tick: { fill: "#000" },
  },
  tooltip: {
    contentStyle: {
      background: WIN98_CHART_COLORS.silver,
      border: "2px outset #ffffff",
      borderRadius: 0,
      fontSize: 11,
      fontFamily: '"MS Sans Serif", "Segoe UI", sans-serif',
    } as React.CSSProperties,
    itemStyle: { color: "#000", fontSize: 11 } as React.CSSProperties,
    labelStyle: {
      color: WIN98_CHART_COLORS.navy,
      fontWeight: "bold" as const,
      fontSize: 11,
    } as React.CSSProperties,
  },
};
