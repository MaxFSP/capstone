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
import { useToast } from '~/components/hooks/use-toast';

import { useRouter } from 'next/navigation';
import { Input } from '~/components/ui/input';

import { useState } from 'react';

import { FiEdit2 } from 'react-icons/fi';

export default function EditColumnDialog(props: {
  columnsWorkOrder: Column[];
  fetchData: () => Promise<void>;
}) {
  const router = useRouter();

  const { columnsWorkOrder, fetchData } = props;
  const [columnTitles, setColumnTitles] = useState<Record<number, string>>({});

  const initialValue = columnsWorkOrder;
  const { toast } = useToast();
  const [columns, setColumns] = useState<Column[]>(columnsWorkOrder || ([] as Column[]));

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

    const response = await fetch('/api/updateColumn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(col),
    });
    if (response.ok) {
      toast({
        title: 'Success',
        description: 'Column edited successfully.',
      });
      router.refresh();
      void fetchData();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to edit column.',
        variant: 'destructive',
      });
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center justify-center space-x-0 md:space-x-2 bg-secondary text-secondary-foreground hover:bg-secondary-dark px-4 py-2"
        >
          <span className="hidden md:inline">Edit Columns</span>
          <FiEdit2 className="md:hidden" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="h-auto max-h-[90vh] w-full max-w-[90vw] overflow-auto bg-background text-foreground sm:max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg text-primary sm:text-xl">
            Column editing
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Edit the column names
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4">
          {columns.map((column) => (
            <div
              key={column.column_id + column.title + 'column'}
              className="flex flex-col items-center gap-4 sm:flex-row"
            >
              <Input
                className="w-full border border-border bg-muted text-base font-semibold text-muted-foreground sm:w-[70%]"
                value={columnTitles[column.column_id] ?? column.title}
                onChange={(e) => handleInputChange(column.column_id, e.target.value)}
              />
              <Button
                variant="default"
                className="w-full bg-primary text-primary-foreground sm:w-auto"
                onClick={() =>
                  editColumn(column.column_id, columnTitles[column.column_id] ?? column.title)
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
              className="w-full bg-secondary text-secondary-foreground sm:w-auto"
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
