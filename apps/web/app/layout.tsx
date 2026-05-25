import './globals.css';
import { GlobalProviders } from '~/providers/global';
import { WindowsProvider } from '~/components/windows-context';
import { Clippy } from '~/components/clippy';

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
