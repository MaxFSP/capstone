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
import { type States } from "~/server/types/IMachinery";
import { type ILocation } from "~/server/types/ILocation";

export function CreateMachineryDialog(props: { locations: ILocation[] }) {
  const { locations } = props;

  const [locationValue, setLocationValue] = useState(locations[0]!.name);
  const [stateValue, setStateValue] = useState<States>("Available");

  const [machineryFormValues, setMachineryFormValues] = useState({
    brand: "",
    model: "",
    year: "",
    serial_number: "",
    acquisition_date: new Date(),
    location_id: 0,
    observations: "",
    state: "",
  });

  // Calendar stuff
  const [date, setDate] = useState<Date>(new Date());

  // Form stuff
  const [isEditing, setIsEditing] = useState(true);
  const [isMachineryFormValid, setIsMachineryFormValid] = useState(false);

  useEffect(() => {
    const isBrandValid = validateBrand(machineryFormValues.brand);
    const isModelValid = validateMachineryModel(machineryFormValues.model);
    const isYearValid = validateMachineryYear(machineryFormValues.year);
    const isSerialNumberValid = validateMachinerySerialNumber(
      machineryFormValues.serial_number,
    );
    const isObservationsValid = validateObservations(
      machineryFormValues.observations,
    );
    const isAquisitionDateValid = validateAquisitionDate(
      machineryFormValues.acquisition_date,
    );

    setIsMachineryFormValid(
      isBrandValid &&
        isModelValid &&
        isYearValid &&
        isSerialNumberValid &&
        isAquisitionDateValid &&
        isObservationsValid,
    );
  }, [machineryFormValues]);

  // MACHINERY VALIDATIONS
  const validateBrand = (brand: string) => /^[A-Za-z\s]+$/.test(brand);
  const validateMachineryModel = (model: string) =>
    /^[A-Za-z0-9\s]+$/.test(model);
  const validateMachineryYear = (year: string) => /^[0-9]+$/.test(year);
  const validateMachinerySerialNumber = (serial_number: string) =>
    /^[A-Za-z0-9\s]+$/.test(serial_number);
  const validateAquisitionDate = (aquisition_date: Date) =>
    aquisition_date !== null;
  const validateObservations = (observations: string) =>
    /^[A-Za-z0-9\s]+$/.test(observations);

  // Form Input Change Handler
  const handleMachineryInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setMachineryFormValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const handleSaveClick = async (): Promise<boolean> => {
    try {
      const locationId = locations.find(
        (location) => location.name === locationValue,
      )!.location_id;

      machineryFormValues.location_id = locationId;
      machineryFormValues.state = stateValue;

      const response = await fetch("/api/createMachinery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(machineryFormValues),
      });

      if (!response.ok) {
        throw new Error("Failed to create machine");
      }

      setIsEditing(false);
      return true;
    } catch (error) {
      console.error("Failed to create machine:", error);
      return false;
    }
  };

  const handleSaveAndCloseClick = async () => {
    await handleSaveClick();
    setMachineryFormValues({
      brand: "",
      model: "",
      year: "",
      serial_number: "",
      acquisition_date: new Date(),
      location_id: 0,
      observations: "",
      state: "",
    });
  };

  const isBrandInvalid = useMemo(
    () =>
      machineryFormValues.brand !== "" &&
      !validateBrand(machineryFormValues.brand),
    [machineryFormValues.brand],
  );
  const isModelInvalid = useMemo(
    () =>
      machineryFormValues.model !== "" &&
      !validateMachineryModel(machineryFormValues.model),
    [machineryFormValues.model],
  );
  const isYearInvalid = useMemo(
    () =>
      machineryFormValues.year !== "" &&
      !validateMachineryYear(machineryFormValues.year),
    [machineryFormValues.year],
  );
  const isSerialNumberInvalid = useMemo(
    () =>
      machineryFormValues.serial_number !== "" &&
      !validateMachinerySerialNumber(machineryFormValues.serial_number),
    [machineryFormValues.serial_number],
  );
  const isObservationsInvalid = useMemo(
    () =>
      machineryFormValues.observations !== "" &&
      !validateObservations(machineryFormValues.observations),
    [machineryFormValues.observations],
  );

  return (
    <form className="space-y-4">
      <div className="flex space-x-4">
        <div className="flex-1">
          <Label>Brand</Label>
          <Input
            required
            type="text"
            name="brand"
            value={machineryFormValues.brand}
            onChange={handleMachineryInputChange}
            disabled={!isEditing}
            className={cn(isBrandInvalid && "border-red-500")}
          />
          {isBrandInvalid && (
            <p className="text-sm text-red-500">
              Brand can only contain letters
            </p>
          )}
        </div>
        <div className="flex-1">
          <Label>Model</Label>
          <Input
            required
            type="text"
            name="model"
            value={machineryFormValues.model}
            onChange={handleMachineryInputChange}
            disabled={!isEditing}
            className={cn(isModelInvalid && "border-red-500")}
          />
          {isModelInvalid && (
            <p className="text-sm text-red-500">
              Model can only contain letters and numbers
            </p>
          )}
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <Label>Year</Label>
          <Input
            required
            type="text"
            name="year"
            value={machineryFormValues.year}
            onChange={handleMachineryInputChange}
            disabled={!isEditing}
            className={cn(isYearInvalid && "border-red-500")}
          />
          {isYearInvalid && (
            <p className="text-sm text-red-500">Year must be a number</p>
          )}
        </div>
        <div className="flex-1">
          <Label>Serial Number</Label>
          <Input
            required
            type="text"
            name="serial_number"
            value={machineryFormValues.serial_number}
            onChange={handleMachineryInputChange}
            disabled={!isEditing}
            className={cn(isSerialNumberInvalid && "border-red-500")}
          />
          {isSerialNumberInvalid && (
            <p className="text-sm text-red-500">
              Serial Number can only contain letters, numbers, and spaces
            </p>
          )}
        </div>
      </div>
      <div className="flex space-x-4">
        <div className="flex-1">
          <Label>Observations</Label>
          <Input
            type="text"
            name="observations"
            value={machineryFormValues.observations}
            onChange={handleMachineryInputChange}
            disabled={!isEditing}
            className={cn(isObservationsInvalid && "border-red-500")}
          />
          {isObservationsInvalid && (
            <p className="text-sm text-red-500">
              Observations can only contain letters and spaces
            </p>
          )}
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <Label>Location</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full" variant="outline">
                {locationValue}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Locations</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={locationValue}
                onValueChange={setLocationValue}
              >
                {locations.map((location) => (
                  <DropdownMenuRadioItem
                    key={location.name}
                    value={location.name}
                  >
                    {location.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex-1">
          <Label>State</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full" variant="outline">
                {stateValue}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>State</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={stateValue}
                onValueChange={(value) => setStateValue(value as States)}
              >
                <DropdownMenuRadioItem value="Available">
                  Available
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Sold">Sold</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Under Maintenance">
                  Under Maintenance
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-col">
        <Label>Acquisition Date</Label>
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
                  setMachineryFormValues((prev) => ({
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

      <AlertDialogFooter className="sm:justify-start">
        <AlertDialogCancel asChild>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setMachineryFormValues({
                brand: "",
                model: "",
                year: "",
                serial_number: "",
                acquisition_date: new Date(),
                location_id: 0,
                observations: "",
                state: "",
              });
            }}
          >
            Close
          </Button>
        </AlertDialogCancel>

        <Button
          onClick={handleSaveAndCloseClick}
          variant="default"
          disabled={!isMachineryFormValid}
        >
          Save
        </Button>
      </AlertDialogFooter>
    </form>
  );
}
