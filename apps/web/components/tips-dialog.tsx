'use client';

import { useState, useCallback } from 'react';

const TIPS = [
  'Did you know? You can double-click any form in My Forms to open the builder.',
  'Did you know? Deleted forms go to the Recycle Bin \u2014 you can restore them!',
  'Did you know? Click Start > Shut Down to close the app in true Win98 style.',
  'Did you know? Clippy can help you generate forms using AI. Just click the paperclip!',
  'Did you know? The Music Player supports MP3 files. Drop them in the public folder!',
  'Did you know? Right-click the desktop for more options.',
  'Did you know? You can drag desktop icons to the Recycle Bin to delete them.',
  'Did you know? Press Ctrl+Alt+N to quickly create a new form.',
  'Did you know? Your forms are saved automatically as you work.',
  'Did you know? You can resize any window by dragging its edges.',
  'Did you know? The Start menu has a Log Off option to switch users.',
  'Did you know? Forms Builder 98 supports drag-and-drop form building.',
  'Did you know? You can preview your form before publishing it.',
];

const LS_KEY = 'win98-tips-settings';

interface TipsSettings {
  showOnStartup: boolean;
}

function loadSettings(): TipsSettings {
  if (typeof window === 'undefined') return { showOnStartup: true };
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { showOnStartup: true };
}

function saveSettings(settings: TipsSettings) {
  localStorage.setItem(LS_KEY, JSON.stringify(settings));
}

export function TipsDialog({ onClose }: { onClose?: () => void }) {
  const [settings, setSettings] = useState<TipsSettings>(loadSettings);
  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * TIPS.length));

  const handleNextTip = useCallback(() => {
    setTipIndex(prev => (prev + 1) % TIPS.length);
  }, []);

  const handleToggleShowOnStartup = useCallback(() => {
    setSettings(prev => {
      const next = { ...prev, showOnStartup: !prev.showOnStartup };
      saveSettings(next);
      return next;
    });
  }, []);

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0]" style={{ fontFamily: 'Tahoma,Arial,sans-serif' }}>
      <div className="flex gap-4 p-4 flex-1">
        <div className="flex flex-col items-center justify-start pt-2">
          <div
            style={{
              width: 48,
              height: 48,
              background: '#FFFF80',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              border: '2px solid #808080',
            }}
          >
            💡
          </div>
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold mb-1">Did you know\u2026</div>
          <div className="text-sm leading-relaxed">{TIPS[tipIndex]}</div>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-2 border-t border-[#808080]">
        <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
          <input
            type="checkbox"
            checked={settings.showOnStartup}
            onChange={handleToggleShowOnStartup}
          />
          Show tips on startup
        </label>
        <div className="flex gap-2">
          <button className="win98-btn px-3 py-0.5 text-xs" onClick={handleNextTip}>
            Next Tip
          </button>
          <button className="win98-btn px-3 py-0.5 text-xs" onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function shouldShowTipsOnStartup(): boolean {
  if (typeof window === 'undefined') return false;
  if (localStorage.getItem('win98-booted') !== 'true') return false;
  const settings = loadSettings();
  if (!settings.showOnStartup) return false;
  const shown = sessionStorage.getItem('win98-tips-shown');
  if (shown) return false;
  sessionStorage.setItem('win98-tips-shown', 'true');
  return true;
}
