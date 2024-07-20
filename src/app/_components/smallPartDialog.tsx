/* eslint-disable @next/next/no-img-element */
import { Button } from "~/components/ui/button";
import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
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

export function SmallPartDialog(props: { data: Part; index: number }) {
  const { index, data } = props;
  const [length, setLength] = React.useState(data.length_unit);
  const [width, setWidth] = React.useState(data.width_unit);
  const [height, setHeight] = React.useState(data.height_unit);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex flex-col border-b border-gray-700 px-5 py-4 text-white">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-base font-semibold">ID</p>
            <div className="flex items-center gap-2">{index}</div>
          </div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-400">Name</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-200">{data.name}</span>
            </div>
          </div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-400">Condition</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-200">{data.condition}</span>
            </div>
          </div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-400">Quantity</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-200">{data.quantity}</span>
            </div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="h-auto max-h-[90vh] overflow-auto lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-large">Test</DialogTitle>
          <DialogDescription>
            Anyone who has this link will be able to view this.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {data.images && data.images.length > 0 && (
            <div className="flex justify-center">
              <Carousel
                className="w-full max-w-xs"
                plugins={[
                  Autoplay({
                    delay: 5000,
                  }),
                ]}
              >
                <CarouselContent>
                  {data.images.map((image: string, index: number) => (
                    <CarouselItem key={index} className="p-0">
                      <img
                        src={image}
                        className="h-full w-full object-cover"
                        alt="Machinery Images"
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
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
            <div className="flex-1">
              <Label>Dimensions (L x W x H)</Label>
              <div className="flex flex-row">
                <div className="m-2 flex items-center gap-2">
                  <Input
                    value={data.length}
                    readOnly
                    className=" border border-gray-300"
                  />

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="w-1/6" variant="outline">
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
                        <DropdownMenuRadioItem value="cm">
                          cm
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="mm">
                          mm
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="m-2 flex  items-center gap-2">
                  <Input
                    value={data.width}
                    readOnly
                    className="border border-gray-300"
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className=" w-1/6" variant="outline">
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
                        <DropdownMenuRadioItem value="cm">
                          cm
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="mm">
                          mm
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="m-2  flex items-center gap-2">
                  <Input
                    value={data.height}
                    readOnly
                    className="border border-gray-300"
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className=" w-1/6" variant="outline">
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
                        <DropdownMenuRadioItem value="cm">
                          cm
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="mm">
                          mm
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
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
