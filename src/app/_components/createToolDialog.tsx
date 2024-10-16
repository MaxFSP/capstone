/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
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

import { SingleSelectCombobox } from '~/components/ui/SingleSelectCombobox';

export function CreateToolDialog(props: { locations: ILocation[] }) {
  const { locations } = props;
  const router = useRouter();
  const { toast } = useToast();

  // Options arrays
  const toolTypes = [
    'Wrench',
    'Hammer',
    'Screwdriver',
    'Drill',
    'Grinder',
    'Impact Wrench',
    'Hydraulic Jack',
    'Torque Wrench',
    'Pliers',
    'Allen Key',
    'Sockets',
  ];

  const toolBrands = [
    'Milwaukee',
    'DeWalt',
    'Bosch',
    'Makita',
    'Hilti',
    'Snap-On',
    'Stanley',
    'Ridgid',
    'Kobalt',
    'Husky',
  ];

  const toolCategories = [
    'Hand Tools',
    'Power Tools',
    'Measuring Tools',
    'Cutting Tools',
    'Pneumatic Tools',
    'Hydraulic Tools',
    'Electrical Tools',
    'Safety Tools',
    'Welding Tools',
    'Fastening Tools',
  ];

  const [toolFormValues, setToolFormValues] = useState({
    name: '',
    brand: toolBrands[0],
    category: toolCategories[0],
    tool_type: toolTypes[0],
    condition: 'Good' as ToolCondition,
    quantity: '',
    acquisition_date: new Date(),
    location_id: locations[0]?.location_id ?? 0,
    location_name: locations[0]?.name ?? '',
    observations: '',
  });

  const [isEditing, setIsEditing] = useState(true);
  const [isToolFormValid, setIsToolFormValid] = useState(false);

  // Validation functions
  const validateName = (name: string) => /^[A-Za-z\s]+$/.test(name);
  const validateQuantity = (quantity: string) => /^[0-9]+$/.test(quantity);
  const validateObservations = (observations: string) => /^[A-Za-z0-9\s]*$/.test(observations);

  // Effect to validate form
  useEffect(() => {
    const isNameValid = validateName(toolFormValues.name);
    const isQuantityValid = validateQuantity(toolFormValues.quantity);
    const isObservationsValid = validateObservations(toolFormValues.observations);

    setIsToolFormValid(isNameValid && isQuantityValid && isObservationsValid);
  }, [toolFormValues]);

  // Error flags using useMemo
  const isNameInvalid = useMemo(
    () => toolFormValues.name !== '' && !validateName(toolFormValues.name),
    [toolFormValues.name]
  );
  const isQuantityInvalid = useMemo(
    () => toolFormValues.quantity !== '' && !validateQuantity(toolFormValues.quantity),
    [toolFormValues.quantity]
  );
  const isObservationsInvalid = useMemo(
    () => toolFormValues.observations !== '' && !validateObservations(toolFormValues.observations),
    [toolFormValues.observations]
  );

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
      const payload = {
        ...toolFormValues,
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
        brand: toolBrands[0],
        category: toolCategories[0],
        tool_type: toolTypes[0],
        condition: 'Good',
        quantity: '',
        acquisition_date: new Date(),
        location_id: locations[0]?.location_id ?? 0,
        location_name: locations[0]?.name ?? '',
        observations: '',
      });
      setIsEditing(true);
    }
  };

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
          <SingleSelectCombobox
            options={toolBrands.map((brand) => ({
              label: brand,
              value: brand,
            }))}
            placeholder="Select a brand..."
            selectedValue={toolFormValues.brand!}
            onChange={(value) => {
              setToolFormValues((prev) => ({ ...prev, brand: value }));
            }}
            disabled={!isEditing}
          />
        </div>
      </div>

      {/* Category and Tool Type */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <Label htmlFor="category">Category</Label>
          <SingleSelectCombobox
            options={toolCategories.map((category) => ({
              label: category,
              value: category,
            }))}
            placeholder="Select a category..."
            selectedValue={toolFormValues.category!}
            onChange={(value) => {
              setToolFormValues((prev) => ({ ...prev, category: value }));
            }}
            disabled={!isEditing}
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="tool_type">Tool Type</Label>
          <SingleSelectCombobox
            options={toolTypes.map((type) => ({
              label: type,
              value: type,
            }))}
            placeholder="Select a tool type..."
            selectedValue={toolFormValues.tool_type!}
            onChange={(value) => {
              setToolFormValues((prev) => ({ ...prev, tool_type: value }));
            }}
            disabled={!isEditing}
          />
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
            type="text"
            id="quantity"
            name="quantity"
            value={toolFormValues.quantity}
            onChange={handleToolInputChange}
            disabled={!isEditing}
            inputMode="numeric"
            pattern="[0-9]*"
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
          <SingleSelectCombobox
            options={locations.map((location) => ({
              label: location.name,
              value: location.name,
            }))}
            placeholder="Select a location..."
            selectedValue={toolFormValues.location_name}
            onChange={(value) => {
              const selectedLocation = locations.find((loc) => loc.name === value);
              if (selectedLocation) {
                setToolFormValues((prev) => ({
                  ...prev,
                  location_name: selectedLocation.name,
                  location_id: selectedLocation.location_id,
                }));
              }
            }}
            disabled={!isEditing}
          />
        </div>
        <div className="flex-1">
          <Label>Condition</Label>
          <SingleSelectCombobox
            options={[
              { label: 'Good', value: 'Good' },
              { label: 'Bad', value: 'Bad' },
              { label: 'Excellent', value: 'Excellent' },
              { label: 'Poor', value: 'Poor' },
            ]}
            placeholder="Select a condition..."
            selectedValue={toolFormValues.condition}
            onChange={(value) => {
              setToolFormValues((prev) => ({
                ...prev,
                condition: value as ToolCondition,
              }));
            }}
            disabled={!isEditing}
          />
        </div>
      </div>

      {/* Acquisition Date */}
      <div className="flex flex-col">
        <Label>Acquisition Date</Label>
        <Popover>
          <PopoverTrigger asChild disabled={!isEditing}>
            <Button
              variant={'outline'}
              className={cn(
                'w-[240px] justify-start border border-border bg-background text-left font-normal text-foreground',
                !toolFormValues.acquisition_date && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {toolFormValues.acquisition_date ? (
                format(toolFormValues.acquisition_date, 'PPP')
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto bg-background p-0 text-foreground" align="start">
            <Calendar
              mode="single"
              selected={toolFormValues.acquisition_date}
              onSelect={(selectedDate) => {
                if (selectedDate) {
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
                brand: toolBrands[0],
                category: toolCategories[0],
                tool_type: toolTypes[0],
                condition: 'Good',
                quantity: '',
                acquisition_date: new Date(),
                location_id: locations[0]?.location_id ?? 0,
                location_name: locations[0]?.name ?? '',
                observations: '',
              });
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
