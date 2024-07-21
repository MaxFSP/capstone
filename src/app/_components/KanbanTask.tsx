import { Card } from "@nextui-org/react";

export default function KanbanTask(props: {
  title: string;
  description: string;
}) {
  const { title, description } = props;
  return (
    <Card className="p-4">
      <h3 className="font-semibold">{title}</h3>
      <p>{description}</p>
    </Card>
  );
}
