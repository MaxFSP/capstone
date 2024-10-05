// lib/dataFetchers.ts
import 'server-only';

import { db } from '../../db';
import {
  workOrders,
  workTasks,
  employees,
  machineryStock,
  toolStock,
  partStock,
  partsInTasks,
  toolsInTasks,
} from '~/server/db/schema';
import { sql, eq } from 'drizzle-orm';

// Helper functions
function mapWorkOrderState(state: number): string {
  switch (state) {
    case 0:
      return 'Not Started';
    case 1:
      return 'In Progress';
    case 2:
      return 'Completed';
    case 3:
      return 'Delayed';
    default:
      return 'Unknown';
  }
}

function mapTaskState(state: number): string {
  switch (state) {
    case 0:
      return 'Not Started';
    case 1:
      return 'In Progress';
    case 2:
      return 'Completed';
    case 3:
      return 'Delayed';
    default:
      return 'Unknown';
  }
}

// 1. Work Order Status Overview
export async function fetchWorkOrderStatusData() {
  const data = await db
    .select({
      state: workOrders.state,
      count: sql<number>`COUNT(*)`,
    })
    .from(workOrders)
    .groupBy(workOrders.state);
  const val = data.map((item) => ({
    name: mapWorkOrderState(item.state),
    value: Number(item.count),
  }));
  return data.map((item) => ({
    name: mapWorkOrderState(item.state),
    value: Number(item.count),
  }));
}

// 2. Employee Workload Distribution
export async function fetchEmployeeWorkloadData() {
  const data = await db
    .select({
      employeeId: employees.employee_id,
      firstName: employees.firstName,
      lastName: employees.lastName,
      taskCount: sql<number>`COUNT(${workTasks.task_id})`,
    })
    .from(employees)
    .leftJoin(workTasks, eq(workTasks.assigned_to, employees.employee_id))
    .groupBy(employees.employee_id, employees.firstName, employees.lastName);

  return data.map((item) => ({
    name: `${item.firstName} ${item.lastName}`,
    tasks: Number(item.taskCount),
  }));
}

// 3. Task Completion Rate Over Time
export async function fetchTaskCompletionData() {
  const data = await db
    .select({
      date: sql<Date>`DATE(${workTasks.end_date})`,
      count: sql<number>`COUNT(*)`,
    })
    .from(workTasks)
    .where(eq(workTasks.state, 2)) // Correct usage
    .groupBy(sql`DATE(${workTasks.end_date})`)
    .orderBy(sql`DATE(${workTasks.end_date})`);

  return data.map((item) => ({
    date: item.date,
    count: Number(item.count),
  }));
}

// 4. Average Task Completion Time by Employee
export async function fetchAverageCompletionTimeData() {
  const data = await db
    .select({
      employeeId: employees.employee_id,
      firstName: employees.firstName,
      lastName: employees.lastName,
      averageTime: sql<number>`AVG(EXTRACT(EPOCH FROM (${workTasks.end_date} - ${workTasks.start_date})))`,
    })
    .from(employees)
    .leftJoin(workTasks, eq(workTasks.assigned_to, employees.employee_id))
    .where(eq(workTasks.state, 2)) // Correct usage
    .groupBy(employees.employee_id, employees.firstName, employees.lastName);

  return data.map((item) => ({
    name: `${item.firstName} ${item.lastName}`,
    averageTime: Number(item.averageTime) / 3600, // Convert seconds to hours
  }));
}

// 5. Task Priority Distribution
export async function fetchTaskPriorityData() {
  const data = await db
    .select({
      priority: workTasks.priority,
      count: sql<number>`COUNT(*)`,
    })
    .from(workTasks)
    .groupBy(workTasks.priority);

  return data.map((item) => ({
    name: item.priority,
    value: Number(item.count),
  }));
}

// 6. Upcoming Deadlines and Overdue Tasks
// This will require additional implementation, possibly for a Gantt Chart.

// 7. Employee Performance Metrics Dashboard
// This would be a combination of several metrics, possibly aggregated in the front-end.

// 8. Machinery Maintenance Status
export async function fetchMachineryStatusData() {
  const data = await db
    .select({
      state: machineryStock.state,
      count: sql<number>`COUNT(*)`,
    })
    .from(machineryStock)
    .groupBy(machineryStock.state);

  return data.map((item) => ({
    name: item.state,
    value: Number(item.count),
  }));
}

// 9. Tool and Part Usage Frequency
export async function fetchToolUsageData() {
  const data = await db
    .select({
      toolId: toolStock.tool_id,
      toolName: toolStock.name,
      usageCount: sql<number>`COUNT(${toolsInTasks.tool_id})`,
    })
    .from(toolStock)
    .leftJoin(toolsInTasks, eq(toolsInTasks.tool_id, toolStock.tool_id))
    .groupBy(toolStock.tool_id, toolStock.name);

  return data.map((item) => ({
    name: item.toolName,
    usage: Number(item.usageCount),
  }));
}

export async function fetchPartUsageData() {
  const data = await db
    .select({
      partId: partStock.part_id,
      partName: partStock.name,
      usageCount: sql<number>`COUNT(${partsInTasks.part_id})`,
    })
    .from(partStock)
    .leftJoin(partsInTasks, eq(partsInTasks.part_id, partStock.part_id))
    .groupBy(partStock.part_id, partStock.name);

  return data.map((item) => ({
    name: item.partName,
    usage: Number(item.usageCount),
  }));
}

// 10. Inventory Stock Levels Over Time
// This would require historical data tracking, which may not be available.

// Continue adding data fetching functions for other charts as needed.
