'use client';

import { type TasksOnColumns } from '~/server/types/ITasks';
import { type Column } from '~/server/types/IColumns';
import KanbanBoardHeader from './KanbanBoardHeader';
import { type Employee } from '~/server/types/IEmployee';
import { type RegularWorkOrder } from '~/server/types/IOrders';
import { type Part } from '~/server/types/IPart';
import { type Tool } from '~/server/types/ITool';
import { useState, useEffect } from 'react';
import KanbanBoard from './KanbanBoard';
import ListBoard from './ListBoard';

export default function DashboardView(props: {
  workOrder: RegularWorkOrder | undefined;
  tasksOnColumns: TasksOnColumns;
  columnsWorkOrder: Column[];
  employees: Employee[];
  tools: Tool[];
  parts: Part[];
}) {
  const { workOrder, tasksOnColumns, columnsWorkOrder, employees, tools, parts } = props;
  const [boardType, setBoardType] = useState('list');

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const [kanbanData, setKanbanData] = useState({
    tasksOnColumns,
    columnsWorkOrder,
  });

  useEffect(() => {
    setKanbanData({
      tasksOnColumns,
      columnsWorkOrder,
    });
  }, [tasksOnColumns, columnsWorkOrder]);

  return (
    <div className="min-h-screen p-4 flex flex-col">
      {workOrder ? (
        <div className="rounded-lg  shadow-md flex flex-col flex-grow">
          <KanbanBoardHeader
            key={`${workOrder.order_id}-${refreshTrigger}`}
            workOrder={workOrder}
            triggerRefresh={triggerRefresh}
            tasksOnColumns={kanbanData.tasksOnColumns}
            columnsWorkOrder={columnsWorkOrder}
          />
          {boardType === 'kanban' ? (
            <KanbanBoard
              key={`${workOrder.order_id}-${refreshTrigger}`}
              workOrder={workOrder}
              tasksOnColumns={kanbanData.tasksOnColumns}
              allColumns={kanbanData.columnsWorkOrder}
              employees={employees}
              tools={tools}
              parts={parts}
              triggerRefresh={triggerRefresh}
            />
          ) : (
            <ListBoard
              key={`${workOrder.order_id}-${refreshTrigger}`}
              workOrder={workOrder}
              tasksOnColumns={kanbanData.tasksOnColumns}
              allColumns={kanbanData.columnsWorkOrder}
              employees={employees}
              tools={tools}
              parts={parts}
              triggerRefresh={triggerRefresh}
            />
          )}
        </div>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center  rounded-lg p-6 shadow-md">
          <h1 className="mb-4 text-center text-3xl font-extrabold text-primary">
            No Work Order Found
          </h1>
          <p className="w-full max-w-lg text-center text-lg text-muted-foreground">
            Sit back and relax, we will create a work order for you soon.
          </p>
        </div>
      )}
    </div>
  );
}
