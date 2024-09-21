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

export default function CreatePartDialog(props: { locations: ILocation[] }) {
  const { locations } = props;
  const router = useRouter();
  const { toast } = useToast();

  const [date, setDate] = useState<Date>(new Date());
  const [length, setLength] = useState<typeof partUnitEnum._type>('cm');
  const [width, setWidth] = useState<typeof partUnitEnum._type>('cm');
  const [height, setHeight] = useState<typeof partUnitEnum._type>('cm');
  const [locationValue, setLocationValue] = useState(locations[0]!.name);
  const [conditionValue, setConditionValue] = useState<PartCondition>('Good');

  const [formData, setFormData] = useState({
    part_id: 0,
    name: '',
    part_number: '',
    condition: 'Good' as PartCondition,
    quantity: 0,
    location_id: locations[0]!.location_id,
    location_name: locations[0]!.name,
    length: 0,
    length_unit: 'cm' as typeof partUnitEnum._type,
    width: 0,
    width_unit: 'cm' as typeof partUnitEnum._type,
    height: 0,
    height_unit: 'cm' as typeof partUnitEnum._type,
    compatible_machines: '',
    created_at: new Date(),
    images: [],
  });

  const [isFormValid, setIsFormValid] = useState(false);

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

  // PART VALIDATIONS
  const validateName = (name: string) => name.trim() !== '';
  const validatePartNumber = (partNumber: string) => /^[A-Za-z0-9-]+$/.test(partNumber);
  const validateQuantity = (quantity: number) => quantity > 0;
  const validateDimensions = (length: number, width: number, height: number) =>
    length > 0 && width > 0 && height > 0;
  const validateCompatibleMachines = (machines: string) => machines.trim() !== '';

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

  const handleSaveClick = async () => {
    if (isFormValid) {
      try {
        const updatedFormData = {
          ...formData,
          location_id: locations.find((location) => location.name === locationValue)!.location_id,
          location_name: locationValue,
          condition: conditionValue,
          length_unit: length,
          width_unit: width,
          height_unit: height,
          created_at: date,
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
          router.refresh();
        } else {
          const data = await response.json();
          throw new Error(data.error || 'Failed to create part.');
        }
      } catch (error) {
        console.error('Error creating part:', error);
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
      (formData.length !== 0 || formData.width !== 0 || formData.height !== 0) &&
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
      <div className="flex space-x-4">
        <div className="flex-1">
          <Label>Name</Label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={cn(isNameInvalid && 'border-red-500')}
          />
          {isNameInvalid && <p className="text-sm text-red-500">Name cannot be empty</p>}
        </div>
        <div className="flex-1">
          <Label>Part Number</Label>
          <Input
            name="part_number"
            value={formData.part_number}
            onChange={handleChange}
            className={cn(isPartNumberInvalid && 'border-red-500')}
          />
          {isPartNumberInvalid && (
            <p className="text-sm text-red-500">
              Part number can only contain letters, numbers, and hyphens
            </p>
          )}
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <Label>Compatible Machines</Label>
          <Input
            name="compatible_machines"
            value={formData.compatible_machines}
            onChange={handleChange}
            className={cn(isCompatibleMachinesInvalid && 'border-red-500')}
          />
          {isCompatibleMachinesInvalid && (
            <p className="text-sm text-red-500">Compatible machines cannot be empty</p>
          )}
        </div>
        <div className="w-[100px]">
          <Label>Quantity</Label>
          <Input
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className={cn(isQuantityInvalid && 'border-red-500')}
          />
          {isQuantityInvalid && (
            <p className="text-sm text-red-500">Quantity must be greater than 0</p>
          )}
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <div className="flex flex-col">
            <Label>Dimensions</Label>
            <Label>(L x W x H)</Label>
          </div>
          <div className="flex">
            <Input
              name="length"
              value={formData.length}
              onChange={handleChange}
              className={cn('m-2 w-1/6', isDimensionsInvalid && 'border-red-500')}
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
                  value={length}
                  onValueChange={(value) => setLength(value as typeof partUnitEnum._type)}
                >
                  <DropdownMenuRadioItem value="cm">cm</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="mm">mm</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Input
              name="width"
              value={formData.width}
              onChange={handleChange}
              className={cn('m-2 w-1/6', isDimensionsInvalid && 'border-red-500')}
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
                  value={width}
                  onValueChange={(value) => setWidth(value as typeof partUnitEnum._type)}
                >
                  <DropdownMenuRadioItem value="cm">cm</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="mm">mm</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Input
              name="height"
              value={formData.height}
              onChange={handleChange}
              className={cn('m-2 w-1/6', isDimensionsInvalid && 'border-red-500')}
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
            <p className="text-sm text-red-500">Please enter valid dimensions</p>
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
              <DropdownMenuRadioGroup value={locationValue} onValueChange={setLocationValue}>
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
              <Button className="w-full" variant="outline">
                {conditionValue}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
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

      <div className="flex flex-col">
        <Label>Acquisition Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={'outline'}
              className={cn(
                'w-[240px] justify-start text-left font-normal',
                !date && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, 'PPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
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
              setFormData({
                part_id: 0,
                name: '',
                part_number: '',
                condition: 'Good',
                quantity: 0,
                location_id: locations[0]!.location_id,
                location_name: locations[0]!.name,
                length: 0,
                length_unit: 'cm',
                width: 0,
                width_unit: 'cm',
                height: 0,
                height_unit: 'cm',
                compatible_machines: '',
                created_at: new Date(),
                images: [],
              });
              setDate(new Date());
              setLength('cm');
              setWidth('cm');
              setHeight('cm');
              setLocationValue(locations[0]!.name);
              setConditionValue('Good');
            }}
          >
            Close
          </Button>
        </AlertDialogCancel>
        <Button onClick={handleSaveClick} disabled={!isFormValid}>
          Save
        </Button>
      </AlertDialogFooter>
    </form>
  );
}
