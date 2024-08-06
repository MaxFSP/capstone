"use client";

import { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import KanbanTask from "./KanbanTask";

interface Task {
  id: string;
  title: string;
  description: string;
  position: number;
  column: string;
}

type TaskState = Record<string, Task[]>;

const initialTasks: TaskState = {
  ToDo: [
    {
      id: "1",
      title: "Task 1",
      description: "Description for Task 1",
      position: 0,
      column: "ToDo",
    },
    {
      id: "2",
      title: "Task 2",
      description: "Description for Task 2",
      position: 1,
      column: "ToDo",
    },
  ],
  Doing: [
    {
      id: "3",
      title: "Task 3",
      description: "Description for Task 3",
      position: 0,
      column: "Doing",
    },
  ],
  Done: [
    {
      id: "4",
      title: "Task 4",
      description: "Description for Task 4",
      position: 0,
      column: "Done",
    },
  ],
};

function KanbanBoard() {
  const [tasks, setTasks] = useState<TaskState>(initialTasks);
  const [columnOrder, setColumnOrder] = useState<string[]>(
    Object.keys(initialTasks),
  );
  const [newColumnName, setNewColumnName] = useState<string>("");
  const [isAddingColumn, setIsAddingColumn] = useState<boolean>(false);

  const addTask = (column: string) => {
    const newPosition = tasks[column]?.length ?? 0;

    // MOVE ALL THIS LOGIC TO THE MODAL COMPONENT, MAKE SURE TO SEND THE POSITION IT WILL BE GOING TO BE ADDED TO
    // AT THE END MAKE SURE TO DO A REFRESH OF THE BOARD TO LOAD ALL THE TASKS
    const newTask: Task = {
      id: new Date().getTime().toString(),
      title: "New Task",
      description: "Description for new task",
      position: newPosition,
      column,
    };

    setTasks((prev) => ({
      ...prev,
      [column]: prev[column] ? [...(prev[column] ?? []), newTask] : [newTask],
    }));
  };

  const addColumn = () => {
    if (newColumnName.trim() !== "" && !tasks[newColumnName]) {
      setTasks((prev) => ({ ...prev, [newColumnName]: [] }));
      setColumnOrder([...columnOrder, newColumnName]);
      setNewColumnName("");
      setIsAddingColumn(false);
    }
  };

  const cancelAddColumn = () => {
    setNewColumnName("");
    setIsAddingColumn(false);
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;

    if (!destination) return;

    if (type === "COLUMN") {
      const newColumnOrder = Array.from(columnOrder);
      const [movedColumn] = newColumnOrder.splice(source.index, 1) as [string];
      newColumnOrder.splice(destination.index, 0, movedColumn);
      setColumnOrder(newColumnOrder);

      console.log("Column order changed:", newColumnOrder);
      return;
    }

    const startColumnId = source.droppableId;
    const finishColumnId = destination.droppableId;

    const startTasks = tasks[startColumnId]
      ? Array.from(tasks[startColumnId]!)
      : [];
    const finishTasks = tasks[finishColumnId]
      ? Array.from(tasks[finishColumnId]!)
      : [];

    const movedTask = startTasks.splice(source.index, 1)[0];

    if (!movedTask) return;

    let taskLogMessage: string;

    if (startColumnId === finishColumnId) {
      startTasks.splice(destination.index, 0, movedTask);
      startTasks.forEach((task, index) => (task.position = index));
      setTasks((prev) => ({
        ...prev,
        [startColumnId]: startTasks,
      }));
      taskLogMessage = `Task ${movedTask.id} moved within column ${startColumnId} to position ${destination.index}`;
    } else {
      movedTask.column = finishColumnId;
      finishTasks.splice(destination.index, 0, movedTask);
      startTasks.forEach((task, index) => (task.position = index));
      finishTasks.forEach((task, index) => (task.position = index));
      setTasks((prev) => ({
        ...prev,
        [startColumnId]: startTasks,
        [finishColumnId]: finishTasks,
      }));
      taskLogMessage = `Task ${movedTask.id} moved from column ${startColumnId} (pos ${source.index}) to column ${finishColumnId} (pos ${destination.index})`;
    }

    console.log(taskLogMessage);
    console.log("Updated state of columns and tasks:", {
      [startColumnId]: startTasks,
      [finishColumnId]: finishTasks,
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="all-columns" direction="horizontal" type="COLUMN">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex h-full w-full flex-col space-y-4 p-4 lg:flex-row lg:space-x-4 lg:space-y-0"
          >
            {columnOrder.map((columnId, index) => (
              <Draggable draggableId={columnId} index={index} key={columnId}>
                {(provided) => (
                  <div
                    {...provided.draggableProps}
                    ref={provided.innerRef}
                    className="flex min-w-[300px] max-w-[400px] flex-col"
                  >
                    <div
                      className="mb-4 rounded bg-gray-800 p-4 shadow"
                      {...provided.dragHandleProps}
                    >
                      <h2 className="break-words text-center text-base font-semibold">
                        {columnId.length > 27
                          ? columnId.slice(0, 27) + "..."
                          : columnId}
                      </h2>
                    </div>
                    <Droppable droppableId={columnId} type="TASK">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="mb-2 flex-grow overflow-auto"
                        >
                          {tasks[columnId]?.map((task, index) => (
                            <Draggable
                              draggableId={task.id}
                              index={index}
                              key={task.id}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="m-1 mb-4 p-1"
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
                          <div className="mt-2 w-full text-center">
                            <Button
                              onClick={() => addTask(columnId)}
                              className="w-full"
                            >
                              + Add a card
                            </Button>
                          </div>
                        </div>
                      )}
                    </Droppable>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            <div className="flex h-full min-w-[300px] max-w-[400px] flex-col items-center justify-center">
              {isAddingColumn ? (
                <>
                  <Input
                    placeholder="New Column Name"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                  />
                  <div className="mt-4 flex">
                    <Button onClick={addColumn} className="mr-2">
                      Add Column
                    </Button>
                    <Button onClick={cancelAddColumn}>X</Button>
                  </div>
                </>
              ) : (
                <Button
                  onClick={() => setIsAddingColumn(true)}
                  className="h-full min-w-[300px] max-w-[400px] p-4"
                >
                  + Add Column
                </Button>
              )}
            </div>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default KanbanBoard;
