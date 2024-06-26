/* eslint-disable @next/next/no-img-element */
"use client";

import type { CreateEmployee } from "../types/employee";
import type { Org } from "../types/org";
import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@nextui-org/react";
import type { CreateUserResponse } from "../types/api";

export default function CreateUser({
  user,
  orgs,
}: {
  user: CreateEmployee;
  orgs: Org[];
}) {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(true);
  const [formValues, setFormValues] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.email[0]!,
    password: "",
    confirmPassword: "",
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setInitialFormValues] = useState({ ...formValues });
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(
    new Set([orgs[0]!.name]),
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [initialSelectedKeys, setInitialSelectedKeys] = useState(
    new Set([orgs[0]!.name]),
  );
  const [isFormValid, setIsFormValid] = useState(false);

  const selectedValue = useMemo(
    () => Array.from(selectedKeys).join(", ").replaceAll("_", " "),
    [selectedKeys],
  );

  useEffect(() => {
    setInitialFormValues({ ...formValues });
    setSelectedKeys(new Set([orgs[0]!.name]));
    setInitialSelectedKeys(new Set([orgs[0]!.name]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, orgs]);

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
        isPasswordsMatch &&
        selectedKeys.size > 0,
    );
  }, [formValues, selectedKeys]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const handleSaveClick = async (): Promise<boolean> => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...formValuesWithoutConfirm } = formValues;
    const { email, ...formValuesCrop } = formValuesWithoutConfirm;
    const emails = [email];
    const formValuesF = { email: emails, ...formValuesCrop };

    const selectedDepartmentName = Array.from(selectedKeys).join(", ");
    const selectedDepartment = orgs.find(
      (org) => org.name === selectedDepartmentName,
    );
    const organizationId = selectedDepartment ? selectedDepartment.id : "";

    // Add organizationId to the form values
    const formValuesWithOrg = { ...formValuesF, organizationId };

    try {
      const response = await fetch("/api/createUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formValuesWithOrg),
      });

      if (!response.ok) {
        throw new Error("Failed to process user");
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data: CreateUserResponse = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setIsEditing(false);
      return true;
    } catch (error) {
      console.error("Failed to process user:", error);
      return false;
    }
  };

  const handleCancelClick = () => {
    router.push("/management");
  };

  const handleSaveAndCloseClick = async () => {
    const saveSuccessful = await handleSaveClick();
    if (saveSuccessful) {
      router.push("/management");
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
    <div className="flex min-h-screen w-full items-center justify-center text-gray-100">
      <div className="w-full max-w-4xl rounded-lg bg-gray-800 p-8 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-start md:space-x-8">
          <div className="mb-4 flex-shrink-0 md:mb-0">
            <img
              src="https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18yZ3FVVEYwYk8yTGxBZUZQYkFMYWFMT1Njc2QiLCJyaWQiOiJ1c2VyXzJndWxDUGRBTE03OFFGSVhZZ0RseGt0UGR4VCIsImluaXRpYWxzIjoiTEcifQ"
              alt={`${user.firstName} ${user.lastName}'s profile picture`}
              className="h-32 w-32 rounded-full object-cover"
            />
          </div>
          <div className="w-full">
            <h3 className="mb-4 text-2xl font-semibold">Create User</h3>
            <form className="flex flex-col space-y-4">
              <Input
                required
                type="text"
                label="First Name"
                name="firstName"
                value={formValues.firstName}
                onChange={handleInputChange}
                isDisabled={!isEditing}
                isInvalid={isNameInvalid}
                color={isNameInvalid ? "danger" : "default"}
                errorMessage={isNameInvalid && "Name can only contain letters"}
              />
              <Input
                required
                type="text"
                label="Last Name"
                name="lastName"
                value={formValues.lastName}
                onChange={handleInputChange}
                isDisabled={!isEditing}
                isInvalid={isLastNameInvalid}
                color={isLastNameInvalid ? "danger" : "default"}
                errorMessage={
                  isLastNameInvalid && "Last Name can only contain letters"
                }
              />
              <Input
                required
                type="text"
                label="Username"
                name="username"
                pattern="[a-zA-Z0-9]+"
                value={formValues.username}
                onChange={handleInputChange}
                isDisabled={!isEditing}
                isInvalid={isUsernameInvalid}
                color={isUsernameInvalid ? "danger" : "default"}
                errorMessage={
                  isUsernameInvalid &&
                  "Username can only contain letters and numbers"
                }
              />
              <Input
                required
                type="email"
                label="Email"
                name="email"
                value={formValues.email}
                onChange={handleInputChange}
                isDisabled={!isEditing}
                isInvalid={isEmailInvalid}
                color={isEmailInvalid ? "danger" : "default"}
                errorMessage={isEmailInvalid && "Please enter a valid email"}
              />
              <Input
                required
                type="password"
                label="Password"
                name="password"
                value={formValues.password}
                onChange={handleInputChange}
                isDisabled={!isEditing}
                isInvalid={isPasswordInvalid}
                color={isPasswordInvalid ? "danger" : "default"}
                errorMessage={
                  isPasswordInvalid &&
                  "Password must contain at least 8 characters, one uppercase letter, and one number"
                }
              />
              <Input
                required
                type="password"
                label="Confirm Password"
                name="confirmPassword"
                value={formValues.confirmPassword}
                onChange={handleInputChange}
                isDisabled={!isEditing}
                isInvalid={isConfirmPasswordInvalid}
                color={isConfirmPasswordInvalid ? "danger" : "default"}
                errorMessage={
                  isConfirmPasswordInvalid && "Passwords do not match"
                }
              />
              <Dropdown isDisabled={!isEditing} closeOnSelect={true}>
                <DropdownTrigger>
                  <Button variant="bordered" className="capitalize">
                    {selectedValue === "" ? "Select Department" : selectedValue}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  variant="flat"
                  disallowEmptySelection
                  selectionMode="single"
                  selectedKeys={selectedKeys}
                  onSelectionChange={(keys) => setSelectedKeys(new Set(keys))}
                >
                  {orgs.map((org) => (
                    <DropdownItem key={org.name}>{org.name}</DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>

              <div className="flex justify-between">
                <Button onClick={handleCancelClick}>Cancel</Button>

                <Button
                  onClick={handleSaveAndCloseClick}
                  isDisabled={!isFormValid}
                >
                  Save & Close
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
