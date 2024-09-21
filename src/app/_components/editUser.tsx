/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @next/next/no-img-element */
'use client';

import type { ClerkUser } from '../../server/types/IClerkUser';
import React, { useEffect, useState, useMemo } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '~/components/ui/dialog';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Switch } from '~/components/ui/switch';

import type { UpdateUserRequest, UpdateUserResponse } from '../../server/types/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import type { UpdateClerkUser } from '../../server/types/IClerkUser';
import { useRouter } from 'next/navigation';
import { Label } from '~/components/ui/label';
import { type Org } from '~/server/types/org';
import { cn } from '~/lib/utils';

export default function EditUser({ user, orgs }: { user: ClerkUser; orgs: Org[] }) {
  const router = useRouter();

  let current_role = '';

  if (Array.isArray(orgs)) {
    if (orgs.some((o) => o.name?.includes('Administrator'))) {
      current_role = 'Administrator';
    } else {
      current_role = orgs[0]?.name ?? '';
    }
  }

  const [role, setRole] = useState(current_role);

  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.email[0],
    online: user.online,
    password: '',
    confirmPassword: '',
  });

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
    const email = formValues.email ?? '';
    const isEmailValid = validateEmail(email);
    const isUsernameValid = validateUsername(formValues.username);
    const isNameValid = validateName(formValues.firstName);
    const isLastNameValid = validateName(formValues.lastName);
    const isPasswordValid = validatePassword(formValues.password);
    const isConfirmPasswordValid = formValues.password === formValues.confirmPassword;

    setIsFormValid(
      isEmailValid &&
        isUsernameValid &&
        isNameValid &&
        isLastNameValid &&
        (formValues.password === '' || (isPasswordValid && isConfirmPasswordValid))
    );
  };

  const checkForChanges = () => {
    const hasChanges =
      JSON.stringify({ ...formValues, confirmPassword: '' }) !==
        JSON.stringify({ ...initialFormValues, confirmPassword: '' }) || role !== current_role;
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
    const { password, confirmPassword, ...formValuesWithoutPassword } = formValues;

    const changes: Partial<UpdateClerkUser> = {};

    (Object.keys(formValuesWithoutPassword) as (keyof typeof formValuesWithoutPassword)[]).forEach(
      (key) => {
        if (formValuesWithoutPassword[key] !== initialFormValues[key]) {
          changes[key] = formValuesWithoutPassword[key] as any;
        }
      }
    );

    if (password) {
      changes.password = password;
    }

    if (!changes.email) {
      changes.email = [formValues.email];
    }

    const selectedDepartment = orgs.find((org) => org.name === role);
    const orgVal = selectedDepartment ? selectedDepartment.id : '';

    const finalChanges: UpdateUserRequest = {
      userId: user.id,
      orgId: orgVal,
      formEmployee: {
        ...changes,
        email: changes.email,
      },
    };

    try {
      const response = await fetch('/api/updateUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalChanges),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      const data: UpdateUserResponse = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setIsEditing(false);
      setInitialFormValues({ ...formValues });
      checkForChanges();
      router.refresh();
      return true;
    } catch (error) {
      console.error('Failed to update user:', error);
      return false;
    }
  };

  const handleCancelClick = () => {
    setFormValues(initialFormValues);
    setIsEditing(false);
  };

  const validateEmail = (email: string) => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);
  const validateUsername = (username: string) => /^[a-zA-Z0-9]+$/.test(username);
  const validateName = (name: string) => /^[a-zA-Z\s]+$/.test(name);
  const validatePassword = (password: string) => /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);

  const isEmailInvalid = useMemo(
    () => formValues.email && !validateEmail(formValues.email),
    [formValues.email]
  );
  const isUsernameInvalid = useMemo(
    () => formValues.username && !validateUsername(formValues.username),
    [formValues.username]
  );

  const isNameInvalid = useMemo(
    () => formValues.firstName !== '' && !validateName(formValues.firstName),
    [formValues.firstName]
  );
  const isLastNameInvalid = useMemo(
    () => formValues.lastName !== '' && !validateName(formValues.lastName),
    [formValues.lastName]
  );
  const isPasswordInvalid = useMemo(
    () => formValues.password !== '' && !validatePassword(formValues.password),
    [formValues.password]
  );
  const isConfirmPasswordInvalid = useMemo(
    () => formValues.confirmPassword !== '' && formValues.password !== formValues.confirmPassword,
    [formValues.password, formValues.confirmPassword]
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <p className="w-8 cursor-pointer text-sm font-semibold text-foreground">View</p>
      </DialogTrigger>
      <DialogContent className="h-auto max-h-[90vh] overflow-auto bg-background text-foreground lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            This will update the user&lsquo;s details in the system.
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
            <h3 className="mb-4 text-2xl font-semibold text-foreground">Edit User</h3>
            <form className="flex flex-col space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <Label>User Id</Label>
                <Input
                  type="text"
                  defaultValue={`${user.id}`}
                  disabled
                  className="border border-border bg-background text-foreground"
                />
              </div>
              <div>
                <Label>First Name</Label>
                <Input
                  type="text"
                  name="firstName"
                  value={formValues.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={cn(
                    'border border-border bg-background text-foreground',
                    isNameInvalid && 'border-destructive'
                  )}
                />
                {isNameInvalid && (
                  <p className="text-sm text-destructive">Name can only contain letters</p>
                )}
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  type="text"
                  name="lastName"
                  value={formValues.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={cn(
                    'border border-border bg-background text-foreground',
                    isLastNameInvalid && 'border-destructive'
                  )}
                />
                {isLastNameInvalid && (
                  <p className="text-sm text-destructive">Last Name can only contain letters</p>
                )}
              </div>
              <div>
                <Label>Username</Label>
                <Input
                  type="text"
                  name="username"
                  value={formValues.username}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={cn(
                    'border border-border bg-background text-foreground',
                    isUsernameInvalid && 'border-destructive'
                  )}
                />
                {isUsernameInvalid && (
                  <p className="text-sm text-destructive">
                    Username can only contain letters and numbers
                  </p>
                )}
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={formValues.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={cn(
                    'border border-border bg-background text-foreground',
                    isEmailInvalid && 'border-destructive'
                  )}
                />
                {isEmailInvalid && (
                  <p className="text-sm text-destructive">Please enter a valid email</p>
                )}
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  name="password"
                  value={formValues.password}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={cn(
                    'border border-border bg-background text-foreground',
                    isPasswordInvalid && 'border-destructive'
                  )}
                />
                {isPasswordInvalid && (
                  <p className="text-sm text-destructive">
                    Password must be at least 8 characters long and contain at least one uppercase
                    letter and one number
                  </p>
                )}
              </div>
              <div>
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={formValues.confirmPassword}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={cn(
                    'border border-border bg-background text-foreground',
                    isConfirmPasswordInvalid && 'border-destructive'
                  )}
                />
                {isConfirmPasswordInvalid && (
                  <p className="text-sm text-destructive">Passwords do not match</p>
                )}
              </div>
              <div className="flex-1">
                <Label>Role</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild disabled={!isEditing}>
                    <Button
                      className="w-full border border-border bg-background text-foreground"
                      variant="outline"
                    >
                      {role}
                    </Button>
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

              <div className="flex items-center space-x-2">
                <Switch
                  id="online"
                  disabled={!isEditing}
                  checked={formValues.online}
                  onCheckedChange={handleCheckboxChange}
                />
                <Label htmlFor="enableUser">Enable user</Label>
              </div>
              <div className="flex space-x-4">
                {!isEditing && (
                  <DialogClose asChild>
                    <Button className="bg-secondary text-secondary-foreground">Close</Button>
                  </DialogClose>
                )}
                <Button
                  type="button"
                  onClick={isEditing ? handleCancelClick : handleEditClick}
                  className={
                    isEditing
                      ? 'bg-secondary text-secondary-foreground'
                      : 'bg-primary text-primary-foreground'
                  }
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
                {isEditing && (
                  <DialogClose asChild>
                    <Button
                      type="button"
                      onClick={handleSaveClick}
                      disabled={!isFormValid || !hasChanges}
                      className="bg-primary text-primary-foreground"
                    >
                      Save
                    </Button>
                  </DialogClose>
                )}
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
