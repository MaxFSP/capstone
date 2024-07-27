import { Button } from "~/components/ui/button";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "~/components/ui/alert-dialog";
import { type DeleteImage } from "~/server/types/IImages";
import { useRouter } from "next/navigation";

export default function DeleteImageDialog(props: { imageInfo: DeleteImage }) {
  const { imageInfo } = props;
  const router = useRouter();

  const handleDelete = async () => {
    try {
      const response = await fetch("/api/deleteImage", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(imageInfo),
      });
      if (response.ok) {
        router.refresh();
      } else {
        // console.error("Failed to update tool:", result.error);
      }
    } catch (error) {
      console.error("Error updating tool:", error);
    }
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild key={imageInfo.image_id} className="mt-4">
        <Button variant="destructive">Delete</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="h-auto max-h-[90vh] overflow-auto lg:max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-large">
            Delete Image
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this image?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex justify-end sm:justify-start">
          <AlertDialogCancel asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild onClick={handleDelete}>
            <Button variant="destructive">Delete</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
