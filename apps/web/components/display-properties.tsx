"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  wallpaperPresets,
  colorSchemes,
  getWallpaperStyle,
  applyColorScheme,
  type WallpaperId,
  type ColorSchemeId,
} from "~/lib/theme-config";
import { useSettingsStore } from "~/store/settings-store";

type Tab = "background" | "appearance";

export function DisplayProperties() {
  const {
    wallpaper: savedWallpaper,
    colorScheme: savedScheme,
    customWallpaper: savedCustom,
    setWallpaper,
    setColorScheme,
    setCustomWallpaper,
  } = useSettingsStore();

  const [activeTab, setActiveTab] = useState<Tab>("background");
  const [wallpaper, setLocalWallpaper] = useState<WallpaperId | "custom">(
    savedWallpaper,
  );
  const [scheme, setLocalScheme] = useState<ColorSchemeId>(savedScheme);
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
        setPreviewKey((k) => k + 1);
      };
      reader.readAsDataURL(file);

      e.target.value = "";
    },
    [],
  );

  const applyAll = useCallback(
    (showMsg: boolean) => {
      setWallpaper(wallpaper);
      setColorScheme(scheme);
      if (wallpaper === "custom") {
        setCustomWallpaper(customWallpaper);
      }
      applyColorScheme(scheme);
      if (showMsg) {
        const label =
          wallpaper === "custom"
            ? "Your custom wallpaper"
            : wallpaperPresets[wallpaper as WallpaperId]?.label ?? "Wallpaper";
        flashStatus(`${label} applied.`);
      }
    },
    [
      wallpaper,
      scheme,
      customWallpaper,
      setWallpaper,
      setColorScheme,
      setCustomWallpaper,
      flashStatus,
    ],
  );

  const handleOk = useCallback(() => {
    applyAll(true);
  }, [applyAll]);

  const handleApply = useCallback(() => {
    applyAll(true);
    setPreviewKey((k) => k + 1);
  }, [applyAll]);

  useEffect(() => {
    applyColorScheme(savedScheme);
  }, [savedScheme]);

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

      <div className="flex border-b border-[#808080] bg-[#c0c0c0] px-2 pt-1 gap-1 shrink-0">
        <TabButton
          active={activeTab === "background"}
          onClick={() => setActiveTab("background")}
        >
          Background
        </TabButton>
        <TabButton
          active={activeTab === "appearance"}
          onClick={() => setActiveTab("appearance")}
        >
          Appearance
        </TabButton>
      </div>

      <div className="flex-1 overflow-auto p-3 min-h-0">
        {activeTab === "background" && (
          <BackgroundTab
            wallpaper={wallpaper}
            customWallpaper={customWallpaper}
            onSelectWallpaper={setLocalWallpaper}
            onBrowse={handleBrowse}
            previewStyle={currentWallpaperPreview}
            previewKey={previewKey}
          />
        )}
        {activeTab === "appearance" && (
          <AppearanceTab
            scheme={scheme}
            onSelectScheme={setLocalScheme}
          />
        )}
      </div>

      <div className="flex items-center px-3 py-2 border-t border-[#808080] shrink-0 bg-[#c0c0c0]">
        <div className="flex-1 text-sm font-bold text-[#008080] min-h-[22px]">
          {statusMsg ?? ""}
        </div>
        <div className="flex gap-2">
          <Win98Button onClick={handleOk}>OK</Win98Button>
          <Win98Button onClick={handleApply}>Apply</Win98Button>
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-1 text-sm relative -mb-px"
      style={{
        background: active ? "#c0c0c0" : "#e0e0e0",
        border: active
          ? "1px solid #808080"
          : "1px solid #808080",
        borderBottom: active ? "1px solid #c0c0c0" : "1px solid #808080",
        borderLeft: "2px solid #dfdfdf",
        borderTop: "2px solid #dfdfdf",
        outline: "none",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
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

function getSchemeSwatchStyle(id: string): React.CSSProperties {
  const cs = colorSchemes[id];
  if (!cs) return {};
  return {
    background: cs.vars["--title-bar-bg"] ?? "#000080",
    borderBottom: `4px solid ${cs.vars["--surface"] ?? "#c0c0c0"}`,
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

function SchemeSwatch({
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
  const cs = colorSchemes[id];
  const titleBar = cs?.vars["--title-bar-bg"] ?? "#000080";
  const surface = cs?.vars["--surface"] ?? "#c0c0c0";
  const buttonFace = cs?.vars["--button-face"] ?? "#dfdfdf";
  const buttonText = cs?.vars["--button-text"] ?? "#000000";

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 p-1 cursor-pointer"
      style={{
        background: "none",
        border: "none",
        outline: "none",
        width: 90,
      }}
    >
      <div
        className="border overflow-hidden"
        style={{
          width: 80,
          height: 56,
          borderColor: selected ? "#000080" : "#808080",
          borderWidth: selected ? 2 : 1,
          background: surface,
        }}
      >
        <div
          className="flex items-center px-[2px] text-[7px]"
          style={{
            height: 12,
            background: titleBar,
            color: cs?.vars["--title-bar-text"] ?? "#ffffff",
          }}
        >
          <span className="flex-1 text-left">窗口</span>
          <span>✕</span>
        </div>
        <div
          className="p-[2px] text-[7px]"
          style={{ color: buttonText }}
        >
          <div
            className="mb-[1px] px-1"
            style={{
              background: cs?.vars["--selection-bg"] ?? "#000080",
              color: cs?.vars["--selection-text"] ?? "#ffffff",
            }}
          >
            Selected
          </div>
          <div>Normal</div>
        </div>
        <div className="flex gap-[1px] px-[2px] mt-[1px]">
          <div
            className="px-1"
            style={{
              background: buttonFace,
              border: "1px solid",
              borderColor: cs?.vars["--button-shadow"] ?? "#808080",
              color: buttonText,
              fontSize: 7,
            }}
          >
            OK
          </div>
        </div>
      </div>
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

function AppearanceTab({
  scheme,
  onSelectScheme,
}: {
  scheme: ColorSchemeId;
  onSelectScheme: (id: ColorSchemeId) => void;
}) {
  const previewVars = colorSchemes[scheme]?.vars ?? {};

  return (
    <div className="flex gap-4 h-full">
      <div className="flex-1 min-w-0">
        <label className="text-sm font-bold block mb-2">Color Scheme</label>
        <div className="text-sm mb-1">Click a scheme to preview it:</div>
        <div
          className="border border-[#808080] bg-white p-2 overflow-y-auto"
          style={{ maxHeight: 200 }}
        >
          <div className="flex flex-wrap gap-1">
            {Object.entries(colorSchemes).map(([id, cs]) => (
              <SchemeSwatch
                key={id}
                id={id}
                label={cs.label}
                selected={scheme === id}
                onClick={() => onSelectScheme(id as ColorSchemeId)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="w-48 shrink-0">
        <label className="text-sm font-bold block mb-2">Preview</label>
        <div
          className="border border-[#808080] p-2 text-center"
          style={{
            minHeight: 200,
            background: previewVars["--surface"] ?? "#c0c0c0",
          }}
        >
          <div className="text-xs mb-2">Active Window</div>
          <div
            className="mx-auto border"
            style={{
              width: 160,
              height: 120,
              background: previewVars["--button-face"] ?? "#dfdfdf",
              borderColor: previewVars["--button-shadow"] ?? "#808080",
            }}
          >
            <div
              className="flex items-center px-1 text-xs"
              style={{
                height: 16,
                background: previewVars["--title-bar-bg"] ?? "#000080",
                color: previewVars["--title-bar-text"] ?? "#ffffff",
              }}
            >
              <span className="flex-1 text-left">My Window</span>
              <span className="text-xs">✕</span>
            </div>
            <div
              className="p-2 text-left text-xs"
              style={{
                color: previewVars["--button-text"] ?? "#000000",
              }}
            >
              <div
                className="mb-1 px-2 py-1"
                style={{
                  background: previewVars["--selection-bg"] ?? "#000080",
                  color: previewVars["--selection-text"] ?? "#ffffff",
                }}
              >
                Selected item
              </div>
              <div>Normal item</div>
            </div>
            <div className="flex gap-1 px-2 mt-1">
              <div
                className="px-2 py-1 text-xs"
                style={{
                  background: previewVars["--button-face"] ?? "#dfdfdf",
                  border: "1px solid",
                  borderColor:
                    previewVars["--button-shadow"] ?? "#808080",
                  color: previewVars["--button-text"] ?? "#000000",
                }}
              >
                OK
              </div>
              <div
                className="px-2 py-1 text-xs"
                style={{
                  background: previewVars["--button-face"] ?? "#dfdfdf",
                  border: "1px solid",
                  borderColor:
                    previewVars["--button-shadow"] ?? "#808080",
                  color: previewVars["--button-text"] ?? "#000000",
                }}
              >
                Cancel
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
