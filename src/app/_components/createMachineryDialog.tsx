/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
'use client';

import { useState, useEffect, useMemo } from 'react';

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
import { type States } from '~/server/types/IMachinery';
import { type ILocation } from '~/server/types/ILocation';
import { useToast } from '~/components/hooks/use-toast';
import { useRouter } from 'next/navigation';

export function CreateMachineryDialog(props: { locations: ILocation[] }) {
  const { locations } = props;

  const [locationValue, setLocationValue] = useState(locations[0]?.name ?? '');
  const [stateValue, setStateValue] = useState<States>('Available');

  const [machineryFormValues, setMachineryFormValues] = useState({
    brand: '',
    model: '',
    year: '',
    serial_number: '',
    acquisition_date: new Date(),
    location_id: 0,
    observations: '',
    state: '',
  });

  // Calendar state
  const [date, setDate] = useState<Date>(new Date());

  // Form validation state
  const [isEditing, setIsEditing] = useState(true);
  const [isMachineryFormValid, setIsMachineryFormValid] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  useEffect(() => {
    const isBrandValid = validateBrand(machineryFormValues.brand);
    const isModelValid = validateMachineryModel(machineryFormValues.model);
    const isYearValid = validateMachineryYear(machineryFormValues.year);
    const isSerialNumberValid = validateMachinerySerialNumber(machineryFormValues.serial_number);
    const isObservationsValid = validateObservations(machineryFormValues.observations);
    const isAquisitionDateValid = validateAquisitionDate(machineryFormValues.acquisition_date);

    setIsMachineryFormValid(
      isBrandValid &&
        isModelValid &&
        isYearValid &&
        isSerialNumberValid &&
        isAquisitionDateValid &&
        isObservationsValid
    );
  }, [machineryFormValues]);

  // Validation functions
  const validateBrand = (brand: string) => /^[A-Za-z\s]+$/.test(brand);
  const validateMachineryModel = (model: string) => /^[A-Za-z0-9\s]+$/.test(model);
  const validateMachineryYear = (year: string) => /^[0-9]{4}$/.test(year); // Assuming year is 4 digits
  const validateMachinerySerialNumber = (serial_number: string) =>
    /^[A-Za-z0-9\s]+$/.test(serial_number);
  const validateAquisitionDate = (aquisition_date: Date) =>
    aquisition_date instanceof Date && !isNaN(aquisition_date.getTime());
  const validateObservations = (observations: string) =>
    observations === '' || /^[A-Za-z0-9\s]+$/.test(observations);

  // Handle input changes
  const handleMachineryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMachineryFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSaveClick = async (): Promise<boolean> => {
    try {
      const location = locations.find((location) => location.name === locationValue);
      if (!location) {
        throw new Error('Selected location not found.');
      }

      const machineryData = {
        ...machineryFormValues,
        location_id: location.location_id,
        state: stateValue,
      };

      const response = await fetch('/api/createMachinery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(machineryData),
      });
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Machinery created successfully.',
        });
        router.refresh();
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create machinery. Please try again.');
      }

      setIsEditing(false);
      return true;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create machinery.',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Handle save and reset
  const handleSaveAndCloseClick = async () => {
    const isSaved = await handleSaveClick();
    if (isSaved) {
      // Reset form values
      setMachineryFormValues({
        brand: '',
        model: '',
        year: '',
        serial_number: '',
        acquisition_date: new Date(),
        location_id: 0,
        observations: '',
        state: '',
      });
      setDate(new Date());
      setLocationValue(locations[0]?.name ?? '');
      setStateValue('Available');
      setIsEditing(true);
      // Optionally, close the dialog or show a success message here
    }
  };

  // Memoized validation flags
  const isBrandInvalid = useMemo(
    () => machineryFormValues.brand !== '' && !validateBrand(machineryFormValues.brand),
    [machineryFormValues.brand]
  );
  const isModelInvalid = useMemo(
    () => machineryFormValues.model !== '' && !validateMachineryModel(machineryFormValues.model),
    [machineryFormValues.model]
  );
  const isYearInvalid = useMemo(
    () => machineryFormValues.year !== '' && !validateMachineryYear(machineryFormValues.year),
    [machineryFormValues.year]
  );
  const isSerialNumberInvalid = useMemo(
    () =>
      machineryFormValues.serial_number !== '' &&
      !validateMachinerySerialNumber(machineryFormValues.serial_number),
    [machineryFormValues.serial_number]
  );
  const isObservationsInvalid = useMemo(
    () =>
      machineryFormValues.observations !== '' &&
      !validateObservations(machineryFormValues.observations),
    [machineryFormValues.observations]
  );

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        await handleSaveAndCloseClick();
      }}
    >
      <div className="flex space-x-4">
        <div className="flex-1">
          <Label htmlFor="brand">Brand</Label>
          <Input
            required
            type="text"
            id="brand"
            name="brand"
            value={machineryFormValues.brand}
            onChange={handleMachineryInputChange}
            disabled={!isEditing}
            className={cn(
              'border border-border bg-background text-foreground',
              isBrandInvalid && 'border-destructive'
            )}
          />
          {isBrandInvalid && (
            <p className="text-sm text-destructive">Brand can only contain letters and spaces.</p>
          )}
        </div>
        <div className="flex-1">
          <Label htmlFor="model">Model</Label>
          <Input
            required
            type="text"
            id="model"
            name="model"
            value={machineryFormValues.model}
            onChange={handleMachineryInputChange}
            disabled={!isEditing}
            className={cn(
              'border border-border bg-background text-foreground',
              isModelInvalid && 'border-destructive'
            )}
          />
          {isModelInvalid && (
            <p className="text-sm text-destructive">
              Model can only contain letters, numbers, and spaces.
            </p>
          )}
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <Label htmlFor="year">Year</Label>
          <Input
            required
            type="text"
            id="year"
            name="year"
            value={machineryFormValues.year}
            onChange={handleMachineryInputChange}
            disabled={!isEditing}
            className={cn(
              'border border-border bg-background text-foreground',
              isYearInvalid && 'border-destructive'
            )}
          />
          {isYearInvalid && (
            <p className="text-sm text-destructive">Year must be a 4-digit number.</p>
          )}
        </div>
        <div className="flex-1">
          <Label htmlFor="serial_number">Serial Number</Label>
          <Input
            required
            type="text"
            id="serial_number"
            name="serial_number"
            value={machineryFormValues.serial_number}
            onChange={handleMachineryInputChange}
            disabled={!isEditing}
            className={cn(
              'border border-border bg-background text-foreground',
              isSerialNumberInvalid && 'border-destructive'
            )}
          />
          {isSerialNumberInvalid && (
            <p className="text-sm text-destructive">
              Serial Number can only contain letters, numbers, and spaces.
            </p>
          )}
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <Label htmlFor="observations">Observations</Label>
          <Input
            type="text"
            id="observations"
            name="observations"
            value={machineryFormValues.observations}
            onChange={handleMachineryInputChange}
            disabled={!isEditing}
            className={cn(
              'border border-border bg-background text-foreground',
              isObservationsInvalid && 'border-destructive'
            )}
          />
          {isObservationsInvalid && (
            <p className="text-sm text-destructive">
              Observations can only contain letters, numbers, and spaces.
            </p>
          )}
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <Label>Location</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full border border-border bg-background text-foreground">
                {locationValue || 'Select Location'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full bg-background text-foreground">
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
          <Label>State</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full border border-border bg-background text-foreground">
                {stateValue}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full bg-background text-foreground">
              <DropdownMenuLabel>State</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={stateValue}
                onValueChange={(value) => setStateValue(value as States)}
              >
                <DropdownMenuRadioItem value="Available">Available</DropdownMenuRadioItem>
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
              onSelect={(selectedDate) => {
                if (selectedDate) {
                  setDate(selectedDate);
                  setMachineryFormValues((prev) => ({
                    ...prev,
                    acquisition_date: selectedDate,
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
                brand: '',
                model: '',
                year: '',
                serial_number: '',
                acquisition_date: new Date(),
                location_id: 0,
                observations: '',
                state: '',
              });
              setDate(new Date());
              setLocationValue(locations[0]?.name ?? '');
              setStateValue('Available');
              setIsEditing(true);
            }}
            className="bg-secondary text-secondary-foreground"
          >
            Close
          </Button>
        </AlertDialogCancel>

        <Button
          type="submit"
          disabled={!isMachineryFormValid}
          className="bg-primary text-primary-foreground"
        >
          Save
        </Button>
      </AlertDialogFooter>
    </form>
  );
}
