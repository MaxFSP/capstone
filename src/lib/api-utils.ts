/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { toast } from '~/components/hooks/use-toast';

type DeleteEntityParams = {
  endpoint: string;
  entityId: string | number;
  entityName: string;
  onSuccess?: () => void;
};

export async function deleteEntity({
  endpoint,
  entityId,
  entityName,
  onSuccess,
}: DeleteEntityParams) {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ [`${entityName}_id`]: entityId }),
    });

    if (response.ok) {
      toast({
        title: 'Success',
        description: `${entityName} deleted successfully.`,
      });
      if (onSuccess) onSuccess();
    } else {
      const data = await response.json();
      throw new Error(data.error || `Failed to delete ${entityName}.`);
    }
  } catch (error) {
    console.error(`Error deleting ${entityName}:`, error);
    let errorMessage = 'An unknown error occurred.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive',
    });
    throw error;
  }
}
