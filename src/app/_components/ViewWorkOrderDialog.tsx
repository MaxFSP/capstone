/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from "react";

import { Button } from "~/components/ui/button";
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
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { cn } from "~/lib/utils";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { useRouter } from "next/navigation";
import { type WorkOrdersWithUser } from "~/server/types/IOrders";
import { type User } from "~/server/types/IUser";
import { type Machinery } from "~/server/types/IMachinery";
import { Switch } from "~/components/ui/switch";

export function WorkOrderDataViewDialog(props: {
  title: string;
  data: WorkOrdersWithUser;
  size: string;
  index: number;
  users: User[];
  machines: Machinery[];
}) {
  const { title, data, size, index, users, machines } = props;

  const router = useRouter();
  const current_date = data.start_date;
  const current_machine = data.machine_id;
  const current_user = data.userName;
  const current_state = data.state;

  const [assigned_user, setAssignedUser] = useState(data.userName);
  const [machinery, setMachine] = useState(data.machine_serial);

  const [dateValue, setDateValue] = useState<Date>(new Date(data.start_date));

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...data });
  const [initialFormData, setInitialFormData] = useState({ ...data });
  const [isFormValid, setIsFormValid] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [currentStateBoolean, setCurrentStateBoolean] = useState<boolean>(
    data.state === 1,
  );

  useEffect(() => {
    if (!isEditing) {
      setAssignedUser(data.userName);
      setMachine(data.machine_serial);
      setFormData({ ...data });
      setDateValue(data.start_date);
    }
  }, [isEditing, data]);

  useEffect(() => {
    validateForm();
    checkForChanges();
  }, [formData, machinery, assigned_user, dateValue, currentStateBoolean]);

  const validateForm = () => {
    const isDataValid =
      formData.order_id !== null && formData.order_id !== undefined;
    setIsFormValid(isDataValid);
  };

  const checkForChanges = () => {
    const dateWithoutTime = dateValue.toISOString().split("T")[0];
    const dateWithoutTimeCurrent = new Date(current_date)
      .toISOString()
      .split("T")[0];

    const machine_id = machines.find(
      (machine) => machine.serial_number === machinery,
    )!.machine_id;

    const currentState = current_state === 1;
    const hasChanges =
      JSON.stringify(formData) !== JSON.stringify(initialFormData) ||
      assigned_user !== current_user ||
      machine_id !== current_machine ||
      dateWithoutTime !== dateWithoutTimeCurrent ||
      currentStateBoolean !== currentState;
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancelClick = () => {
    setFormData(initialFormData);
    setCurrentStateBoolean(current_state === 1);
    setIsEditing(false);
  };

  const handleSaveClick = async () => {
    if (isFormValid && hasChanges) {
      try {
        formData.assigned_user = users.find(
          (user) => user.first_name + " " + user.last_name === assigned_user,
        )!.user_id;

        formData.machine_id = machines.find(
          (machine) => machine.serial_number === machinery,
        )!.machine_id;

        formData.start_date = dateValue;

        formData.state = currentStateBoolean ? 1 : 0;

        const response = await fetch("/api/updateWorkOrder", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        if (response.ok) {
          router.refresh();
        } else {
          console.error("Failed to update work order");
        }
      } catch (error) {
        console.error("Error updating work order:", error);
      }
    }
  };

  const handleSaveAndCloseClick = async () => {
    await handleSaveClick();
    setIsEditing(false);
  };

  async function generateReport(orderId: number) {
    try {
      const response = await fetch("/api/generateWorkOrderReport", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `WorkOrder_${orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        console.error("Failed to generate report");
      }
    } catch (error) {
      console.error("Error generating report:", error);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {size === "lg" ? (
          <p className="w-8 cursor-pointer text-sm font-semibold text-foreground">
            {title}
          </p>
        ) : (
          <div className="flex flex-col border-b border-border px-5 py-4 text-foreground">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-base font-semibold">ID</p>
              <div className="flex items-center gap-2">{index}</div>
            </div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <div className="flex items-center gap-2">
                <span className="text-sm">{data.name}</span>
              </div>
            </div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Machine Serial
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm">{data.machine_serial}</span>
              </div>
            </div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Username
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm">{data.userName}</span>
              </div>
            </div>
          </div>
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
              <Label>Name</Label>
              <Input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="flex-1">
              <Label>Assigned Machine</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={!isEditing}>
                  <Button className="w-full" variant="outline">
                    {machinery}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full bg-white text-black">
                  <DropdownMenuLabel>Serial Number</DropdownMenuLabel>
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
                name="age"
                value={formData.observations ?? " "}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild disabled={!isEditing}>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start bg-background text-left font-normal",
                      !dateValue && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateValue ? format(dateValue, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 ">
                  <Calendar
                    mode="single"
                    selected={dateValue}
                    onSelect={(date) => {
                      if (date) {
                        setDateValue(date);
                        setFormData((prev) => ({
                          ...prev,
                          hireDate: date,
                        }));
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={!isEditing}>
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
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableWorkOrder"
                  disabled={!isEditing}
                  checked={currentStateBoolean}
                  onCheckedChange={() =>
                    setCurrentStateBoolean(!currentStateBoolean)
                  }
                />
                <Label htmlFor="enableWorkOrder">Enable Work Order</Label>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          {!isEditing && (
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          )}
          <Button onClick={isEditing ? handleCancelClick : handleEditClick}>
            {isEditing ? "Cancel" : "Edit"}
          </Button>
          {isEditing && (
            <>
              <DialogClose asChild>
                <Button
                  onClick={handleSaveClick}
                  disabled={!isFormValid || !hasChanges}
                >
                  Save
                </Button>
              </DialogClose>

              <DialogClose asChild>
                <Button
                  onClick={handleSaveAndCloseClick}
                  disabled={!isFormValid || !hasChanges}
                >
                  Save & Close
                </Button>
              </DialogClose>
            </>
          )}
          <DialogClose asChild>
            <Button onClick={() => generateReport(data.order_id)}>
              Generate Report
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
