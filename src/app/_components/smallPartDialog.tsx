/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import Autoplay from "embla-carousel-autoplay";

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
import { type PartCondition, type Part } from "~/server/types/IPart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { type ILocation } from "~/server/types/ILocation";
import { UploadButton } from "../utils/uploadthing";
import { type Image } from "~/server/types/IImages";
import DeleteImageDialog from "./deleteImageDialog";
import { useRouter } from "next/navigation";

export function SmallPartDialog(props: {
  data: Part;
  index: number;
  locations: ILocation[];
}) {
  const { index, data, locations } = props;
  const current_location: string = locations.find(
    (location) => data.location_name === location.name,
  )!.name;
  const router = useRouter();
  const curret_condition = data.condition;

  const [locationValue, setLocationValue] = useState<string>(current_location);
  const [conditionValue, setConditionValue] = useState<PartCondition>(
    data.condition as PartCondition,
  );

  const [length, setLength] = useState(data.length_unit);
  const [width, setWidth] = useState(data.width_unit);
  const [height, setHeight] = useState(data.height_unit);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...data });
  const [initialFormData, setInitialFormData] = useState({ ...data });
  const [isFormValid, setIsFormValid] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setLocationValue(current_location);
      setConditionValue(data.condition as PartCondition);
      setFormData({ ...data });
    }
  }, [isEditing, data]);

  useEffect(() => {
    validateForm();
    checkForChanges();
  }, [formData, locationValue, conditionValue]);

  const handleUploadComplete = () => {
    router.refresh();
  };

  const validateForm = () => {
    const isDataValid =
      formData.part_id !== null && formData.part_id !== undefined;
    formData;
    setIsFormValid(isDataValid);
  };

  const checkForChanges = () => {
    const hasChanges =
      JSON.stringify(formData) !== JSON.stringify(initialFormData) ||
      locationValue !== current_location ||
      conditionValue !== curret_condition;
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
        formData.condition = conditionValue;
        const response = await fetch("/api/updatePart", {
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
            <p className="text-sm font-medium text-gray-400">Name</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-200">{data.name}</span>
            </div>
          </div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-400">Condition</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-200">{data.condition}</span>
            </div>
          </div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-400">Quantity</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-200">{data.quantity}</span>
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
                          alt="Part Images"
                        />
                        <DeleteImageDialog
                          imageInfo={{
                            image_id: image.image_id,
                            image_key: image.image_key,
                            type: "Part",
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
              <Label>Part ID</Label>
              <Input
                name="part_id"
                value={formData.part_id}
                readOnly
                disabled
                className="bg-zinc-700"
              />
            </div>
            <div className="flex-1">
              <Label>Part Number</Label>
              <Input
                name="part_number"
                value={formData.part_number}
                readOnly={!isEditing}
                onChange={handleChange}
                disabled={!isEditing}
                className="border border-gray-300"
              />
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>Name</Label>
              <Input
                name="name"
                value={formData.name}
                readOnly={!isEditing}
                disabled={!isEditing}
                onChange={handleChange}
                className="border border-gray-300"
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
                disabled={!isEditing}
                onChange={handleChange}
                className="border border-gray-300"
              />
            </div>
            <div className="flex-1">
              <Label>Acquisition Date</Label>
              <Input
                name="created_at"
                value={formData.created_at.toLocaleDateString()}
                readOnly
                disabled
                className="bg-zinc-700"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4 ">
            <div className="flex-1">
              <Label>Dimensions (L x W x H)</Label>
              <div className="flex flex-row">
                <div className="m-2 flex items-center gap-2">
                  <Input
                    name="length"
                    value={formData.length}
                    readOnly={!isEditing}
                    disabled={!isEditing}
                    onChange={handleChange}
                    className="  border border-gray-300"
                  />

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild disabled={!isEditing}>
                      <Button className="w-1/6" variant="outline">
                        {length}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Unit</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuRadioGroup
                        value={formData.length_unit}
                        onValueChange={(e) => {
                          setLength(e);
                          setFormData((prev) => ({ ...prev, length_unit: e }));
                        }}
                      >
                        <DropdownMenuRadioItem value="cm">
                          cm
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="mm">
                          mm
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="m-2 flex  items-center gap-2">
                  <Input
                    name="width"
                    value={formData.width}
                    readOnly={!isEditing}
                    disabled={!isEditing}
                    onChange={handleChange}
                    className=" border border-gray-300"
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild disabled={!isEditing}>
                      <Button className=" w-1/6" variant="outline">
                        {width}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Unit</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuRadioGroup
                        value={formData.width_unit}
                        onValueChange={(e) => {
                          setWidth(e);
                          setFormData((prev) => ({ ...prev, width_unit: e }));
                        }}
                      >
                        <DropdownMenuRadioItem value="cm">
                          cm
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="mm">
                          mm
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="m-2  flex items-center gap-2">
                  <Input
                    name="height"
                    value={formData.height}
                    disabled={!isEditing}
                    readOnly={!isEditing}
                    onChange={handleChange}
                    className=" border border-gray-300"
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild disabled={!isEditing}>
                      <Button className=" w-1/6" variant="outline">
                        {height}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Unit</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuRadioGroup
                        value={formData.height_unit}
                        onValueChange={(e) => {
                          setHeight(e);
                          setFormData((prev) => ({ ...prev, height_unit: e }));
                        }}
                      >
                        <DropdownMenuRadioItem value="cm">
                          cm
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="mm">
                          mm
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
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
            <div className="flex-1">
              <Label>Condition</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={!isEditing}>
                  <Button className="w-full" variant="outline">
                    {conditionValue}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuLabel>Condition</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={conditionValue}
                    onValueChange={(value) =>
                      setConditionValue(value as PartCondition)
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
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>Upload Images</Label>
              <div className="flex items-center gap-2">
                <Input readOnly disabled></Input>
                <UploadButton
                  disabled={!isEditing}
                  input={{ part_id: data.part_id }}
                  endpoint="partImageUploader"
                  onClientUploadComplete={() => {
                    handleUploadComplete();
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-start">
          {!isEditing && (
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          )}
          <Button onClick={isEditing ? handleCancelClick : handleEditClick}>
            {isEditing ? "Cancel" : "Edit"}
          </Button>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
