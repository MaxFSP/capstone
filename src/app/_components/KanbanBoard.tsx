/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
'use client';

import { useState, useEffect } from 'react';
export const dynamic = 'force-dynamic';

import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import KanbanTask from './KanbanTask';
import { CreateTaskDialog } from './createTask';
import { type RegularWorkOrder } from '~/server/types/IOrders';
import { type TasksOnColumns } from '~/server/types/ITasks';
import { type Column } from '~/server/types/IColumns';
import { type Employee } from '~/server/types/IEmployee';
import { type Tool } from '~/server/types/ITool';
import { type Part } from '~/server/types/IPart';
import { useRouter } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';
import { FiPlus, FiX } from 'react-icons/fi';

function KanbanBoard(props: {
  workOrder: RegularWorkOrder;
  tasksOnColumns: TasksOnColumns;
  allColumns: Column[];
  employees: Employee[];
  tools: Tool[];
  parts: Part[];
  fetchData: () => Promise<void>;
}) {
  const { workOrder, tasksOnColumns, allColumns, employees, tools, parts, fetchData } = props;
  const router = useRouter();

  useEffect(() => {
    setTasks(tasksOnColumns);
    setColumnOrder(Object.keys(tasksOnColumns));
    setColumnList(allColumns);
  }, [tasksOnColumns, allColumns]);

  const [tasks, setTasks] = useState<TasksOnColumns>(tasksOnColumns);
  const [columnOrder, setColumnOrder] = useState<string[]>(Object.keys(tasksOnColumns));

  const [newColumnName, setNewColumnName] = useState<string>('');
  const [columnList, setColumnList] = useState<Column[]>(allColumns);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const openModal = () => {
    setIsModalOpen(true);
    setNewColumnName('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewColumnName('');
  };

  const addColumn = async () => {
    if (newColumnName.trim() !== '' && !tasks[newColumnName]) {
      setTasks((prev) => ({ ...prev, [newColumnName]: [] }));
      setColumnOrder([...columnOrder, newColumnName]);
      closeModal();

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
      <div className="relative flex flex-col flex-grow">
        {/* Add Column Button - Top Right for Larger Screens */}
        <div className="absolute top-4 right-4 hidden sm:block">
          {employees &&
          employees.length > 0 &&
          tools &&
          tools.length > 0 &&
          parts &&
          parts.length > 0 ? (
            <Button
              onClick={openModal}
              className="bg-primary py-2 px-4 sm:py-3 sm:px-6 text-primary-foreground flex items-center space-x-2 rounded-md shadow-lg hover:bg-primary-dark transition-colors duration-200 ease-in-out"
              aria-label="Add Column"
            >
              <FiPlus className="text-xl" />
              <span className="hidden sm:inline text-sm sm:text-base">Add Column</span>
            </Button>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    disabled
                    className="bg-primary py-2 px-4 sm:py-3 sm:px-6 text-primary-foreground cursor-not-allowed flex items-center space-x-2 rounded-md shadow-lg"
                    aria-label="Add Column Disabled"
                  >
                    <FiPlus className="text-xl" />
                    <span className="hidden sm:inline text-sm sm:text-base">Add Column</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Populate employees, tools, and parts lists before adding a new column to prevent
                    errors when adding a task.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Floating Action Button for Mobile Devices */}
        <div className="fixed bottom-6 right-6 sm:hidden">
          {employees &&
          employees.length > 0 &&
          tools &&
          tools.length > 0 &&
          parts &&
          parts.length > 0 ? (
            <Button
              onClick={openModal}
              className="bg-primary text-primary-foreground flex items-center justify-center w-14 h-14 rounded-full shadow-lg hover:bg-primary-dark transition-colors duration-200 ease-in-out"
              aria-label="Add Column"
            >
              <FiPlus className="text-2xl" />
            </Button>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    disabled
                    className="bg-primary text-primary-foreground cursor-not-allowed flex items-center justify-center w-14 h-14 rounded-full shadow-lg"
                    aria-label="Add Column Disabled"
                  >
                    <FiPlus className="text-2xl" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Populate employees, tools, and parts lists before adding a new column to prevent
                    errors when adding a task.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Columns Section */}
        <Droppable droppableId="all-columns" direction="horizontal" type="COLUMN">
          {(provided) => (
            <div className="flex flex-grow w-full overflow-x-auto custom-scrollbar p-8">
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="flex flex-row space-x-4"
              >
                {columnOrder.map((columnId, index) => (
                  <Draggable draggableId={columnId} index={index} key={columnId}>
                    {(provided) => (
                      <div
                        {...provided.draggableProps}
                        ref={provided.innerRef}
                        className="flex-shrink-0 w-[250px] sm:w-[250px] md:w-[350px] flex flex-col rounded-md border border-border p-4 shadow-md  overflow-x-hidden"
                      >
                        {/* Column Header without h2 */}
                        <div
                          className="mb-4 rounded bg-secondary p-3 shadow cursor-pointer flex items-center justify-center"
                          {...provided.dragHandleProps}
                        >
                          <span className="break-words text-sm sm:text-base font-semibold text-secondary-foreground text-center">
                            {columnId.length > 20 ? `${columnId.slice(0, 20)}...` : columnId}
                          </span>
                        </div>

                        {/* Tasks List */}
                        <Droppable droppableId={columnId} type="TASK">
                          {(provided) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className="flex-grow overflow-y-auto overflow-x-hidden custom-scrollbar"
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
                                        key={`${task.task_id}-KanbanTask`}
                                        task={task}
                                        employees={employees}
                                        column_id={getColumnIdByName(columnId)}
                                        tools={tools}
                                        parts={parts}
                                        onGone={() => {
                                          const newTasks = { ...tasks };
                                          newTasks[columnId]?.splice(index, 1);
                                          setTasks(newTasks);
                                        }}
                                        size=""
                                        fetchData={fetchData}
                                        type="kanban"
                                      />
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}

                              {/* Create Task Dialog */}
                              <div className="mt-2 w-full text-center">
                                <CreateTaskDialog
                                  employees={employees}
                                  pos={tasks[columnId]?.length ?? 0}
                                  column_id={getColumnIdByName(columnId)}
                                  tools={tools}
                                  parts={parts}
                                  type="kanban"
                                  fetchData={fetchData} // Pass fetchData here
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
              </div>
            </div>
          )}
        </Droppable>

        {/* Custom Modal for Adding Column */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* Overlay */}
            <div className="absolute inset-0  opacity-50" onClick={closeModal}></div>

            {/* Modal Content */}
            <div className=" rounded-lg shadow-lg z-10 w-11/12 max-w-md mx-auto p-6 relative">
              {/* Close Button */}
              <button
                className="absolute top-3 right-3 text-primary-foreground hover:text-primary-dark"
                onClick={closeModal}
                aria-label="Close Add Column Modal"
              >
                <FiX size={24} />
              </button>

              <h3 className="text-xl font-semibold mb-4 text-primary-foreground">Add New Column</h3>
              <Input
                placeholder="Column Name"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                className="w-full border border-border bg-background text-primary-foreground mb-4 rounded-md px-3 py-2"
              />
              <div className="flex justify-end space-x-2">
                <Button
                  onClick={closeModal}
                  className="bg-primary text-primary-foreground hover:bg-primary-dark px-4 py-2 rounded-md transition-colors duration-200 ease-in-out"
                  aria-label="Cancel Add Column"
                >
                  Cancel
                </Button>
                <Button
                  onClick={addColumn}
                  className="bg-primary text-primary-foreground hover:bg-primary-dark px-4 py-2 rounded-md transition-colors duration-200 ease-in-out"
                  aria-label="Confirm Add Column"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DragDropContext>
  );
}

export default KanbanBoard;
