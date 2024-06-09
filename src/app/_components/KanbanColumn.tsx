"use client";

import { Droppable, Draggable } from "react-beautiful-dnd";
import KanbanTask from "./KanbanTask";
import { Card, Button } from "@nextui-org/react";

interface Task {
  id: string;
  title: string;
  description: string;
}

interface KanbanColumnProps {
  columnId: string;
  tasks: Task[];
  addTask: () => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  columnId,
  tasks,
  addTask,
}) => {
  return (
    <Droppable droppableId={columnId}>
      {(provided) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className="flex h-full flex-col"
        >
          <Card className="mb-4">
            <h2 className="p-4 text-center text-xl font-semibold">
              {columnId}
            </h2>
          </Card>
          <div className="flex-grow overflow-auto">
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="mb-4"
                  >
                    <KanbanTask
                      title={task.title}
                      description={task.description}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
          <div className="mt-4 text-center">
            <Button onClick={addTask}>Add Task</Button>
          </div>
        </div>
      )}
    </Droppable>
  );
};

export default KanbanColumn;
