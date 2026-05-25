import './globals.css';
import { DesktopShell } from '~/components/desktop-shell';
import { GlobalProviders } from '~/providers/global';
import { WindowsProvider } from '~/components/windows-context';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <GlobalProviders>
          <WindowsProvider>
            <DesktopShell>
              {/* 
                Pages mount here as floating windows.
                The layout persists, so the desktop + taskbar never unmount.
              */}
              {children}
            </DesktopShell>
          </WindowsProvider>
        </GlobalProviders>
      </body>
    </html>
  );
}