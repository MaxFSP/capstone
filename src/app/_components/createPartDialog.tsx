import { Label } from "@radix-ui/react-label";
import {
  AlertDialogCancel,
  AlertDialogFooter,
} from "~/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useState, useEffect, useMemo } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "@nextui-org/react";
import { type PartCondition } from "~/server/types/IPart";
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

export default function CreatePartDialog(props: { locations: ILocation[] }) {
  const { locations } = props;

  const [date, setDate] = useState<Date>(new Date());

  const [partFormValues, setPartFormValues] = useState({
    name: "",
    part_number: "",
    condition: "",
    quantity: "",
    location_id: 0,
    length: "",
    length_unit: "cm",
    width: "",
    width_unit: "cm",
    height: "",
    height_unit: "cm",
    compatible_machines: "",
  });

  const [length, setLength] = useState(partFormValues.length_unit);
  const [width, setWidth] = useState(partFormValues.width_unit);
  const [height, setHeight] = useState(partFormValues.height_unit);

  const [isPartFormValid, setIsPartFormValid] = useState(false);
  const [isEditing, setIsEditing] = useState(true);

  // REMEMBER TO ADD THIS TO THE FORM BEFORE SENDING IT
  const [locationValue, setLocationValue] = useState(locations[0]!.name);
  const [conditionValue, setConditionValue] = useState<PartCondition>("Good");

  useEffect(() => {
    const isNameValid = validateName(partFormValues.name); // Added type annotation
    const isPartNumberValid = validatePartNumber(partFormValues.part_number);
    const isQuantityValid = validateQuantity(partFormValues.quantity);
    const isLengthValid = validateLength(partFormValues.length);
    const isWidthValid = validateWidth(partFormValues.width);
    const isHeightValid = validateHeight(partFormValues.height);
    const isCompatibleMachinesValid = validateCompatibleMachines(
      partFormValues.compatible_machines,
    );

    setIsPartFormValid(
      isNameValid &&
        isPartNumberValid &&
        isQuantityValid &&
        isLengthValid &&
        isWidthValid &&
        isHeightValid &&
        isCompatibleMachinesValid,
    );
  }, [partFormValues]);

  const validateName = (name: string) => /^[A-Za-z\s]+$/.test(name); // Only letters and spaces
  const validatePartNumber = (part_number: string) =>
    /^[A-Za-z0-9\s]+$/.test(part_number); // Only letters, numbers and spaces
  const validateQuantity = (quantity: string) => /^[0-9]+$/.test(quantity);
  const validateLength = (length: string) => /^[0-9]+$/.test(length);
  const validateWidth = (width: string) => /^[0-9]+$/.test(width);
  // WIDTH AND HEIGHT AND LENGTH UNITS ARE DROPDOWNS
  const validateHeight = (height: string) => /^[0-9]+$/.test(height);
  const validateCompatibleMachines = (compatible_machines: string) =>
    /^[A-Za-z0-9\s]+$/.test(compatible_machines); // Only letters and spaces

  const isNameValid = useMemo(
    () => partFormValues.name !== "" && !validateName(partFormValues.name),
    [partFormValues.name],
  );

  const isPartNumberValid = useMemo(
    () =>
      partFormValues.part_number !== "" &&
      !validatePartNumber(partFormValues.part_number),
    [partFormValues.part_number],
  );

  const isCompatibleMachinesValid = useMemo(
    () =>
      partFormValues.compatible_machines !== "" &&
      !validateCompatibleMachines(partFormValues.compatible_machines),
    [partFormValues.compatible_machines],
  );

  const isQuantityValid = useMemo(
    () =>
      partFormValues.quantity !== "" &&
      !validateQuantity(partFormValues.quantity),
    [partFormValues.quantity],
  );

  const isLengthValid = useMemo(
    () =>
      partFormValues.length !== "" && !validateLength(partFormValues.length),
    [partFormValues.length],
  );

  const isWidthValid = useMemo(
    () => partFormValues.width !== "" && !validateWidth(partFormValues.width),
    [partFormValues.width],
  );

  const isHeightValid = useMemo(
    () =>
      partFormValues.height !== "" && !validateHeight(partFormValues.height),
    [partFormValues.height],
  );

  const handlePartInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPartFormValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const handleSaveClick = async (): Promise<boolean> => {
    try {
      const locationId = locations.find(
        (location) => location.name === locationValue,
      )!.location_id;
      partFormValues.location_id = locationId;
      partFormValues.condition = conditionValue;
      partFormValues.length_unit = length;
      partFormValues.width_unit = width;
      partFormValues.height_unit = height;

      const response = await fetch("/api/createPart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(partFormValues),
      });

      //TODO: ADD A TOAST FOR SUCCESS AND FOR ERRORS TOO
      if (!response.ok) {
        throw new Error("Failed to create part");
      }

      setIsEditing(false);
      return true;
    } catch (error) {
      console.error("Failed to create part:", error);
      return false;
    }
  };

  const handleSaveAndCloseClick = async () => {
    await handleSaveClick();
    setPartFormValues({
      name: "",
      part_number: "",
      condition: "",
      quantity: "",
      location_id: 0,
      length: "",
      length_unit: "cm",
      width: "",
      width_unit: "cm",
      height: "",
      height_unit: "cm",
      compatible_machines: "",
    });
  };
  return (
    <form className="space-y-4">
      <div className="flex space-x-4">
        <div className="flex-1">
          <Label>Name</Label>
          <Input
            type="text"
            label="Name"
            name="name"
            value={partFormValues.name}
            onChange={handlePartInputChange}
            isDisabled={!isEditing}
            isInvalid={isNameValid}
            color={isNameValid ? "danger" : "default"}
            errorMessage={isNameValid && "Name can only contain letters"}
          />
        </div>
        <div className="flex-1">
          <Label>Part Number</Label>
          <Input
            type="text"
            label="Part Number"
            name="part_number"
            value={partFormValues.part_number}
            onChange={handlePartInputChange}
            isDisabled={!isEditing}
            isInvalid={isPartNumberValid}
            color={isPartNumberValid ? "danger" : "default"}
            errorMessage={
              isPartNumberValid && "Part Number can only contain letters"
            }
          />
        </div>
      </div>
      <div className="flex space-x-4">
        <div className="flex-1">
          <Label>Compatible Machines</Label>
          <Input
            type="text"
            label="Compatible Machines"
            name="compatible_machines"
            value={partFormValues.compatible_machines}
            onChange={handlePartInputChange}
            isDisabled={!isEditing}
            isInvalid={isCompatibleMachinesValid}
            color={isCompatibleMachinesValid ? "danger" : "default"}
            errorMessage={
              isCompatibleMachinesValid &&
              "Compatible Machines can only contain letters and spaces"
            }
          />
        </div>
        <div className="w-[100px]">
          <Label>Quantity</Label>
          <Input
            type="text"
            label="Quantity"
            name="quantity"
            value={partFormValues.quantity}
            onChange={handlePartInputChange}
            isDisabled={!isEditing}
            isInvalid={isQuantityValid}
            color={isQuantityValid ? "danger" : "default"}
            errorMessage={
              isQuantityValid && "Quantity can only contain numbers"
            }
          />
        </div>
      </div>

      <div className="flex space-x-4 ">
        <div className="flex-1">
          <div className="flex flex-col">
            <Label>Dimensions</Label>
            <Label>(L x W x H)</Label>
          </div>
          <div className="flex ">
            <Input
              type="text"
              name="length"
              className="h-[19px]"
              value={partFormValues.length}
              onChange={handlePartInputChange}
              isDisabled={!isEditing}
              isInvalid={isLengthValid}
              color={isLengthValid ? "danger" : "default"}
              errorMessage={isLengthValid && "Length must be a number"}
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="m-2 w-1/6" variant="outline">
                  {length}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Unit</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={partFormValues.length_unit}
                  onValueChange={(e) => {
                    setLength(e);
                    setPartFormValues((prev) => ({
                      ...prev,
                      length_unit: e,
                    }));
                  }}
                >
                  <DropdownMenuRadioItem value="cm">cm</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="mm">mm</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Input
              type="text"
              name="width"
              value={partFormValues.width}
              onChange={handlePartInputChange}
              className="h-[19px]"
              isDisabled={!isEditing}
              isInvalid={isWidthValid}
              color={isWidthValid ? "danger" : "default"}
              errorMessage={isWidthValid && "Width must be a number"}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="m-2 w-1/6" variant="outline">
                  {width}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Unit</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={partFormValues.width_unit}
                  onValueChange={(e) => {
                    setWidth(e);
                    setPartFormValues((prev) => ({ ...prev, width_unit: e }));
                  }}
                >
                  <DropdownMenuRadioItem value="cm">cm</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="mm">mm</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Input
              type="text"
              name="height"
              value={partFormValues.height}
              className="h-[19px]"
              onChange={handlePartInputChange}
              isDisabled={!isEditing}
              isInvalid={isHeightValid}
              color={isHeightValid ? "danger" : "default"}
              errorMessage={isHeightValid && "Height must be a number"}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="m-2 w-1/6" variant="outline">
                  {height}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Unit</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={partFormValues.height_unit}
                  onValueChange={(e) => {
                    setHeight(e);
                    setPartFormValues((prev) => ({ ...prev, height_unit: e }));
                  }}
                >
                  <DropdownMenuRadioItem value="cm">cm</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="mm">mm</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
          {/* CONDITION */}
          <Label>Condition</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full" variant="outline">
                {conditionValue}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Locations</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={conditionValue}
                onValueChange={(value) =>
                  setConditionValue(value as PartCondition)
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
                  setPartFormValues((prev) => ({
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
              setPartFormValues({
                name: "",
                part_number: "",
                condition: "",
                quantity: "",
                location_id: 0,
                length: "",
                length_unit: "cm",
                width: "",
                width_unit: "cm",
                height: "",
                height_unit: "cm",
                compatible_machines: "",
              });
            }}
          >
            Close
          </Button>
        </AlertDialogCancel>
        <Button
          onClick={handleSaveAndCloseClick}
          variant="secondary"
          disabled={!isPartFormValid}
        >
          Save & Close
        </Button>
      </AlertDialogFooter>
    </form>
  );
}
