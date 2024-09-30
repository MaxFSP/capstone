/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
'use client';

import { useState } from 'react';
export const dynamic = 'force-dynamic';
import { type WorkOrders } from '~/server/types/IOrders';
import { type TasksOnColumns } from '~/server/types/ITasks';
import { type Column } from '~/server/types/IColumns';
import { type Employee } from '~/server/types/IEmployee';
import { type Tool } from '~/server/types/ITool';
import { type Part } from '~/server/types/IPart';
import KanbanBoard from './KanbanBoard';
import ListBoard from './ListBoard';

function WorkOrderView(props: {
  workOrder: WorkOrders;
  tasksOnColumns: TasksOnColumns;
  allColumns: Column[];
  employees: Employee[];
  tools: Tool[];
  parts: Part[];
  triggerRefresh: () => void;
}) {
  const [boardType, setType] = useState('list');
  return boardType === 'kanban' ? <KanbanBoard {...props} /> : <ListBoard {...props} />;
}

export default WorkOrderView;
