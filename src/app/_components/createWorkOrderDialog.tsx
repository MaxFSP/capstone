'use client';

import { useState, useEffect, useMemo } from 'react';
import { useToast } from '~/components/hooks/use-toast';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { AlertDialogCancel, AlertDialogFooter } from '~/components/ui/alert-dialog';
import { Label } from '~/components/ui/label';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { cn } from '~/lib/utils';
import { Calendar } from '~/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { type User } from '~/server/types/IUser';
import { type Machinery } from '~/server/types/IMachinery';
import { useRouter } from 'next/navigation';

export function CreateWorkOrderDialog(props: { users: User[]; machines: Machinery[] }) {
  const router = useRouter();
  const { users, machines } = props;
  const first_user = users[0]!.first_name + ' ' + users[0]!.last_name;
  const [assigned_user, setAssignedUser] = useState(first_user);
  const [machinery, setMachine] = useState(machines[0]!.serial_number);
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

  useEffect(() => {
    const isNameValid = validateStringWithSpaces(orderFormValue.name);
    const isObservationsValid = validateStringWithSpaces(orderFormValue.observations);

    if (isNameValid && isObservationsValid) {
      setIsOrderFormValid(true);
    }
  }, [orderFormValue]);

  const validateStringWithSpaces = (name: string) => /^[A-Za-z\s]+$/.test(name);

  const handleWorkOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOrderFormValue((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const handleSaveClick = async (): Promise<boolean> => {
    try {
      orderFormValue.assigned_user = users.find(
        (user) => user.first_name + ' ' + user.last_name === assigned_user
      )!.user_id;

      orderFormValue.machine_id = machines.find(
        (machine) => machine.serial_number === machinery
      )!.machine_id;

      const response = await fetch('/api/createWorkOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderFormValue),
      });
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Work order created successfully.',
        });
        router.refresh();
      }

      if (!response.ok) {
        throw new Error('Failed to create work order');
      }

      return true;
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
    await handleSaveClick();
    setOrderFormValue({
      name: '',
      machine_id: 0,
      observations: '',
      start_date: new Date(),
      assigned_user: 0,
    });
    router.refresh();
  };

  const isNameInvalid = useMemo(
    () => orderFormValue.name !== '' && !validateStringWithSpaces(orderFormValue.name),
    [orderFormValue.name]
  );

  const isObservationsInvalid = useMemo(
    () =>
      orderFormValue.observations !== '' && !validateStringWithSpaces(orderFormValue.observations),
    [orderFormValue.observations]
  );

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full border border-border bg-background text-foreground">
                {machinery}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full bg-background text-foreground">
              <DropdownMenuLabel>Machine</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={machinery}
                onValueChange={(value: string) => setMachine(value)}
              >
                {machines.map((machine) => (
                  <DropdownMenuRadioItem key={machine.serial_number} value={machine.serial_number}>
                    {machine.serial_number}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
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
                variant={'outline'}
                className={cn(
                  'w-[240px] justify-start border border-border bg-background text-left font-normal text-foreground',
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
                onSelect={(date) => {
                  if (date) {
                    setDate(date);
                    setOrderFormValue((prev) => ({
                      ...prev,
                      start_date: date,
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full border border-border bg-background text-foreground">
                {assigned_user}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full bg-background text-foreground">
              <DropdownMenuLabel>User</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={assigned_user}
                onValueChange={(value: string) => setAssignedUser(value)}
              >
                {users.map((user) => (
                  <DropdownMenuRadioItem
                    key={user.username}
                    value={user.first_name + ' ' + user.last_name}
                  >
                    {user.first_name + ' ' + user.last_name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialogFooter className="sm:justify-start">
        <AlertDialogCancel asChild>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setOrderFormValue({
                name: '',
                machine_id: 0,
                observations: '',
                start_date: new Date(),
                assigned_user: 0,
              });
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
