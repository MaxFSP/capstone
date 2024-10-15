/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// AdminWorkOrderDataViewDialog.tsx

import { useState, useEffect } from 'react';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { type RegularWorkOrder } from '~/server/types/IOrders';
import { type User } from '~/server/types/IUser';
import { type Machinery } from '~/server/types/IMachinery';
import { useToast } from '~/components/hooks/use-toast';

import { type Employee } from '~/server/types/IEmployee';
import { type Task } from '~/server/types/ITasks';
import { type Column } from '~/server/types/IColumns';

interface WorkOrderDetails {
  workOrder: RegularWorkOrder;
  tasksOnColumns: Record<string, Task[]>;
  columnsWorkOrder: Column[];
  machinery: Machinery;
  user: User;
  employees: Employee[];
}

export function AdminWorkOrderDataViewDialog(props: {
  title: string;
  data: RegularWorkOrder;
  type: string;
  size: string;
  users: User[];
}) {
  const { title, data, type, size, users } = props;

  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [workOrderDetails, setWorkOrderDetails] = useState<WorkOrderDetails | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch data when dialog opens
  useEffect(() => {
    if (dialogOpen) {
      // Fetch the additional data
      setLoading(true);
      void fetchWorkOrderData();
    }
  }, [dialogOpen]);

  const fetchWorkOrderData = async () => {
    try {
      const response = await fetch('/api/workOrderInformation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: data.order_id }),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch work order data');
      }
      const result = await response.json();
      const dataReceived = result.data as WorkOrderDetails;
      setWorkOrderDetails(dataReceived);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching work order data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch work order data.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  // Function to generate Excel report
  const generateExcelReport = async (orderId: number) => {
    try {
      const response = await fetch('/api/generateWorkOrderExcelReport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `WorkOrder_${orderId}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        console.error('Failed to generate Excel report');
        toast({
          title: 'Error',
          description: 'Failed to generate Excel report.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error generating Excel report:', error);
      toast({
        title: 'Error',
        description: 'Error generating Excel report.',
        variant: 'destructive',
      });
    }
  };

  // Function to generate PDF report
  const generateReport = async (orderId: number) => {
    try {
      const response = await fetch('/api/generateWorkOrderReport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `WorkOrder_${orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        console.error('Failed to generate report');
        toast({
          title: 'Error',
          description: 'Failed to generate report.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Error',
        description: 'Error generating report.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        {type === 'kanban' ? (
          <div
            onClick={(e) => e.stopPropagation()}
            className={
              'transition-shadow p-4 duration-150 ease-in-out hover:z-10 hover:shadow-outline'
            }
            key={data.order_id + 'KanbanTask'}
          >
            <div className="cursor-pointer">
              <h3 className="font-semibold">{data.name}</h3>
            </div>
          </div>
        ) : size === 'lg' ? (
          <p className="w-8 cursor-pointer text-sm font-semibold text-foreground">View</p>
        ) : (
          <div className="flex flex-col border-b border-border px-5 py-4 text-foreground cursor-pointer">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-base font-semibold">ID</p>
              <div className="flex items-center gap-2">
                <span className="text-sm">{data.order_id}</span>
              </div>
            </div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {data.name.length > 20 ? data.name.slice(0, 20) + '...' : data.name}
                </span>
              </div>
            </div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Assigned User</p>
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {users.find((user) => user.user_id === data.assigned_user)
                    ? `${users.find((user) => user.user_id === data.assigned_user)?.first_name} ${
                        users.find((user) => user.user_id === data.assigned_user)?.last_name
                      }`
                    : 'Unassigned'}
                </span>
              </div>
            </div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Start Date</p>
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {data.start_date ? new Date(data.start_date).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto bg-background text-foreground w-full sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>View the details of the work order below.</DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center items-center">
            <p>Loading...</p>
          </div>
        ) : workOrderDetails ? (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold mb-4">Work Order Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">Order ID:</p>
                  <p>{workOrderDetails.workOrder.order_id}</p>
                </div>
                <div>
                  <p className="font-semibold">Name:</p>
                  <p>{workOrderDetails.workOrder.name}</p>
                </div>
                <div>
                  <p className="font-semibold">Machine:</p>
                  <p>{`${workOrderDetails.machinery.brand} ${workOrderDetails.machinery.model} (${workOrderDetails.machinery.serial_number})`}</p>
                </div>
                <div>
                  <p className="font-semibold">Assigned User:</p>
                  <p>{`${workOrderDetails.user.first_name} ${workOrderDetails.user.last_name}`}</p>
                </div>
                <div>
                  <p className="font-semibold">Start Date:</p>
                  <p>{new Date(workOrderDetails.workOrder.start_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-semibold">End Date:</p>
                  <p>
                    {workOrderDetails.workOrder.end_date
                      ? new Date(workOrderDetails.workOrder.end_date).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Status:</p>
                  <p>
                    {workOrderDetails.workOrder.state === 1
                      ? 'Active'
                      : workOrderDetails.workOrder.state === 0
                        ? 'On Hold'
                        : 'Completed'}
                  </p>
                </div>
                {/* Add more details if needed */}
              </div>
            </div>
            {/* Columns and Tasks */}
            <div>
              <h2 className="text-xl font-bold mb-4">Columns and Tasks</h2>
              {workOrderDetails.columnsWorkOrder.map((column: Column) => (
                <div key={column.column_id} className="mt-4">
                  <h3 className="text-lg font-semibold">{column.title}</h3>
                  <div className="space-y-2">
                    {workOrderDetails.tasksOnColumns[column.title]?.map((task: Task) => {
                      const assignedEmployee = task.assigned_to
                        ? workOrderDetails.employees.find(
                            (e: Employee) => e.employee_id === task.assigned_to
                          )
                        : null;
                      const assignedTo = assignedEmployee
                        ? `${assignedEmployee.firstName} ${assignedEmployee.lastName}`
                        : 'Unassigned';
                      return (
                        <div key={task.task_id} className="p-2 border rounded">
                          <p className="font-semibold">Task title: {task.title}</p>
                          <p>Description: {task.description}</p>
                          <p>Assigned To: {assignedTo}</p>
                          <p>Priority: {task.priority}</p>
                          <p>
                            Status:{' '}
                            {task.state === 1
                              ? 'In Progress'
                              : task.state === 0
                                ? 'On Hold'
                                : 'Completed'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <p>No data available.</p>
          </div>
        )}
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
          <Button onClick={() => generateExcelReport(data.order_id)}>Download Excel Report</Button>
          <Button onClick={() => generateReport(data.order_id)}>Generate Report</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
