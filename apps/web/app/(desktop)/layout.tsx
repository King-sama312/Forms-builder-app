import { DesktopShell } from '~/components/desktop-shell';
import { Clippy } from '~/components/clippy';
import { WindowManagerProvider } from '~/components/windows-context';

export default function DesktopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WindowManagerProvider>
      <DesktopShell>
        {children}
        <Clippy />
      </DesktopShell>
    </WindowManagerProvider>
  );
}
