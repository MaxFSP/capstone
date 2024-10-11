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
import { type RegularWorkOrder } from '~/server/types/IOrders';
import { type User } from '~/server/types/IUser';
import { type Machinery } from '~/server/types/IMachinery';
import { Switch } from '~/components/ui/switch';
import { type z } from 'zod';
import { useFormValidation } from '~/hooks/useFormValidation';
import { regularWorkOrderSchema } from '~/server/types/IOrders';
import LabeledInput from './LabeledInput';
import { Label } from '~/components/ui/label';
import { useToast } from '~/components/hooks/use-toast';

import { SingleSelectCombobox } from '~/components/ui/SingleSelectCombobox';

type WorkOrderFormData = z.infer<typeof regularWorkOrderSchema>;

export function AdminWorkOrderDataViewDialog(props: {
  title: string;
  data: RegularWorkOrder;
  type: string;
  users: User[];
  machines: Machinery[];
}) {
  const { title, data, type, users, machines } = props;
  const router = useRouter();
  const current_date = data.start_date;
  const current_state = data.state;

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
      schema: regularWorkOrderSchema,
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
        {type === 'kanban' ? (
          <div
            onClick={(e) => e.stopPropagation()}
            className={
              'transition-shadow p-4 duration-150 ease-in-out hover:z-10 hover:shadow-outline'
            }
            key={data.order_id + 'KanbanTask'}
          >
            <div className="cursor-pointer">
              <h3 className="font-semibold">{data.name}</h3>
            </div>
          </div>
        ) : (
          <p className="w-8 cursor-pointer text-small font-semibold">View</p>
        )}
      </DialogTrigger>
      <DialogContent className="h-auto max-h-[90vh] overflow-auto bg-background text-foreground lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg">Edit {title}</DialogTitle>
          <DialogDescription>
            Make sure all the information is correct before saving changes.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex space-x-4">
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

          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild disabled={!isEditing}>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-[240px] justify-start bg-background text-left font-normal',
                      !dateValue && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateValue ? format(dateValue, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 ">
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
                options={users.map((user) => ({
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
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2 text-destructive">
                {current_state === 2 && (
                  <Label>This work order is marked as done. Enable it to continue.</Label>
                )}
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
            </div>
          </div>
        </div>
        {errors.length > 0 && (
          <div className="mt-4 text-sm text-red-500">Please correct the errors before saving.</div>
        )}
        <DialogFooter className="sm:justify-start">
          {!isEditing && (
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          )}
          <Button onClick={isEditing ? handleCancelClick : handleEditClick}>
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
          {isEditing && (
            <>
              <DialogClose asChild>
                <Button
                  onClick={handleSaveClick}
                  disabled={!isFormValid || !hasChanges}
                  className="bg-primary text-primary-foreground"
                >
                  Save
                </Button>
              </DialogClose>
            </>
          )}
          <DialogClose asChild>
            <Button onClick={() => generateReport(data.order_id)}>Generate Report</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
