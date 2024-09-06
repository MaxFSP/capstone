import { type Part } from "./IPart";
import { type Tool } from "./ITool";

export interface Task {
  task_id: number;
  title: string;
  description: string;
  position: number;
  start_date: Date;
  end_date: Date;
  column_id: number;
  assigned_to: number;
  priority: string;
  state: number;
}

export interface MovingTask {
  task_id: number;
  new_column_id: number;
  new_position: number;
}

export interface CreateTask {
  title: string;
  description: string;
  position: number;
  start_date: Date;
  end_date: Date;
  column_id: number;
  assigned_to: number;
  priority: string; // 0 = low, 1 = medium, 2 = high
}

export type TasksOnColumns = Record<string, Task[]>;

export interface ToolInTask {
  task_id: number;
  tool_id: number;
}

export interface PartInTask {
  task_id: number;
  part_id: number;
}

export interface ToolsAndParts {
  task_id: number;
  tools: number[];
  parts: number[];
}

export interface taskWithToolsAndParts {
  task: Task;
  toolsInTask: Tool[];
  partsInTask: Part[];
}
