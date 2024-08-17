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
import { useRouter } from "next/navigation";

export function CreateEmployeeDialog() {
  const router = useRouter();

  const [bloodType, setBloodType] = useState("A+");
  const [job, setJob] = useState("Mechanic");

  const [employeeFormValue, setEmployeeFormValue] = useState({
    firstName: "",
    lastName: "",
    age: "",
    hireDate: new Date(),
    phoneNumber: "",
    job: "",
    bloodType: "A+",
  });

  // Calendar stuff
  const [date, setDate] = useState<Date>(new Date());

  // Form validation state
  const [isEmployeeFormValid, setIsEmployeeFormValid] = useState(false);

  useEffect(() => {
    const isNameValid = validateStringWithSpaces(employeeFormValue.firstName);
    const isLastNameValid = validateStringWithSpaces(
      employeeFormValue.lastName,
    );
    const isAgeValid = validateOnlyNumbers(employeeFormValue.age);
    if (isNameValid && isLastNameValid && isAgeValid) {
      setIsEmployeeFormValid(true);
    }
  }, [employeeFormValue]);

  const validateStringWithSpaces = (name: string) => /^[A-Za-z\s]+$/.test(name);
  const validateOnlyNumbers = (age: string) => /^[0-9]+$/.test(age);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmployeeFormValue((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const handleSaveClick = async (): Promise<boolean> => {
    try {
      employeeFormValue.bloodType = bloodType;
      employeeFormValue.job = job;

      const response = await fetch("/api/createEmployee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(employeeFormValue),
      });

      if (!response.ok) {
        throw new Error("Failed to create employee");
      }

      return true;
    } catch (error) {
      console.error("Failed to create employee:", error);
      return false;
    }
  };

  const handleSaveAndCloseClick = async () => {
    await handleSaveClick();
    setEmployeeFormValue({
      firstName: "",
      lastName: "",
      age: "",
      hireDate: new Date(),
      phoneNumber: "",
      job: "",
      bloodType: "A+",
    });
    router.refresh();
  };

  const isFirstNameInvalid = useMemo(
    () =>
      employeeFormValue.firstName !== "" &&
      !validateStringWithSpaces(employeeFormValue.firstName),
    [employeeFormValue.firstName],
  );

  const isLastNameInvalid = useMemo(
    () =>
      employeeFormValue.lastName !== "" &&
      !validateStringWithSpaces(employeeFormValue.lastName),
    [employeeFormValue.lastName],
  );

  const isAgeInvalid = useMemo(
    () =>
      employeeFormValue.age !== "" &&
      !validateOnlyNumbers(employeeFormValue.age),
    [employeeFormValue.age],
  );

  const isPhoneNumberInvalid = useMemo(
    () =>
      employeeFormValue.phoneNumber !== "" &&
      !validateOnlyNumbers(employeeFormValue.phoneNumber),
    [employeeFormValue.phoneNumber],
  );

  return (
    <form className="space-y-4">
      <div className="flex space-x-4">
        <div className="flex-1">
          <Label>First Name</Label>
          <Input
            required
            type="text"
            name="firstName"
            value={employeeFormValue.firstName}
            onChange={handleInputChange}
            className={cn(
              "border border-border bg-background text-foreground",
              isFirstNameInvalid && "border-destructive",
            )}
          />
        </div>
        <div className="flex-1">
          <Label>Last Name</Label>
          <Input
            required
            type="text"
            name="lastName"
            value={employeeFormValue.lastName}
            onChange={handleInputChange}
            className={cn(
              "border border-border bg-background text-foreground",
              isLastNameInvalid && "border-destructive",
            )}
          />
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <Label>Age</Label>
          <Input
            required
            type="text"
            name="age"
            value={employeeFormValue.age}
            onChange={handleInputChange}
            className={cn(
              "border border-border bg-background text-foreground",
              isAgeInvalid && "border-destructive",
            )}
          />
        </div>
        <div className="flex-1">
          <Label>Phone Number</Label>
          <Input
            required
            type="text"
            name="phoneNumber"
            value={employeeFormValue.phoneNumber}
            onChange={handleInputChange}
            className={cn(
              "border border-border bg-background text-foreground",
              isPhoneNumberInvalid && "border-destructive",
            )}
          />
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <Label>Blood Type</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full border border-border bg-background text-foreground">
                {bloodType}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full bg-background text-foreground">
              <DropdownMenuLabel>Blood Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={bloodType}
                onValueChange={(value: string) => setBloodType(value)}
              >
                <DropdownMenuRadioItem value="A+">A+</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="A-">A-</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="B+">B+</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="B-">B-</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="AB+">AB+</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="AB-">AB-</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="O+">O+</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="O-">O-</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex-1">
          <Label>Job</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full border border-border bg-background text-foreground">
                {job}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full bg-background text-foreground">
              <DropdownMenuLabel>Job</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={job}
                onValueChange={(value: string) => setJob(value)}
              >
                <DropdownMenuRadioItem value="Mechanic">
                  Mechanic
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Painter">
                  Painter
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Engineer">
                  Engineer
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Parts Specialist">
                  Parts Specialist
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Sales">
                  Sales
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-col">
        <Label>Hire Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start border border-border bg-background text-left font-normal text-foreground",
                !date && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto bg-background p-0 text-foreground">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => {
                if (date) {
                  setDate(date);
                  setEmployeeFormValue((prev) => ({
                    ...prev,
                    hireDate: date,
                  }));
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <AlertDialogFooter className="sm:justify-start">
        <AlertDialogCancel asChild>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setEmployeeFormValue({
                firstName: "",
                lastName: "",
                age: "",
                hireDate: new Date(),
                phoneNumber: "",
                job: "",
                bloodType: "A+",
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
            disabled={!isEmployeeFormValid}
            className="bg-primary text-primary-foreground"
          >
            Save & Close
          </Button>
        </AlertDialogCancel>
      </AlertDialogFooter>
    </form>
  );
}
