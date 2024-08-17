/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @next/next/no-img-element */
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
} from "~/components/ui/dialog";

import { Input, Button, Checkbox } from "@nextui-org/react";
import { Button as ButtonTwo } from "~/components/ui/button";
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
import { DialogClose } from "@radix-ui/react-dialog";

import { Avatar } from "@nextui-org/react";
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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormValues((prevValues) => ({ ...prevValues, [name]: checked }));
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
          <Avatar src={user.img} alt={user.firstName} size="lg" />
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
            This will update the user`&apos;`s details in the system.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col md:flex-row md:items-start md:space-x-4">
          <div className="mb-4 flex-shrink-0 md:mb-0">
            <img
              src={user.img}
              alt={`${user.firstName} ${user.lastName}'s profile picture`}
              className="h-32 w-32 rounded-full object-cover"
            />
          </div>
          <div className="w-full">
            <h3 className="mb-4 text-2xl font-semibold text-foreground">
              Edit User
            </h3>
            <form className="flex flex-col space-y-4">
              <Input
                type="text"
                label="User Id"
                defaultValue={`${user.id}`}
                isDisabled
                className="border border-border bg-muted text-muted-foreground"
              />
              <Input
                type="text"
                label="First Name"
                name="firstName"
                value={formValues.firstName}
                onChange={handleInputChange}
                isDisabled={!isEditing}
                isInvalid={isNameInvalid}
                color={isNameInvalid ? "danger" : "default"}
                errorMessage={
                  isNameInvalid ? "Name can only contain letters" : undefined
                }
                className="border border-border bg-background text-foreground"
              />
              <Input
                type="text"
                label="Last Name"
                name="lastName"
                value={formValues.lastName}
                onChange={handleInputChange}
                isDisabled={!isEditing}
                isInvalid={isLastNameInvalid}
                color={isLastNameInvalid ? "danger" : "default"}
                errorMessage={
                  isLastNameInvalid
                    ? "Last Name can only contain letters"
                    : undefined
                }
                className="border border-border bg-background text-foreground"
              />
              <Input
                type="text"
                label="Username"
                name="username"
                pattern="[a-zA-Z0-9]+"
                value={formValues.username}
                onChange={handleInputChange}
                isDisabled={!isEditing}
                isInvalid={!!isUsernameInvalid}
                color={isUsernameInvalid ? "danger" : "default"}
                errorMessage={
                  isUsernameInvalid
                    ? "Username can only contain letters and numbers"
                    : undefined
                }
                className="border border-border bg-background text-foreground"
              />
              <Input
                type="email"
                label="Email"
                name="email"
                value={formValues.email}
                onChange={handleInputChange}
                isDisabled={!isEditing}
                isInvalid={!!isEmailInvalid}
                color={isEmailInvalid ? "danger" : "default"}
                errorMessage={
                  isEmailInvalid ? "Please enter a valid email" : undefined
                }
                className="border border-border bg-background text-foreground"
              />

              <Input
                type="password"
                label="Password"
                name="password"
                value={formValues.password}
                onChange={handleInputChange}
                isDisabled={!isEditing}
                isInvalid={isPasswordInvalid}
                color={isPasswordInvalid ? "danger" : "default"}
                errorMessage={
                  isPasswordInvalid
                    ? "Password must be at least 8 characters long and contain at least one uppercase letter and one number"
                    : undefined
                }
                className="border border-border bg-background text-foreground"
              />
              <Input
                type="password"
                label="Confirm Password"
                name="confirmPassword"
                value={formValues.confirmPassword}
                onChange={handleInputChange}
                isDisabled={!isEditing}
                isInvalid={isConfirmPasswordInvalid}
                color={isConfirmPasswordInvalid ? "danger" : "default"}
                errorMessage={
                  isConfirmPasswordInvalid
                    ? "Passwords do not match"
                    : undefined
                }
                className="border border-border bg-background text-foreground"
              />
              <div className="flex-1">
                <Label>Role</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild disabled={!isEditing}>
                    <ButtonTwo
                      className="w-full border border-border bg-background text-foreground"
                      variant="outline"
                    >
                      {role}
                    </ButtonTwo>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full bg-background text-foreground">
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
              <Checkbox
                name="online"
                isSelected={formValues.online}
                onChange={handleCheckboxChange}
                isDisabled={!isEditing}
                className="border border-border bg-background text-foreground"
              >
                Online
              </Checkbox>

              <div className="flex space-x-4">
                {!isEditing && (
                  <DialogClose asChild>
                    <Button className="bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground">
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
                        isDisabled={!isFormValid || !hasChanges}
                        className="hover:bg-accent-dark bg-accent text-accent-foreground"
                      >
                        Save
                      </Button>
                    </DialogClose>

                    <DialogClose asChild>
                      <Button
                        onClick={handleSaveAndCloseClick}
                        isDisabled={!isFormValid || !hasChanges}
                        className="bg-destructive text-destructive-foreground hover:bg-opacity-90"
                      >
                        Save & Close
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
