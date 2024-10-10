/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from '~/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogDescription,
  AlertDialogCancel,
} from '~/components/ui/alert-dialog';
import { type Column } from '~/server/types/IColumns';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { type RegularWorkOrder } from '~/server/types/IOrders';
import { type TasksOnColumns } from '~/server/types/ITasks';
import { Label } from '~/components/ui/label';
import { ScrollArea } from '~/components/ui/scroll-area';
import { useToast } from '~/components/hooks/use-toast';
import { FiCheck } from 'react-icons/fi';

export default function WorkOrderDoneDialog(props: {
  columnsWorkOrder: Column[];
  tasksOnColumns: TasksOnColumns;
  workOrder: RegularWorkOrder;
  fetchData: () => Promise<void>;
}) {
  const router = useRouter();
  const { columnsWorkOrder, workOrder, tasksOnColumns, fetchData } = props;
  const { toast } = useToast();
  const [isDone, setIsDone] = useState(true);

  const handleSaveAndCloseClick = async () => {
    try {
      const data = {
        workOrder: workOrder,
        tasks: tasksOnColumns,
        columns: columnsWorkOrder,
      };

      const response = await fetch('/api/workOrderDone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Work order marked as done.',
        });
        router.refresh();
        void fetchData();
      } else {
        console.error('Failed to update work order:', response.statusText);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark work order as done.',
      });
      console.error('Error updating work order:', error);
    }
  };

  useEffect(() => {
    const totalTasks = Object.keys(tasksOnColumns).reduce((acc, key) => {
      return acc + tasksOnColumns[key]!.length;
    }, 0);

    if (columnsWorkOrder.length >= 2 && totalTasks > 0) {
      const lastColumn = columnsWorkOrder[columnsWorkOrder.length - 1];
      if (lastColumn) {
        const tasksInLastColumn = tasksOnColumns[lastColumn.title];
        if (tasksInLastColumn && tasksInLastColumn.length === totalTasks) {
          setIsDone(false);
        } else {
          setIsDone(true);
        }
      }
    }
  }, [columnsWorkOrder, tasksOnColumns]);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="secondary"
          className="flex items-center justify-center space-x-0 md:space-x-2 bg-success text-success-foreground hover:bg-success-dark px-4 py-2"
          disabled={isDone}
          aria-label="Mark Work Order as Done"
        >
          <span className="hidden md:inline">Mark as done</span>
          <FiCheck className="md:hidden" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="h-auto max-h-[90vh] w-full max-w-[90vw] overflow-auto bg-background text-foreground sm:max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg text-primary sm:text-xl">
            Mark this work order as done
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Make sure you completed all the tasks before marking this work order as done.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4">
          <div className="flex-1">
            <Label>You have completed all these tasks</Label>
            <ScrollArea className="mt-1 h-32 w-full flex-1 rounded-md border border-border">
              <div className="space-y-2 p-2">
                {Object.keys(tasksOnColumns).map((key) => {
                  if (tasksOnColumns[key]!.length > 0) {
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-base font-semibold text-primary">
                            Total tasks done: {tasksOnColumns[key]!.length}
                          </p>
                        </div>
                        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                          {tasksOnColumns[key]!.map((task) => (
                            <div key={task.task_id + 'task'} className="rounded-md bg-muted p-2">
                              <p className="text-sm font-medium text-foreground">{task.title}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {task.end_date.toDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
        <AlertDialogFooter className="flex flex-col justify-end gap-2 sm:flex-row sm:justify-start">
          <AlertDialogCancel asChild>
            <Button
              type="button"
              variant="secondary"
              className="w-full bg-secondary text-secondary-foreground sm:w-auto"
            >
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogCancel asChild>
            <Button
              onClick={handleSaveAndCloseClick}
              variant="secondary"
              className="w-full bg-primary text-primary-foreground sm:w-auto"
              disabled={isDone}
            >
              Mark as done
            </Button>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
