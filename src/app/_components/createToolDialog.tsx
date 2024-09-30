/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
import { type ILocation } from '~/server/types/ILocation';
import { type ToolCondition } from '~/server/types/ITool';
import { useToast } from '~/components/hooks/use-toast'; // Assuming you have a useToast hook
import { useRouter } from 'next/navigation';

export function CreateToolDialog(props: { locations: ILocation[] }) {
  const { locations } = props;
  const router = useRouter();
  const { toast } = useToast();

  const [locationValue, setLocationValue] = useState(locations[0]?.name ?? '');
  const [conditionValue, setConditionValue] = useState<ToolCondition>('Good');

  const [toolFormValues, setToolFormValues] = useState({
    name: '',
    brand: '',
    category: '',
    tool_type: '',
    condition: 'Good' as ToolCondition,
    quantity: '',
    acquisition_date: new Date(),
    location_id: locations[0]?.location_id ?? 0,
    observations: '',
  });

  const [date, setDate] = useState<Date>(new Date());

  const [isEditing, setIsEditing] = useState(true);
  const [isToolFormValid, setIsToolFormValid] = useState(false);

  // Validation functions
  const validateName = (name: string) => /^[A-Za-z\s]+$/.test(name);
  const validateBrand = (brand: string) => /^[A-Za-z\s]+$/.test(brand);
  const validateToolType = (tool_type: string) => /^[A-Za-z\s]+$/.test(tool_type);
  const validateCategory = (category: string) => /^[A-Za-z\s]+$/.test(category);
  const validateQuantity = (quantity: string) => /^[0-9]+$/.test(quantity);
  const validateAquisitionDate = (aquisition_date: Date) => aquisition_date !== null;
  const validateObservations = (observations: string) => /^[A-Za-z0-9\s]+$/.test(observations);

  // Effect to validate form
  useEffect(() => {
    const isNameValid = validateName(toolFormValues.name);
    const isBrandValid = validateBrand(toolFormValues.brand);
    const isToolTypeValid = validateToolType(toolFormValues.tool_type);
    const isCategoryValid = validateCategory(toolFormValues.category);
    const isQuantityValid = validateQuantity(toolFormValues.quantity);
    const isObservationsValid = validateObservations(toolFormValues.observations);
    const isAquisitionDateValid = validateAquisitionDate(toolFormValues.acquisition_date);

    setIsToolFormValid(
      isNameValid &&
        isBrandValid &&
        isToolTypeValid &&
        isCategoryValid &&
        isQuantityValid &&
        isObservationsValid &&
        isAquisitionDateValid
    );
  }, [toolFormValues]);

  // Handlers
  const handleToolInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // For quantity, ensure only numbers are entered
    if (name === 'quantity') {
      if (value === '' || /^[0-9]*$/.test(value)) {
        setToolFormValues((prevValues) => ({ ...prevValues, [name]: value }));
      }
    } else {
      setToolFormValues((prevValues) => ({ ...prevValues, [name]: value }));
    }
  };

  const handleSaveClick = async (): Promise<boolean> => {
    try {
      const location = locations.find((loc) => loc.name === locationValue);
      if (!location) {
        throw new Error('Selected location is invalid.');
      }

      const payload = {
        ...toolFormValues,
        condition: conditionValue,
        location_id: location.location_id,
        acquisition_date: toolFormValues.acquisition_date,
      };

      const response = await fetch('/api/createTool', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create tool.');
      }

      toast({
        title: 'Success',
        description: 'Tool created successfully.',
      });

      // Refresh or redirect as needed
      router.refresh();
      return true;
    } catch (error) {
      console.error('Failed to create tool:', error);
      let errorMessage = 'An unknown error occurred.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  };

  const handleSaveAndCloseClick = async () => {
    const success = await handleSaveClick();
    if (success) {
      setToolFormValues({
        name: '',
        brand: '',
        category: '',
        tool_type: '',
        condition: 'Good',
        quantity: '',
        acquisition_date: new Date(),
        location_id: locations[0]?.location_id ?? 0,
        observations: '',
      });
      setDate(new Date());
      setLocationValue(locations[0]?.name ?? '');
      setConditionValue('Good');
      setIsEditing(true);
    }
  };

  // Error flags using useMemo
  const isNameInvalid = useMemo(
    () => toolFormValues.name !== '' && !validateName(toolFormValues.name),
    [toolFormValues.name]
  );
  const isBrandInvalid = useMemo(
    () => toolFormValues.brand !== '' && !validateBrand(toolFormValues.brand),
    [toolFormValues.brand]
  );
  const isToolTypeInvalid = useMemo(
    () => toolFormValues.tool_type !== '' && !validateToolType(toolFormValues.tool_type),
    [toolFormValues.tool_type]
  );
  const isCategoryInvalid = useMemo(
    () => toolFormValues.category !== '' && !validateCategory(toolFormValues.category),
    [toolFormValues.category]
  );
  const isQuantityInvalid = useMemo(
    () => toolFormValues.quantity !== '' && !validateQuantity(toolFormValues.quantity),
    [toolFormValues.quantity]
  );
  const isObservationsInvalid = useMemo(
    () => toolFormValues.observations !== '' && !validateObservations(toolFormValues.observations),
    [toolFormValues.observations]
  );

  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      {/* Name and Brand */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <Label htmlFor="name">Name</Label>
          <Input
            required
            type="text"
            id="name"
            name="name"
            value={toolFormValues.name}
            onChange={handleToolInputChange}
            disabled={!isEditing}
            className={cn(
              'border border-border bg-background text-foreground',
              isNameInvalid && 'border-destructive'
            )}
          />
          {isNameInvalid && (
            <p className="text-sm text-destructive">Name can only contain letters and spaces.</p>
          )}
        </div>
        <div className="flex-1">
          <Label htmlFor="brand">Brand</Label>
          <Input
            required
            type="text"
            id="brand"
            name="brand"
            value={toolFormValues.brand}
            onChange={handleToolInputChange}
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
      </div>

      {/* Category and Tool Type */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <Label htmlFor="category">Category</Label>
          <Input
            required
            type="text"
            id="category"
            name="category"
            value={toolFormValues.category}
            onChange={handleToolInputChange}
            disabled={!isEditing}
            className={cn(
              'border border-border bg-background text-foreground',
              isCategoryInvalid && 'border-destructive'
            )}
          />
          {isCategoryInvalid && (
            <p className="text-sm text-destructive">
              Category can only contain letters and spaces.
            </p>
          )}
        </div>
        <div className="flex-1">
          <Label htmlFor="tool_type">Tool Type</Label>
          <Input
            required
            type="text"
            id="tool_type"
            name="tool_type"
            value={toolFormValues.tool_type}
            onChange={handleToolInputChange}
            disabled={!isEditing}
            className={cn(
              'border border-border bg-background text-foreground',
              isToolTypeInvalid && 'border-destructive'
            )}
          />
          {isToolTypeInvalid && (
            <p className="text-sm text-destructive">
              Tool Type can only contain letters and spaces.
            </p>
          )}
        </div>
      </div>

      {/* Observations and Quantity */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <Label htmlFor="observations">Observations</Label>
          <Input
            type="text"
            id="observations"
            name="observations"
            value={toolFormValues.observations}
            onChange={handleToolInputChange}
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
        <div className="w-[100px]">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            required
            type="text" // Changed to text to handle custom validation
            id="quantity"
            name="quantity"
            value={toolFormValues.quantity}
            onChange={handleToolInputChange}
            disabled={!isEditing}
            inputMode="numeric" // Helps mobile devices show numeric keyboard
            pattern="[0-9]*" // HTML pattern for numeric input
            className={cn(
              'border border-border bg-background text-foreground',
              isQuantityInvalid && 'border-destructive'
            )}
          />
          {isQuantityInvalid && (
            <p className="text-sm text-destructive">Quantity can only contain numbers.</p>
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
                    setToolFormValues((prev) => ({
                      ...prev,
                      location_id: selectedLocation.location_id,
                    }));
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
                onValueChange={(value: string) => setConditionValue(value as ToolCondition)}
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
              onSelect={(selectedDate) => {
                if (selectedDate) {
                  setDate(selectedDate);
                  setToolFormValues((prev) => ({
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

      {/* Form Actions */}
      <AlertDialogFooter className="sm:justify-start">
        <AlertDialogCancel asChild>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setToolFormValues({
                name: '',
                brand: '',
                category: '',
                tool_type: '',
                condition: 'Good',
                quantity: '',
                acquisition_date: new Date(),
                location_id: locations[0]?.location_id ?? 0,
                observations: '',
              });
              setDate(new Date());
              setLocationValue(locations[0]?.name ?? '');
              setConditionValue('Good');
              setIsEditing(true);
            }}
            className="bg-secondary text-secondary-foreground"
          >
            Close
          </Button>
        </AlertDialogCancel>

        <Button
          onClick={handleSaveAndCloseClick}
          disabled={!isToolFormValid || !isEditing}
          className="bg-primary text-primary-foreground"
        >
          Save
        </Button>
      </AlertDialogFooter>
    </form>
  );
}
