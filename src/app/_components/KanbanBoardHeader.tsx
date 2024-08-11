"use client";
import { Button } from "~/components/ui/button";
import { type WorkOrders } from "~/server/types/IOrders";
import { useRouter } from "next/navigation";

export default function KanbanBoardHeader(props: {
  workOrder: WorkOrders;
  triggerRefresh: () => void;
}) {
  const { workOrder, triggerRefresh } = props;
  const router = useRouter();

  return (
    <div className="flex flex-row items-center justify-between">
      <h1 className="mb-4 text-2xl font-bold">
        {workOrder.name + " - " + workOrder.order_id}
      </h1>
      <Button
        onClick={() => {
          triggerRefresh(); // Trigger the refresh in DashboardPage
          router.refresh(); // Optional: Keep this if you want to re-fetch data
        }}
      >
        Update page
      </Button>
    </div>
  );
}
