/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"use client";

import { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Card, Button, Input } from "@nextui-org/react";
import KanbanTask from "./KanbanTask";

interface Task {
  id: string;
  title: string;
  description: string;
}

type TaskState = Record<string, Task[]>;

const initialTasks: TaskState = {
  ToDo: [
    { id: "1", title: "Task 1", description: "Description for Task 1" },
    { id: "2", title: "Task 2", description: "Description for Task 2" },
  ],
  Doing: [{ id: "3", title: "Task 3", description: "Description for Task 3" }],
  Done: [{ id: "4", title: "Task 4", description: "Description for Task 4" }],
};

function KanbanBoard() {
  const [tasks, setTasks] = useState<TaskState>(initialTasks);
  const [newColumnName, setNewColumnName] = useState<string>("");

  const addTask = (column: string) => {
    const newTask: Task = {
      id: new Date().getTime().toString(),
      title: "New Task",
      description: "Description for new task",
    };
    setTasks((prev) => ({ ...prev, [column]: [...prev[column], newTask] }));
  };

  const addColumn = () => {
    if (newColumnName.trim() !== "" && !tasks[newColumnName]) {
      setTasks((prev) => ({ ...prev, [newColumnName]: [] }));
      setNewColumnName("");
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const startColumnId = source.droppableId;
    const finishColumnId = destination.droppableId;

    const startTasks = Array.from(tasks[startColumnId]);
    const [movedTask] = startTasks.splice(source.index, 1);

    if (startColumnId === finishColumnId) {
      startTasks.splice(destination.index, 0, movedTask);
      setTasks((prev) => ({
        ...prev,
        [startColumnId]: startTasks,
      }));
    } else {
      const finishTasks = Array.from(tasks[finishColumnId]);
      finishTasks.splice(destination.index, 0, movedTask);
      setTasks((prev) => ({
        ...prev,
        [startColumnId]: startTasks,
        [finishColumnId]: finishTasks,
      }));
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid h-screen grid-cols-1 gap-4 p-4 md:grid-cols-4 md:gap-4 md:p-4">
        {Object.entries(tasks).map(([columnId, columnTasks]) => (
          <Droppable key={columnId} droppableId={columnId}>
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
                  {columnTasks.map((task, index) => (
                    <Draggable
                      key={task.id}
                      draggableId={task.id}
                      index={index}
                    >
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
                  <Button onClick={() => addTask(columnId)}>Add Task</Button>
                </div>
              </div>
            )}
          </Droppable>
        ))}
        <div className="flex h-full flex-col items-center justify-center">
          <Input
            clearable
            underlined
            placeholder="New Column Name"
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
          />
          <Button onClick={addColumn} className="mt-4">
            Add Column
          </Button>
        </div>
      </div>
    </DragDropContext>
  );
}

export default KanbanBoard;
