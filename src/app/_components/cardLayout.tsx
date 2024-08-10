import { Card, CardHeader } from "@nextui-org/react";

export default function CardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-4">
      <Card>
        <CardHeader className="flex items-center justify-between p-4">
          {children}
        </CardHeader>
      </Card>
    </div>
  );
}
