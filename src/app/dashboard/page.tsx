import { getColumnTasksByWorkOrderId } from '~/server/queries/columnsWorkOrder/queries';
import { getWorkOrderBySessionId } from '~/server/queries/workOrder/queries';
import { type Task, type TasksOnColumns } from '~/server/types/ITasks';
import { getTasksByColumnId } from '~/server/queries/columnTasks/queries';
import { type Column } from '~/server/types/IColumns';
import { getEmployees } from '~/server/queries/employee/queries';
import { getTools } from '~/server/queries/tool/queries';
import { getParts } from '~/server/queries/part/queries';
import DashboardView from '../_components/dashboardView';
import { type Employee } from '~/server/types/IEmployee';
import { type RegularWorkOrder } from '~/server/types/IOrders';

export default async function DashboardPage() {
  const workOrder: RegularWorkOrder[] = await getWorkOrderBySessionId();
  const tasksOnColumns: TasksOnColumns = {};
  let columnsWorkOrder: Column[] = [];
  const employees: Employee[] = await getEmployees();
  const tools = await getTools();
  const parts = await getParts();

  // check what work order state is 1 its an array of workOrders now
  const enabledWorkOrders = workOrder.filter((workOrders) => workOrders.state === 1);

  // HERE CHECK IF THERE IS MULTIPLE AND THEN MAYBE DO SOMETHING ABOUT IT
  let currentWorkOrder = enabledWorkOrders[0];

  if (currentWorkOrder) {
    if (currentWorkOrder.state === 1) {
      columnsWorkOrder = await getColumnTasksByWorkOrderId(currentWorkOrder.order_id);
      columnsWorkOrder = columnsWorkOrder.filter((column) => column.state !== 0);
      columnsWorkOrder.sort((a, b) => a.position - b.position);

      if (columnsWorkOrder.length > 0) {
        columnsWorkOrder.forEach((column) => {
          tasksOnColumns[column.title] = [];
        });

        const columnIds = columnsWorkOrder.map((column) => column.column_id);

        const columnTasks = await getTasksByColumnId(columnIds);

        columnTasks.forEach((task) => {
          const column = columnsWorkOrder.find((col) => col.column_id === task.column_id);
          if (column) {
            if (task.state === 1) {
              const columnTitle = column.title;
              tasksOnColumns[columnTitle]!.push(task as Task);
            }
          }
        });

        // Sort the tasks by position in the column
        Object.keys(tasksOnColumns).forEach((key) => {
          if (tasksOnColumns[key]) {
            tasksOnColumns[key] = tasksOnColumns[key]!.sort((a, b) => a.position - b.position);
          }
        });
      }
    } else {
      currentWorkOrder = undefined;
    }
  }

  return (
    <DashboardView
      workOrder={currentWorkOrder}
      tasksOnColumns={tasksOnColumns}
      columnsWorkOrder={columnsWorkOrder}
      employees={employees}
      tools={tools}
      parts={parts}
    />
  );
}
