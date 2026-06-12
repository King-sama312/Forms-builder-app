"use client";

import { useState, useRef, useCallback } from "react";
import {
  wallpaperPresets,
  getWallpaperStyle,
  type WallpaperId,
} from "~/lib/theme-config";
import { useSettingsStore } from "~/store/settings-store";
import { useWindowManager } from "~/components/windows-context";

export function DisplayProperties() {
  const { closeWindow } = useWindowManager();
  const {
    wallpaper: savedWallpaper,
    customWallpaper: savedCustom,
    setWallpaper,
    setCustomWallpaper,
  } = useSettingsStore();

  const [wallpaper, setLocalWallpaper] = useState<WallpaperId | "custom">(
    savedWallpaper,
  );
  const [customWallpaper, setLocalCustom] = useState<string | null>(
    savedCustom,
  );
  const [previewKey, setPreviewKey] = useState(0);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const statusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const flashStatus = useCallback((msg: string) => {
    setStatusMsg(msg);
    if (statusTimer.current) clearTimeout(statusTimer.current);
    statusTimer.current = setTimeout(() => setStatusMsg(null), 2500);
  }, []);

  const handleBrowse = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setLocalCustom(dataUrl);
        setLocalWallpaper("custom");
        setWallpaper("custom");
        setCustomWallpaper(dataUrl);
        setPreviewKey((k) => k + 1);
        flashStatus("Custom image applied");
      };
      reader.readAsDataURL(file);

      e.target.value = "";
    },
    [setWallpaper, setCustomWallpaper, flashStatus],
  );

  const persist = useCallback(
    (showMsg: boolean) => {
      setWallpaper(wallpaper);
      if (wallpaper === "custom") {
        setCustomWallpaper(customWallpaper);
      }
      if (showMsg) {
        const label =
          wallpaper === "custom"
            ? "Custom image"
            : wallpaperPresets[wallpaper as WallpaperId]?.label ?? "Wallpaper";
        flashStatus(`${label} applied`);
      }
    },
    [wallpaper, customWallpaper, setWallpaper, setCustomWallpaper, flashStatus],
  );

  const handleSelectWallpaper = useCallback(
    (id: WallpaperId | "custom") => {
      setLocalWallpaper(id);
      if (id !== "custom") {
        setWallpaper(id);
        flashStatus(
          `${wallpaperPresets[id]?.label ?? "Wallpaper"} applied`,
        );
      }
    },
    [setWallpaper, flashStatus],
  );

  const handleOk = useCallback(() => {
    persist(true);
    closeWindow("display-properties");
  }, [persist, closeWindow]);



  const currentWallpaperPreview = getWallpaperStyle(
    wallpaper === "custom" ? "custom" : wallpaper,
    wallpaper === "custom" ? customWallpaper : null,
  );

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] select-none">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex-1 overflow-auto p-3 min-h-0">
        <BackgroundTab
          wallpaper={wallpaper}
          customWallpaper={customWallpaper}
          onSelectWallpaper={handleSelectWallpaper}
          onBrowse={handleBrowse}
          previewStyle={currentWallpaperPreview}
          previewKey={previewKey}
        />
      </div>

      <div className="flex items-center px-3 py-2 border-t border-[#808080] shrink-0 bg-[#c0c0c0]">
        <div className="flex-1 text-sm font-bold text-[#008080] min-h-[22px]">
          {statusMsg ?? ""}
        </div>
        <div className="flex gap-2">
          <Win98Button onClick={handleOk}>OK</Win98Button>
        </div>
      </div>
    </div>
  );
}

function Win98Button({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-1 text-sm"
      style={{
        background: "#c0c0c0",
        border: "2px outset #fff",
        cursor: "pointer",
        outline: "none",
        minWidth: 64,
      }}
    >
      {children}
    </button>
  );
}

function getSwatchStyle(id: string): React.CSSProperties {
  if (id === "custom") {
    return {
      background: "conic-gradient(#c0c0c0 25%, #e0e0e0 25% 50%, #c0c0c0 50% 75%, #e0e0e0 75% 100%)",
      backgroundSize: "12px 12px",
    };
  }
  const preset = wallpaperPresets[id];
  if (!preset) return { backgroundColor: "#008080" };
  return {
    backgroundColor: preset.cssValue.split(" ")[0] || "#008080",
    backgroundImage: preset.cssValue,
    backgroundSize: preset.backgroundSize,
  };
}

function WallpaperSwatch({
  id,
  label,
  selected,
  onClick,
}: {
  id: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 p-1 cursor-pointer"
      style={{
        background: "none",
        border: "none",
        outline: "none",
        width: 80,
      }}
    >
      <div
        className="border"
        style={{
          width: 64,
          height: 48,
          borderColor: selected ? "#000080" : "#808080",
          borderWidth: selected ? 2 : 1,
          ...getSwatchStyle(id),
        }}
      />
      <span
        className="text-[11px] text-center leading-tight"
        style={{
          color: selected ? "#000080" : "#000",
          fontWeight: selected ? 700 : 400,
        }}
      >
        {label}
      </span>
    </button>
  );
}

function BackgroundTab({
  wallpaper,
  customWallpaper,
  onSelectWallpaper,
  onBrowse,
  previewStyle,
  previewKey,
}: {
  wallpaper: WallpaperId | "custom";
  customWallpaper: string | null;
  onSelectWallpaper: (id: WallpaperId | "custom") => void;
  onBrowse: () => void;
  previewStyle: React.CSSProperties;
  previewKey: number;
}) {
  return (
    <div className="flex gap-4 h-full">
      <div className="flex-1 min-w-0">
        <label className="text-sm font-bold block mb-2">Wallpaper</label>
        <div className="border border-[#808080] bg-white p-1 mb-2">
          <div
            key={previewKey}
            className="w-full h-24 border border-[#dfdfdf]"
            style={previewStyle}
          />
        </div>

        <div className="text-sm mb-1">Click a wallpaper to select it:</div>
        <div
          className="border border-[#808080] bg-white p-2 overflow-y-auto"
          style={{ maxHeight: 170 }}
        >
          <div className="flex flex-wrap gap-1">
            {Object.entries(wallpaperPresets).map(([id, preset]) => (
              <WallpaperSwatch
                key={id}
                id={id}
                label={preset.label}
                selected={wallpaper === id}
                onClick={() => onSelectWallpaper(id as WallpaperId)}
              />
            ))}
            <WallpaperSwatch
              id="custom"
              label={customWallpaper ? "Custom Image" : "Browse..."}
              selected={wallpaper === "custom"}
              onClick={customWallpaper ? () => onSelectWallpaper("custom") : onBrowse}
            />
          </div>
        </div>
      </div>

      <div className="w-48 shrink-0">
        <label className="text-sm font-bold block mb-2">Display</label>
        <div
          className="border border-[#808080] bg-white p-2 text-center"
          style={{ minHeight: 200 }}
        >
          <div className="text-xs text-gray-500 mb-2">Desktop Preview</div>
          <div
            className="mx-auto border border-[#c0c0c0]"
            style={{
              width: 160,
              height: 120,
              ...previewStyle,
              backgroundPosition: "center",
            }}
          >
            <div
              className="mx-auto mt-2 border border-[#dfdfdf] bg-[#c0c0c0]"
              style={{ width: 100, height: 60 }}
            >
              <div
                className="bg-[#000080] text-white text-[8px] px-1"
                style={{ height: 12, lineHeight: "12px" }}
              >
                Window
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onBrowse}
          className="w-full mt-2 px-4 py-1 text-sm"
          style={{
            background: "#c0c0c0",
            border: "2px outset #fff",
            cursor: "pointer",
            outline: "none",
          }}
        >
          Browse...
        </button>
      </div>
    </div>
  );
}
