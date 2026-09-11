'use client';

import { useState, useCallback, ChangeEvent, FormEvent } from 'react';
import { ZodSchema, ZodError } from 'zod';

interface UseFormOptions<T extends Record<string, any>> {
  schema: ZodSchema<T>;
  initialValues: T;
  onSubmit: (values: T) => Promise<void>;
}

export function useForm<T extends Record<string, any>>({
  schema,
  initialValues,
  onSubmit,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validateField = useCallback(
    (field: keyof T, val: any) => {
      try {
        schema.parse({ ...values, [field]: val });
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      } catch (err) {
        if (err instanceof ZodError) {
          const fieldIssue = err.issues.find((issue) => issue.path[0] === field);
          setErrors((prev) => ({
            ...prev,
            [field]: fieldIssue ? fieldIssue.message : undefined,
          }));
        }
      }
    },
    [schema, values]
  );

  const handleChange = useCallback(
    (field: keyof T) =>
      (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.value;
        setValues((prev) => ({ ...prev, [field]: value }));
        setServerError(null);
        if (touched[field]) {
          validateField(field, value);
        }
      },
    [touched, validateField]
  );

  const handleBlur = useCallback(
    (field: keyof T) => () => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      validateField(field, values[field]);
    },
    [validateField, values]
  );

  const setFieldValue = useCallback((field: keyof T, val: any) => {
    setValues((prev) => ({ ...prev, [field]: val }));
    setServerError(null);
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleSubmit = useCallback(
    async (e?: FormEvent) => {
      if (e) e.preventDefault();
      setServerError(null);

      // Mark all fields as touched
      const allTouched: Partial<Record<keyof T, boolean>> = {};
      Object.keys(values).forEach((k) => {
        allTouched[k as keyof T] = true;
      });
      setTouched(allTouched);

      try {
        const validatedValues = schema.parse(values);
        setIsSubmitting(true);
        await onSubmit(validatedValues);
      } catch (err: any) {
        if (err instanceof ZodError) {
          const fieldErrors: Partial<Record<keyof T, string>> = {};
          err.issues.forEach((issue) => {
            const path = issue.path[0] as keyof T;
            if (!fieldErrors[path]) {
              fieldErrors[path] = issue.message;
            }
          });
          setErrors(fieldErrors);
        } else {
          setServerError(err.message || 'خطایی در ثبت فرم رخ داد');
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [schema, values, onSubmit]
  );

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setServerError(null);
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    serverError,
    setServerError,
    handleChange,
    handleBlur,
    setFieldValue,
    handleSubmit,
    resetForm,
  };
}
