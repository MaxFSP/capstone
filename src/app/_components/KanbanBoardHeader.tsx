"use client";
import { Button } from "~/components/ui/button";
import { type WorkOrders } from "~/server/types/IOrders";
import { useRouter } from "next/navigation";
import DeleteColumnDialog from "./deleteColumns";
import { type Column } from "~/server/types/IColumns";
import EditColumnDialog from "./viewColumnDialog";
import WorkOrderDoneDialog from "./WorkOrderDoneDialog";
import { type TasksOnColumns } from "~/server/types/ITasks";

export default function KanbanBoardHeader(props: {
  workOrder: WorkOrders;
  triggerRefresh: () => void;
  tasksOnColumns: TasksOnColumns;
  columnsWorkOrder: Column[];
}) {
  const { workOrder, triggerRefresh, columnsWorkOrder, tasksOnColumns } = props;
  const router = useRouter();

  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h1 className="mb-2 text-xl font-bold text-foreground md:text-2xl">
          {workOrder.name + " - " + workOrder.order_id}
        </h1>
        <h1 className="mb-2 text-xl font-bold text-foreground md:text-2xl">
          Dashboard
        </h1>
      </div>
      <div className="flex flex-col items-start gap-2 md:flex-row md:items-center">
        <Button
          className="w-full bg-primary text-primary-foreground sm:w-auto"
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
