import { Button } from "~/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogDescription,
  AlertDialogCancel,
} from "~/components/ui/alert-dialog";
import { type Column } from "~/server/types/IColumns";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { WorkOrders } from "~/server/types/IOrders";
import { TasksOnColumns } from "~/server/types/ITasks";
import { Label } from "~/components/ui/label";
import { ScrollArea } from "~/components/ui/scroll-area";

export default function WorkOrderDoneDialog(props: {
  columnsWorkOrder: Column[];
  tasksOnColumns: TasksOnColumns;
  workOrder: WorkOrders;
  triggerRefresh: () => void;
}) {
  const router = useRouter();
  const { triggerRefresh, columnsWorkOrder, workOrder, tasksOnColumns } = props;

  const [isDone, setIsDone] = useState(true);

  const handleSaveAndCloseClick = async () => {
    try {
      const data = {
        workOrder: workOrder,
        tasks: tasksOnColumns,
        columns: columnsWorkOrder,
      };

      const response = await fetch("/api/workOrderDone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        router.refresh();
      } else {
        console.error("Failed to update work order:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating work order:", error);
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
          variant={"secondary"}
          className="w-full sm:w-auto"
          disabled={isDone}
        >
          Mark as done
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="h-auto max-h-[90vh] w-full max-w-[90vw] overflow-auto sm:max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg sm:text-xl">
            Mark this work order as done
          </AlertDialogTitle>
          <AlertDialogDescription>
            Make sure you completed all the tasks before marking this work order
            as done.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4">
          <div className="flex-1">
            <Label>You have completed all these tasks</Label>
            <ScrollArea className="mt-1 h-32 w-full flex-1 rounded-md border">
              <div className="space-y-2 p-2">
                {Object.keys(tasksOnColumns).map((key) => {
                  if (tasksOnColumns[key]!.length > 0) {
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-base font-semibold">
                            Total tasks done: {tasksOnColumns[key]!.length}
                          </p>
                        </div>
                        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                          {tasksOnColumns[key]!.map((task) => (
                            <div
                              key={task.task_id + "task"}
                              className="rounded-md bg-gray-100 p-2"
                            >
                              <p className="text-sm font-medium text-gray-900">
                                {task.title}
                              </p>
                              <p className="mt-1 text-xs text-gray-600">
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
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogCancel asChild>
            <Button
              onClick={handleSaveAndCloseClick}
              variant="secondary"
              className="w-full sm:w-auto"
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