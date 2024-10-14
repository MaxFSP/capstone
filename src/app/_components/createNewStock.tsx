'use client';

import { Button } from '~/components/ui/button';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog';
import { type ILocation } from '~/server/types/ILocation';
import CreatePartDialog from './createPartDialog';
import { CreateMachineryDialog } from './createMachineryDialog';
import { CreateToolDialog } from './createToolDialog';
import { CreateEmployeeDialog } from './createEmployeeDialog';
import { CreateWorkOrderDialog } from './createWorkOrderDialog';
import { type UserWithOrg } from '~/server/types/IUser';
import { type Machinery } from '~/server/types/IMachinery';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';

export function CreateNewStockDialog(props: {
  locations?: ILocation[];
  type: string;
  users?: UserWithOrg[];
  machines?: Machinery[];
}) {
  const { locations, type, users, machines } = props;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {type === 'WorkOrder' && machines && machines.length === 0 ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button variant="default" disabled>
                  Create Work Order
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Make sure to populate the machinery list before creating a work order.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button variant="default">Create {type}</Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="h-auto max-h-[90vh] overflow-auto border-border bg-background text-foreground lg:max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-large">Create {type}</AlertDialogTitle>
          <AlertDialogDescription>
            Make sure you type the correct information before creating the {type}.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {type === 'Machinery' ? (
          <CreateMachineryDialog locations={locations!} />
        ) : type === 'Part' ? (
          <CreatePartDialog locations={locations!} />
        ) : type === 'Tool' ? (
          <CreateToolDialog locations={locations!} />
        ) : type === 'Employee' ? (
          <CreateEmployeeDialog />
        ) : machines && machines.length > 0 ? (
          <CreateWorkOrderDialog users={users!} machines={machines} />
        ) : null}
      </AlertDialogContent>
    </AlertDialog>
  );
}
