/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { useToast } from '~/components/hooks/use-toast';

export function CreateEmployeeDialog() {
  const router = useRouter();
  const { toast } = useToast();

  const [bloodType, setBloodType] = useState('A+');
  const [job, setJob] = useState('Mechanic');
  const [date, setDate] = useState<Date>(new Date());

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    phoneNumber: '',
    bloodType: 'A+',
    job: 'Mechanic',
    hireDate: new Date(),
  });

  const [isFormValid, setIsFormValid] = useState(false);

  // Validation functions
  const validateName = (name: string) => /^[A-Za-z\s]+$/.test(name);
  const validateAge = (age: string) => {
    const ageNum = parseInt(age);
    return !isNaN(ageNum) && ageNum >= 18 && ageNum <= 90;
  };
  const validatePhoneNumber = (phoneNumber: string) => /^\d{7,8}$/.test(phoneNumber);

  useEffect(() => {
    const isFirstNameValid = validateName(formData.firstName);
    const isLastNameValid = validateName(formData.lastName);
    const isAgeValid = validateAge(formData.age);
    const isPhoneNumberValid = validatePhoneNumber(formData.phoneNumber);

    setIsFormValid(isFirstNameValid && isLastNameValid && isAgeValid && isPhoneNumberValid);
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = async () => {
    if (isFormValid) {
      try {
        const response = await fetch('/api/createEmployee', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            hireDate: date.toISOString(),
            state: 1,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error ?? 'Failed to create employee');
        }

        toast({
          title: 'Success',
          description: 'Employee created successfully.',
        });

        resetForm();
        router.refresh();
      } catch (error) {
        console.error('Failed to create employee:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'An unknown error occurred.',
          variant: 'destructive',
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      age: '',
      phoneNumber: '',
      bloodType: 'A+',
      job: 'Mechanic',
      hireDate: new Date(),
    });
    setDate(new Date());
    setBloodType('A+');
    setJob('Mechanic');
  };

  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <div className="flex space-x-4">
        <div className="flex-1">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className={cn(
              'border border-border bg-background text-foreground',
              formData.firstName && !validateName(formData.firstName) && 'border-destructive'
            )}
          />
          {formData.firstName && !validateName(formData.firstName) && (
            <p className="text-sm text-destructive mt-1">
              First name must contain only letters and spaces.
            </p>
          )}
        </div>
        <div className="flex-1">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className={cn(
              'border border-border bg-background text-foreground',
              formData.lastName && !validateName(formData.lastName) && 'border-destructive'
            )}
          />
          {formData.lastName && !validateName(formData.lastName) && (
            <p className="text-sm text-destructive mt-1">
              Last name must contain only letters and spaces.
            </p>
          )}
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            name="age"
            type="number"
            value={formData.age}
            onChange={handleInputChange}
            min="18"
            max="90"
            className={cn(
              'border border-border bg-background text-foreground',
              formData.age && !validateAge(formData.age) && 'border-destructive'
            )}
          />
          {formData.age && !validateAge(formData.age) && (
            <p className="text-sm text-destructive mt-1">Age must be between 18 and 90.</p>
          )}
        </div>
        <div className="flex-1">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            className={cn(
              'border border-border bg-background text-foreground',
              formData.phoneNumber &&
                !validatePhoneNumber(formData.phoneNumber) &&
                'border-destructive'
            )}
          />
          {formData.phoneNumber && !validatePhoneNumber(formData.phoneNumber) && (
            <p className="text-sm text-destructive mt-1">
              Phone number must contain 7 to 8 digits.
            </p>
          )}
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <Label htmlFor="bloodType">Blood Type</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full border border-border bg-background text-foreground"
              >
                {bloodType}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full bg-background text-foreground">
              <DropdownMenuLabel>Blood Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={bloodType}
                onValueChange={(value: string) => {
                  setBloodType(value);
                  setFormData((prev) => ({ ...prev, bloodType: value }));
                }}
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                  <DropdownMenuRadioItem key={type} value={type}>
                    {type}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex-1">
          <Label htmlFor="job">Job</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full border border-border bg-background text-foreground"
              >
                {job}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full bg-background text-foreground">
              <DropdownMenuLabel>Job</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={job}
                onValueChange={(value: string) => {
                  setJob(value);
                  setFormData((prev) => ({ ...prev, job: value }));
                }}
              >
                {['Mechanic', 'Painter', 'Engineer', 'Parts Specialist', 'Sales'].map(
                  (jobTitle) => (
                    <DropdownMenuRadioItem key={jobTitle} value={jobTitle}>
                      {jobTitle}
                    </DropdownMenuRadioItem>
                  )
                )}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-col">
        <Label htmlFor="hireDate">Hire Date</Label>
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
                  setFormData((prev) => ({ ...prev, hireDate: selectedDate }));
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
            onClick={resetForm}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            Close
          </Button>
        </AlertDialogCancel>

        <AlertDialogCancel asChild>
          <Button
            onClick={handleSaveClick}
            disabled={!isFormValid}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Save
          </Button>
        </AlertDialogCancel>
      </AlertDialogFooter>
    </form>
  );
}
