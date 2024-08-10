"use client";

import { Button } from "~/components/ui/button";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";

import { type ILocation } from "~/server/types/ILocation";
import CreatePartDialog from "./createPartDialog";
import { CreateMachineryDialog } from "./createMachineryDialog";
import { CreateToolDialog } from "./createToolDialog";
import { CreateEmployeeDialog } from "./createEmployeeDialog";
import { CreateWorkOrderDialog } from "./createWorkOrderDialog";
import { type User } from "~/server/types/IUser";
import { type Machinery } from "~/server/types/IMachinery";

export function CreateNewStockDialog(props: {
  locations?: ILocation[];
  type: string;
  users?: User[];
  machines?: Machinery[];
}) {
  const { locations, type, users, machines } = props;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="default">Create {type}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="h-auto max-h-[90vh] overflow-auto lg:max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-large">
            Create {type}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Make sure you type the correct information before creating the
            machine.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {type === "Machinery" ? (
          <CreateMachineryDialog locations={locations!} />
        ) : type === "Part" ? (
          <CreatePartDialog locations={locations!} />
        ) : type === "Tool" ? (
          <CreateToolDialog locations={locations!} />
        ) : type === "Employee" ? (
          <CreateEmployeeDialog />
        ) : (
          <CreateWorkOrderDialog users={users!} machines={machines!} />
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
