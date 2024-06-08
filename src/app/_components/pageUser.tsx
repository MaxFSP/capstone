/* eslint-disable @next/next/no-img-element */
"use client";

import type { Employee } from "../types/employee";
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
  Checkbox,
} from "@nextui-org/react";
import type { UpdateUserRequest, UpdateUserResponse } from "../types/api";

export default function PageUser({
  user,
  departments,
}: {
  user: Employee;
  departments: Org[];
}) {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.email,
    online: user.online,
  });
  const [initialFormValues, setInitialFormValues] = useState({ ...formValues });
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(
    new Set([departments[0]!.name]),
  );
  const [initialSelectedKeys, setInitialSelectedKeys] = useState(
    new Set([departments[0]!.name]),
  );
  const [isFormValid, setIsFormValid] = useState(false);

  const selectedValue = useMemo(
    () => Array.from(selectedKeys).join(", ").replaceAll("_", " "),
    [selectedKeys],
  );

  useEffect(() => {
    setInitialFormValues({ ...formValues });
    setSelectedKeys(new Set([departments[0]!.name]));
    setInitialSelectedKeys(new Set([departments[0]!.name]));
  }, [user, departments, formValues]);

  useEffect(() => {
    const isEmailValid = validateEmail(formValues.email);
    const isUsernameValid = validateUsername(formValues.username);
    const isNameValid = validateName(formValues.firstName);
    const isLastNameValid = validateName(formValues.lastName);

    setIsFormValid(
      isEmailValid &&
        isUsernameValid &&
        isNameValid &&
        isLastNameValid &&
        selectedKeys.size > 0,
    );
  }, [formValues, selectedKeys]);

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { online, ...formValuesWithoutOnline } = formValues;
    const changes: UpdateUserRequest = {
      userId: user.id,
      formEmployee: {
        ...formValuesWithoutOnline,
        department: Array.from(selectedKeys),
      },
    };

    try {
      const response = await fetch("/api/updateUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(changes),
      });

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data: UpdateUserResponse = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setIsEditing(false);
      return true;
    } catch (error) {
      console.error("Failed to update user:", error);
      return false;
    }
  };

  const handleCancelClick = () => {
    setFormValues(initialFormValues);
    setSelectedKeys(initialSelectedKeys);
    setIsEditing(false);
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

  return (
    <div className="flex min-h-screen w-full items-center justify-center text-gray-100">
      <div className="w-full max-w-4xl rounded-lg bg-gray-800 p-8 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-start md:space-x-8">
          <div className="mb-4 flex-shrink-0 md:mb-0">
            <img
              src={user.img}
              alt={`${user.firstName} ${user.lastName}'s profile picture`}
              className="h-32 w-32 rounded-full object-cover"
            />
          </div>
          <div className="w-full">
            <h3 className="mb-4 text-2xl font-semibold">Edit User</h3>
            <form className="flex flex-col space-y-4">
              <Input
                type="text"
                label="User Id"
                defaultValue={`${user.id}`}
                isDisabled
              />
              <Input
                type="text"
                label="firstName"
                name="firstName"
                value={formValues.firstName}
                onChange={handleInputChange}
                isDisabled={!isEditing}
                isInvalid={isNameInvalid}
                color={isNameInvalid ? "danger" : "default"}
                errorMessage={isNameInvalid && "Name can only contain letters"}
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
                  isLastNameInvalid && "Last Name can only contain letters"
                }
              />
              <Input
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
                  {departments.map((department) => (
                    <DropdownItem key={department.name}>
                      {department.name}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
              <Checkbox
                isSelected={formValues.online}
                onChange={handleCheckboxChange}
                name="online"
                isDisabled={!isEditing}
              >
                Online
              </Checkbox>
              <div className="flex space-x-4">
                <Button
                  onClick={isEditing ? handleCancelClick : handleEditClick}
                >
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
                {isEditing && (
                  <>
                    <Button onClick={handleSaveClick} isDisabled={!isFormValid}>
                      Save
                    </Button>
                    <Button
                      onClick={handleSaveAndCloseClick}
                      isDisabled={!isFormValid}
                    >
                      Save & Close
                    </Button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
