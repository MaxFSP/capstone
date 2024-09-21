/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { Label } from '~/components/ui/label';
import { UploadButton } from '../utils/uploadthing';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { cn } from '~/lib/utils';
import { Calendar } from '~/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import DeleteImageDialog from './deleteImageDialog';
import { useRouter } from 'next/navigation';
import type { Employee } from '~/server/types/IEmployee';
import { useFormValidation } from '~/hooks/useFormValidation';
import { employeeSchema } from '~/server/types/IEmployee';
import type { z } from 'zod';
import LabeledInput from './LabeledInput';
import { isBloodType, isJobType } from '~/server/types/typeGuard';
import { useToast } from '~/components/hooks/use-toast';
import { BLOOD_TYPES, JOB_TYPES } from '~/server/types/constants';
import type { BloodType } from '~/server/types/constants';
import { deleteEntity } from '~/lib/api-utils';

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeDataViewDialogProps {
  title: string;
  data: Employee;
  size: string;
  index: number;
}

const EmployeeDataViewDialog: React.FC<EmployeeDataViewDialogProps> = ({
  title,
  data,
  size,
  index,
}) => {
  const router = useRouter();
  const { toast } = useToast();

  // State Management
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [jobValue, setJobValue] = useState<string>(data.job);
  const [bloodTypeValue, setBloodTypeValue] = useState<BloodType>(data.bloodType as BloodType);
  const [dateValue, setDateValue] = useState<Date>(new Date(data.hireDate));
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  // Initialize form data with proper types
  const initialFormData: EmployeeFormData = {
    ...data,
    age: Number(data.age),
    hireDate: new Date(data.hireDate),
  };

  const { formData, setFormData, isFormValid, errors, validateForm } =
    useFormValidation<EmployeeFormData>({
      schema: employeeSchema,
      initialData: initialFormData,
    });

  // Handle input changes
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type } = e.target;
      let newValue: string | number = value;

      if (type === 'number') {
        newValue = value === '' ? 0 : Number(value);
      }

      setFormData({ [name]: newValue });
      validateForm();
    },
    [setFormData, validateForm]
  );

  // Handle Blood Type Change with Type Guard
  const handleBloodTypeChange = (value: string) => {
    if (isBloodType(value)) {
      setBloodTypeValue(value);
      setFormData({ bloodType: value });
    } else {
      console.error(`Invalid BloodType: ${value}`);
      toast({
        title: 'Error',
        description: 'Selected blood type is invalid.',
        variant: 'destructive',
      });
    }
  };

  // Handle Job Change with Type Guard
  const handleJobChange = (value: string) => {
    if (isJobType(value)) {
      setJobValue(value);
      setFormData({ job: value });
    } else {
      console.error(`Invalid Job Type: ${value}`);
      toast({
        title: 'Error',
        description: 'Selected job type is invalid.',
        variant: 'destructive',
      });
    }
  };

  // Handle Date Change
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setDateValue(date);
      setFormData({ hireDate: date });
    }
  };

  // Handle Edit/Cancel Click
  const handleEditClick = () => {
    if (isEditing) {
      // If cancelling, reset form data to initial
      setFormData(initialFormData);
      setJobValue(initialFormData.job);
      setBloodTypeValue(initialFormData.bloodType);
      setDateValue(initialFormData.hireDate);
    }
    setIsEditing(!isEditing);
  };

  // Handle Save Click
  const handleSaveClick = async () => {
    if (isFormValid && hasChanges) {
      try {
        const updatedFormData: Employee = {
          ...formData,
          job: jobValue,
          bloodType: bloodTypeValue,
          hireDate: dateValue,
        };

        const response = await fetch('/api/updateEmployee', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedFormData),
        });

        if (response.ok) {
          toast({
            title: 'Success',
            description: 'Employee updated successfully.',
          });
          router.refresh();
          setIsEditing(false);
        } else {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update employee.');
        }
      } catch (error) {
        console.error('Error updating employee:', error);
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

  const handleDeleteClick = async () => {
    try {
      await deleteEntity({
        endpoint: '/api/deleteEntity',
        entityId: data.employee_id,
        entityName: 'employee',
        onSuccess: () => router.refresh(),
      });
    } catch (error) {}
  };

  // Check for changes in the form
  useEffect(() => {
    const hasFormChanges =
      formData.firstName !== initialFormData.firstName ||
      formData.lastName !== initialFormData.lastName ||
      formData.age !== initialFormData.age ||
      formData.phoneNumber !== initialFormData.phoneNumber ||
      formData.job !== initialFormData.job ||
      formData.bloodType !== initialFormData.bloodType ||
      formData.hireDate.toISOString() !== initialFormData.hireDate.toISOString();

    setHasChanges(hasFormChanges);
  }, [formData, initialFormData]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {size === 'lg' ? (
          <p className="w-8 cursor-pointer text-small font-semibold">{title}</p>
        ) : (
          <div className="flex flex-col border-b border-border px-5 py-4 text-foreground">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-base font-semibold">ID</p>
              <div className="flex items-center gap-2">{index}</div>
            </div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">First Name</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground">{data.firstName}</span>
              </div>
            </div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Last Name</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground">{data.lastName}</span>
              </div>
            </div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Job</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground">{data.job}</span>
              </div>
            </div>
          </div>
        )}
      </DialogTrigger>
      <DialogContent className="h-auto max-h-[90vh] overflow-auto lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-large">{title}</DialogTitle>
          <DialogDescription>Manage employee details.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex space-x-4">
            {data.imageUrl && (
              <div>
                <img
                  src={data.imageUrl}
                  alt="Profile Image"
                  className="h-24 w-24 rounded-full object-cover"
                />
                <DeleteImageDialog
                  imageInfo={{
                    image_id: data.employee_id,
                    image_key: data.imageKey!,
                    type: 'Employee',
                  }}
                />
              </div>
            )}
            <div className="flex-1 flex-col">
              <div className="flex space-x-4">
                <LabeledInput
                  label="First Name"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  disabled={!isEditing}
                  error={errors.find((e) => e.path[0] === 'firstName')?.message}
                  required
                />
                <LabeledInput
                  label="Last Name"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  disabled={!isEditing}
                  error={errors.find((e) => e.path[0] === 'lastName')?.message}
                  required
                />
              </div>
              <div className="flex space-x-4">
                <LabeledInput
                  label="Age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  disabled={!isEditing}
                  error={errors.find((e) => e.path[0] === 'age')?.message}
                  required
                />
                <LabeledInput
                  label="Phone Number"
                  name="phoneNumber"
                  type="text"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  disabled={!isEditing}
                  error={errors.find((e) => e.path[0] === 'phoneNumber')?.message}
                  required
                />
              </div>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label>Blood Type</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild disabled={!isEditing}>
                      <Button variant="outline" className="w-full bg-background text-foreground">
                        {bloodTypeValue}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full bg-white text-black">
                      <DropdownMenuLabel>Blood Type</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuRadioGroup
                        value={bloodTypeValue}
                        onValueChange={handleBloodTypeChange}
                      >
                        {BLOOD_TYPES.map((type) => (
                          <DropdownMenuRadioItem key={type} value={type}>
                            {type}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex-1">
                  <Label>Job</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild disabled={!isEditing}>
                      <Button variant="outline" className="w-full bg-background text-foreground">
                        {jobValue}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full bg-white text-black">
                      <DropdownMenuLabel>Job</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuRadioGroup value={jobValue} onValueChange={handleJobChange}>
                        {JOB_TYPES.map((job) => (
                          <DropdownMenuRadioItem key={job} value={job}>
                            {job}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="flex flex-col">
                <Label>Hire Date</Label>
                <Popover>
                  <PopoverTrigger asChild disabled={!isEditing}>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-[240px] justify-start bg-background text-left font-normal',
                        !dateValue && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateValue ? format(dateValue, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateValue}
                      onSelect={handleDateChange}
                      initialFocus
                      className="border border-border bg-background text-foreground"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          {!data.imageUrl && (
            <div className="flex space-x-4">
              <div className="flex-1">
                <Label>Upload Images</Label>
                <div className="flex items-center gap-2">
                  <UploadButton
                    disabled={!isEditing}
                    input={{ employee_id: data.employee_id }}
                    endpoint="employeeImageUploader"
                    onClientUploadComplete={() => {
                      toast({
                        title: 'Success',
                        description: 'Image uploaded successfully.',
                      });
                      router.refresh();
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        {errors.length > 0 && isEditing && (
          <div className="mt-4 text-sm text-red-500">Please correct the errors before saving.</div>
        )}
        <DialogFooter className="sm:justify-start">
          {!isEditing && (
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          )}
          <Button onClick={handleEditClick}>{isEditing ? 'Cancel' : 'Edit'}</Button>
          {isEditing && (
            <>
              <DialogClose asChild>
                <Button
                  onClick={handleSaveClick}
                  disabled={!isFormValid || !hasChanges}
                  className="bg-primary text-primary-foreground"
                >
                  Save
                </Button>
              </DialogClose>
            </>
          )}
          <DialogClose asChild>
            <Button
              onClick={handleDeleteClick}
              variant="destructive"
              className="bg-red-600 text-white"
            >
              Delete
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeDataViewDialog;
