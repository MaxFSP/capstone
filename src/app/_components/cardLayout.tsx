export default function CardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-4">
      <div className="mb-2 rounded bg-zinc-900  shadow">
        <h2 className="flex items-center justify-between p-4">{children}</h2>
      </div>
    </div>
  );
}
