/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '~/components/ui/button';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { cn } from '~/lib/utils';
import { Calendar } from '~/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { type SellDataValues } from '~/server/types/IMachinery';
import { useToast } from '~/components/hooks/use-toast';
import { useRouter } from 'next/navigation';

export function SellDataViewDialog(props: { data: SellDataValues }) {
  const { data } = props;
  const router = useRouter();
  const { toast } = useToast();

  // Initialize state for form values
  const [formValues, setFormValues] = useState({
    machine_id: data.machine_id,
    brand: data.brand,
    model: data.model,
    year: data.year,
    serial_number: data.serial_number,
    sold_price: data.sold_price.toString(),
    sold_to: data.sold_to,
    sold_date: data.sold_date,
  });

  // State to manage the selected date
  const [date, setDate] = useState<Date>(data.sold_date ? new Date(data.sold_date) : new Date());

  // State to track if the form is being edited
  const [isEditing, setIsEditing] = useState(true);

  // State to handle form validation
  const [isFormValid, setIsFormValid] = useState(false);

  // State to manage form submission status
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State to track if fields have been touched
  const [touched, setTouched] = useState({
    sold_price: false,
    sold_to: false,
  });

  // Validation Functions
  const validateSoldPrice = (sold_price: string) => {
    const price = parseFloat(sold_price);
    return !isNaN(price) && price > 0;
  };

  const validateSoldTo = (sold_to: string) => /^[A-Za-z\s]+$/.test(sold_to);

  const validateSoldDate = (sold_date: Date | null) => sold_date !== null;

  // Effect to validate the form whenever formValues or date changes
  useEffect(() => {
    const isSoldPriceValid = validateSoldPrice(formValues.sold_price);
    const isSoldToValid = validateSoldTo(formValues.sold_to);
    const isSoldDateValid = validateSoldDate(date);

    setIsFormValid(isSoldPriceValid && isSoldToValid && isSoldDateValid);
  }, [formValues, date]);

  // Memoized validation states for styling
  const isSoldPriceValid = useMemo(
    () => validateSoldPrice(formValues.sold_price),
    [formValues.sold_price]
  );
  const isSoldToValid = useMemo(() => validateSoldTo(formValues.sold_to), [formValues.sold_to]);

  // Handle form submission
  const handleSaveClick = async (): Promise<boolean> => {
    try {
      setIsSubmitting(true); // Start submission

      const response = await fetch('/api/sellMachinery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          machine_id: formValues.machine_id,
          sold_price: parseFloat(formValues.sold_price),
          sold_date: date,
          sold_to: formValues.sold_to,
        }),
      });

      if (!response.ok) {
        // Extract error message from response
        const errorData = await response.json();
        const errorMessage = errorData.error ?? 'Failed to sell machine';
        throw new Error(errorMessage);
      }

      // Success Toast
      toast({
        title: 'Success',
        description: 'Machine marked as sold successfully.',
      });

      setIsEditing(false);
      setIsSubmitting(false);
      router.refresh(); // Refresh or update data as needed
      return true;
    } catch (error) {
      console.error('Failed to sell machine:', error);
      let errorMessage = 'An unknown error occurred.';

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Error Toast
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });

      setIsSubmitting(false);
      return false;
    }
  };

  // Handle Save and Close operation
  const handleSaveAndCloseClick = async () => {
    await handleSaveClick();
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  // Handle input blur to set touched state
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prevTouched) => ({ ...prevTouched, [name]: true }));
  };

  // Handle close button click to reset form
  const handleCloseClick = () => {
    setFormValues({
      machine_id: data.machine_id,
      brand: data.brand,
      model: data.model,
      year: data.year,
      serial_number: data.serial_number,
      sold_price: data.sold_price.toString(),
      sold_to: data.sold_to,
      sold_date: data.sold_date,
    });
    setDate(data.sold_date ? new Date(data.sold_date) : new Date());
    setTouched({
      sold_price: false,
      sold_to: false,
    });
    setIsEditing(true); // Reset editing state if needed
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-opacity-90">
          Sell Machine
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="h-auto max-h-[90vh] overflow-auto rounded-lg border border-border bg-background text-foreground lg:max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold text-primary">
            Sell Machine
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Make sure you type the correct information before selling the machine.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* Machine Details (Read-Only) */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>Machine ID</Label>
              <Input
                name="machine_id"
                value={data.machine_id}
                readOnly
                disabled
                className="border border-border bg-muted text-muted-foreground"
              />
            </div>
            <div className="flex-1">
              <Label>Brand</Label>
              <Input
                name="brand"
                value={data.brand}
                readOnly
                disabled
                className="border border-border bg-muted text-muted-foreground"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>Model</Label>
              <Input
                name="model"
                value={data.model}
                readOnly
                disabled
                className="border border-border bg-muted text-muted-foreground"
              />
            </div>
            <div className="flex-1">
              <Label>Year</Label>
              <Input
                name="year"
                value={data.year}
                readOnly
                disabled
                className="border border-border bg-muted text-muted-foreground"
              />
            </div>
            <div className="flex-1">
              <Label>Serial Number</Label>
              <Input
                name="serial_number"
                value={data.serial_number}
                readOnly
                disabled
                className="border border-border bg-muted text-muted-foreground"
              />
            </div>
          </div>

          {/* Editable Fields */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>Sold Price (USD)</Label>
              <Input
                required
                type="number"
                name="sold_price"
                value={formValues.sold_price}
                onChange={handleInputChange}
                onBlur={handleBlur}
                min="0.01"
                step="0.01"
                className={`${
                  isSoldPriceValid ?? !touched.sold_price ? 'text-foreground' : 'text-destructive'
                } border border-border bg-background`}
                placeholder="Enter sold price"
              />
              {touched.sold_price && !isSoldPriceValid && (
                <p className="text-sm text-destructive">Sold price must be a positive number.</p>
              )}
            </div>
            <div className="flex-1">
              <Label>Sold To</Label>
              <Input
                required
                type="text"
                name="sold_to"
                value={formValues.sold_to}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`${
                  isSoldToValid ?? !touched.sold_to ? 'text-foreground' : 'text-destructive'
                } border border-border bg-background`}
                placeholder="Enter buyer's name"
              />
              {touched.sold_to && !isSoldToValid && (
                <p className="text-sm text-destructive">
                  Sold To must contain only letters and spaces.
                </p>
              )}
            </div>
          </div>

          {/* Sold Date */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-[240px] justify-start border border-border bg-background text-left font-normal text-foreground',
                  !date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-foreground" />
                {date ? format(date, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto border border-border bg-background p-0 text-foreground"
              align="start"
            >
              <Calendar
                mode="single"
                selected={date}
                onSelect={(selectedDate) => {
                  if (selectedDate) {
                    setDate(selectedDate);
                    setFormValues((prev) => ({
                      ...prev,
                      sold_date: selectedDate,
                    }));
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Footer with Actions */}
        <AlertDialogFooter className="sm:justify-start">
          <AlertDialogCancel asChild>
            <Button
              type="button"
              variant="secondary"
              className="bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              onClick={handleCloseClick}
              disabled={isSubmitting}
            >
              Close
            </Button>
          </AlertDialogCancel>
          <AlertDialogCancel asChild>
            <Button
              onClick={handleSaveAndCloseClick}
              variant="destructive"
              disabled={!isFormValid ?? isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? 'Submitting...' : 'Mark as sold'}
            </Button>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
