import './../globals.css';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-screen overflow-auto" style={{ backgroundColor: '#008080' }}>
      {children}
    </div>
  );
}
