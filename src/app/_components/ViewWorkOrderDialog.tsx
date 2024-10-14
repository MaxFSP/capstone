// WorkOrderDataViewDialog.tsx

import { useState, useEffect } from 'react';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { cn } from '~/lib/utils';
import { Calendar } from '~/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { useRouter } from 'next/navigation';
import { type WorkOrdersWithUser } from '~/server/types/IOrders';
import { type UserWithOrg } from '~/server/types/IUser';
import { type Machinery } from '~/server/types/IMachinery';
import { Switch } from '~/components/ui/switch';
import { type z } from 'zod';
import { useFormValidation } from '~/hooks/useFormValidation';
import { workOrderSchema } from '~/server/types/IOrders';
import LabeledInput from './LabeledInput';
import { Label } from '~/components/ui/label';
import { useToast } from '~/components/hooks/use-toast';

import { SingleSelectCombobox } from '~/components/ui/SingleSelectCombobox';

type WorkOrderFormData = z.infer<typeof workOrderSchema>;

export function WorkOrderDataViewDialog(props: {
  title: string;
  data: WorkOrdersWithUser;
  size: string;
  index: number;
  users: UserWithOrg[];
  machines: Machinery[];
}) {
  const { title, data, size, index, users, machines } = props;

  const router = useRouter();
  const current_date = data.start_date;
  const current_state = data.state;
  const usersWithoutAdmin = users.filter((user) => !user.orgName.includes('Admin'));
  const [assigned_user, setAssignedUser] = useState(data.assigned_user.toString());
  const [machinery, setMachine] = useState(data.machine_id.toString());
  const [dateValue, setDateValue] = useState<Date>(new Date(data.start_date));
  const [isEditing, setIsEditing] = useState(false);
  const [initialFormData, setInitialFormData] = useState({ ...data });
  const [hasChanges, setHasChanges] = useState(false);
  const [currentStateBoolean, setCurrentStateBoolean] = useState<boolean>(data.state === 1);
  const { toast } = useToast();
  const { formData, setFormData, isFormValid, errors, validateForm } =
    useFormValidation<WorkOrderFormData>({
      schema: workOrderSchema,
      initialData: {
        ...data,
        start_date: new Date(data.start_date),
        end_date: data.end_date ? new Date(data.end_date) : null,
      },
    });

  useEffect(() => {
    if (!isEditing) {
      setAssignedUser(data.assigned_user.toString());
      setMachine(data.machine_id.toString());
      setFormData({ ...data });
      setDateValue(new Date(data.start_date));
    }
  }, [isEditing, data]);

  useEffect(() => {
    checkForChanges();
  }, [formData, machinery, assigned_user, dateValue, currentStateBoolean]);

  const checkForChanges = () => {
    const dateWithoutTime = dateValue.toISOString().split('T')[0];
    const dateWithoutTimeCurrent = new Date(current_date).toISOString().split('T')[0];

    const hasChanges =
      JSON.stringify(formData) !== JSON.stringify(initialFormData) ||
      assigned_user !== data.assigned_user.toString() ||
      machinery !== data.machine_id.toString() ||
      dateWithoutTime !== dateWithoutTimeCurrent ||
      currentStateBoolean !== (current_state === 1);

    setHasChanges(hasChanges);
  };

  const handleEditClick = () => {
    if (isEditing) {
      setInitialFormData({ ...formData });
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value || null }));
    validateForm();
  };

  const handleCancelClick = () => {
    setFormData(initialFormData);
    setCurrentStateBoolean(current_state === 1);
    setIsEditing(false);
  };

  const handleSaveClick = async () => {
    if (isFormValid && hasChanges) {
      try {
        const updatedFormData: WorkOrderFormData = {
          ...formData,
          assigned_user: parseInt(assigned_user),
          machine_id: parseInt(machinery),
          start_date: dateValue,
          state: currentStateBoolean ? 1 : 0,
        };

        const response = await fetch('/api/updateWorkOrder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedFormData),
        });
        if (response.ok) {
          toast({
            title: 'Success',
            description: 'Work order edited successfully.',
          });
          router.refresh();
          handleCancelClick();
        } else {
          console.error('Failed to update work order');
          handleCancelClick();
        }
      } catch (error) {
        console.error('Error updating work order:', error);
        handleCancelClick();
      }
    }
  };

  async function generateReport(orderId: number) {
    try {
      const response = await fetch('/api/generateWorkOrderReport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `WorkOrder_${orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        console.error('Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {size === 'lg' ? (
          <p className="w-8 cursor-pointer text-sm font-semibold text-foreground">{title}</p>
        ) : (
          <div className="flex flex-col border-b border-border px-5 py-4 text-foreground">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-base font-semibold">ID</p>
              <div className="flex items-center gap-2">
                <span className="text-sm">{index}</span>
              </div>
            </div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <div className="flex items-center gap-2">
                <span className="text-sm">{data.name}</span>
              </div>
            </div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Machine Serial</p>
              <div className="flex items-center gap-2">
                <span className="text-sm">{data.machine_serial}</span>
              </div>
            </div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Username</p>
              <div className="flex items-center gap-2">
                <span className="text-sm">{data.userName}</span>
              </div>
            </div>
          </div>
        )}
      </DialogTrigger>
      <DialogContent className="h-auto max-h-[90vh] overflow-auto bg-background text-foreground sm:max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle className="text-lg">{isEditing ? `Edit ${title}` : title}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Make sure all the information is correct before saving changes.'
              : 'View the details of the work order below.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
            <div className="flex-1">
              <LabeledInput
                label="Name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                required
                error={errors.find((e) => e.path[0] === 'name')?.message}
              />
            </div>
            <div className="flex-1">
              <Label>Assigned Machine</Label>
              <SingleSelectCombobox
                options={machines.map((machine) => ({
                  label: machine.serial_number,
                  value: machine.machine_id.toString(),
                }))}
                placeholder="Select a machine..."
                selectedValue={machinery}
                onChange={(value) => setMachine(value)}
                disabled={!isEditing}
              />
            </div>
          </div>

          <LabeledInput
            label="Observations"
            name="observations"
            type="text"
            value={formData.observations ?? ''}
            onChange={handleChange}
            disabled={!isEditing}
            error={errors.find((e) => e.path[0] === 'observations')?.message}
          />

          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
            <div className="flex-1">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild disabled={!isEditing}>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start bg-background text-left font-normal',
                      !dateValue && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateValue ? format(dateValue, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateValue}
                    onSelect={(date) => {
                      if (date) {
                        setDateValue(date);
                      }
                    }}
                    initialFocus
                    className="border border-border bg-background text-foreground"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex-1">
              <Label>Assigned User</Label>
              <SingleSelectCombobox
                options={usersWithoutAdmin.map((user) => ({
                  label: `${user.first_name} ${user.last_name}`,
                  value: user.user_id.toString(),
                }))}
                placeholder="Select a user..."
                selectedValue={assigned_user}
                onChange={(value) => setAssignedUser(value)}
                disabled={!isEditing}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="enableWorkOrder"
              disabled={!isEditing}
              checked={currentStateBoolean}
              onCheckedChange={() => setCurrentStateBoolean(!currentStateBoolean)}
            />
            <Label htmlFor="enableWorkOrder">Enable Work Order</Label>
          </div>
          {current_state === 2 && (
            <div className="flex items-center space-x-2 text-destructive">
              <Label>This work order is marked as done. Enable it to continue.</Label>
            </div>
          )}
        </div>
        {errors.length > 0 && (
          <div className="mt-4 text-sm text-red-500">Please correct the errors before saving.</div>
        )}
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 sm:space-y-0 mt-4">
          {!isEditing && (
            <DialogClose asChild>
              <Button type="button" variant="secondary" className="w-full sm:w-auto">
                Close
              </Button>
            </DialogClose>
          )}
          <Button
            onClick={isEditing ? handleCancelClick : handleEditClick}
            className="w-full sm:w-auto"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
          {isEditing && (
            <DialogClose asChild>
              <Button
                onClick={handleSaveClick}
                disabled={!isFormValid || !hasChanges}
                className="w-full sm:w-auto bg-primary text-primary-foreground"
              >
                Save
              </Button>
            </DialogClose>
          )}
          <DialogClose asChild>
            <Button onClick={() => generateReport(data.order_id)} className="w-full sm:w-auto">
              Generate Report
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
