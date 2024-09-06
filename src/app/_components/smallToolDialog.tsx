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
import { type ToolCondition, type Tool } from "~/server/types/ITool";
import { type ILocation } from "~/server/types/ILocation";
import { UploadButton } from "../utils/uploadthing";
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

export function SmallToolDialog(props: {
  data: Tool;
  index: number;
  locations: ILocation[];
}) {
  const { index, data, locations } = props;
  const current_date = data.acquisition_date;
  const router = useRouter();
  const current_location: string = locations.find(
    (location) => data.location_name === location.name,
  )!.name;
  const curret_condition = data.condition;
  const [conditionValue, setConditionValue] = useState<ToolCondition>(
    data.condition as ToolCondition,
  );
  const [dateValue, setDateValue] = useState<Date>(
    new Date(data.acquisition_date),
  );

  const [locationValue, setLocationValue] = useState<string>(current_location);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...data });
  const [initialFormData, setInitialFormData] = useState({ ...data });
  const [isFormValid, setIsFormValid] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setLocationValue(current_location);
      setFormData({ ...data });
      setConditionValue(data.condition as ToolCondition);
      setDateValue(data.acquisition_date);
    }
  }, [isEditing, data]);

  useEffect(() => {
    validateForm();
    checkForChanges();
  }, [formData, locationValue, conditionValue, dateValue]);

  const handleUploadComplete = () => {
    router.refresh();
  };

  const validateForm = () => {
    const isDataValid =
      formData.tool_id !== null && formData.tool_id !== undefined;
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
      conditionValue !== curret_condition ||
      dateWithoutTime !== dateWithoutTimeCurrent;

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
        const response = await fetch("/api/updateTool", {
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
        <div className="flex flex-col border-b border-border px-5 py-4 text-foreground">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-base font-semibold">ID</p>
            <div className="flex items-center gap-2">{index}</div>
          </div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Name</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground">{data.name}</span>
            </div>
          </div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Condition
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground">{data.condition}</span>
            </div>
          </div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Quantity
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground">{data.quantity}</span>
            </div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="h-auto max-h-[90vh] max-w-[95vw] overflow-auto rounded-lg border border-border bg-background lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-large text-primary">
            Edit Tool
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Anyone who has this link will be able to view this.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {formData.images && formData.images.length > 0 && (
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
                  {formData.images.map((image: Image, index: number) => (
                    <CarouselItem key={index} className="p-0">
                      <div className=" flex h-full w-full flex-col items-center justify-center">
                        <img
                          src={image.image_url}
                          className="h-full w-full object-scale-down "
                          alt="Tool Images"
                        />
                        <DeleteImageDialog
                          imageInfo={{
                            image_id: image.image_id,
                            image_key: image.image_key,
                            type: "Tool",
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
              <Label>Tool ID</Label>
              <Input
                name="tool_id"
                value={data.tool_id}
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
                disabled={!isEditing}
                onChange={handleChange}
                className="border border-border bg-background text-foreground"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>Name</Label>
              <Input
                name="Name"
                value={formData.name}
                readOnly={!isEditing}
                disabled={!isEditing}
                onChange={handleChange}
                className="border border-border bg-background text-foreground"
              />
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
            </div>
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
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>Quantity</Label>
              <Input
                name="quantity"
                value={formData.quantity}
                readOnly={!isEditing}
                onChange={handleChange}
                disabled={!isEditing}
                className="border border-border bg-background text-foreground"
              />
            </div>
            <div className="flex-1">
              <Label>Acquisition Date</Label>
              <Popover>
                <PopoverTrigger asChild disabled={!isEditing}>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start border border-border bg-background text-left font-normal text-foreground",
                      !dateValue && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-foreground" />
                    {dateValue ? (
                      format(dateValue, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto border border-border bg-background p-0 text-foreground"
                  align="start"
                >
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
                onChange={handleChange}
                disabled={!isEditing}
                className="border border-border bg-background text-foreground"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>Location</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={!isEditing}>
                  <Button className="w-full border border-border bg-background text-foreground">
                    {locationValue}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="border border-border bg-background text-foreground">
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
            <div className="flex-1">
              <Label>Condition</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={!isEditing}>
                  <Button className="w-full border border-border bg-background text-foreground">
                    {conditionValue}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="border border-border bg-background text-foreground">
                  <DropdownMenuLabel>Condition</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={conditionValue}
                    onValueChange={(value) =>
                      setConditionValue(value as ToolCondition)
                    }
                  >
                    <DropdownMenuRadioItem value="Good">
                      Good
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="Bad">
                      Bad
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="Excellent">
                      Excellent
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="Poor">
                      Poor
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
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
                input={{ tool_id: data.tool_id }}
                endpoint="toolImageUploader"
                onClientUploadComplete={() => {
                  handleUploadComplete();
                }}
              />
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          {!isEditing && (
            <DialogClose asChild>
              <Button
                type="button"
                variant="secondary"
                className="bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                Close
              </Button>
            </DialogClose>
          )}
          <Button
            onClick={isEditing ? handleCancelClick : handleEditClick}
            className="bg-primary text-primary-foreground"
          >
            {isEditing ? "Cancel" : "Edit"}
          </Button>
          {isEditing && (
            <>
              <DialogClose asChild>
                <Button
                  onClick={handleSaveClick}
                  disabled={!isFormValid || !hasChanges}
                  className="hover:bg-accent-dark bg-accent text-accent-foreground"
                >
                  Save
                </Button>
              </DialogClose>

              <DialogClose asChild>
                <Button
                  onClick={handleSaveAndCloseClick}
                  disabled={!isFormValid || !hasChanges}
                  className="bg-destructive text-destructive-foreground hover:bg-opacity-90"
                >
                  Save & Close
                </Button>
              </DialogClose>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
