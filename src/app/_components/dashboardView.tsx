"use client";

import KanbanBoard from "./KanbanBoard";
import { type TasksOnColumns } from "~/server/types/ITasks";
import { type Column } from "~/server/types/IColumns";
import KanbanBoardHeader from "./KanbanBoardHeader";
import { type Employee } from "~/server/types/IEmployee";
import { type WorkOrders } from "~/server/types/IOrders";
import { type Part } from "~/server/types/IPart";
import { type Tool } from "~/server/types/ITool";
import { useState } from "react";

export default function DashboardView(props: {
  workOrder: WorkOrders | undefined;
  tasksOnColumns: TasksOnColumns;
  columnsWorkOrder: Column[];
  employees: Employee[];
  tools: Tool[];
  parts: Part[];
}) {
  const {
    workOrder,
    tasksOnColumns,
    columnsWorkOrder,
    employees,
    tools,
    parts,
  } = props;

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => setRefreshTrigger((prev) => prev + 1);

  return (
    <div>
      {workOrder ? (
        <div className="p-4">
          <KanbanBoardHeader
            workOrder={workOrder}
            triggerRefresh={triggerRefresh}
          />
          <KanbanBoard
            key={`${refreshTrigger}-${workOrder?.order_id}`}
            workOrder={workOrder}
            tasksOnColumns={tasksOnColumns}
            allColumns={columnsWorkOrder}
            employees={employees}
            tools={tools}
            parts={parts}
            triggerRefresh={triggerRefresh}
          />
        </div>
      ) : (
        <div className="flex h-screen w-screen flex-col items-center justify-center">
          <h1 className="w-full text-center text-2xl font-bold">
            No work order found
          </h1>
          <p className="w-full overflow-ellipsis text-center">
            Sit back and relax, we will create a work order for you
          </p>
        </div>
      )}
    </div>
  );
}
