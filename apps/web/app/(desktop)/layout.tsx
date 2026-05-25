import { DesktopShell } from '~/components/desktop-shell';
import { WindowsProvider } from '~/components/windows-context';

export default function DesktopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WindowsProvider>
      <DesktopShell>{children}</DesktopShell>
    </WindowsProvider>
  );
}
