import KanbanBoard from "../_components/KanbanBoard";
import { getWorkOrderBySessionId } from "~/server/queries/workOrder/queries";

export default async function DashboardPage() {
  const workOrder = await getWorkOrderBySessionId();
  return (
    <div>
      {workOrder ? (
        <div className="p-4">
          <h1 className="mb-4 text-2xl font-bold">Kanban Board</h1>
          <KanbanBoard />
        </div>
      ) : (
        <div className="flex h-screen w-screen flex-col items-center justify-center">
          <h1 className="w-full text-center text-2xl font-bold">
            No work order found
          </h1>
          <p className="w-full overflow-ellipsis text-center">
            Sit back and relax, we will create a work order for you
          </p>
        </div>
      )}
    </div>
  );
}
