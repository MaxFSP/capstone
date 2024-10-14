'use client';

import { useState } from 'react';
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '~/components/ui/command';
import { Popover, PopoverTrigger, PopoverContent } from '~/components/ui/popover';
import { Button } from '~/components/ui/button';
import { ScrollArea } from '~/components/ui/scroll-area';

interface SingleSelectComboboxProps {
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
  selectedValue: string;
  onChange: (selected: string) => void;
  disabled?: boolean;
}

export function SingleSelectCombobox({
  options,
  placeholder,
  selectedValue,
  onChange,
  disabled,
}: SingleSelectComboboxProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (value: string) => {
    onChange(value);
    setOpen(false); // Close the combobox after selection
  };

  const selectedOption = options.find((option) => option.value === selectedValue);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          <span>{selectedOption ? selectedOption.label : placeholder ?? 'Select an option'}</span>
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={placeholder ?? 'Search...'} />
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem key={option.value} onSelect={() => handleSelect(option.value)}>
                  <div className="mr-2 h-4 w-4">
                    {selectedValue === option.value ? <CheckIcon className="h-4 w-4" /> : null}
                  </div>
                  <span>{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
