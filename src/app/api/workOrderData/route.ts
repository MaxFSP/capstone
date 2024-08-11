import { NextResponse } from "next/server";
import { getColumnTasksByWorkOrderId } from "~/server/queries/columnsWorkOrder/queries";
import { getWorkOrderBySessionId } from "~/server/queries/workOrder/queries";
import { getTasksByColumnId } from "~/server/queries/columnTasks/queries";
import { getEmployees } from "~/server/queries/employee/queries";
import { getTools } from "~/server/queries/tool/queries";
import { getParts } from "~/server/queries/part/queries";
import { type TasksOnColumns } from "~/server/types/ITasks";
import { type Column } from "~/server/types/IColumns";
import { type Task } from "~/server/types/ITasks";

export async function GET() {
  try {
    const workOrder = await getWorkOrderBySessionId();
    const tasksOnColumns: TasksOnColumns = {};
    let columnsWorkOrder: Column[] = [];
    const employees = await getEmployees();
    const tools = await getTools();
    const parts = await getParts();

    if (workOrder) {
      columnsWorkOrder = await getColumnTasksByWorkOrderId(workOrder.order_id);
      columnsWorkOrder = columnsWorkOrder.filter(
        (column) => column.state !== 0,
      );
      columnsWorkOrder.sort((a, b) => a.position - b.position);

      if (columnsWorkOrder.length > 0) {
        columnsWorkOrder.forEach((column) => {
          tasksOnColumns[column.title] = [];
        });

        const columnIds = columnsWorkOrder.map((column) => column.column_id);
        const columnTasks = await getTasksByColumnId(columnIds);

        columnTasks.forEach((task) => {
          const column = columnsWorkOrder.find(
            (col) => col.column_id === task.column_id,
          );
          if (column && task.state === 1) {
            tasksOnColumns[column.title]!.push(task as Task);
          }
        });

        // Ordenar las tareas por posición en la columna
        Object.keys(tasksOnColumns).forEach((key) => {
          if (tasksOnColumns[key]) {
            tasksOnColumns[key] = tasksOnColumns[key]!.sort(
              (a, b) => a.position - b.position,
            );
          }
        });
      }
    }

    return NextResponse.json({
      workOrder,
      tasksOnColumns,
      columnsWorkOrder,
      employees,
      tools,
      parts,
    });
  } catch (error) {
    console.error("Error fetching work order data:", error);
    return NextResponse.error();
  }
}
