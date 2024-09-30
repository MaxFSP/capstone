/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Label } from '~/components/ui/label';
import { AlertDialogCancel, AlertDialogFooter } from '~/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { type PartCondition, type partUnitEnum } from '~/server/types/IPart';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { cn } from '~/lib/utils';
import { Calendar } from '~/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { type ILocation } from '~/server/types/ILocation';
import { useToast } from '~/components/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface Image {
  url: string;
  altText?: string;
}

// Define the interface for formData
interface FormData {
  part_id: number;
  name: string;
  part_number: string;
  condition: PartCondition;
  quantity: number;
  location_id: number;
  location_name: string;
  length: number;
  length_unit: typeof partUnitEnum._type;
  width: number;
  width_unit: typeof partUnitEnum._type;
  height: number;
  height_unit: typeof partUnitEnum._type;
  compatible_machines: string;
  acquisition_date: Date;
  images: Image[]; // Use the defined Image type
}

// Define the initial form data
const initialFormData: FormData = {
  part_id: 0,
  name: '',
  part_number: '',
  condition: 'Good',
  quantity: 0,
  location_id: 0, // Will be set based on locations prop
  location_name: '',
  length: 0,
  length_unit: 'cm',
  width: 0,
  width_unit: 'cm',
  height: 0,
  height_unit: 'cm',
  compatible_machines: '',
  acquisition_date: new Date(),
  images: [],
};

export default function CreatePartDialog(props: { locations: ILocation[] }) {
  const { locations } = props;
  const router = useRouter();
  const { toast } = useToast();

  const [date, setDate] = useState<Date>(new Date());
  const [length, setLength] = useState<typeof partUnitEnum._type>('cm');
  const [width, setWidth] = useState<typeof partUnitEnum._type>('cm');
  const [height, setHeight] = useState<typeof partUnitEnum._type>('cm');
  const [locationValue, setLocationValue] = useState(locations[0]?.name ?? '');
  const [conditionValue, setConditionValue] = useState<PartCondition>('Good');

  const [formData, setFormData] = useState<FormData>({
    ...initialFormData,
    location_id: locations[0]?.location_id ?? 0,
    location_name: locations[0]?.name ?? '',
  });

  const [isFormValid, setIsFormValid] = useState(false);

  // PART VALIDATIONS
  const validateName = (name: string) => name.trim() !== '';
  const validatePartNumber = (partNumber: string) => /^[A-Za-z0-9-]+$/.test(partNumber);
  const validateQuantity = (quantity: number) => quantity > 0;
  const validateDimensions = (length: number, width: number, height: number) =>
    length > 0 && width > 0 && height > 0;
  const validateCompatibleMachines = (machines: string) => machines.trim() !== '';

  useEffect(() => {
    const isNameValid = validateName(formData.name);
    const isPartNumberValid = validatePartNumber(formData.part_number);
    const isQuantityValid = validateQuantity(formData.quantity);
    const isDimensionsValid = validateDimensions(formData.length, formData.width, formData.height);
    const isCompatibleMachinesValid = validateCompatibleMachines(formData.compatible_machines);

    setIsFormValid(
      isNameValid &&
        isPartNumberValid &&
        isQuantityValid &&
        isDimensionsValid &&
        isCompatibleMachinesValid
    );
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let parsedValue: string | number = value;

    if (['quantity', 'length', 'width', 'height'].includes(name)) {
      parsedValue = value === '' ? 0 : Number(value);
      if (isNaN(parsedValue)) {
        parsedValue = 0;
      }
    }

    setFormData((prevData) => ({ ...prevData, [name]: parsedValue }));
  };

  const resetForm = () => {
    setFormData({
      ...initialFormData,
      location_id: locations[0]?.location_id ?? 0,
      location_name: locations[0]?.name ?? '',
    });
    setDate(new Date());
    setLength('cm');
    setWidth('cm');
    setHeight('cm');
    setLocationValue(locations[0]?.name ?? '');
    setConditionValue('Good');
  };

  const handleSaveClick = async () => {
    if (isFormValid) {
      try {
        const selectedLocation = locations.find((location) => location.name === locationValue);
        if (!selectedLocation) {
          throw new Error('Selected location is invalid.');
        }

        const updatedFormData: FormData = {
          ...formData,
          location_id: selectedLocation.location_id,
          location_name: locationValue,
          condition: conditionValue,
          length_unit: length,
          width_unit: width,
          height_unit: height,
          acquisition_date: date,
        };

        const response = await fetch('/api/createPart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedFormData),
        });

        if (response.ok) {
          toast({
            title: 'Success',
            description: 'Part created successfully.',
          });
          resetForm();
          router.refresh();
        } else {
          const data = await response.json();
          throw new Error(data.error ?? 'Failed to create part.');
        }
      } catch (error) {
        let errorMessage = 'An unknown error occurred.';
        if (error instanceof Error) {
          errorMessage = error.message;
        }

        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    }
  };

  const isNameInvalid = useMemo(
    () => formData.name !== '' && !validateName(formData.name),
    [formData.name]
  );
  const isPartNumberInvalid = useMemo(
    () => formData.part_number !== '' && !validatePartNumber(formData.part_number),
    [formData.part_number]
  );
  const isQuantityInvalid = useMemo(
    () => formData.quantity !== 0 && !validateQuantity(formData.quantity),
    [formData.quantity]
  );
  const isDimensionsInvalid = useMemo(
    () =>
      (formData.length !== 0 ?? formData.width !== 0 ?? formData.height !== 0) &&
      !validateDimensions(formData.length, formData.width, formData.height),
    [formData.length, formData.width, formData.height]
  );
  const isCompatibleMachinesInvalid = useMemo(
    () =>
      formData.compatible_machines !== '' &&
      !validateCompatibleMachines(formData.compatible_machines),
    [formData.compatible_machines]
  );

  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      {/* Name and Part Number */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <Label htmlFor="name">Name</Label>
          <Input
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            className={cn(
              'border border-border bg-background text-foreground',
              isNameInvalid && 'border-destructive'
            )}
          />
          {isNameInvalid && <p className="text-sm text-destructive">Name cannot be empty.</p>}
        </div>
        <div className="flex-1">
          <Label htmlFor="part_number">Part Number</Label>
          <Input
            name="part_number"
            id="part_number"
            value={formData.part_number}
            onChange={handleChange}
            className={cn(
              'border border-border bg-background text-foreground',
              isPartNumberInvalid && 'border-destructive'
            )}
          />
          {isPartNumberInvalid && (
            <p className="text-sm text-destructive">
              Part number can only contain letters, numbers, and hyphens.
            </p>
          )}
        </div>
      </div>

      {/* Compatible Machines and Quantity */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <Label htmlFor="compatible_machines">Compatible Machines</Label>
          <Input
            name="compatible_machines"
            id="compatible_machines"
            value={formData.compatible_machines}
            onChange={handleChange}
            className={cn(
              'border border-border bg-background text-foreground',
              isCompatibleMachinesInvalid && 'border-destructive'
            )}
          />
          {isCompatibleMachinesInvalid && (
            <p className="text-sm text-destructive">Compatible machines cannot be empty.</p>
          )}
        </div>
        <div className="w-[100px]">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            name="quantity"
            id="quantity"
            type="number" // Changed to number to restrict input
            value={formData.quantity}
            onChange={handleChange}
            min="1" // Enforce minimum value in the UI
            className={cn(
              'border border-border bg-background text-foreground',
              isQuantityInvalid && 'border-destructive'
            )}
          />
          {isQuantityInvalid && (
            <p className="text-sm text-destructive">Quantity must be greater than 0.</p>
          )}
        </div>
      </div>

      {/* Dimensions */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <div className="flex flex-col">
            <Label>Dimensions</Label>
            <Label>(L x W x H)</Label>
          </div>
          <div className="flex">
            {/* Length */}
            <Input
              name="length"
              id="length"
              type="number" // Changed to number to restrict input
              value={formData.length}
              onChange={handleChange}
              min="1" // Enforce minimum value in the UI
              className={cn(
                'm-2 w-1/6 border border-border bg-background text-foreground',
                isDimensionsInvalid && 'border-destructive'
              )}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="m-2 w-1/6 border border-border bg-background text-foreground">
                  {length}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background text-foreground">
                <DropdownMenuLabel>Unit</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={length}
                  onValueChange={(value) => setLength(value as typeof partUnitEnum._type)}
                >
                  <DropdownMenuRadioItem value="cm">cm</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="mm">mm</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Width */}
            <Input
              name="width"
              id="width"
              type="number" // Changed to number to restrict input
              value={formData.width}
              onChange={handleChange}
              min="1" // Enforce minimum value in the UI
              className={cn(
                'm-2 w-1/6 border border-border bg-background text-foreground',
                isDimensionsInvalid && 'border-destructive'
              )}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="m-2 w-1/6 border border-border bg-background text-foreground">
                  {width}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background text-foreground">
                <DropdownMenuLabel>Unit</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={width}
                  onValueChange={(value) => setWidth(value as typeof partUnitEnum._type)}
                >
                  <DropdownMenuRadioItem value="cm">cm</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="mm">mm</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Height */}
            <Input
              name="height"
              id="height"
              type="number" // Changed to number to restrict input
              value={formData.height}
              onChange={handleChange}
              min="1" // Enforce minimum value in the UI
              className={cn(
                'm-2 w-1/6 border border-border bg-background text-foreground',
                isDimensionsInvalid && 'border-destructive'
              )}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="m-2 w-1/6 border border-border bg-background text-foreground">
                  {height}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background text-foreground">
                <DropdownMenuLabel>Unit</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={height}
                  onValueChange={(value) => setHeight(value as typeof partUnitEnum._type)}
                >
                  <DropdownMenuRadioItem value="cm">cm</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="mm">mm</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {isDimensionsInvalid && (
            <p className="text-sm text-destructive">Please enter valid dimensions.</p>
          )}
        </div>
      </div>

      {/* Location and Condition */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <Label>Location</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full border border-border bg-background text-foreground">
                {locationValue}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-background text-foreground">
              <DropdownMenuLabel>Locations</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={locationValue}
                onValueChange={(value) => {
                  setLocationValue(value);
                  const selectedLocation = locations.find((loc) => loc.name === value);
                  if (selectedLocation) {
                    setFormData((prev) => ({ ...prev, location_id: selectedLocation.location_id }));
                  }
                }}
              >
                {locations.map((location) => (
                  <DropdownMenuRadioItem key={location.name} value={location.name}>
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
              <Button className="w-full border border-border bg-background text-foreground">
                {conditionValue}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-background text-foreground">
              <DropdownMenuLabel>Condition</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={conditionValue}
                onValueChange={(value) => setConditionValue(value as PartCondition)}
              >
                <DropdownMenuRadioItem value="Good">Good</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Bad">Bad</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Excellent">Excellent</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Poor">Poor</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Acquisition Date */}
      <div className="flex flex-col">
        <Label>Acquisition Date</Label>
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
          <PopoverContent className="w-auto bg-background p-0 text-foreground" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => {
                if (newDate) {
                  setDate(newDate);
                  setFormData((prev) => ({
                    ...prev,
                    acquisition_date: newDate,
                  }));
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Form Actions */}
      <AlertDialogFooter className="sm:justify-start">
        <AlertDialogCancel asChild>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              resetForm(); // Reset the form
            }}
            className="bg-secondary text-secondary-foreground"
          >
            Close
          </Button>
        </AlertDialogCancel>
        <AlertDialogCancel asChild>
          <Button
            onClick={handleSaveClick}
            disabled={!isFormValid}
            className="bg-primary text-primary-foreground"
          >
            Save
          </Button>
        </AlertDialogCancel>
      </AlertDialogFooter>
    </form>
  );
}
