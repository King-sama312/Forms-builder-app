import type { Metadata } from 'next';
import './globals.css';
import { GlobalProviders } from '~/providers/global';
import { WindowsProvider } from '~/components/windows-context';
import { Clippy } from '~/components/clippy';

export const metadata: Metadata = {
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.ico',
  },
};

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
            {children}
            <Clippy />
          </WindowsProvider>
        </GlobalProviders>
      </body>
    </html>
  );
}
