"use client";
import { Button } from "~/components/ui/button";
import { type WorkOrders } from "~/server/types/IOrders";
import { useRouter } from "next/navigation";
import DeleteColumnDialog from "./deleteColumns";
import { type Column } from "~/server/types/IColumns";
import EditColumnDialog from "./viewColumnDialog";
import WorkOrderDoneDialog from "./WorkOrderDoneDialog";
import { type TasksOnColumns } from "~/server/types/ITasks";
import { useEffect, useState } from "react";

export default function KanbanBoardHeader(props: {
  workOrder: WorkOrders;
  triggerRefresh: () => void;
  tasksOnColumns: TasksOnColumns;
  columnsWorkOrder: Column[];
}) {
  const { workOrder, triggerRefresh, columnsWorkOrder, tasksOnColumns } = props;
  const router = useRouter();

  return (
    <div className="flex flex-row items-center justify-between">
      <div>
        <h1 className="mb-4 text-2xl font-bold">
          {workOrder.name + " - " + workOrder.order_id}
        </h1>
        <h1 className="mb-4 text-2xl font-bold">{"Currently working on: "}</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={() => {
            triggerRefresh(); // Trigger the refresh in DashboardPage
            router.refresh(); // Optional: Keep this if you want to re-fetch data
          }}
        >
          Update page
        </Button>

        <DeleteColumnDialog
          triggerRefresh={triggerRefresh}
          columnsWorkOrder={columnsWorkOrder}
        />

        <EditColumnDialog
          triggerRefresh={triggerRefresh}
          columnsWorkOrder={columnsWorkOrder}
        />
        <WorkOrderDoneDialog
          triggerRefresh={triggerRefresh}
          workOrder={workOrder}
          tasksOnColumns={tasksOnColumns}
          columnsWorkOrder={columnsWorkOrder}
        />
      </div>
    </div>
  );
}
