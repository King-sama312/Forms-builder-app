export interface WallpaperPreset {
  label: string;
  cssValue: string;
  backgroundSize: string;
}

export const wallpaperPresets: Record<string, WallpaperPreset> = {
  teal: {
    label: "Teal (Default)",
    cssValue:
      "#008080 radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 1px, transparent 1px)",
    backgroundSize: "4px 4px",
  },
  "silver-cloud": {
    label: "Silver Cloud",
    cssValue:
      "linear-gradient(180deg, #b0c4de 0%, #e0e0e0 50%, #c0c0c0 100%)",
    backgroundSize: "100% 100%",
  },
  forest: {
    label: "Forest",
    cssValue:
      "linear-gradient(135deg, #2d5a27 0%, #4a7c3f 30%, #1a3a15 70%, #0d260a 100%)",
    backgroundSize: "100% 100%",
  },
  "brick-wall": {
    label: "Brick Wall",
    cssValue:
      "#8b4513 repeating-linear-gradient(0deg, #8b4513, #8b4513 30px, #a0522d 30px, #a0522d 32px)",
    backgroundSize: "100% 64px",
  },
  "windows-98": {
    label: "Windows 98",
    cssValue: "#008080",
    backgroundSize: "100% 100%",
  },
  "black-tile": {
    label: "Black Tile",
    cssValue:
      "#1a1a1a repeating-conic-gradient(#2a2a2a 0% 25%, transparent 0% 50%)",
    backgroundSize: "8px 8px",
  },
};

export type WallpaperId = keyof typeof wallpaperPresets;

export interface ColorScheme {
  label: string;
  vars: Record<string, string>;
}

export const colorSchemes: Record<string, ColorScheme> = {
  standard: {
    label: "Standard (Default)",
    vars: {},
  },
  "high-contrast": {
    label: "High Contrast",
    vars: {
      "--surface": "#000000",
      "--button-face": "#000000",
      "--button-text": "#ffffff",
      "--button-highlight": "#ffffff",
      "--button-shadow": "#ffffff",
      "--button-dark-shadow": "#ffffff",
      "--button-light": "#000000",
      "--title-bar-bg": "#000080",
      "--title-bar-text": "#ffffff",
      "--title-bar-bg-inactive": "#808080",
      "--title-bar-text-inactive": "#c0c0c0",
      "--selection-bg": "#000080",
      "--selection-text": "#ffffff",
    },
  },
  marine: {
    label: "Marine",
    vars: {
      "--title-bar-bg": "#004040",
      "--title-bar-text": "#ffffff",
      "--title-bar-bg-inactive": "#608080",
      "--title-bar-text-inactive": "#c0d0d0",
      "--selection-bg": "#004040",
      "--selection-text": "#ffffff",
    },
  },
  eggplant: {
    label: "Eggplant",
    vars: {
      "--surface": "#c8b0d0",
      "--button-face": "#d8c8e0",
      "--button-highlight": "#e8d8f0",
      "--title-bar-bg": "#400040",
      "--title-bar-text": "#ffffff",
      "--title-bar-bg-inactive": "#806080",
      "--title-bar-text-inactive": "#d0c0d0",
      "--selection-bg": "#400040",
      "--selection-text": "#ffffff",
    },
  },
  plum: {
    label: "Plum",
    vars: {
      "--surface": "#d0b0c0",
      "--button-face": "#e0c8d8",
      "--button-highlight": "#f0d8e8",
      "--title-bar-bg": "#800040",
      "--title-bar-text": "#ffffff",
      "--title-bar-bg-inactive": "#a06080",
      "--title-bar-text-inactive": "#e0d0d8",
      "--selection-bg": "#800040",
      "--selection-text": "#ffffff",
    },
  },
};

export type ColorSchemeId = keyof typeof colorSchemes;

export function getWallpaperStyle(
  wallpaper: WallpaperId | "custom",
  customWallpaper: string | null,
): React.CSSProperties {
  if (wallpaper === "custom" && customWallpaper) {
    return {
      backgroundColor: "#008080",
      backgroundImage: `url(${customWallpaper})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    };
  }

  const preset = wallpaperPresets[wallpaper as WallpaperId];
  if (!preset) {
    return {
      backgroundColor: "#008080",
      backgroundImage:
        "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 1px, transparent 1px)",
      backgroundSize: "4px 4px",
    };
  }

  return {
    backgroundColor: preset.cssValue.split(" ")[0] || "#008080",
    backgroundImage: preset.cssValue.includes("gradient")
      ? preset.cssValue
      : preset.cssValue.includes("radial") ||
          preset.cssValue.includes("repeating")
        ? preset.cssValue
        : undefined,
    backgroundSize: preset.backgroundSize,
  };
}

export function applyColorScheme(schemeId: ColorSchemeId): void {
  const scheme = colorSchemes[schemeId];
  if (!scheme) return;

  const root = document.documentElement;
  root.style.removeProperty("--surface");
  root.style.removeProperty("--button-face");
  root.style.removeProperty("--button-text");
  root.style.removeProperty("--button-highlight");
  root.style.removeProperty("--button-shadow");
  root.style.removeProperty("--button-dark-shadow");
  root.style.removeProperty("--button-light");
  root.style.removeProperty("--title-bar-bg");
  root.style.removeProperty("--title-bar-text");
  root.style.removeProperty("--title-bar-bg-inactive");
  root.style.removeProperty("--title-bar-text-inactive");
  root.style.removeProperty("--selection-bg");
  root.style.removeProperty("--selection-text");

  for (const [key, value] of Object.entries(scheme.vars)) {
    root.style.setProperty(key, value);
  }
}
