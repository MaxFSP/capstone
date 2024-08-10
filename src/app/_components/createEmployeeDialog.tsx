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

  // Form stuff
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

  const handleToolInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      //TODO: ADD A TOAST FOR SUCCESS AND FOR ERRORS TOO
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
            onChange={handleToolInputChange}
            color={isFirstNameInvalid ? "danger" : "default"}
          />
        </div>
        <div className="flex-1">
          <Label>Last Name</Label>
          <Input
            required
            type="text"
            name="lastName"
            value={employeeFormValue.lastName}
            onChange={handleToolInputChange}
            color={isLastNameInvalid ? "danger" : "default"}
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
            onChange={handleToolInputChange}
            color={isAgeInvalid ? "danger" : "default"}
          />
        </div>
        <div className="flex-1">
          <Label>Phone Number</Label>
          <Input
            required
            type="text"
            name="phoneNumber"
            value={employeeFormValue.phoneNumber}
            onChange={handleToolInputChange}
            color={isPhoneNumberInvalid ? "danger" : "default"}
          />
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <Label>Blood Type</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full" variant="outline">
                {bloodType}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full">
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
              <Button className="w-full" variant="outline">
                {job}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full">
              <DropdownMenuLabel>Job</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={job}
                onValueChange={(value: string) => setJob(value)}
              >
                <DropdownMenuRadioItem value="Mechanic">
                  Mechanic
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Doctor">
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
                "w-[240px] justify-start text-left font-normal",
                !date && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
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
          >
            Close
          </Button>
        </AlertDialogCancel>

        <AlertDialogCancel asChild>
          <Button
            onClick={handleSaveAndCloseClick}
            variant="secondary"
            disabled={!isEmployeeFormValid}
          >
            Save & Close
          </Button>
        </AlertDialogCancel>
      </AlertDialogFooter>
    </form>
  );
}
