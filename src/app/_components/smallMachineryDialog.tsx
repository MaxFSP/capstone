/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from "react";

import { Button } from "~/components/ui/button";
import Autoplay from "embla-carousel-autoplay";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "~/components/ui/carousel";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { type Machinery } from "~/server/types/IMachinery";
import { type ILocation } from "~/server/types/ILocation";
import { UploadButton } from "../utils/uploadthing";
import { SellDataViewDialog } from "./sellMachineDialog";
import { type States } from "~/server/types/IMachinery";

import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { cn } from "~/lib/utils";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { type Image } from "~/server/types/IImages";
import DeleteImageDialog from "./deleteImageDialog";
import { useRouter } from "next/navigation";

export function SmallMachineryDialog(props: {
  data: Machinery;
  index: number;
  locations: ILocation[];
}) {
  const { index, data, locations } = props;
  const router = useRouter();

  const current_location: string = locations.find(
    (location) => data.location_name === location.name,
  )!.name;

  const current_date = data.acquisition_date;
  const current_state = data.state;

  const [locationValue, setLocationValue] = useState<string>(current_location);
  const [stateValue, setStateValue] = useState<States>(data.state as States);
  const [dateValue, setDateValue] = useState<Date>(
    new Date(data.acquisition_date),
  );

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...data });
  const [initialFormData, setInitialFormData] = useState({ ...data });
  const [isFormValid, setIsFormValid] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setFormData({ ...data });
      setLocationValue(current_location);
    }
  }, [isEditing, data]);

  useEffect(() => {
    validateForm();
    checkForChanges();
  }, [formData, locationValue, dateValue]);

  const handleUploadComplete = () => {
    router.refresh();
  };

  const validateForm = () => {
    const isDataValid =
      formData.machine_id !== null && formData.machine_id !== undefined;
    setIsFormValid(isDataValid);
  };

  const checkForChanges = () => {
    const dateWithoutTime = dateValue.toISOString().split("T")[0];
    const dateWithoutTimeCurrent = new Date(current_date)
      .toISOString()
      .split("T")[0];

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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancelClick = () => {
    setFormData(initialFormData);
    setIsEditing(false);
  };

  const handleSaveClick = async () => {
    if (isFormValid && hasChanges) {
      try {
        formData.location_id = locations.find(
          (location) => location.name === locationValue,
        )!.location_id;
        formData.state = stateValue;
        const response = await fetch("/api/updateMachinery", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        if (response.ok) {
          // console.log("Tool updated successfully:", result);
        } else {
          // console.error("Failed to update tool:", result.error);
        }
      } catch (error) {
        console.error("Error updating tool:", error);
      }
    }
  };

  const handleSaveAndCloseClick = async () => {
    await handleSaveClick();
    setIsEditing(false);
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex flex-col border-b border-gray-700 px-5 py-4 text-white">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-base font-semibold">ID</p>
            <div className="flex items-center gap-2">{index}</div>
          </div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-400">Brand</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-200">{data.brand}</span>
            </div>
          </div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-400">Model</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-200">{data.model}</span>
            </div>
          </div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-400">Serial Number</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-200">
                {data.serial_number}
              </span>
            </div>
          </div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-400">State</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-200">{data.state}</span>
            </div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="h-auto max-h-[90vh] max-w-[95vw] overflow-auto lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-large">Test</DialogTitle>
          <DialogDescription>
            Anyone who has this link will be able to view this.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {data.images && data.images.length > 0 && (
            <div className="flex justify-center">
              <Carousel
                className="w-full max-w-xs"
                plugins={[
                  Autoplay({
                    delay: 5000,
                  }),
                ]}
              >
                <CarouselContent>
                  {data.images.map((image: Image, index: number) => (
                    <CarouselItem key={index} className="p-0">
                      <div className=" flex h-full w-full flex-col items-center justify-center">
                        <img
                          src={image.image_url}
                          className="h-full w-full object-scale-down "
                          alt="Machinery Images"
                        />
                        <DeleteImageDialog
                          imageInfo={{
                            image_id: image.image_id,
                            image_key: image.image_key,
                            type: "Machinery",
                          }}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
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
                className="bg-zinc-700"
              />
            </div>
            <div className="flex-1">
              <Label>Brand</Label>
              <Input
                name="brand"
                value={formData.brand}
                readOnly={!isEditing}
                disabled={!isEditing}
                onChange={handleChange}
                className="border border-gray-300"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>Model</Label>
              <Input
                name="model"
                value={formData.model}
                readOnly={!isEditing}
                disabled={!isEditing}
                onChange={handleChange}
                className="border border-gray-300"
              />
            </div>
            <div className="flex-1">
              <Label>Year</Label>
              <Input
                name="year"
                value={formData.year}
                disabled={!isEditing}
                readOnly={!isEditing}
                onChange={handleChange}
                className="border border-gray-300"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>Serial Number</Label>
              <Input
                name="serial_number"
                value={formData.serial_number}
                disabled={!isEditing}
                readOnly={!isEditing}
                onChange={handleChange}
                className="border border-gray-300"
              />
            </div>
            <div className="flex-1">
              <Label>Acquisition Date</Label>
              <Popover>
                <PopoverTrigger asChild disabled={!isEditing}>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !dateValue && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateValue ? (
                      format(dateValue, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
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
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>Observations</Label>
              <Input
                name="observations"
                value={formData.observations ?? "N/A"}
                readOnly={!isEditing}
                disabled={!isEditing}
                onChange={handleChange}
                className="border border-gray-300"
              />
            </div>
            <div className="flex-1">
              <Label>Created At</Label>
              <Input
                name="created_at"
                value={formData.created_at.toLocaleDateString()}
                disabled
                readOnly={!isEditing}
                onChange={handleChange}
                className="border border-gray-300"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>State</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={!isEditing}>
                  <Button className="w-full" variant="outline">
                    {stateValue}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuLabel>State</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={stateValue}
                    onValueChange={(value) => setStateValue(value as States)}
                  >
                    <DropdownMenuRadioItem value="Available">
                      Available
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="Sold">
                      Sold
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="Under Maintenance">
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
                  <Button className="w-full" variant="outline">
                    {locationValue}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Locations</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={locationValue}
                    onValueChange={setLocationValue}
                  >
                    {locations.map((location) => (
                      <DropdownMenuRadioItem
                        key={location.name}
                        value={location.name}
                      >
                        {location.name}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {data.sold_price !== null && (
            <>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label>Sold Price</Label>
                  <Input
                    value={data.sold_price}
                    readOnly
                    disabled={!isEditing}
                    className="border border-gray-300"
                  />
                </div>
                <div className="flex-1">
                  <Label>Sold Date</Label>
                  <Input
                    value={
                      data.sold_date
                        ? data.sold_date.toLocaleDateString()
                        : "N/A"
                    }
                    readOnly
                    disabled={!isEditing}
                    className="border border-gray-300"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label>Sold To</Label>
                  <Input
                    value={data.sold_to ?? "N/A"}
                    readOnly
                    disabled={!isEditing}
                    className="border border-gray-300"
                  />
                </div>
              </div>
            </>
          )}
          {data.state !== "Sold" && (
            <div className="flex-1">
              <Label>Upload Images</Label>
              <div className="flex items-center gap-2">
                <Input readOnly disabled></Input>
                <UploadButton
                  disabled={!isEditing}
                  input={{ machine_id: data.machine_id }}
                  endpoint="machineryImageUploader"
                  onClientUploadComplete={() => {
                    handleUploadComplete();
                  }}
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
          {data.state !== "Sold" && (
            <Button onClick={isEditing ? handleCancelClick : handleEditClick}>
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          )}
          {isEditing && (
            <>
              <DialogClose asChild>
                <Button
                  onClick={handleSaveClick}
                  disabled={!isFormValid || !hasChanges}
                >
                  Save
                </Button>
              </DialogClose>

              <DialogClose asChild>
                <Button
                  onClick={handleSaveAndCloseClick}
                  disabled={!isFormValid || !hasChanges}
                >
                  Save & Close
                </Button>
              </DialogClose>
            </>
          )}
          {data.state !== "Sold" && (
            <SellDataViewDialog
              data={{
                machine_id: data.machine_id,
                brand: data.brand,
                model: data.model,
                year: data.year,
                serial_number: data.serial_number,
                sold_price: data.sold_price ?? 0,
                sold_to: data.sold_to ?? "N/A",
                sold_date: data.sold_date ?? new Date(),
              }}
            />
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
