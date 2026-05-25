import './globals.css';
import { Taskbar } from '~/components/taskbar';
import { DesktopIcons } from '~/components/desktop-icons';
import { GlobalProviders } from '~/providers/global';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <GlobalProviders>
          <div className="win98-desktop relative w-screen h-screen overflow-hidden">
            {/* Desktop workspace - everything above taskbar */}
            <div className="relative w-full h-[calc(100vh-28px)]">
              <DesktopIcons />
              
              {/* 
                Pages mount here as floating windows.
                The layout persists, so the desktop + taskbar never unmount.
              */}
              {children}
            </div>

            {/* Taskbar always visible */}
            <Taskbar />
          </div>
        </GlobalProviders>
      </body>
    </html>
  );
}