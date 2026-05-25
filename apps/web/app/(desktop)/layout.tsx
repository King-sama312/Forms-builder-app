import { DesktopShell } from '~/components/desktop-shell';

export default function DesktopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DesktopShell>{children}</DesktopShell>;
}
