"use client";

import type { ClerkUser } from "../../server/types/IClerkUser";
import React, { useEffect, useState, useMemo } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "~/components/ui/dialog";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import type {
  UpdateUserRequest,
  UpdateUserResponse,
} from "../../server/types/api";

import type { UpdateClerkUser } from "../../server/types/IClerkUser";

import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { type Org } from "../../server/types/org";
import { Label } from "~/components/ui/label";

export default function SmallEditUser({
  user,
  orgs,
}: {
  user: ClerkUser;
  orgs: Org[];
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.email[0],
    online: user.online,
    password: "",
    confirmPassword: "",
  });
  const [role, setRole] = useState(user.org.name);

  const [initialFormValues, setInitialFormValues] = useState({ ...formValues });
  const [isFormValid, setIsFormValid] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setInitialFormValues({ ...formValues, email: user.email[0] });
  }, [user]);

  useEffect(() => {
    validateForm();
    checkForChanges();
  }, [formValues, role]);

  const validateForm = () => {
    const email = formValues.email ?? "";
    const isEmailValid = validateEmail(email);
    const isUsernameValid = validateUsername(formValues.username);
    const isNameValid = validateName(formValues.firstName);
    const isLastNameValid = validateName(formValues.lastName);
    const isPasswordValid = validatePassword(formValues.password);
    const isConfirmPasswordValid =
      formValues.password === formValues.confirmPassword;

    setIsFormValid(
      isEmailValid &&
        isUsernameValid &&
        isNameValid &&
        isLastNameValid &&
        (formValues.password === "" ||
          (isPasswordValid && isConfirmPasswordValid)),
    );
  };

  const checkForChanges = () => {
    const hasChanges =
      JSON.stringify({ ...formValues, confirmPassword: "" }) !==
        JSON.stringify({ ...initialFormValues, confirmPassword: "" }) ||
      role !== user.org.name;
    setHasChanges(hasChanges);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormValues((prevValues) => ({ ...prevValues, online: checked }));
  };

  const handleEditClick = () => setIsEditing((prev) => !prev);

  const handleSaveClick = async (): Promise<boolean> => {
    const { password, confirmPassword, ...formValuesWithoutPassword } =
      formValues;

    const changes: Partial<UpdateClerkUser> = {};

    (
      Object.keys(
        formValuesWithoutPassword,
      ) as (keyof typeof formValuesWithoutPassword)[]
    ).forEach((key) => {
      if (formValuesWithoutPassword[key] !== initialFormValues[key]) {
        changes[key] = formValuesWithoutPassword[key] as any;
      }
    });

    if (password) {
      changes.password = password;
    }

    if (!changes.email) {
      changes.email = [formValues.email!];
    }

    const selectedDepartment = orgs.find((org) => org.name === role);
    const orgVal = selectedDepartment ? selectedDepartment.id : "";
    const finalChanges: UpdateUserRequest = {
      userId: user.id,
      orgId: orgVal,
      formEmployee: {
        ...changes,
        email: changes.email,
      },
    };

    try {
      const response = await fetch("/api/updateUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalChanges),
      });

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      const data: UpdateUserResponse = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setIsEditing(false);
      setInitialFormValues({ ...formValues });
      checkForChanges();
      return true;
    } catch (error) {
      console.error("Failed to update user:", error);
      return false;
    }
  };

  const handleCancelClick = () => {
    setFormValues(initialFormValues);
    setIsEditing(false);
  };

  const handleSaveAndCloseClick = async () => {
    const saveSuccessful = await handleSaveClick();
    if (saveSuccessful) {
      // notify the user that the changes have been saved
    }
  };

  const validateEmail = (email: string) =>
    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);
  const validateUsername = (username: string) =>
    /^[a-zA-Z0-9]+$/.test(username);
  const validateName = (name: string) => /^[a-zA-Z]+$/.test(name);
  const validatePassword = (password: string) =>
    /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);

  const isEmailInvalid = useMemo(
    () => formValues.email && !validateEmail(formValues.email),
    [formValues.email],
  );
  const isUsernameInvalid = useMemo(
    () => formValues.username && !validateUsername(formValues.username),
    [formValues.username],
  );

  const isNameInvalid = useMemo(
    () => formValues.firstName !== "" && !validateName(formValues.firstName),
    [formValues.firstName],
  );
  const isLastNameInvalid = useMemo(
    () => formValues.lastName !== "" && !validateName(formValues.lastName),
    [formValues.lastName],
  );
  const isPasswordInvalid = useMemo(
    () => formValues.password !== "" && !validatePassword(formValues.password),
    [formValues.password],
  );
  const isConfirmPasswordInvalid = useMemo(
    () =>
      formValues.confirmPassword !== "" &&
      formValues.password !== formValues.confirmPassword,
    [formValues.password, formValues.confirmPassword],
  );

  const statusClass = user.online ? "bg-green-500" : "bg-red-500";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex cursor-pointer items-center gap-4 border-b border-border px-5 py-4 text-foreground">
          <Avatar>
            <AvatarImage src={user.img} alt={user.firstName} />
            <AvatarFallback>
              {user.firstName[0]}
              {user.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex w-full flex-col justify-center">
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold">{user.firstName}</p>
              <div className="flex items-center gap-2 pr-5">
                <div className="text-sm font-semibold text-muted-foreground">
                  {user.org.name}
                </div>
                <div
                  className={`ml-6 h-3 w-3 rounded-full ${statusClass}`}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="h-auto max-h-[90vh] overflow-auto rounded-lg border border-border bg-background lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-large text-primary">
            Edit User
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            This will update the user's details in the system.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col md:flex-row md:items-start md:space-x-4">
          <div className="mb-4 flex-shrink-0 md:mb-0">
            <Avatar className="h-32 w-32">
              <AvatarImage
                src={user.img}
                alt={`${user.firstName} ${user.lastName}'s profile picture`}
              />
              <AvatarFallback>
                {user.firstName[0]}
                {user.lastName[0]}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="w-full">
            <h3 className="mb-4 text-2xl font-semibold text-foreground">
              Edit User
            </h3>
            <form className="flex flex-col space-y-4">
              <div>
                <Label htmlFor="userId">User Id</Label>
                <Input
                  id="userId"
                  type="text"
                  defaultValue={`${user.id}`}
                  disabled
                  className="bg-muted text-muted-foreground"
                />
              </div>
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={formValues.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={isNameInvalid ? "border-red-500" : ""}
                />
                {isNameInvalid && (
                  <p className="text-sm text-red-500">
                    Name can only contain letters
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={formValues.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={isLastNameInvalid ? "border-red-500" : ""}
                />
                {isLastNameInvalid && (
                  <p className="text-sm text-red-500">
                    Last Name can only contain letters
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  name="username"
                  pattern="[a-zA-Z0-9]+"
                  value={formValues.username}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={isUsernameInvalid ? "border-red-500" : ""}
                />
                {isUsernameInvalid && (
                  <p className="text-sm text-red-500">
                    Username can only contain letters and numbers
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={formValues.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={isEmailInvalid ? "border-red-500" : ""}
                />
                {isEmailInvalid && (
                  <p className="text-sm text-red-500">
                    Please enter a valid email
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  value={formValues.password}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={isPasswordInvalid ? "border-red-500" : ""}
                />
                {isPasswordInvalid && (
                  <p className="text-sm text-red-500">
                    Password must be at least 8 characters long and contain at
                    least one uppercase letter and one number
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={formValues.confirmPassword}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={isConfirmPasswordInvalid ? "border-red-500" : ""}
                />
                {isConfirmPasswordInvalid && (
                  <p className="text-sm text-red-500">Passwords do not match</p>
                )}
              </div>
              <div className="flex-1">
                <Label>Role</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild disabled={!isEditing}>
                    <Button className="w-full" variant="outline">
                      {role}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuLabel>Role</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup
                      value={role}
                      onValueChange={(value: string) => setRole(value)}
                    >
                      {orgs.map((org) => (
                        <DropdownMenuRadioItem key={org.id} value={org.name}>
                          {org.name}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="online"
                  disabled={!isEditing}
                  checked={formValues.online}
                  onCheckedChange={handleCheckboxChange}
                />
                <Label htmlFor="enableWorkOrder">Enable Work Order</Label>
              </div>
              <div className="flex space-x-4">
                {!isEditing && (
                  <DialogClose asChild>
                    <Button variant="secondary">Close</Button>
                  </DialogClose>
                )}
                <Button
                  onClick={isEditing ? handleCancelClick : handleEditClick}
                  variant="outline"
                >
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
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
