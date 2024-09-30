/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from 'react';
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
import { type ILocation } from '~/server/types/ILocation';
import { type ToolCondition, type Tool } from '~/server/types/ITool';
import { UploadButton } from '../utils/uploadthing';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { cn } from '~/lib/utils';
import { Calendar } from '~/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { type Image } from '~/server/types/IImages';
import DeleteImageDialog from './deleteImageDialog';
import { useRouter } from 'next/navigation';
import { useToast } from '~/components/hooks/use-toast';
import { useFormValidation } from '~/hooks/useFormValidation';
import { toolSchema } from '~/server/types/ITool';
import type { z } from 'zod';

type ToolFormData = z.infer<typeof toolSchema>;

export function ToolDataViewDialog(props: { title: string; data: Tool; locations: ILocation[] }) {
  const { title, data, locations } = props;

  const router = useRouter();
  const { toast } = useToast();

  const current_location: string = locations.find(
    (location) => data.location_name === location.name
  )!.name;
  const current_condition = data.condition;

  const [conditionValue, setConditionValue] = useState<ToolCondition>(data.condition);
  const [dateValue, setDateValue] = useState<Date>(new Date(data.acquisition_date));
  const [locationValue, setLocationValue] = useState<string>(current_location);
  const [isEditing, setIsEditing] = useState(false);
  const [initialFormData, setInitialFormData] = useState({ ...data });
  const [hasChanges, setHasChanges] = useState(false);

  const { formData, setFormData, isFormValid, errors, validateForm } =
    useFormValidation<ToolFormData>({
      schema: toolSchema,
      initialData: { ...data },
    });

  useEffect(() => {
    if (!isEditing) {
      setLocationValue(current_location);
      setConditionValue(data.condition);
      setFormData({ ...data });
      setDateValue(new Date(data.acquisition_date));
    }
  }, [isEditing, data]);

  useEffect(() => {
    checkForChanges();
  }, [formData, locationValue, conditionValue, dateValue]);

  const handleUploadComplete = () => {
    toast({
      title: 'Success',
      description: 'Image uploaded successfully.',
    });
    router.refresh();
  };

  const checkForChanges = () => {
    const hasFormChanged = JSON.stringify(formData) !== JSON.stringify(initialFormData);
    const hasLocationChanged = locationValue !== current_location;
    const hasConditionChanged = conditionValue !== current_condition;
    const hasDateChanged =
      dateValue.toISOString().split('T')[0] !==
      new Date(data.acquisition_date).toISOString().split('T')[0];

    setHasChanges(hasFormChanged ?? hasLocationChanged ?? hasConditionChanged ?? hasDateChanged);
  };

  const handleEditClick = () => {
    if (isEditing) {
      setInitialFormData({ ...formData });
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let parsedValue: string | number = value;

    // Convert to number for specific fields
    if (name === 'quantity') {
      parsedValue = value === '' ? 0 : Number(value);
      if (isNaN(parsedValue)) {
        parsedValue = 0;
      }
    }

    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
    validateForm();
  };

  const handleCancelClick = () => {
    setFormData(initialFormData);
    setIsEditing(false);
  };

  const handleSaveClick = async () => {
    if (isFormValid && hasChanges) {
      try {
        const updatedFormData: ToolFormData = {
          ...formData,
          location_id: locations.find((location) => location.name === locationValue)!.location_id,
          condition: conditionValue,
          acquisition_date: dateValue,
        };

        const response = await fetch('/api/updateTool', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedFormData),
        });

        if (response.ok) {
          toast({
            title: 'Success',
            description: 'Tool updated successfully.',
          });
          router.refresh();
          setIsEditing(false);
        } else {
          const responseData = await response.json();
          throw new Error(responseData.error ?? 'Failed to update tool.');
        }
      } catch (error) {
        console.error('Error updating tool:', error);
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
                          alt="Tool Images"
                        />
                        <DeleteImageDialog
                          imageInfo={{
                            image_id: image.image_id,
                            image_key: image.image_key,
                            type: 'Tool',
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

          {/* Tool ID and Brand */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>Tool ID</Label>
              <Input
                name="tool_id"
                value={formData.tool_id}
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
                readOnly={!isEditing}
                onChange={handleChange}
                disabled={!isEditing}
                className="border border-border bg-background text-foreground"
              />
              {errors.find((e) => e.path[0] === 'brand') && (
                <p className="text-sm text-red-500">
                  {errors.find((e) => e.path[0] === 'brand')?.message}
                </p>
              )}
            </div>
          </div>

          {/* Name and Category */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>Name</Label>
              <Input
                name="name"
                value={formData.name}
                readOnly={!isEditing}
                onChange={handleChange}
                disabled={!isEditing}
                className="border border-border bg-background text-foreground"
              />
              {errors.find((e) => e.path[0] === 'name') && (
                <p className="text-sm text-red-500">
                  {errors.find((e) => e.path[0] === 'name')?.message}
                </p>
              )}
            </div>
            <div className="flex-1">
              <Label>Category</Label>
              <Input
                name="category"
                value={formData.category}
                readOnly={!isEditing}
                onChange={handleChange}
                disabled={!isEditing}
                className="border border-border bg-background text-foreground"
              />
              {errors.find((e) => e.path[0] === 'category') && (
                <p className="text-sm text-red-500">
                  {errors.find((e) => e.path[0] === 'category')?.message}
                </p>
              )}
            </div>
          </div>

          {/* Tool Type and Quantity */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>Tool Type</Label>
              <Input
                name="tool_type"
                value={formData.tool_type}
                readOnly={!isEditing}
                onChange={handleChange}
                disabled={!isEditing}
                className="border border-border bg-background text-foreground"
              />
              {errors.find((e) => e.path[0] === 'tool_type') && (
                <p className="text-sm text-red-500">
                  {errors.find((e) => e.path[0] === 'tool_type')?.message}
                </p>
              )}
            </div>
            <div className="flex-1">
              <Label>Quantity</Label>
              <Input
                name="quantity"
                type="number"
                value={formData.quantity}
                readOnly={!isEditing}
                disabled={!isEditing}
                onChange={handleChange}
                className="border border-border bg-background text-foreground"
              />
              {errors.find((e) => e.path[0] === 'quantity') && (
                <p className="text-sm text-red-500">
                  {errors.find((e) => e.path[0] === 'quantity')?.message}
                </p>
              )}
            </div>
          </div>

          {/* Acquisition Date */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>Acquisition Date</Label>
              <Popover>
                <PopoverTrigger asChild disabled={!isEditing}>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start border border-border bg-background text-left font-normal text-foreground',
                      !dateValue && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateValue ? format(dateValue, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto border border-border bg-background p-0 text-foreground">
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

          {/* Observations */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>Observations</Label>
              <Input
                name="observations"
                value={formData.observations ?? ''}
                readOnly={!isEditing}
                disabled={!isEditing}
                onChange={handleChange}
                className="border border-border bg-background text-foreground"
              />
              {errors.find((e) => e.path[0] === 'observations') && (
                <p className="text-sm text-red-500">
                  {errors.find((e) => e.path[0] === 'observations')?.message}
                </p>
              )}
            </div>
          </div>

          {/* Location and Condition */}
          <div className="flex space-x-4">
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
                <DropdownMenuContent className="w-full border border-border bg-background text-foreground">
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
            <div className="flex-1">
              <Label>Condition</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={!isEditing}>
                  <Button
                    className="w-full border border-border bg-background text-foreground"
                    variant="outline"
                  >
                    {conditionValue}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full border border-border bg-background text-foreground">
                  <DropdownMenuLabel>Condition</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={conditionValue}
                    onValueChange={(value) => setConditionValue(value as ToolCondition)}
                  >
                    <DropdownMenuRadioItem
                      value="Good"
                      className="hover:bg-muted-background hover:text-foreground"
                    >
                      Good
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="Bad"
                      className="hover:bg-muted-background hover:text-foreground"
                    >
                      Bad
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="Excellent"
                      className="hover:bg-muted-background hover:text-foreground"
                    >
                      Excellent
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="Poor"
                      className="hover:bg-muted-background hover:text-foreground"
                    >
                      Poor
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Upload Images */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>Upload Images</Label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  disabled
                  className="border border-border bg-muted text-muted-foreground"
                />
                <UploadButton
                  disabled={!isEditing}
                  input={{ tool_id: data.tool_id }}
                  endpoint="toolImageUploader"
                  onClientUploadComplete={handleUploadComplete}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Display general error message if there are validation errors */}
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
          <Button onClick={isEditing ? handleCancelClick : handleEditClick}>
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
          {isEditing && (
            <DialogClose asChild>
              <Button
                onClick={handleSaveClick}
                className="bg-primary text-primary-foreground"
                disabled={!isFormValid ?? !hasChanges}
              >
                Save
              </Button>
            </DialogClose>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
