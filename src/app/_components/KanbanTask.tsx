import { Card } from "@nextui-org/react";
import { Button } from "~/components/ui/button";

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

export default function KanbanTask(props: {
  title: string;
  description: string;
}) {
  return (
    <Card className="hover:shadow-outline  p-4 transition-shadow duration-150 ease-in-out hover:z-10">
      <Dialog>
        <DialogTrigger asChild>
          <div className="cursor-pointer" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold">{props.title}</h3>
            <p>{props.description}</p>
          </div>
        </DialogTrigger>
        <DialogContent className="h-auto max-h-[90vh] overflow-auto lg:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{props.title}</DialogTitle>
            <DialogDescription>{props.description}</DialogDescription>
          </DialogHeader>
          <p>This is additional content inside the dialog.</p>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
