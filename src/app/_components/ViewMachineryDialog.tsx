/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from 'react';

import { UploadButton } from '../utils/uploadthing';
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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '~/components/ui/carousel';
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
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { SellDataViewDialog } from './sellMachineDialog';

import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { cn } from '~/lib/utils';
import { Calendar } from '~/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';

import { type States, type Machinery, machinerySchema } from '~/server/types/IMachinery';
import { type ILocation } from '~/server/types/ILocation';
import { type Image } from '~/server/types/IImages';
import DeleteImageDialog from './deleteImageDialog';
import { useRouter } from 'next/navigation';
import { useToast } from '~/components/hooks/use-toast';
import { useFormValidation } from '~/hooks/useFormValidation';
import type { z } from 'zod';

type MachineryFormData = z.infer<typeof machinerySchema>;

export function MachineryDataViewDialog(props: {
  title: string;
  data: Machinery;
  locations: ILocation[];
}) {
  const { title, data, locations } = props;
  const current_date = data.acquisition_date;
  const current_state = data.state;
  const router = useRouter();
  const { toast } = useToast();

  const current_location: string = locations.find(
    (location) => data.location_name === location.name
  )!.name;

  const [stateValue, setStateValue] = useState<States>(data.state);
  const [dateValue, setDateValue] = useState<Date>(new Date(data.acquisition_date));
  const [locationValue, setLocationValue] = useState<string>(current_location);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [initialFormData, setInitialFormData] = useState({ ...data });
  const [hasChanges, setHasChanges] = useState(false);

  const { formData, setFormData, isFormValid, errors, validateForm } =
    useFormValidation<MachineryFormData>({
      schema: machinerySchema,
      initialData: { ...data },
    });

  useEffect(() => {
    if (!isEditing) {
      setLocationValue(current_location);
      setStateValue(data.state);
      setFormData({ ...data });
    }
  }, [isEditing, data]);

  useEffect(() => {
    validateForm();
    checkForChanges();
  }, [formData, locationValue, dateValue, stateValue]);

  const handleUploadComplete = () => {
    router.refresh();
    toast({
      title: 'Success',
      description: 'Image uploaded successfully.',
    });
  };

  const checkForChanges = () => {
    const dateWithoutTime = dateValue.toISOString().split('T')[0];
    const dateWithoutTimeCurrent = new Date(current_date).toISOString().split('T')[0];

    const hasChanges =
      JSON.stringify(formData) !== JSON.stringify(initialFormData) ||
      locationValue !== current_location ||
      dateWithoutTime !== dateWithoutTimeCurrent ||
      stateValue !== current_state;

    setHasChanges(hasChanges);
  };

  const handleEditClick = () => {
    if (isEditing) {
      setInitialFormData({ ...formData });
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'year') {
      // Only allow numeric input for year
      const numericValue = value.replace(/\D/g, '');
      setFormData((prev) => ({ ...prev, [name]: numericValue ? parseInt(numericValue, 10) : 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    validateForm();
  };

  const handleCancelClick = () => {
    setFormData(initialFormData);
    setIsEditing(false);
  };

  const handleSaveClick = async () => {
    if (isFormValid && hasChanges) {
      try {
        const updatedFormData: MachineryFormData = {
          ...formData,
          location_id: locations.find((location) => location.name === locationValue)!.location_id,
          state: stateValue,
          acquisition_date: dateValue,
        };

        const response = await fetch('/api/updateMachinery', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedFormData),
        });
        if (response.ok) {
          toast({
            title: 'Success',
            description: 'Machinery updated successfully.',
          });
          router.refresh();
          setIsEditing(false);
        } else {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update machinery.');
        }
      } catch (error) {
        console.error('Error updating machinery:', error);
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

  const inputProps = {
    readOnly: data.state === 'Sold',
    disabled: data.state === 'Sold',
    className:
      data.state === 'Sold'
        ? 'border border-border bg-muted text-muted-foreground'
        : 'border border-border bg-background text-foreground',
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <p className="w-8 cursor-pointer text-small font-semibold">{title}</p>
      </DialogTrigger>
      <DialogContent className="h-auto max-h-[90vh] overflow-auto border border-border bg-background text-foreground lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-large">{title}</DialogTitle>
          <DialogDescription>Anyone who has this link will be able to view this.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {data.images && data.images.length > 0 && (
            <div className="flex justify-center">
              <Carousel className="w-full max-w-xs">
                <CarouselContent>
                  {data.images.map((image: Image, index: number) => (
                    <CarouselItem key={index} className="p-0">
                      <div className="flex h-full w-full flex-col items-center justify-center">
                        <img
                          src={image.image_url}
                          className="h-full w-full object-scale-down"
                          alt="Machinery Images"
                        />
                        <DeleteImageDialog
                          imageInfo={{
                            image_id: image.image_id,
                            image_key: image.image_key,
                            type: 'Machinery',
                          }}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          )}

          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>Machine ID</Label>
              <Input
                name="machine_id"
                value={formData.machine_id}
                readOnly
                disabled
                className="border border-border bg-muted text-muted-foreground"
              />
            </div>
            <div className="flex-1">
              <Label>Brand</Label>
              <Input
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                readOnly={!isEditing && inputProps.readOnly}
                disabled={!isEditing}
                className={inputProps.className}
              />
              {errors.find((e) => e.path[0] === 'brand') && (
                <p className="text-sm text-red-500">
                  {errors.find((e) => e.path[0] === 'brand')?.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>Model</Label>
              <Input
                name="model"
                value={formData.model}
                onChange={handleChange}
                readOnly={!isEditing && inputProps.readOnly}
                disabled={!isEditing}
                className={inputProps.className}
              />
              {errors.find((e) => e.path[0] === 'model') && (
                <p className="text-sm text-red-500">
                  {errors.find((e) => e.path[0] === 'model')?.message}
                </p>
              )}
            </div>
            <div className="flex-1">
              <Label>Year</Label>
              <Input
                name="year"
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                value={formData.year}
                onChange={handleChange}
                readOnly={!isEditing && inputProps.readOnly}
                disabled={!isEditing}
                className={inputProps.className}
              />

              {errors.find((e) => e.path[0] === 'year') && (
                <p className="text-sm text-red-500">
                  {errors.find((e) => e.path[0] === 'year')?.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>Serial Number</Label>
              <Input
                name="serial_number"
                value={formData.serial_number}
                onChange={handleChange}
                readOnly={!isEditing && inputProps.readOnly}
                disabled={!isEditing}
                className={inputProps.className}
              />
              {errors.find((e) => e.path[0] === 'serial_number') && (
                <p className="text-sm text-red-500">
                  {errors.find((e) => e.path[0] === 'serial_number')?.message}
                </p>
              )}
            </div>
            <div className="flex-1">
              <Label>Acquisition Date</Label>
              <Popover>
                <PopoverTrigger asChild disabled={!isEditing}>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-[240px] justify-start text-left font-normal',
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
                    onSelect={(date) => {
                      if (date) {
                        setDateValue(date);
                        setFormData((prev) => ({
                          ...prev,
                          acquisition_date: date,
                        }));
                      }
                    }}
                    initialFocus
                    className="border border-border bg-background text-foreground"
                  />
                </PopoverContent>
              </Popover>
              {errors.find((e) => e.path[0] === 'acquisition_date') && (
                <p className="text-sm text-red-500">
                  {errors.find((e) => e.path[0] === 'acquisition_date')?.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>Observations</Label>
              <Input
                name="observations"
                value={formData.observations ?? 'N/A'}
                onChange={handleChange}
                readOnly={!isEditing}
                disabled={!isEditing}
                className={inputProps.className}
              />
              {errors.find((e) => e.path[0] === 'observations') && (
                <p className="text-sm text-red-500">
                  {errors.find((e) => e.path[0] === 'observations')?.message}
                </p>
              )}
            </div>
            <div className="flex-1">
              <Label>Created At</Label>
              <Input
                name="created_at"
                value={formData.created_at.toLocaleDateString()}
                readOnly
                disabled
                className={inputProps.className}
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>State</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={!isEditing}>
                  <Button
                    className="w-full border border-border bg-background text-foreground"
                    variant="outline"
                  >
                    {stateValue}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="border border-border bg-background text-foreground">
                  <DropdownMenuLabel>State</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={stateValue}
                    onValueChange={(value) => setStateValue(value as States)}
                  >
                    <DropdownMenuRadioItem
                      value="Available"
                      className="hover:bg-muted-background hover:text-foreground"
                    >
                      Available
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="Sold"
                      className="hover:bg-muted-background hover:text-foreground"
                    >
                      Sold
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="Under Maintenance"
                      className="hover:bg-muted-background hover:text-foreground"
                    >
                      Under Maintenance
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex-1">
              <Label>Location</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={!isEditing}>
                  <Button
                    className="w-full border border-border bg-background text-foreground"
                    variant="outline"
                  >
                    {locationValue}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="border border-border bg-background text-foreground">
                  <DropdownMenuLabel>Locations</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={locationValue} onValueChange={setLocationValue}>
                    {locations.map((location) => (
                      <DropdownMenuRadioItem
                        key={location.name}
                        value={location.name}
                        className="hover:bg-muted-background hover:text-foreground"
                      >
                        {location.name}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {data.state === 'Sold' && data.sold_price !== null && data.sold_to !== null && (
            <>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label>Sold Price</Label>
                  <Input
                    value={data.sold_price}
                    readOnly={!isEditing}
                    disabled={!isEditing}
                    className={inputProps.className}
                  />
                </div>

                <div className="flex-1">
                  <Label>Sold To</Label>
                  <Input
                    value={data.sold_to}
                    readOnly={!isEditing}
                    disabled={!isEditing}
                    className={inputProps.className}
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label>Sold Date</Label>
                  <Input
                    value={data.sold_date ? data.sold_date.toLocaleDateString() : 'N/A'}
                    readOnly={!isEditing && inputProps.readOnly}
                    disabled={!isEditing}
                    className={inputProps.className}
                  />
                </div>
              </div>
            </>
          )}
          {data.state !== 'Sold' && (
            <div className="flex-1">
              <Label>Upload Images</Label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  disabled
                  className="border border-border bg-muted text-muted-foreground"
                ></Input>
                <UploadButton
                  disabled={!isEditing}
                  input={{ machine_id: data.machine_id }}
                  endpoint="machineryImageUploader"
                  onClientUploadComplete={handleUploadComplete}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-start">
          {!isEditing && (
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          )}
          {data.state !== 'Sold' && (
            <Button onClick={isEditing ? handleCancelClick : handleEditClick}>
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          )}
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
          {data.state !== 'Sold' && (
            <SellDataViewDialog
              data={{
                machine_id: data.machine_id,
                brand: data.brand,
                model: data.model,
                year: data.year,
                serial_number: data.serial_number,
                sold_price: data.sold_price ?? 0,
                sold_to: data.sold_to ?? 'N/A',
                sold_date: data.sold_date ?? new Date(),
              }}
            />
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
