"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "~/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { cn } from "~/lib/utils";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { type SellDataValues } from "~/server/types/IMachinery";

export function SellDataViewDialog(props: { data: SellDataValues }) {
  const { data } = props;
  const [date, setDate] = useState<Date>(
    new Date(data.sold_date || Date.now()),
  );
  const [isEditing, setIsEditing] = useState(true);
  const [formValues, setFormValues] = useState({
    machine_id: data.machine_id,
    brand: data.brand,
    model: data.model,
    year: data.year,
    serial_number: data.serial_number,
    sold_price: data.sold_price.toString(),
    sold_to: data.sold_to,
    sold_date: data.sold_date,
  });

  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const isSoldPriceValid = validateSoldPrice(formValues.sold_price);
    const isSoldToValid = validateSoldTo(formValues.sold_to);
    const isSoldDateValid = validateSoldDate(date);

    setIsFormValid(isSoldPriceValid && isSoldToValid && isSoldDateValid);
  }, [formValues, date]);

  const validateSoldPrice = (sold_price: string) => {
    const price = parseFloat(sold_price);
    return !isNaN(price) && price > 0;
  };

  const validateSoldTo = (sold_to: string) => /^[A-Za-z\s]+$/.test(sold_to);

  const validateSoldDate = (sold_date: Date | null) => sold_date !== null;

  const isSoldPriceValid = useMemo(
    () => validateSoldPrice(formValues.sold_price),
    [formValues.sold_price],
  );
  const isSoldToValid = useMemo(
    () => validateSoldTo(formValues.sold_to),
    [formValues.sold_to],
  );

  const handleSaveClick = async (): Promise<boolean> => {
    const { brand, model, year, serial_number, ...formValuesNew } = formValues;

    try {
      const response = await fetch("/api/sellMachinery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          machine_id: formValuesNew.machine_id,
          sold_price: parseFloat(formValuesNew.sold_price),
          sold_date: date,
          sold_to: formValuesNew.sold_to,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to sell machine");
      }

      setIsEditing(false);
      return true;
    } catch (error) {
      console.error("Failed to sell machine:", error);
      return false;
    }
  };

  const handleSaveAndCloseClick = async () => {
    await handleSaveClick();
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-opacity-90">
          Sell Machine
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="h-auto max-h-[90vh] overflow-auto rounded-lg border border-border bg-background text-foreground lg:max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold text-primary">
            Sell Machine
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Make sure you type the correct information before selling the
            machine.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>Machine ID</Label>
              <Input
                name="machine_id"
                value={data.machine_id}
                readOnly
                disabled
                className="border border-border bg-muted text-muted-foreground"
              />
            </div>
            <div className="flex-1">
              <Label>Brand</Label>
              <Input
                name="brand"
                value={data.brand}
                readOnly
                disabled
                className="border border-border bg-muted text-muted-foreground"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>Model</Label>
              <Input
                name="model"
                value={data.model}
                readOnly
                disabled
                className="border border-border bg-muted text-muted-foreground"
              />
            </div>
            <div className="flex-1">
              <Label>Year</Label>
              <Input
                name="year"
                value={data.year}
                readOnly
                disabled
                className="border border-border bg-muted text-muted-foreground"
              />
            </div>
            <div className="flex-1">
              <Label>Serial Number</Label>
              <Input
                name="serial_number"
                value={data.serial_number}
                readOnly
                disabled
                className="border border-border bg-muted text-muted-foreground"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>Sold Price (USD)</Label>
              <Input
                required
                type="text"
                name="sold_price"
                value={formValues.sold_price}
                onChange={handleInputChange}
                className={`${
                  isSoldPriceValid ? "text-foreground" : "text-destructive"
                } border border-border bg-background`}
              />
            </div>
            <div className="flex-1">
              <Label>Sold To</Label>
              <Input
                required
                type="text"
                name="sold_to"
                value={formValues.sold_to}
                onChange={handleInputChange}
                className={`${
                  isSoldToValid ? "text-foreground" : "text-destructive"
                } border border-border bg-background`}
              />
            </div>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start border border-border bg-background text-left font-normal text-foreground",
                  !date && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-foreground" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto border border-border bg-background p-0 text-foreground"
              align="start"
            >
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => {
                  if (date) {
                    setDate(date);
                    setFormValues((prev) => ({
                      ...prev,
                      sold_date: date,
                    }));
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <AlertDialogFooter className="sm:justify-start">
          <AlertDialogCancel asChild>
            <Button
              type="button"
              variant="secondary"
              className="bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              onClick={() => {
                setFormValues({
                  machine_id: data.machine_id,
                  brand: data.brand,
                  model: data.model,
                  year: data.year,
                  serial_number: data.serial_number,
                  sold_price: data.sold_price.toString(),
                  sold_to: data.sold_to,
                  sold_date: data.sold_date,
                });
              }}
            >
              Close
            </Button>
          </AlertDialogCancel>
          <AlertDialogCancel asChild>
            <Button
              onClick={handleSaveAndCloseClick}
              variant="destructive"
              disabled={!isFormValid}
              className="bg-destructive text-destructive-foreground hover:bg-opacity-90"
            >
              Save & Close
            </Button>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
