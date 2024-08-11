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

export default function DeleteColumnDialog(props: {
  columnsWorkOrder: Column[];
  triggerRefresh: () => void;
}) {
  const router = useRouter();

  const deleteColumns = async (columnId: number) => {
    const response = await fetch("/api/deleteColumn", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(columnId),
    });
    if (response.ok) {
      router.refresh();
    } else {
      // console.error("Failed to delete columns:", result.error);
    }
  };

  const { triggerRefresh, columnsWorkOrder } = props;
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete Columns</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="h-auto max-h-[90vh] overflow-auto lg:max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-large">
            Delete Columns
          </AlertDialogTitle>
          <AlertDialogDescription>
            Make sure you are not deleting any column with tasks. If you are
            they will be deleted as well.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4">
          <h3>Columns to be deleted:</h3>
          <div>
            {columnsWorkOrder.map((column) => (
              <div key={column.column_id + "column" + column.title}>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-base font-semibold">{column.title}</p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={"destructive"}
                      onClick={() => deleteColumns(column.column_id)}
                    >
                      - Delete Column
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <AlertDialogFooter className="flex justify-end sm:justify-start">
          <AlertDialogCancel asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
