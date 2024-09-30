// LabeledInput.tsx

import React from 'react';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { cn } from '~/lib/utils';

interface LabeledInputProps {
  label: string;
  name: string;
  type: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  className?: string;
}

const LabeledInput: React.FC<LabeledInputProps> = ({
  label,
  name,
  type,
  value,
  onChange,
  readOnly = false,
  disabled = false,
  error,
  required = false,
  className = '',
}) => (
  <div className={cn('flex flex-col', className)}>
    <Label htmlFor={name}>{label}</Label>
    <Input
      required={required}
      type={type}
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      disabled={disabled}
      className={cn(
        'border border-border bg-background text-foreground',
        error && 'border-red-500'
      )}
    />
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);

export default LabeledInput;
