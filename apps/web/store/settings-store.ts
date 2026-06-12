"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WallpaperId, ColorSchemeId } from "~/lib/theme-config";

interface SettingsState {
  wallpaper: WallpaperId | "custom";
  colorScheme: ColorSchemeId;
  customWallpaper: string | null;

  setWallpaper: (wallpaper: WallpaperId | "custom") => void;
  setColorScheme: (scheme: ColorSchemeId) => void;
  setCustomWallpaper: (dataUrl: string | null) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      wallpaper: "teal",
      colorScheme: "standard",
      customWallpaper: null,

      setWallpaper: (wallpaper) => set({ wallpaper }),
      setColorScheme: (colorScheme) => set({ colorScheme }),
      setCustomWallpaper: (customWallpaper) => set({ customWallpaper }),
    }),
    { name: "win98-settings" },
  ),
);
