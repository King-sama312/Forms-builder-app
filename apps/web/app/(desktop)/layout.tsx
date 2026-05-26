import { DesktopShell } from '~/components/desktop-shell';
import { Clippy } from '~/components/clippy';

export default function DesktopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DesktopShell>
      {children}
      <Clippy />
    </DesktopShell>
  );
}
