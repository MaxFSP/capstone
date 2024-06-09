"use client";

import { Card } from "@nextui-org/react";

interface KanbanTaskProps {
  title: string;
  description: string;
}

const KanbanTask: React.FC<KanbanTaskProps> = ({ title, description }) => {
  return (
    <Card className="p-4">
      <h3 className="font-semibold">{title}</h3>
      <p>{description}</p>
    </Card>
  );
};

export default KanbanTask;
