/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
'use client';

import { useState, useEffect } from 'react';
export const dynamic = 'force-dynamic';

import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import KanbanTask from './KanbanTask';
import { type WorkOrders } from '~/server/types/IOrders';
import { type TasksOnColumns } from '~/server/types/ITasks';
import { type Column } from '~/server/types/IColumns';
import { CreateTaskDialog } from './createTask';
import { type Employee } from '~/server/types/IEmployee';
import { type Tool } from '~/server/types/ITool';
import { type Part } from '~/server/types/IPart';
import { useRouter } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';

function KanbanBoard(props: {
  workOrder: WorkOrders;
  tasksOnColumns: TasksOnColumns;
  allColumns: Column[];
  employees: Employee[];
  tools: Tool[];
  parts: Part[];
  triggerRefresh: () => void;
}) {
  const { workOrder, tasksOnColumns, allColumns, employees, tools, parts, triggerRefresh } = props;
  const router = useRouter();

  useEffect(() => {
    setTasks(tasksOnColumns);
    setColumnOrder(Object.keys(tasksOnColumns));
    setColumnList(allColumns);
  }, [tasksOnColumns, triggerRefresh, allColumns]);

  const [tasks, setTasks] = useState<TasksOnColumns>(tasksOnColumns);
  const [columnOrder, setColumnOrder] = useState<string[]>(Object.keys(tasksOnColumns));

  const [newColumnName, setNewColumnName] = useState<string>('');
  const [columnList, setColumnList] = useState<Column[]>(allColumns);
  const [isAddingColumn, setIsAddingColumn] = useState<boolean>(false);

  const addColumn = async () => {
    if (newColumnName.trim() !== '' && !tasks[newColumnName]) {
      setTasks((prev) => ({ ...prev, [newColumnName]: [] }));
      setColumnOrder([...columnOrder, newColumnName]);
      setNewColumnName('');
      setIsAddingColumn(false);

      const newColumn = {
        title: newColumnName,
        position: columnOrder.length,
        order_id: workOrder.order_id,
      };

      try {
        const response = await fetch('/api/createColumn', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newColumn),
        });
        if (response.ok) {
          console.log('Column added successfully:', newColumnName);
          const responseData = await response.json();
          if (responseData.data) {
            const newColumnData = responseData.data;
            setColumnList([...columnList, newColumnData[0]]);
          }
        } else {
          console.error('Failed to add column:', response.statusText);
        }
      } catch (error) {
        console.error('Error adding column:', error);
      }
    }
  };

  const cancelAddColumn = () => {
    setNewColumnName('');
    setIsAddingColumn(false);
  };

  const getColumnIdByName = (name: string): number => {
    const column = columnList.find((col) => col.title === name);
    return column ? column.column_id : 0;
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, type } = result;

    if (!destination) return;

    if (type === 'COLUMN') {
      const newColumnOrder = Array.from(columnOrder);
      const [movedColumn] = newColumnOrder.splice(source.index, 1) as [string];
      newColumnOrder.splice(destination.index, 0, movedColumn);
      setColumnOrder(newColumnOrder);

      const newestColumnOrder = allColumns.map((column) => {
        const newPos = newColumnOrder.findIndex((c) => c === column.title);
        column.position = newPos;
        return column;
      });

      try {
        const response = await fetch('/api/updateColumns', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newestColumnOrder),
        });

        if (!response.ok) {
          throw new Error('Failed to update columns');
        }
      } catch (error) {
        console.error('Error updating columns:', error);
      }
      return;
    }

    const startColumnId = source.droppableId;
    const finishColumnName = destination.droppableId;
    const finishColumnId = getColumnIdByName(finishColumnName);

    const startTasks = tasks[startColumnId] ? Array.from(tasks[startColumnId]!) : [];
    const finishTasks = tasks[finishColumnName] ? Array.from(tasks[finishColumnName]!) : [];

    const movedTask = startTasks.splice(source.index, 1)[0];

    if (!movedTask) return;

    if (startColumnId === finishColumnName) {
      startTasks.splice(destination.index, 0, movedTask);
      startTasks.forEach((task, index) => (task.position = index));
      setTasks((prev) => ({
        ...prev,
        [startColumnId]: startTasks,
      }));

      console.log(
        `API Request: Update task positions in column ${startColumnId} at endpoint /api/updateTaskPositions with data:`,
        startTasks
      );
      try {
        const response = await fetch('/api/updateTaskPositions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(startTasks),
        });

        if (!response.ok) {
          throw new Error('Failed to update task positions');
        }
      } catch (error) {
        console.error('Error updating task positions:', error);
      }
    } else {
      movedTask.column_id = finishColumnId; // Ensure column_id is a number
      finishTasks.splice(destination.index, 0, movedTask);
      startTasks.forEach((task, index) => (task.position = index));
      finishTasks.forEach((task, index) => (task.position = index));
      setTasks((prev) => ({
        ...prev,
        [startColumnId]: startTasks,
        [finishColumnName]: finishTasks,
      }));
      console.log(
        `API Request: Move task ${movedTask.task_id} from column ${startColumnId} to column ${finishColumnId} and update positions at endpoint /api/moveTask with data:`,
        {
          task_id: movedTask.task_id,
          new_column_id: movedTask.column_id,
          new_position: destination.index,
        }
      );

      try {
        const response = await fetch('/api/moveTask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            task_id: movedTask.task_id,
            new_column_id: movedTask.column_id,
            new_position: destination.index,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to move task');
        }
        router.refresh();
      } catch (error) {
        console.error('Error moving task:', error);
      }
    }

    console.log('Updated state of columns and tasks:', {
      [startColumnId]: startTasks,
      [finishColumnName]: finishTasks,
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="all-columns" direction="horizontal" type="COLUMN">
        {(provided) => (
          <div className="flex h-full w-full ">
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex h-full w-fit flex-col space-y-4 p-4 lg:flex-row lg:space-x-4 lg:space-y-0"
            >
              {columnOrder.map((columnId, index) => (
                <Draggable draggableId={columnId} index={index} key={columnId}>
                  {(provided) => (
                    <div
                      {...provided.draggableProps}
                      ref={provided.innerRef}
                      className="flex min-w-[300px] max-w-[400px] flex-col rounded-sm border border-border p-1 shadow-md"
                    >
                      <div
                        className="mb-4 rounded bg-secondary p-4 shadow"
                        {...provided.dragHandleProps}
                      >
                        <h2 className="break-words text-center text-base font-semibold text-secondary-foreground">
                          {columnId.length > 27 ? columnId.slice(0, 27) + '...' : columnId}
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
                                draggableId={task.task_id.toString()}
                                index={index}
                                key={task.task_id}
                              >
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="m-1 mb-4 p-1"
                                  >
                                    <KanbanTask
                                      key={task.task_id + 'KanbanTask'}
                                      task={task}
                                      employees={employees}
                                      column_id={getColumnIdByName(columnId)}
                                      tools={tools}
                                      parts={parts}
                                      onGone={() => {
                                        const newTasks = { ...tasks };
                                        delete newTasks[columnId]![index];
                                        setTasks(newTasks);
                                      }}
                                      triggerRefresh={() => {
                                        triggerRefresh();
                                      }}
                                    />
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                            <div className="mt-2 w-full text-center">
                              <CreateTaskDialog
                                employees={employees}
                                pos={tasks[columnId]?.length ?? 0}
                                column_id={getColumnIdByName(columnId)}
                                tools={tools}
                                parts={parts}
                                triggerRefresh={() => {
                                  triggerRefresh();
                                }}
                              />
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
                      className="border border-border bg-background text-foreground"
                    />
                    <div className="mt-4 flex">
                      <Button
                        onClick={addColumn}
                        className="mr-2 bg-primary text-primary-foreground"
                      >
                        Add Column
                      </Button>
                      <Button
                        onClick={cancelAddColumn}
                        className="bg-destructive text-destructive-foreground"
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : employees &&
                  employees.length > 0 &&
                  tools &&
                  tools.length > 0 &&
                  parts &&
                  parts.length > 0 ? (
                  <Button
                    onClick={() => setIsAddingColumn(true)}
                    className="h-full min-w-[300px] max-w-[400px] bg-primary p-4 text-primary-foreground"
                  >
                    + Add Column
                  </Button>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Button
                          disabled
                          className="h-full min-w-[300px] max-w-[400px] bg-primary p-4 text-primary-foreground"
                        >
                          + Add Column
                        </Button>{' '}
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Make sure to populate the employees, tools, and parts lists before adding
                          a new column this will prevent errors when adding a task.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default KanbanBoard;
