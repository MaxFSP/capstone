/* eslint-disable @next/next/no-img-element */

// TODO: ADD FUNCTIONALITY TO UPLOAD IMAGES
// TODO ADD FUNCTIONALITY TO EDIT VALUES
// TODO ADD FUNCTIONALITY TO "SELL" MACHINERY MOST LIKELY PUT A DIALOG TO CONFIRM AND SET THE VALUES

import { Button } from "~/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "~/components/ui/carousel";
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
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { type Part } from "~/server/types/IPart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import * as React from "react";

export function PartDataViewDialog(props: { title: string; data: Part }) {
  const { title, data } = props;
  const [length, setLength] = React.useState(data.length_unit);
  const [width, setWidth] = React.useState(data.width_unit);
  const [height, setHeight] = React.useState(data.height_unit);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <p className="w-8 cursor-pointer text-small font-semibold">{title}</p>
      </DialogTrigger>
      <DialogContent className="h-auto max-h-[90vh] overflow-auto lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-large">{title}</DialogTitle>
          <DialogDescription>
            Anyone who has this link will be able to view this.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {data.images && data.images.length > 0 && (
            <div className="flex justify-center">
              <Carousel className="w-full max-w-xs">
                <CarouselContent>
                  {data.images.map((image: string, index: number) => (
                    <CarouselItem key={index} className="p-0">
                      <img
                        src={image}
                        className="h-full w-full rounded-lg object-cover"
                        alt="Part Images"
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          )}

          {data.images && data.images.length === 0 && (
            <div>
              <Label className="text-sm font-medium text-gray-400">
                Upload Images
              </Label>
              <div className="flex items-center gap-2">
                <Input readOnly className="border border-gray-300"></Input>
                <Button>Upload</Button>
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>Part ID</Label>
              <Input
                value={data.part_id}
                readOnly
                className="border border-gray-300"
              />
            </div>
            <div className="flex-1">
              <Label>Part Number</Label>
              <Input
                value={data.part_number}
                readOnly
                className="border border-gray-300"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>Name</Label>
              <Input
                value={data.name}
                readOnly
                className="border border-gray-300"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>Quantity</Label>
              <Input
                value={data.quantity}
                readOnly
                className="border border-gray-300"
              />
            </div>
            <div className="flex-1">
              <Label>Acquisition Date</Label>
              <Input
                value={data.created_at.toLocaleDateString()}
                readOnly
                className="border border-gray-300"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4 ">
            <div className="flex flex-col items-center">
              <Label>Dimensions</Label>
              <Label>(L x W x H)</Label>
            </div>

            <div className="m-4 flex">
              <Input
                value={data.length}
                readOnly
                className="m-2 w-1/6 border border-gray-300"
              />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="m-2 w-1/6" variant="outline">
                    {length}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Unit</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={length}
                    onValueChange={setLength}
                  >
                    <DropdownMenuRadioItem value="cm">cm</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="mm">mm</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <Input
                value={data.width}
                readOnly
                className="m-2  w-1/6 border border-gray-300"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="m-2 w-1/6" variant="outline">
                    {width}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Unit</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={width}
                    onValueChange={setWidth}
                  >
                    <DropdownMenuRadioItem value="cm">cm</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="mm">mm</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <Input
                value={data.height}
                readOnly
                className="m-2 w-1/6 border border-gray-300"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="m-2 w-1/6" variant="outline">
                    {height}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Unit</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={height}
                    onValueChange={setHeight}
                  >
                    <DropdownMenuRadioItem value="cm">cm</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="mm">mm</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>Location Name</Label>
              <Input
                value={data.location_name}
                readOnly
                className="border border-gray-300"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
          <Button>Edit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
