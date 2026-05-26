'use client';

import { useRouter } from 'next/navigation';
import { useGetUserInfo } from '~/hooks/api/auth/index';

function Icon({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <div className="desktop-icon" onDoubleClick={onClick}>
      <div className="w-14 h-14 mb-1">{icon}</div>
      <span className="text-sm text-center leading-tight">{label}</span>
    </div>
  );
}

export function DesktopIcons() {
  const router = useRouter();
  const { user } = useGetUserInfo();

  return (
    <div className="absolute top-4 left-4 flex flex-col gap-6 z-0">
      {user ? (
        <>
          <Icon
            label="My Forms"
            onClick={() => router.push('/forms')}
            icon={
              <img src="/icons/forms.png" alt="My Forms" className="w-full h-full pixel-art" draggable={false} />
            }
          />
          <Icon
            label="Recycle Bin"
            onClick={() => router.push('/forms/recycle-bin')}
            icon={
              <div className="w-full h-full flex items-center justify-center text-3xl">🗑</div>
            }
          />
        </>
      ) : (
        <>
          <Icon
            label="Login"
            onClick={() => router.push('/login')}
            icon={
              <img src="/icons/login.png" alt="Login" className="w-full h-full pixel-art" draggable={false} />
            }
          />
          <Icon
            label="Register"
            onClick={() => router.push('/signup')}
            icon={
              <img src="/icons/register.png" alt="Register" className="w-full h-full pixel-art" draggable={false} />
            }
          />
        </>
      )}
      <Icon
        label="Music Player"
        onClick={() => router.push('/music-player')}
        icon={
          <img src="/icons/music.png" alt="Music Player" className="w-full h-full pixel-art" draggable={false} />
        }
      />
    </div>
  );
}