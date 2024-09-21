import { useState, useEffect, useCallback } from 'react';
import type { ZodSchema, ZodIssue } from 'zod';

interface UseFormValidationProps<T> {
  schema: ZodSchema<T>;
  initialData: T;
  validateOnChange?: boolean;
}

export function useFormValidation<T>({
  schema,
  initialData,
  validateOnChange = true,
}: UseFormValidationProps<T>) {
  const [formData, setFormData] = useState<T>(initialData);
  const [isFormValid, setIsFormValid] = useState(false);
  const [errors, setErrors] = useState<ZodIssue[]>([]);

  const validateForm = useCallback(() => {
    const result = schema.safeParse(formData);
    if (result.success) {
      setIsFormValid(true);
      setErrors([]);
    } else {
      setIsFormValid(false);
      setErrors(result.error.errors);
    }
    return result.success;
  }, [formData, schema]);

  useEffect(() => {
    if (validateOnChange) {
      validateForm();
    }
  }, [formData, validateOnChange, validateForm]);

  const setFormDataAndValidate = useCallback((newData: Partial<T> | ((prevData: T) => T)) => {
    setFormData((prevData) => {
      const updatedData =
        typeof newData === 'function' ? newData(prevData) : { ...prevData, ...newData };
      return updatedData;
    });
  }, []);

  return {
    formData,
    setFormData: setFormDataAndValidate,
    isFormValid,
    errors,
    validateForm,
  };
}
