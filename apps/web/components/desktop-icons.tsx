'use client';

import { useRouter } from 'next/navigation';

function Icon({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <div className="desktop-icon" onDoubleClick={onClick}>
      <div className="w-8 h-8 mb-1">{icon}</div>
      <span className="text-xs text-center leading-tight">{label}</span>
    </div>
  );
}

export function DesktopIcons() {
  const router = useRouter();

  return (
    <div className="absolute top-4 left-4 flex flex-col gap-6 z-0">
      <Icon
        label="My Forms"
        onClick={() => router.push('/forms')}
        icon={
          <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
            <rect x="2" y="4" width="28" height="24" fill="#f0f0f0" stroke="#000" strokeWidth="1"/>
            <rect x="4" y="6" width="24" height="4" fill="#000080"/>
            <rect x="6" y="12" width="20" height="2" fill="#808080"/>
            <rect x="6" y="16" width="16" height="2" fill="#808080"/>
            <rect x="6" y="20" width="18" height="2" fill="#808080"/>
          </svg>
        }
      />
      <Icon
        label="Music Player"
        onClick={() => router.push('/music-player')}
        icon={
          <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
            <rect x="2" y="2" width="28" height="28" rx="2" fill="#c0c0c0" stroke="#000" strokeWidth="1"/>
            <circle cx="12" cy="20" r="4" fill="#fff" stroke="#000" strokeWidth="1"/>
            <circle cx="22" cy="18" r="3" fill="#fff" stroke="#000" strokeWidth="1"/>
            <rect x="16" y="8" width="8" height="2" fill="#000080"/>
            <rect x="16" y="12" width="6" height="2" fill="#000080"/>
            <rect x="16" y="16" width="4" height="2" fill="#000080"/>
            <path d="M12 20 L12 10 L16 8 L16 14 Z" fill="#808080" stroke="#000" strokeWidth="0.5"/>
            <path d="M22 18 L22 10 L16 8" stroke="#000" strokeWidth="0.5" fill="none"/>
          </svg>
        }
      />
      <Icon
        label="Login"
        onClick={() => router.push('/login')}
        icon={
          <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
            <rect x="6" y="2" width="20" height="28" rx="2" fill="#c0c0c0" stroke="#000" strokeWidth="1"/>
            <circle cx="16" cy="12" r="4" fill="#fff" stroke="#000" strokeWidth="1"/>
            <path d="M10 24c0-3 2.5-6 6-6s6 3 6 6" stroke="#000" strokeWidth="1" fill="none"/>
          </svg>
        }
      />
      <Icon
        label="Register"
        onClick={() => router.push('/signup')}
        icon={
          <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
            <rect x="4" y="6" width="24" height="20" fill="#fff" stroke="#000" strokeWidth="1"/>
            <rect x="8" y="10" width="16" height="2" fill="#000080"/>
            <rect x="8" y="14" width="12" height="2" fill="#808080"/>
            <rect x="8" y="18" width="14" height="2" fill="#808080"/>
            <path d="M22 4l4 4-4 4" stroke="#000" strokeWidth="1" fill="none"/>
          </svg>
        }
      />
    </div>
  );
}