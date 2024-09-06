export default function CardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-4">
      <div className="mb-2 rounded-lg bg-card shadow-md">
        <h2 className="flex items-center justify-between p-4 text-card-foreground">
          {children}
        </h2>
      </div>
    </div>
  );
}
