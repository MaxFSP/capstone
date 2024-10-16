/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useState, useEffect } from 'react';
export const dynamic = 'force-dynamic';

import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { type RegularWorkOrder } from '~/server/types/IOrders';
import { useRouter } from 'next/navigation';
import { AdminWorkOrderDataViewDialog } from './adminViewWorkOrderDialog';
import { type Machinery } from '~/server/types/IMachinery';
import { type User } from '~/server/types/IUser';

function AdminKanbanBoard(props: {
  workOrders: RegularWorkOrder[];
  fetchData: () => Promise<void>;
}) {
  const { workOrders, fetchData } = props;
  const router = useRouter();

  const columns = ['On Hold', 'In Progress', 'Done'];
  const [machines, setMachines] = useState<Machinery[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [columnsData, setColumnsData] = useState<Record<string, RegularWorkOrder[]>>({
    'On Hold': [],
    'In Progress': [],
    Done: [],
  });

  useEffect(() => {
    const newColumnsData: Record<string, RegularWorkOrder[]> = {
      'On Hold': [],
      'In Progress': [],
      Done: [],
    };

    workOrders.forEach((order) => {
      if (order.state === 0) {
        newColumnsData['On Hold']?.push(order);
      } else if (order.state === 1) {
        newColumnsData['In Progress']?.push(order);
      } else if (order.state === 2) {
        newColumnsData.Done?.push(order);
      }
    });
    console.log('Initial workOrders:', workOrders); // Log workOrders
    console.log('Initial columnsData:', newColumnsData); // Log columnsData

    setColumnsData(newColumnsData);
  }, [workOrders]);

  useEffect(() => {
    async function fetchWorkOrderData() {
      try {
        const response = await fetch('/api/getWorkOrderData');
        const data = (await response.json()) as { machinery: Machinery[]; users: User[] };

        setMachines(data.machinery);
        setUsers(data.users);
      } catch (error) {
        console.error('Error fetching work order data:', error);
      }
    }

    void fetchWorkOrderData();
  }, []);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    const sourceColumnName = source.droppableId;
    const destinationColumnName = destination.droppableId;

    // If the source and destination columns are the same, do nothing
    if (sourceColumnName === destinationColumnName) {
      return;
    }

    const sourceTasks = Array.from(columnsData[sourceColumnName]!);
    const destinationTasks = Array.from(columnsData[destinationColumnName]!);

    const [movedOrder] = sourceTasks.splice(source.index, 1);

    if (!movedOrder) return;

    // Update the state of the work order
    if (destinationColumnName === 'On Hold') {
      movedOrder.state = 0;
    } else if (destinationColumnName === 'In Progress') {
      movedOrder.state = 1;
    } else if (destinationColumnName === 'Done') {
      movedOrder.state = 2;
    }

    destinationTasks.splice(destination.index, 0, movedOrder);

    setColumnsData({
      ...columnsData,
      [sourceColumnName]: sourceTasks,
      [destinationColumnName]: destinationTasks,
    });

    // Update the work order state in the backend
    try {
      const response = await fetch('/api/updateWorkOrderState', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: movedOrder.order_id,
          state: movedOrder.state,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update work order state');
      }
      router.refresh();
    } catch (error) {
      console.error('Error updating work order state:', error);
    }
  };

  return (
    <div className="h-full">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="relative flex flex-col h-full">
          {/* Columns Section */}
          <div className="flex flex-grow w-full overflow-x-auto p-8">
            <div className="flex flex-row space-x-4">
              {columns.map((columnName) => (
                <div
                  key={columnName}
                  className="flex-shrink-0 w-[250px] sm:w-[250px] md:w-[350px] flex flex-col rounded-md border border-border p-4 shadow-md overflow-hidden"
                >
                  <Droppable droppableId={columnName}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex flex-col h-full`}
                      >
                        {/* Column Header */}
                        <div className="mb-4 rounded bg-secondary p-3 shadow cursor-pointer flex items-center justify-center">
                          <span className="break-words text-sm sm:text-base font-semibold text-secondary-foreground text-center">
                            {columnName}
                          </span>
                        </div>

                        {/* Scrollable area for the tasks */}
                        <div className="flex-grow flex flex-col overflow-hidden">
                          <div className="flex flex-col min-h-[100px]">
                            {columnsData[columnName]?.map((order, index) => (
                              <Draggable
                                draggableId={order.order_id.toString()}
                                index={index}
                                key={order.order_id}
                              >
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="m-1 mb-4 p-1"
                                  >
                                    <AdminWorkOrderDataViewDialog
                                      title={order.name}
                                      data={order}
                                      type="kanban"
                                      size=""
                                      users={users}
                                    />
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                            {/* Spacer to ensure droppable area fills the column */}
                            <div className="flex-grow" />
                          </div>
                        </div>
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}

export default AdminKanbanBoard;
