/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

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
import { type Machinery } from "~/server/types/IMachinery";

export function SmallMachineryDialog(props: {
  data: Machinery;
  index: number;
}) {
  const { index, data } = props;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex flex-col border-b border-gray-700 px-5 py-4 text-white">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-base font-semibold">ID</p>
            <div className="flex items-center gap-2">{index}</div>
          </div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-400">Brand</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-200">{data.brand}</span>
            </div>
          </div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-400">Model</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-200">{data.model}</span>
            </div>
          </div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-400">Serial Number</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-200">
                {data.serial_number}
              </span>
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
              <Label>Machine ID</Label>
              <Input
                value={data.machine_id}
                readOnly
                className="border border-gray-300"
              />
            </div>
            <div className="flex-1">
              <Label>Brand</Label>
              <Input
                value={data.brand}
                readOnly
                className="border border-gray-300"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>Model</Label>
              <Input
                value={data.model}
                readOnly
                className="border border-gray-300"
              />
            </div>
            <div className="flex-1">
              <Label>Year</Label>
              <Input
                value={data.year}
                readOnly
                className="border border-gray-300"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>Serial Number</Label>
              <Input
                value={data.serial_number}
                readOnly
                className="border border-gray-300"
              />
            </div>
            <div className="flex-1">
              <Label>Acquisition Date</Label>
              <Input
                value={data.acquisition_date.toLocaleDateString()}
                readOnly
                className="border border-gray-300"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>Observations</Label>
              <Input
                value={data.observations ?? "N/A"}
                readOnly
                className="border border-gray-300"
              />
            </div>
            <div className="flex-1">
              <Label>Created At</Label>
              <Input
                value={data.created_at.toLocaleDateString()}
                readOnly
                className="border border-gray-300"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>State</Label>
              <Input
                value={data.state}
                readOnly
                className="border border-gray-300"
              />
            </div>
            <div className="flex-1">
              <Label>Location Name</Label>
              <Input
                value={data.location_name}
                readOnly
                className="border border-gray-300"
              />
            </div>
          </div>

          {data.sold_price !== null && (
            <>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label>Sold Price</Label>
                  <Input
                    value={data.sold_price}
                    readOnly
                    className="border border-gray-300"
                  />
                </div>

                <div className="flex-1">
                  <Label>Sold To</Label>
                  <Input
                    value={data.sold_to ?? "N/A"}
                    readOnly
                    className="border border-gray-300"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label>Sold Date</Label>
                  <Input
                    value={
                      data.sold_date
                        ? data.sold_date.toLocaleDateString()
                        : "N/A"
                    }
                    readOnly
                    className="border border-gray-300"
                  />
                </div>
              </div>
            </>
          )}
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
