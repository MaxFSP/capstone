'use client';

import { useState, useEffect } from 'react';
import KanbanBoardHeader from './KanbanBoardHeader';
import KanbanBoard from './KanbanBoard';
import ListBoard from './ListBoard';
import { type RegularWorkOrder } from '~/server/types/IOrders';
import { type TasksOnColumns } from '~/server/types/ITasks';
import { type Employee } from '~/server/types/IEmployee';
import { type Tool } from '~/server/types/ITool';
import { type Part } from '~/server/types/IPart';

// Define the ColumnType interface
interface ColumnType {
  state: number;
  order_id: number;
  title: string;
  position: number;
  column_id: number;
}

// Define the DashboardData interface
interface DashboardData {
  workOrder: RegularWorkOrder | undefined;
  tasksOnColumns: TasksOnColumns;
  columnsWorkOrder: ColumnType[];
  employees: Employee[];
  tools: Tool[];
  parts: Part[];
}

export default function DashboardView() {
  const [workOrder, setWorkOrder] = useState<RegularWorkOrder | undefined>(undefined);
  const [tasksOnColumns, setTasksOnColumns] = useState<TasksOnColumns>({});
  const [columnsWorkOrder, setColumnsWorkOrder] = useState<ColumnType[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [boardType, setBoardType] = useState('kanban');

  // Inside DashboardView
  async function fetchData() {
    try {
      const response = await fetch('/api/dashboard-data');
      const data = (await response.json()) as DashboardData;

      // Convert date strings to Date objects
      Object.keys(data.tasksOnColumns).forEach((columnTitle) => {
        data.tasksOnColumns[columnTitle] = data.tasksOnColumns[columnTitle]!.map((task) => ({
          ...task,
          start_date: task.start_date ? new Date(task.start_date) : new Date(),
          end_date: task.end_date ? new Date(task.end_date) : new Date(),
        }));
      });

      setWorkOrder(data.workOrder);
      setTasksOnColumns(data.tasksOnColumns);
      setColumnsWorkOrder(data.columnsWorkOrder);
      setEmployees(data.employees);
      setTools(data.tools);
      setParts(data.parts);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  }

  useEffect(() => {
    void fetchData();
  }, []);

  return (
    <div className="min-h-screen p-4 flex flex-col">
      {workOrder ? (
        <div className="rounded-lg shadow-md flex flex-col flex-grow">
          <KanbanBoardHeader
            key={`${workOrder.order_id}`}
            workOrder={workOrder}
            tasksOnColumns={tasksOnColumns}
            columnsWorkOrder={columnsWorkOrder}
            fetchData={fetchData}
          />
          {boardType === 'kanban' ? (
            <KanbanBoard
              key={`${workOrder.order_id}`}
              workOrder={workOrder}
              tasksOnColumns={tasksOnColumns}
              allColumns={columnsWorkOrder}
              employees={employees}
              tools={tools}
              parts={parts}
              fetchData={fetchData}
            />
          ) : (
            <ListBoard
              key={`${workOrder.order_id}`}
              workOrder={workOrder}
              tasksOnColumns={tasksOnColumns}
              allColumns={columnsWorkOrder}
              employees={employees}
              tools={tools}
              parts={parts}
              fetchData={fetchData}
            />
          )}
        </div>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center rounded-lg p-6 shadow-md">
          <h1 className="mb-4 text-center text-3xl font-extrabold text-primary">
            No Work Order Found
          </h1>
          <p className="w-full max-w-lg text-center text-lg text-muted-foreground">
            Sit back and relax, we will create a work order for you soon.
          </p>
        </div>
      )}
    </div>
  );
}
