import type { Metadata } from 'next';
import './globals.css';
import { GlobalProviders } from '~/providers/global';
import { WindowsProvider } from '~/components/windows-context';
import { CookieConsent } from '~/components/cookie-consent';

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
            <CookieConsent />
          </WindowsProvider>
        </GlobalProviders>
      </body>
    </html>
  );
}
