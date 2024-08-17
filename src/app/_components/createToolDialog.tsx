"use client";

import { useState, useEffect, useMemo } from "react";

import { Button } from "~/components/ui/button";

import { Input } from "@nextui-org/react";

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

import { type ILocation } from "~/server/types/ILocation";
import { type ToolCondition } from "~/server/types/ITool";

export function CreateToolDialog(props: { locations: ILocation[] }) {
  const { locations } = props;

  const [locationValue, setLocationValue] = useState(locations[0]!.name);
  const [conditionValue, setConditionValue] = useState<ToolCondition>("Good");

  const [toolFormValues, setToolFormValues] = useState({
    name: "",
    brand: "",
    category: "",
    tool_type: "",
    condition: "",
    quantity: "",
    acquisition_date: new Date(),
    location_id: 0,
    observations: "",
  });

  const [date, setDate] = useState<Date>(new Date());

  const [isEditing, setIsEditing] = useState(true);
  const [isToolFormValid, setIsToolFormValid] = useState(false);

  useEffect(() => {
    const isNameValid = validateName(toolFormValues.name);
    const isBrandValid = validateBrand(toolFormValues.brand);
    const isToolTypeValid = validateToolType(toolFormValues.tool_type);
    const isCategoryValid = validateCategory(toolFormValues.category);
    const isQuantityValid = validateQuantity(toolFormValues.quantity);
    const isObservationsValid = validateObservations(
      toolFormValues.observations,
    );
    const isAquisitionDateValid = validateAquisitionDate(
      toolFormValues.acquisition_date,
    );

    setIsToolFormValid(
      isNameValid &&
        isBrandValid &&
        isToolTypeValid &&
        isCategoryValid &&
        isQuantityValid &&
        isObservationsValid &&
        isAquisitionDateValid,
    );
  }, [toolFormValues]);

  const validateName = (name: string) => /^[A-Za-z\s]+$/.test(name);
  const validateBrand = (brand: string) => /^[A-Za-z\s]+$/.test(brand);
  const validateToolType = (tool_type: string) =>
    /^[A-Za-z\s]+$/.test(tool_type);
  const validateCategory = (category: string) => /^[A-Za-z\s]+$/.test(category);
  const validateQuantity = (quantity: string) => /^[0-9]+$/.test(quantity);
  const validateAquisitionDate = (aquisition_date: Date) =>
    aquisition_date !== null;
  const validateObservations = (observations: string) =>
    /^[A-Za-z\s]+$/.test(observations);

  const handleToolInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setToolFormValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const handleSaveClick = async (): Promise<boolean> => {
    try {
      const locationId = locations.find(
        (location) => location.name === locationValue,
      )!.location_id;
      toolFormValues.location_id = locationId;
      toolFormValues.condition = conditionValue;

      const response = await fetch("/api/createTool", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(toolFormValues),
      });

      if (!response.ok) {
        throw new Error("Failed to create tool");
      }

      setIsEditing(false);
      return true;
    } catch (error) {
      console.error("Failed to create tool:", error);
      return false;
    }
  };

  const handleSaveAndCloseClick = async () => {
    await handleSaveClick();
    setToolFormValues({
      name: "",
      brand: "",
      category: "",
      tool_type: "",
      condition: "",
      quantity: "",
      acquisition_date: new Date(),
      location_id: 0,
      observations: "",
    });
  };

  const isNameInvalid = useMemo(
    () => toolFormValues.name !== "" && !validateName(toolFormValues.name),
    [toolFormValues.name],
  );
  const isBrandInvalid = useMemo(
    () => toolFormValues.brand !== "" && !validateBrand(toolFormValues.brand),
    [toolFormValues.brand],
  );
  const isToolTypeInvalid = useMemo(
    () =>
      toolFormValues.tool_type !== "" &&
      !validateToolType(toolFormValues.tool_type),
    [toolFormValues.tool_type],
  );
  const isCategoryInvalid = useMemo(
    () =>
      toolFormValues.category !== "" &&
      !validateCategory(toolFormValues.category),
    [toolFormValues.category],
  );
  const isQuantityInvalid = useMemo(
    () =>
      toolFormValues.quantity !== "" &&
      !validateQuantity(toolFormValues.quantity),
    [toolFormValues.quantity],
  );

  const isObservationsInvalid = useMemo(
    () =>
      toolFormValues.observations !== "" &&
      !validateObservations(toolFormValues.observations),
    [toolFormValues.observations],
  );

  return (
    <form className="space-y-4">
      <div className="flex space-x-4">
        <div className="flex-1">
          <Label>Name</Label>
          <Input
            required
            type="text"
            label="Name"
            name="name"
            value={toolFormValues.name}
            onChange={handleToolInputChange}
            isDisabled={!isEditing}
            isInvalid={isNameInvalid}
            color={isNameInvalid ? "danger" : "default"}
            errorMessage={isNameInvalid && "Name can only contain letters"}
            className="border border-border bg-background text-foreground"
          />
        </div>
        <div className="flex-1">
          <Label>Brand</Label>
          <Input
            required
            type="text"
            label="Brand"
            name="brand"
            value={toolFormValues.brand}
            onChange={handleToolInputChange}
            isDisabled={!isEditing}
            isInvalid={isBrandInvalid}
            color={isBrandInvalid ? "danger" : "default"}
            errorMessage={isBrandInvalid && "Brand can only contain letters"}
            className="border border-border bg-background text-foreground"
          />
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <Label>Category</Label>
          <Input
            required
            type="text"
            label="Category"
            name="category"
            value={toolFormValues.category}
            onChange={handleToolInputChange}
            isDisabled={!isEditing}
            isInvalid={isCategoryInvalid}
            color={isCategoryInvalid ? "danger" : "default"}
            errorMessage={
              isCategoryInvalid && "Category can only contain letters"
            }
            className="border border-border bg-background text-foreground"
          />
        </div>
        <div className="flex-1">
          <Label>Tool Type</Label>
          <Input
            required
            type="text"
            label="Tool Type"
            name="tool_type"
            value={toolFormValues.tool_type}
            onChange={handleToolInputChange}
            isDisabled={!isEditing}
            isInvalid={isToolTypeInvalid}
            color={isToolTypeInvalid ? "danger" : "default"}
            errorMessage={
              isToolTypeInvalid && "Tool Type can only contain letters"
            }
            className="border border-border bg-background text-foreground"
          />
        </div>
      </div>
      <div className="flex space-x-4">
        <div className="flex-1">
          <Label>Observations</Label>
          <Input
            type="text"
            label="Observations"
            name="observations"
            value={toolFormValues.observations}
            onChange={handleToolInputChange}
            isDisabled={!isEditing}
            isInvalid={isObservationsInvalid}
            color={isObservationsInvalid ? "danger" : "default"}
            errorMessage={
              isObservationsInvalid &&
              "Observations can only contain letters and spaces"
            }
            className="border border-border bg-background text-foreground"
          />
        </div>
        <div className="w-[100px]">
          <Label>Quantity</Label>
          <Input
            type="text"
            label="Quantity"
            name="quantity"
            value={toolFormValues.quantity}
            onChange={handleToolInputChange}
            isDisabled={!isEditing}
            isInvalid={isQuantityInvalid}
            color={isQuantityInvalid ? "danger" : "default"}
            errorMessage={
              isQuantityInvalid && "Quantity can only contain numbers"
            }
            className="border border-border bg-background text-foreground"
          />
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <Label>Location</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="w-full border border-border bg-background text-foreground"
                variant="outline"
              >
                {locationValue}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-background text-foreground">
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
          <Label>Condition</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="w-full border border-border bg-background text-foreground"
                variant="outline"
              >
                {conditionValue}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full bg-background text-foreground">
              <DropdownMenuLabel>Condition</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={conditionValue}
                onValueChange={(value: string) =>
                  setConditionValue(value as ToolCondition)
                }
              >
                <DropdownMenuRadioItem value="Good">Good</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Bad">Bad</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Excellent">
                  Excellent
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Poor">Poor</DropdownMenuRadioItem>
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
                "w-[240px] justify-start border border-border bg-background text-left font-normal text-foreground",
                !date && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto bg-background p-0 text-foreground"
            align="start"
          >
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => {
                if (date) {
                  setDate(date);
                  setToolFormValues((prev) => ({
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
            className="bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              setToolFormValues({
                name: "",
                brand: "",
                category: "",
                tool_type: "",
                condition: "",
                quantity: "",
                acquisition_date: new Date(),
                location_id: 0,
                observations: "",
              });
            }}
          >
            Close
          </Button>
        </AlertDialogCancel>

        <Button
          onClick={handleSaveAndCloseClick}
          variant="secondary"
          disabled={!isToolFormValid}
          className="hover:bg-primary-dark bg-primary text-primary-foreground"
        >
          Save & Close
        </Button>
      </AlertDialogFooter>
    </form>
  );
}
