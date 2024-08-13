import { getFullName } from "~/server/queries/queries";
import HomeView from "./_components/homeView";
import { getWorkOrderBySessionId } from "~/server/queries/workOrder/queries";
import { getColumnTasksByWorkOrderId } from "~/server/queries/columnsWorkOrder/queries";
import {
  getMachineryById,
  totalMachines,
} from "~/server/queries/machinery/queries";
import { getTasksByColumnId } from "~/server/queries/columnTasks/queries";
import { getEmployees } from "~/server/queries/employee/queries";
import { totalTools } from "~/server/queries/tool/queries";
import { totalParts } from "~/server/queries/part/queries";
import { type Task } from "~/server/types/ITasks";
import { type Employee } from "~/server/types/IEmployee";
import { type Column } from "~/server/types/IColumns";

export default async function HomePage() {
  const user = await getFullName();
  const workOrder = await getWorkOrderBySessionId();

  const enabledWorkOrders = workOrder.filter(
    (workOrders) => workOrders.state === 1,
  );

  const currentWorkOrder = enabledWorkOrders[0];

  const userName = user;
  let machineName = "";
  let machineSerial = "";
  let workOrderDescription = "";
  let totalOngoingTasks = 0;
  let completedTasks = 0;
  let latestTasks: Task[] = [];
  const keyMetrics = {
    totalMachines: 0,
    totalParts: 0,
    totalTool: 0,
  };
  let employees: Employee[] = [];
  let columns: Column[] = [];

  if (currentWorkOrder) {
    const machine = await getMachineryById(currentWorkOrder.machine_id);
    if (machine) {
      machineName = `${machine.brand} ${machine.model}`;
      machineSerial = machine.serial_number;
      workOrderDescription = currentWorkOrder.observations ?? "";
      columns = await getColumnTasksByWorkOrderId(currentWorkOrder.order_id);
      if (columns) {
        const columnIds = columns.map((column) => column.column_id);
        const tasks = await getTasksByColumnId(columnIds);

        const totalTasks = tasks.length;
        if (totalTasks > 1) {
          const sortedColumns = columns.sort((a, b) => a.position - b.position);
          const lastColumn = sortedColumns[sortedColumns.length - 1];
          if (lastColumn) {
            const tasksInLastColumn = tasks
              .filter((task) => task.column_id === lastColumn.column_id)
              .map((task) => ({
                ...task,
                description: task.description ?? "",
              }));
            completedTasks = tasksInLastColumn.length;
            totalOngoingTasks = totalTasks - completedTasks;
            latestTasks = tasks
              .filter((task) => task.state === 1)
              .map((task) => ({
                ...task,
                description: task.description ?? "",
              }))
              .sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime(),
              )
              .slice(0, 10);
          }
        }
        employees = await getEmployees();
        keyMetrics.totalMachines = await totalMachines();
        keyMetrics.totalParts = await totalParts();
        keyMetrics.totalTool = await totalTools();
      }
    }
  } else {
    return <HomeView currentWorkOrder={false} userName={user} />;
  }

  return (
    <HomeView
      currentWorkOrder={true}
      userName={userName}
      machineName={machineName}
      machineSerial={machineSerial}
      workOrderDescription={workOrderDescription}
      totalOngoingTasks={totalOngoingTasks}
      completedTasks={completedTasks}
      latestTasks={latestTasks}
      keyMetrics={keyMetrics}
      employees={employees}
      columns={columns}
    />
  );
}
