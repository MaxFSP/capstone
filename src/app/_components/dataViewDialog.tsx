/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

interface TableColumn {
  key: string;
  label: string;
}

type DataType = Record<string, any>;

export function DataViewDialog(props: {
  title: string;
  data: DataType;
  dbColumns: TableColumn[];
}) {
  // TODO: CHECK PERFORMANCE ISSUES WITH LARGE DATA SETS
  // MAYBE GET DATA ON MOUNT AND GET IT FROM ID INSTEAD OF PASSING IT

  const { title, data, dbColumns } = props;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <p className="w-8 cursor-pointer text-small font-semibold">{title}</p>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md lg:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-large">Testing</DialogTitle>
          <DialogDescription>
            Anyone who has this link will be able to view this.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            {dbColumns.map((col) => (
              <div key={col.key}>
                <Label>{col.label}</Label>
                <Input
                  value={data[col.key]}
                  readOnly
                  className="border border-gray-300"
                />
              </div>
            ))}
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
