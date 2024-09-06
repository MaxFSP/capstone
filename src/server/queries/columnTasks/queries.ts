import "server-only";

//DB stuff
import { db } from "../../db";
import { partsInTasks, toolsInTasks, workTasks } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { type Task } from "~/server/types/ITasks";

export async function getTasksByColumnId(columnIds: number[]) {
  if (columnIds.length === 0) return [];
  const tasks = await db.query.workTasks.findMany({
    where: (workTasks, { inArray }) => inArray(workTasks.column_id, columnIds),
  });

  return tasks;
}

export async function createTask(
  title: string,
  description: string,
  position: number,
  start_date: Date,
  end_date: Date,
  column_id: number,
  assigned_to: number,
  priority: string,
) {
  const newTask = await db
    .insert(workTasks)
    .values({
      title: title,
      description: description,
      position: position,
      start_date: start_date,
      end_date: end_date,
      column_id: column_id,
      assigned_to: assigned_to,
      priority: priority,
      state: 1,
    })
    .returning();
  return newTask;
}

export async function updateTask(
  task_id: number,
  title: string,
  description: string,
  position: number,
  start_date: Date,
  end_date: Date,
  column_id: number,
  assigned_to: number,
  priority: string,
  state: number,
) {
  const updatedTask = await db
    .update(workTasks)
    .set({
      title: title,
      description: description,
      position: position,
      start_date: start_date,
      end_date: end_date,
      column_id: column_id,
      assigned_to: assigned_to,
      priority: priority,
      state: state,
    })
    .where(eq(workTasks.task_id, task_id))
    .returning();
  return updatedTask;
}

export async function addToolsToTask(task_id: number, tool_id: number) {
  const newToolInTask = await db
    .insert(toolsInTasks)
    .values({
      task_id: task_id,
      tool_id: tool_id,
    })
    .returning();
  return newToolInTask;
}

export async function addPartsToTask(task_id: number, part_id: number) {
  const newPartInTask = await db
    .insert(partsInTasks)
    .values({
      task_id: task_id,
      part_id: part_id,
    })
    .returning();
  return newPartInTask;
}

export async function getToolsInTask(task_id: number) {
  const tools = await db.query.toolsInTasks.findMany({
    where: (toolsInTasks, { eq }) => eq(toolsInTasks.task_id, task_id),
  });
  return tools;
}

export async function getPartsInTask(task_id: number) {
  const parts = await db.query.partsInTasks.findMany({
    where: (partsInTasks, { eq }) => eq(partsInTasks.task_id, task_id),
  });
  return parts;
}

export async function deleteTask(task_id: number) {
  const deleteTask = await db
    .update(workTasks)
    .set({
      state: 0,
    })
    .where(eq(workTasks.task_id, task_id))
    .returning();
  return deleteTask;
}

export async function doneTask(task_id: number) {
  const doneTask = await db
    .update(workTasks)
    .set({
      state: 2,
    })
    .where(eq(workTasks.task_id, task_id))
    .returning();
  return doneTask;
}

export async function moveTask(
  task_id: number,
  new_column_id: number,
  new_position: number,
) {
  const movedTask = await db
    .update(workTasks)
    .set({
      column_id: new_column_id,
      position: new_position,
    })
    .where(eq(workTasks.task_id, task_id))
    .returning();
  return movedTask;
}

export async function updateTaskPositions(tasks: Task[]) {
  for (const task of tasks) {
    await db
      .update(workTasks)
      .set({
        position: task.position,
      })
      .where(eq(workTasks.task_id, task.task_id))
      .returning();
  }
}

export async function deleteAllToolsInTask(task_id: number) {
  await db
    .delete(toolsInTasks)
    .where(eq(toolsInTasks.task_id, task_id))
    .returning();
}

export async function deleteAllPartsInTask(task_id: number) {
  const deleteParts = await db
    .delete(partsInTasks)
    .where(eq(partsInTasks.task_id, task_id))
    .returning();
}
