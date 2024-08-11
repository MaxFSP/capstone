/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from "react";

import { Button } from "~/components/ui/button";
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
import DeleteImageDialog from "./deleteImageDialog";
import { useRouter } from "next/navigation";
import { type Employee } from "~/server/types/IEmployee";

export function EmployeeDataViewDialog(props: {
  title: string;
  data: Employee;
  size: string;
  index: number;
}) {
  const { title, data, size, index } = props;

  const router = useRouter();
  const current_date = data.hireDate;

  const current_job = data.job;
  const [jobValue, setJobValue] = useState(data.job);
  const current_bloodType = data.bloodType;
  const [bloodTypeValue, setBloodTypeValue] = useState(data.bloodType);

  const [dateValue, setDateValue] = useState<Date>(new Date(data.hireDate));

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...data });
  const [initialFormData, setInitialFormData] = useState({ ...data });
  const [isFormValid, setIsFormValid] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setJobValue(data.job);
      setBloodTypeValue(data.bloodType);
      setFormData({ ...data });
      setDateValue(data.hireDate);
    }
  }, [isEditing, data]);

  useEffect(() => {
    validateForm();
    checkForChanges();
  }, [formData, jobValue, dateValue]);

  const handleUploadComplete = () => {
    router.refresh();
  };

  const validateForm = () => {
    const isDataValid =
      formData.employee_id !== null && formData.employee_id !== undefined;
    setIsFormValid(isDataValid);
  };

  const checkForChanges = () => {
    const dateWithoutTime = dateValue.toISOString().split("T")[0];
    const dateWithoutTimeCurrent = new Date(current_date)
      .toISOString()
      .split("T")[0];

    const hasChanges =
      JSON.stringify(formData) !== JSON.stringify(initialFormData) ||
      jobValue !== current_job ||
      bloodTypeValue !== current_bloodType ||
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
        formData.job = jobValue;
        formData.hireDate = dateValue;
        const response = await fetch("/api/updateEmployee", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        if (response.ok) {
          // console.log("Tool updated successfully:", result);
          router.refresh();
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
        {size === "lg" ? (
          <p className="w-8 cursor-pointer text-small font-semibold">{title}</p>
        ) : (
          <div className="flex flex-col border-b border-gray-700 px-5 py-4 text-white">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-base font-semibold">ID</p>
              <div className="flex items-center gap-2">{index}</div>
            </div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-400">Brand</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-200">{data.firstName}</span>
              </div>
            </div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-400">Model</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-200">{data.lastName}</span>
              </div>
            </div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-400">Serial Number</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-200">{data.job}</span>
              </div>
            </div>
          </div>
        )}
      </DialogTrigger>
      <DialogContent className="h-auto max-h-[90vh] overflow-auto lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-large">{title}</DialogTitle>
          <DialogDescription>
            Anyone who has this link will be able to view this.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex space-x-4">
            {/* add image here its in formData.imageUrl just a simple image in a circle if possible */}
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
                    type: "Employee",
                  }}
                />
              </div>
            )}
            <div className="flex-1 flex-row">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label>First Name</Label>
                  <Input
                    required
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    readOnly={!isEditing}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="border border-gray-300"
                  />
                </div>
                <div className="flex-1">
                  <Label>Last Name</Label>
                  <Input
                    required
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    readOnly={!isEditing}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="border border-gray-300"
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label>Age</Label>
                  <Input
                    required
                    type="text"
                    name="age"
                    value={formData.age}
                    readOnly={!isEditing}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="border border-gray-300"
                  />
                </div>
                <div className="flex-1">
                  <Label>Phone Number</Label>
                  <Input
                    required
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    readOnly={!isEditing}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="border border-gray-300"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label>Blood Type</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild disabled={!isEditing}>
                      <Button className="w-full" variant="outline">
                        {bloodTypeValue}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      <DropdownMenuLabel>Blood Type</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuRadioGroup
                        value={bloodTypeValue}
                        onValueChange={(value: string) =>
                          setBloodTypeValue(value)
                        }
                      >
                        <DropdownMenuRadioItem value="A+">
                          A+
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="A-">
                          A-
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="B+">
                          B+
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="B-">
                          B-
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="AB+">
                          AB+
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="AB-">
                          AB-
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="O+">
                          O+
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="O-">
                          O-
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex-1">
                  <Label>Job</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild disabled={!isEditing}>
                      <Button className="w-full" variant="outline">
                        {jobValue}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      <DropdownMenuLabel>Job</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuRadioGroup
                        value={jobValue}
                        onValueChange={(value: string) => setJobValue(value)}
                      >
                        <DropdownMenuRadioItem value="Mechanic">
                          Mechanic
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="Doctor">
                          Painter
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="Engineer">
                          Engineer
                        </DropdownMenuRadioItem>

                        <DropdownMenuRadioItem value="Parts Specialist">
                          Parts Specialist
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="Sales">
                          Sales
                        </DropdownMenuRadioItem>
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
                            hireDate: date,
                          }));
                        }
                      }}
                      initialFocus
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
                  <Input readOnly disabled></Input>
                  <UploadButton
                    disabled={!isEditing}
                    input={{ employee_id: data.employee_id }}
                    endpoint="employeeImageUploader"
                    onClientUploadComplete={() => {
                      handleUploadComplete();
                    }}
                  />
                </div>
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
