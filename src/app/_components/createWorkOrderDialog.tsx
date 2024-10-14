'use client';

import { useState, useEffect } from 'react';
import { useToast } from '~/components/hooks/use-toast';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { AlertDialogCancel, AlertDialogFooter } from '~/components/ui/alert-dialog';
import { Label } from '~/components/ui/label';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { cn } from '~/lib/utils';
import { Calendar } from '~/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { type UserWithOrg } from '~/server/types/IUser';
import { type Machinery } from '~/server/types/IMachinery';
import { useRouter } from 'next/navigation';
import { SingleSelectCombobox } from '~/components/ui/SingleSelectCombobox';

export function CreateWorkOrderDialog(props: { users: UserWithOrg[]; machines: Machinery[] }) {
  const router = useRouter();
  const { users, machines } = props;

  const firstUserId = users[0]?.user_id.toString() ?? '';
  const firstMachineId = machines[0]?.machine_id.toString() ?? '';
  const [assigned_user, setAssignedUser] = useState(firstUserId);
  const [machinery, setMachine] = useState(firstMachineId);
  const { toast } = useToast();

  const [orderFormValue, setOrderFormValue] = useState({
    name: '',
    machine_id: 0,
    observations: '',
    start_date: new Date(),
    assigned_user: 0,
  });

  const [date, setDate] = useState<Date>(new Date());

  const [isOrderFormValid, setIsOrderFormValid] = useState(false);
  const usersWithoutAdmin = users.filter((user) => !user.orgName.includes('Admin'));

  useEffect(() => {
    const isNameValid = validateStringWithSpaces(orderFormValue.name);
    const isObservationsValid = validateStringWithSpaces(orderFormValue.observations);

    setIsOrderFormValid(isNameValid && isObservationsValid);
  }, [orderFormValue]);

  const validateStringWithSpaces = (text: string) => /^[A-Za-z\s]+$/.test(text);

  const handleWorkOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOrderFormValue((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const handleSaveClick = async (): Promise<boolean> => {
    try {
      // Convert assigned_user and machinery to numbers
      const assignedUserId = parseInt(assigned_user);
      const machineId = parseInt(machinery);

      const response = await fetch('/api/createWorkOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderFormValue,
          assigned_user: assignedUserId,
          machine_id: machineId,
          start_date: date,
        }),
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Work order created successfully.' });
        router.refresh();
        return true;
      } else {
        throw new Error('Failed to create work order');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create work order.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const handleSaveAndCloseClick = async () => {
    const success = await handleSaveClick();
    if (success) {
      // Reset form fields
      setOrderFormValue({
        name: '',
        machine_id: 0,
        observations: '',
        start_date: new Date(),
        assigned_user: 0,
      });
      setAssignedUser(firstUserId);
      setMachine(firstMachineId);
      setDate(new Date());
      router.refresh();
    }
  };

  const isNameInvalid =
    orderFormValue.name !== '' && !validateStringWithSpaces(orderFormValue.name);
  const isObservationsInvalid =
    orderFormValue.observations !== '' && !validateStringWithSpaces(orderFormValue.observations);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <div className="flex space-x-4">
        <div className="flex-1">
          <Label>Name</Label>
          <Input
            required
            type="text"
            name="name"
            value={orderFormValue.name}
            onChange={handleWorkOrderChange}
            className={cn(
              'border border-border bg-background text-foreground',
              isNameInvalid && 'border-destructive'
            )}
          />
        </div>
        <div className="flex-1">
          <Label>Assign a Machine</Label>
          <SingleSelectCombobox
            options={machines.map((machine) => ({
              label: machine.serial_number,
              value: machine.machine_id.toString(),
            }))}
            placeholder="Select a machine..."
            selectedValue={machinery}
            onChange={(value) => setMachine(value)}
            disabled={false}
          />
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <Label>Observations</Label>
          <Input
            required
            type="text"
            name="observations"
            value={orderFormValue.observations}
            onChange={handleWorkOrderChange}
            className={cn(
              'border border-border bg-background text-foreground',
              isObservationsInvalid && 'border-destructive'
            )}
          />
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start border border-border bg-background text-left font-normal text-foreground',
                  !date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto bg-background p-0 text-foreground">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(selectedDate) => {
                  if (selectedDate) {
                    setDate(selectedDate);
                    setOrderFormValue((prev) => ({
                      ...prev,
                      start_date: selectedDate,
                    }));
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex-1">
          <Label>Assign a User</Label>
          <SingleSelectCombobox
            options={usersWithoutAdmin.map((user) => ({
              label: `${user.first_name} ${user.last_name}`,
              value: user.user_id.toString(),
            }))}
            placeholder="Select a user..."
            selectedValue={assigned_user}
            onChange={(value) => setAssignedUser(value)}
            disabled={false}
          />
        </div>
      </div>

      <AlertDialogFooter className="sm:justify-start">
        <AlertDialogCancel asChild>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              // Reset form fields
              setOrderFormValue({
                name: '',
                machine_id: 0,
                observations: '',
                start_date: new Date(),
                assigned_user: 0,
              });
              setAssignedUser(firstUserId);
              setMachine(firstMachineId);
              setDate(new Date());
            }}
            className="bg-secondary text-secondary-foreground"
          >
            Close
          </Button>
        </AlertDialogCancel>

        <AlertDialogCancel asChild>
          <Button
            onClick={handleSaveAndCloseClick}
            disabled={!isOrderFormValid}
            className="bg-primary text-primary-foreground"
          >
            Save
          </Button>
        </AlertDialogCancel>
      </AlertDialogFooter>
    </form>
  );
}
