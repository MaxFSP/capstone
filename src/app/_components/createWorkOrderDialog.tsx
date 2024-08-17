"use client";

import { useState, useEffect, useMemo } from "react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  AlertDialogCancel,
  AlertDialogFooter,
} from "~/components/ui/alert-dialog";
import { Label } from "~/components/ui/label";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { cn } from "~/lib/utils";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { type User } from "~/server/types/IUser";
import { type Machinery } from "~/server/types/IMachinery";
import { useRouter } from "next/navigation";

export function CreateWorkOrderDialog(props: {
  users: User[];
  machines: Machinery[];
}) {
  const router = useRouter();
  const { users, machines } = props;
  const first_user = users[0]!.first_name + " " + users[0]!.last_name;
  const [assigned_user, setAssignedUser] = useState(first_user);
  const [machinery, setMachine] = useState(machines[0]!.serial_number);

  const [orderFormValue, setOrderFormValue] = useState({
    name: "",
    machine_id: 0,
    observations: "",
    start_date: new Date(),
    assigned_user: 0,
  });

  const [date, setDate] = useState<Date>(new Date());

  const [isOrderFormValid, setIsOrderFormValid] = useState(false);

  useEffect(() => {
    const isNameValid = validateStringWithSpaces(orderFormValue.name);
    const isObservationsValid = validateStringWithSpaces(
      orderFormValue.observations,
    );

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
        (user) => user.first_name + " " + user.last_name === assigned_user,
      )!.user_id;

      orderFormValue.machine_id = machines.find(
        (machine) => machine.serial_number === machinery,
      )!.machine_id;

      const response = await fetch("/api/createWorkOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderFormValue),
      });

      if (!response.ok) {
        throw new Error("Failed to create work order");
      }

      return true;
    } catch (error) {
      console.error("Failed to create work order:", error);
      return false;
    }
  };

  const handleSaveAndCloseClick = async () => {
    await handleSaveClick();
    setOrderFormValue({
      name: "",
      machine_id: 0,
      observations: "",
      start_date: new Date(),
      assigned_user: 0,
    });
    router.refresh();
  };

  const isNameInvalid = useMemo(
    () =>
      orderFormValue.name !== "" &&
      !validateStringWithSpaces(orderFormValue.name),
    [orderFormValue.name],
  );

  const isObservationsInvalid = useMemo(
    () =>
      orderFormValue.observations !== "" &&
      !validateStringWithSpaces(orderFormValue.observations),
    [orderFormValue.observations],
  );

  return (
    <form className="space-y-4">
      <div className="flex space-x-4">
        <div className="flex-1">
          <Label>Name</Label>
          <Input
            required
            type="text"
            name="name"
            value={orderFormValue.name}
            onChange={handleWorkOrderChange}
            color={isNameInvalid ? "danger" : "default"}
          />
        </div>
        <div className="flex-1">
          <Label>Assign a Machine</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full" variant="outline">
                {machinery}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full bg-white text-black">
              <DropdownMenuLabel>Machine</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={machinery}
                onValueChange={(value: string) => setMachine(value)}
              >
                {machines.map((machine) => (
                  <DropdownMenuRadioItem
                    key={machine.serial_number}
                    value={machine.serial_number}
                  >
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
            color={isObservationsInvalid ? "danger" : "default"}
          />
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start bg-white text-left font-normal text-black",
                  !date && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto bg-white p-0 text-black"
              align="start"
            >
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => {
                  if (date) {
                    setDate(date);
                    setOrderFormValue((prev) => ({
                      ...prev,
                      acquisition_date: date,
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
              <Button className="w-full" variant="outline">
                {assigned_user}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full bg-white text-black">
              <DropdownMenuLabel>User</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={assigned_user}
                onValueChange={(value: string) => setAssignedUser(value)}
              >
                {users.map((user) => (
                  <DropdownMenuRadioItem
                    key={user.username}
                    value={user.first_name + " " + user.last_name}
                  >
                    {user.first_name + " " + user.last_name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-col"></div>

      <AlertDialogFooter className="sm:justify-start">
        <AlertDialogCancel asChild>
          <Button
            type="button"
            onClick={() => {
              setOrderFormValue({
                name: "",
                machine_id: 0,
                observations: "",
                start_date: new Date(),
                assigned_user: 0,
              });
            }}
          >
            Close
          </Button>
        </AlertDialogCancel>

        <AlertDialogCancel asChild>
          <Button
            onClick={handleSaveAndCloseClick}
            disabled={!isOrderFormValid}
          >
            Save & Close
          </Button>
        </AlertDialogCancel>
      </AlertDialogFooter>
    </form>
  );
}
