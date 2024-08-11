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
import { Input } from "~/components/ui/input";

import { useState } from "react";

export default function EditColumnDialog(props: {
  columnsWorkOrder: Column[];
  triggerRefresh: () => void;
}) {
  const router = useRouter();

  const { triggerRefresh, columnsWorkOrder } = props;
  const [columnTitles, setColumnTitles] = useState<{ [key: number]: string }>(
    {},
  );

  const initialValue = columnsWorkOrder;

  const [columns, setColumns] = useState<Column[]>(
    columnsWorkOrder || ([] as Column[]),
  );

  const handleInputChange = (columnId: number, value: string) => {
    setColumnTitles((prev) => ({
      ...prev,
      [columnId]: value,
    }));
  };

  const editColumn = async (columnId: number, columnName: string) => {
    const col = {
      column_id: columnId,
      title: columnName,
    };

    const response = await fetch("/api/updateColumn", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(col),
    });
    if (response.ok) {
      triggerRefresh();
      router.refresh();
    } else {
      // console.error("Failed to update columns:", result.error);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          Edit Columns
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="h-auto max-h-[90vh] w-full max-w-[90vw] overflow-auto sm:max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg sm:text-xl">
            Column editing
          </AlertDialogTitle>
          <AlertDialogDescription>Edit the column names</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4">
          {columns.map((column) => (
            <div
              key={column.column_id + column.title + "column"}
              className="flex flex-col items-center gap-4 sm:flex-row"
            >
              <Input
                className="w-full text-base font-semibold sm:w-[70%]"
                value={columnTitles[column.column_id] ?? column.title}
                onChange={(e) =>
                  handleInputChange(column.column_id, e.target.value)
                }
              />
              <Button
                variant={"default"}
                className="w-full sm:w-auto"
                onClick={() =>
                  editColumn(
                    column.column_id,
                    columnTitles[column.column_id] ?? column.title,
                  )
                }
              >
                + Edit Column
              </Button>
            </div>
          ))}
        </div>
        <AlertDialogFooter className="flex justify-end sm:justify-start">
          <AlertDialogCancel asChild>
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => {
                setColumns(initialValue);
              }}
            >
              Cancel
            </Button>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
