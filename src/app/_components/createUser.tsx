/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @next/next/no-img-element */
"use client";

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

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useRouter } from "next/navigation";

import type { Org } from "../../server/types/org";
import React, { useEffect, useState, useMemo } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import type { CreateUserResponse } from "../../server/types/api";
import { useToast } from "~/components/hooks/use-toast";
import { cn } from "~/lib/utils";

export default function CreateUser({ orgs }: { orgs: Org[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(true);
  const [formValues, setFormValues] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isFormValid, setIsFormValid] = useState(false);

  const [selectedRole, setSelectedRole] = useState<string>("");
  useEffect(() => {
    const isEmailValid = validateEmail(formValues.email);
    const isUsernameValid = validateUsername(formValues.username);
    const isNameValid = validateName(formValues.firstName);
    const isLastNameValid = validateName(formValues.lastName);
    const isPasswordValid = validatePassword(formValues.password);
    const isPasswordsMatch = formValues.password === formValues.confirmPassword;

    setIsFormValid(
      isEmailValid &&
        isUsernameValid &&
        isNameValid &&
        isLastNameValid &&
        isPasswordValid &&
        isPasswordsMatch,
    );
  }, [formValues]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const handleSaveClick = async (): Promise<boolean> => {
    try {
      const { confirmPassword, email, ...restFormValues } = formValues;
      const formData = {
        ...restFormValues,
        email: [email],
        organizationId: orgs.find((org) => org.name === selectedRole)?.id ?? "",
      };
  
      const response = await fetch("/api/createUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      const data: CreateUserResponse = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to process user");
      }

      toast({
        title: "Success",
        description: "User created successfully",
      });
      return true;
  
    } catch (error) {
      console.error("Error creating user:", error);
  
      let errorMessage = "An unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
  
      if (errorMessage.includes("username is taken")) {
        setFormValues(prev => ({ ...prev, username: '' }));
      }
  
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };
  
  const handleSaveAndCloseClick = async () => {
    const saveSuccessful = await handleSaveClick();
    setIsEditing(true);
    if (saveSuccessful) {
      setFormValues({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      router.refresh();
    }
  };

  const validateEmail = (email: string) =>
    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);
  const validateUsername = (username: string) =>
    /^[a-zA-Z0-9]+$/.test(username);
  const validateName = (name: string) => /^[a-zA-Z\s]+$/.test(name);
  const validatePassword = (password: string) =>
    /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);

  const isEmailInvalid = useMemo(
    () => formValues.email !== "" && !validateEmail(formValues.email),
    [formValues.email],
  );
  const isUsernameInvalid = useMemo(
    () => formValues.username !== "" && !validateUsername(formValues.username),
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary-foreground hover:text-primary">
          Create User
        </Button>
      </DialogTrigger>
      <DialogContent className="h-auto max-h-[90vh] overflow-auto bg-background text-foreground lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-primary">Create User</DialogTitle>
          <DialogDescription>
            This will create a new user in the system.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col md:flex-row md:items-start md:space-x-4">
          <div className="mb-4 flex-shrink-0 md:mb-0">
            <img
              src="https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18yZ3FVVEYwYk8yTGxBZUZQYkFMYWFMT1Njc2QiLCJyaWQiOiJ1c2VyXzJndWxDUGRBTE03OFFGSVhZZ0RseGt0UGR4VCIsImluaXRpYWxzIjoiTEcifQ"
              alt={`${formValues.firstName} ${formValues.lastName}'s profile picture`}
              className="h-32 w-32 rounded-full object-cover"
            />
          </div>
          <div className="w-full">
            <form
              className="flex flex-col space-y-4"
              onSubmit={(e) => e.preventDefault()}
            >
              <div>
                <Input
                  required
                  type="text"
                  placeholder="First Name"
                  name="firstName"
                  value={formValues.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={cn(isNameInvalid && "border-red-500")}
                />
                {isNameInvalid && (
                  <p className="text-sm text-red-500">
                    Name can only contain letters
                  </p>
                )}
              </div>
              <div>
                <Input
                  required
                  type="text"
                  placeholder="Last Name"
                  name="lastName"
                  value={formValues.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={cn(isLastNameInvalid && "border-red-500")}
                />
                {isLastNameInvalid && (
                  <p className="text-sm text-red-500">
                    Last Name can only contain letters
                  </p>
                )}
              </div>
              <div>
                <Input
                  required
                  type="text"
                  placeholder="Username"
                  name="username"
                  pattern="[a-zA-Z0-9]+"
                  value={formValues.username}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={cn(isUsernameInvalid && "border-red-500")}
                />
                {isUsernameInvalid && (
                  <p className="text-sm text-red-500">
                    Username can only contain letters and numbers
                  </p>
                )}
              </div>
              <div>
                <Input
                  required
                  type="email"
                  placeholder="Email"
                  name="email"
                  value={formValues.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={cn(isEmailInvalid && "border-red-500")}
                />
                {isEmailInvalid && (
                  <p className="text-sm text-red-500">
                    Please enter a valid email
                  </p>
                )}
              </div>
              <div>
                <Input
                  required
                  type="password"
                  placeholder="Password"
                  name="password"
                  value={formValues.password}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={cn(isPasswordInvalid && "border-red-500")}
                />
                {isPasswordInvalid && (
                  <p className="text-sm text-red-500">
                    Password must contain at least 8 characters, one uppercase
                    letter, and one number
                  </p>
                )}
              </div>
              <div>
                <Input
                  required
                  type="password"
                  placeholder="Confirm Password"
                  name="confirmPassword"
                  value={formValues.confirmPassword}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={cn(isConfirmPasswordInvalid && "border-red-500")}
                />
                {isConfirmPasswordInvalid && (
                  <p className="text-sm text-red-500">Passwords do not match</p>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full">
                    {selectedRole || "Select a role"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Roles</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={selectedRole}
                    onValueChange={(value: string) => setSelectedRole(value)}
                  >
                    {orgs.map((org) => (
                      <DropdownMenuRadioItem key={org.name} value={org.name}>
                        {org.name}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex justify-between">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setFormValues({
                        firstName: "",
                        lastName: "",
                        username: "",
                        email: "",
                        password: "",
                        confirmPassword: "",
                      });
                    }}
                  >
                    Close
                  </Button>
                </DialogClose>

                <Button
                  onClick={handleSaveAndCloseClick}
                  disabled={!isFormValid}
                  variant="default"
                >
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>

        <DialogFooter className="sm:justify-start"></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
