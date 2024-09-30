'use client';

import { Button } from '~/components/ui/button';
import { type RegularWorkOrder } from '~/server/types/IOrders';
import { useRouter } from 'next/navigation';
import DeleteColumnDialog from './deleteColumns';
import { type Column } from '~/server/types/IColumns';
import EditColumnDialog from './viewColumnDialog';
import WorkOrderDoneDialog from './WorkOrderDoneDialog';
import { type TasksOnColumns } from '~/server/types/ITasks';

// Import icons from React Icons
import { FiRefreshCcw, FiTrash2, FiEdit2, FiCheck } from 'react-icons/fi';

export default function KanbanBoardHeader(props: {
  workOrder: RegularWorkOrder;
  triggerRefresh: () => void;
  tasksOnColumns: TasksOnColumns;
  columnsWorkOrder: Column[];
}) {
  const { workOrder, triggerRefresh, columnsWorkOrder, tasksOnColumns } = props;
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between md:items-center">
      {/* Title Section */}
      <div className="text-center md:text-left">
        <h1 className="mb-2 text-xl font-bold text-foreground md:text-2xl">
          {workOrder.name + ' - ' + workOrder.order_id}
        </h1>
        <h1 className="mb-2 text-xl font-bold text-foreground md:text-2xl">Dashboard</h1>
      </div>

      {/* Buttons Section */}
      <div className="flex flex-row items-center gap-2 justify-center">
        {/* Update Page Button */}
        <Button
          className="flex items-center justify-center space-x-0 md:space-x-2 bg-primary text-primary-foreground hover:bg-primary-dark px-4 py-2"
          onClick={() => {
            triggerRefresh(); // Trigger the refresh in DashboardPage
            router.refresh(); // Optional: Re-fetch data
          }}
          aria-label="Update Page"
        >
          {/* Show text on medium and larger screens, icon on small screens */}
          <span className="hidden md:inline">Update Page</span>
          <FiRefreshCcw className="md:hidden text-xl" />
        </Button>

        {/* Delete Column Dialog Button */}
        <DeleteColumnDialog triggerRefresh={triggerRefresh} columnsWorkOrder={columnsWorkOrder} />

        {/* Edit Column Dialog Button */}
        <EditColumnDialog triggerRefresh={triggerRefresh} columnsWorkOrder={columnsWorkOrder} />

        {/* Work Order Done Dialog Button */}
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
