import { Card, CardHeader } from "@nextui-org/card";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className=" background-black mb-8  mt-12  flex flex-col  gap-12">
      <div>
        <Card>
          <CardHeader className="mb-8 flex items-center justify-between bg-gray-700 p-6">
            <p className="text-l text-white">Stock</p>
          </CardHeader>
        </Card>
      </div>
      <div>{children}</div>;
    </main>
  );
}
