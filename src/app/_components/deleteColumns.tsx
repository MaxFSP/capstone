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
        <Button variant="destructive" className="w-full sm:w-auto">
          Delete Columns
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="h-auto max-h-[90vh] w-full max-w-[90vw] overflow-auto sm:max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg sm:text-xl">
            Delete Columns
          </AlertDialogTitle>
          <AlertDialogDescription>
            Make sure you are not deleting any column with tasks. If you are
            they will be deleted as well.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4">
          <h3 className="text-lg">Columns to be deleted:</h3>
          <div>
            {columnsWorkOrder.map((column) => (
              <div key={column.column_id + "column" + column.title}>
                <div className="mt-2 flex flex-col items-center justify-between sm:flex-row">
                  <p className="text-base font-semibold">{column.title}</p>
                  <div className="mt-2 flex items-center gap-2 sm:mt-0">
                    <Button
                      variant={"destructive"}
                      className="w-full sm:w-auto"
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
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
