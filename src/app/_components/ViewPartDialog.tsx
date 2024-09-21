/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect } from 'react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { UploadButton } from '../utils/uploadthing';
import DeleteImageDialog from './deleteImageDialog';
import { useRouter } from 'next/navigation';
import { useFormValidation } from '~/hooks/useFormValidation';
import { partSchema } from '~/server/types/IPart';
import type { ILocation } from '~/server/types/ILocation';
import type { Image } from '~/server/types/IImages';
import type { PartCondition, Part, partUnitEnum } from '~/server/types/IPart';
import type { z } from 'zod';
import { useToast } from '~/components/hooks/use-toast';
import { deleteEntity } from '~/lib/api-utils';

type PartFormData = z.infer<typeof partSchema>;

export function PartDataViewDialog(props: { title: string; data: Part; locations: ILocation[] }) {
  const { title, data, locations } = props;
  const router = useRouter();
  const { toast } = useToast();

  const current_location: string = locations.find(
    (location) => data.location_name === location.name
  )!.name;

  const current_condition = data.condition;

  const [conditionValue, setConditionValue] = useState<PartCondition>(data.condition);
  const [locationValue, setLocationValue] = useState<string>(current_location);
  const [length, setLength] = useState(data.length_unit);
  const [width, setWidth] = useState(data.width_unit);
  const [height, setHeight] = useState(data.height_unit);

  const [isEditing, setIsEditing] = useState(false);
  const [initialFormData, setInitialFormData] = useState({ ...data });
  const [hasChanges, setHasChanges] = useState(false);

  const { formData, setFormData, isFormValid, errors, validateForm } =
    useFormValidation<PartFormData>({
      schema: partSchema,
      initialData: { ...data },
    });

  useEffect(() => {
    if (!isEditing) {
      setLocationValue(current_location);
      setConditionValue(data.condition);
      setFormData({ ...data });
    }
  }, [isEditing, data]);

  useEffect(() => {
    checkForChanges();
  }, [formData, locationValue, conditionValue, length, width, height]);

  const handleUploadComplete = () => {
    toast({
      title: 'Success',
      description: 'Image uploaded successfully.',
    });
    router.refresh();
  };

  const checkForChanges = () => {
    const hasChanges =
      JSON.stringify(formData) !== JSON.stringify(initialFormData) ||
      locationValue !== current_location ||
      conditionValue !== current_condition ||
      length !== data.length_unit ||
      width !== data.width_unit ||
      height !== data.height_unit;
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
    let parsedValue: string | number = value;

    // Convert to number for specific fields
    if (['quantity', 'length', 'width', 'height'].includes(name)) {
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
        const updatedFormData: PartFormData = {
          ...formData,
          location_id: locations.find((location) => location.name === locationValue)!.location_id,
          condition: conditionValue,
          length_unit: length,
          width_unit: width,
          height_unit: height,
        };

        const response = await fetch('/api/updatePart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedFormData),
        });

        if (response.ok) {
          toast({
            title: 'Success',
            description: 'Part updated successfully.',
          });
          router.refresh();
          setIsEditing(false);
        } else {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update part.');
        }
      } catch (error) {
        console.error('Error updating part:', error);
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
        endpoint: '/api/deletePart',
        entityId: data.part_id,
        entityName: 'employee',
        onSuccess: () => router.refresh(),
      });
    } catch (error) {}
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
                          alt="Part Images"
                        />
                        <DeleteImageDialog
                          imageInfo={{
                            image_id: image.image_id,
                            image_key: image.image_key,
                            type: 'Part',
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
              <Label>Part ID</Label>
              <Input
                name="part_id"
                value={formData.part_id}
                readOnly
                disabled
                className="border border-border bg-muted text-muted-foreground"
              />
            </div>
            <div className="flex-1">
              <Label>Part Number</Label>
              <Input
                name="part_number"
                value={formData.part_number}
                readOnly={!isEditing}
                disabled={!isEditing}
                onChange={handleChange}
                className="border border-border bg-background text-foreground"
              />
              {errors.find((e) => e.path[0] === name) && (
                <p className="text-sm text-red-500">
                  {errors.find((e) => e.path[0] === name)?.message}
                </p>
              )}
            </div>
          </div>

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
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>Quantity</Label>
              <Input
                name="quantity"
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
            <div className="flex-1">
              <Label>Creation Date</Label>
              <Input
                name="created_at"
                value={formData.created_at.toLocaleDateString()}
                readOnly
                disabled
                className="border border-border bg-muted text-muted-foreground"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-center">
              <Label>Dimensions</Label>
              <Label>(L x W x H)</Label>
            </div>

            <div className="m-4 flex">
              <Input
                name="length"
                value={formData.length}
                readOnly={!isEditing}
                onChange={handleChange}
                disabled={!isEditing}
                className="m-2 w-1/6 border border-border bg-background text-foreground"
              />
              {errors.find((e) => e.path[0] === 'length') && (
                <p className="text-sm text-red-500">
                  {errors.find((e) => e.path[0] === 'length')?.message}
                </p>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={!isEditing}>
                  <Button
                    className="m-2 w-1/6 border border-border bg-background text-foreground"
                    variant="outline"
                  >
                    {length}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="border border-border bg-background text-foreground">
                  <DropdownMenuLabel>Unit</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={formData.length_unit}
                    onValueChange={(e) => {
                      setLength(e as typeof partUnitEnum._type);
                      setFormData((prev) => ({
                        ...prev,
                        length_unit: e as typeof partUnitEnum._type,
                      }));
                    }}
                  >
                    <DropdownMenuRadioItem
                      value="cm"
                      className="hover:bg-muted-background hover:text-foreground"
                    >
                      cm
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="mm"
                      className="hover:bg-muted-background hover:text-foreground"
                    >
                      mm
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <Input
                name="width"
                value={formData.width}
                readOnly={!isEditing}
                onChange={handleChange}
                disabled={!isEditing}
                className="m-2 w-1/6 border border-border bg-background text-foreground"
              />
              {errors.find((e) => e.path[0] === 'width') && (
                <p className="text-sm text-red-500">
                  {errors.find((e) => e.path[0] === 'width')?.message}
                </p>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={!isEditing}>
                  <Button
                    className="m-2 w-1/6 border border-border bg-background text-foreground"
                    variant="outline"
                  >
                    {width}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="border border-border bg-background text-foreground">
                  <DropdownMenuLabel>Unit</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={formData.width_unit}
                    onValueChange={(e) => {
                      setWidth(e as typeof partUnitEnum._type);
                      setFormData((prev) => ({
                        ...prev,
                        width_unit: e as typeof partUnitEnum._type,
                      }));
                    }}
                  >
                    <DropdownMenuRadioItem
                      value="cm"
                      className="hover:bg-muted-background hover:text-foreground"
                    >
                      cm
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="mm"
                      className="hover:bg-muted-background hover:text-foreground"
                    >
                      mm
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <Input
                name="height"
                value={formData.height}
                readOnly={!isEditing}
                onChange={handleChange}
                disabled={!isEditing}
                className="m-2 w-1/6 border border-border bg-background text-foreground"
              />
              {errors.find((e) => e.path[0] === 'height') && (
                <p className="text-sm text-red-500">
                  {errors.find((e) => e.path[0] === 'height')?.message}
                </p>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={!isEditing}>
                  <Button
                    className="m-2 w-1/6 border border-border bg-background text-foreground"
                    variant="outline"
                  >
                    {height}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="border border-border bg-background text-foreground">
                  <DropdownMenuLabel>Unit</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={formData.height_unit}
                    onValueChange={(e) => {
                      setHeight(e as typeof partUnitEnum._type);
                      setFormData((prev) => ({
                        ...prev,
                        height_unit: e as typeof partUnitEnum._type,
                      }));
                    }}
                  >
                    <DropdownMenuRadioItem
                      value="cm"
                      className="hover:bg-muted-background hover:text-foreground"
                    >
                      cm
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="mm"
                      className="hover:bg-muted-background hover:text-foreground"
                    >
                      mm
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

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
                <DropdownMenuContent className="border border-border bg-background text-foreground">
                  <DropdownMenuLabel>Condition</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={conditionValue}
                    onValueChange={(value) => setConditionValue(value as PartCondition)}
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
          <div className="flex space-x-4">
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
                  input={{ part_id: data.part_id }}
                  endpoint="partImageUploader"
                  onClientUploadComplete={handleUploadComplete}
                />
              </div>
            </div>
          </div>
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
          <Button onClick={isEditing ? handleCancelClick : handleEditClick}>
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
          {isEditing && (
            <>
              <DialogClose asChild>
                <Button onClick={handleSaveClick} className="bg-primary text-primary-foreground">
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
}
