/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Avatar } from "@nextui-org/avatar";
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
  type?: string; // Optional type to handle special rendering cases
}

interface TableColumns {
  key: string;
  label: string;
}

type DataType = Record<string, any>;

export function SmallDataViewDialog(props: {
  key: string;
  item: any;
  index: number;
  columns: TableColumn[];
  dbColumns: TableColumns[];
  data: DataType;
}) {
  // TODO: CHECK PERFORMANCE ISSUES WITH LARGE DATA SETS
  // MAYBE GET DATA ON MOUNT AND GET IT FROM ID INSTEAD OF PASSING IT

  const { key, index, item, columns, dbColumns, data } = props;
  return (
    <div key={key}>
      <Dialog>
        <DialogTrigger asChild>
          <div
            key={item.id}
            className="flex flex-col border-b border-gray-700 px-5 py-4 text-white"
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-base font-semibold">ID</p>
              <div className="flex items-center gap-2">{index}</div>
            </div>
            {columns.map((col) => (
              <div
                key={col.key}
                className="mb-2 flex items-center justify-between"
              >
                <p className="text-sm font-medium text-gray-400">{col.label}</p>
                <div className="flex items-center gap-2">
                  {col.type === "avatar" ? (
                    <Avatar src={item[col.key]} alt="Profile Image" size="sm" />
                  ) : item[col.key] !== undefined ? (
                    <span className="text-sm text-gray-200">
                      {item[col.key].toString()}
                    </span>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogTrigger>
        <DialogContent className="h-auto max-h-[80vh] overflow-auto sm:max-w-md lg:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-large">
              {data.name !== "" ? data.name : "Name"}
            </DialogTitle>
            <DialogDescription>
              {data.observations !== "" ? data.observations : "Observations"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2">
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
          <DialogFooter className="flex justify-end sm:justify-start">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
