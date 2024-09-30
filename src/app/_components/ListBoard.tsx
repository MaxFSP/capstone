'use client';

import { useState, useEffect, type ChangeEvent } from 'react';
export const dynamic = 'force-dynamic';

import { Input } from '~/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '~/components/ui/select';

import { type RegularWorkOrder } from '~/server/types/IOrders';
import { type TasksOnColumns, type Task } from '~/server/types/ITasks';
import { type Column } from '~/server/types/IColumns';
import { type Employee } from '~/server/types/IEmployee';
import { type Tool } from '~/server/types/ITool';
import { type Part } from '~/server/types/IPart';

import KanbanTask from './KanbanTask';

function ListBoard(props: {
  workOrder: RegularWorkOrder;
  tasksOnColumns: TasksOnColumns;
  allColumns: Column[];
  employees: Employee[];
  tools: Tool[];
  parts: Part[];
  triggerRefresh: () => void;
}) {
  const { tasksOnColumns, allColumns, employees, tools, parts, triggerRefresh } = props;

  // Define a type for tasks with columnName
  type TaskWithColumnName = Task & { columnName: string };

  const [tasks, setTasks] = useState<TaskWithColumnName[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TaskWithColumnName[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedColumn, setSelectedColumn] = useState('all');
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    // Flatten tasks from columns
    const allTasks: TaskWithColumnName[] = [];
    for (const columnName in tasksOnColumns) {
      const columnTasks = tasksOnColumns[columnName];
      if (columnTasks) {
        for (const task of columnTasks) {
          allTasks.push({
            ...task,
            columnName: columnName,
          });
        }
      } else {
        console.log('columnTasks is undefined');
      }
    }
    setTasks(allTasks);
    setFilteredTasks(allTasks);
  }, [tasksOnColumns]);

  useEffect(() => {
    // Apply filters
    let filtered = tasks;

    if (searchTerm.trim() !== '') {
      filtered = filtered.filter((task) =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedEmployee !== 'all') {
      filtered = filtered.filter((task) => task.assigned_to === parseInt(selectedEmployee));
    }

    if (selectedPriority !== 'all') {
      filtered = filtered.filter((task) => task.priority === selectedPriority);
    }

    if (selectedColumn !== 'all') {
      filtered = filtered.filter((task) => task.columnName === selectedColumn);
    }

    setFilteredTasks(filtered);
  }, [searchTerm, selectedEmployee, selectedPriority, selectedColumn, tasks]);

  // Pagination logic
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);

  const paginatedTasks = filteredTasks.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  // Helper function to get column_id by columnName
  const getColumnIdByName = (name: string): number => {
    const column = allColumns.find((col) => col.title === name);
    return column ? column.column_id : 0;
  };

  return (
    <div className="px-4 pb-2 pt-0">
      {/* Filters */}
      <div className="rounded-lg px-4 py-4 shadow-lg md:flex md:items-center md:space-x-4">
        {/* Search Input */}
        <Input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="mb-2 w-full rounded-md border border-border bg-background p-2 text-foreground md:mb-0 md:flex-1"
        />

        {/* Employee Filter */}
        <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
          <SelectTrigger className="w-full sm:w-auto flex-grow">
            <SelectValue placeholder="Filter by employee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Employees</SelectItem>
            {employees.map((employee) => (
              <SelectItem key={employee.employee_id} value={employee.employee_id.toString()}>
                {`${employee.firstName} ${employee.lastName}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
          <SelectTrigger className="w-full sm:w-auto flex-grow">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
          </SelectContent>
        </Select>

        {/* Column Filter */}
        <Select value={selectedColumn} onValueChange={setSelectedColumn}>
          <SelectTrigger className="w-full sm:w-auto flex-grow">
            <SelectValue placeholder="Filter by column" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Columns</SelectItem>
            {allColumns.map((column) => (
              <SelectItem key={column.column_id} value={column.title}>
                {column.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="hidden rounded-lg bg-background p-4 shadow-lg md:block">
        <table className="w-full table-auto rounded-lg border border-border shadow-md">
          <thead className="bg-primary text-primary-foreground">
            <tr>
              <th className="border-b border-border px-5 py-3 text-left">
                <p className="text-s text-[11px] font-bold uppercase">ID</p>
              </th>
              <th className="border-b border-border px-5 py-3 text-left">
                <p className="text-s text-[11px] font-bold uppercase">Task Name</p>
              </th>
              <th className="border-b border-border px-5 py-3 text-left">
                <p className="text-s text-[11px] font-bold uppercase">Column</p>
              </th>
              <th className="border-b border-border px-5 py-3 text-left">
                <p className="text-s text-[11px] font-bold uppercase">Priority</p>
              </th>
              <th className="border-b border-border px-5 py-3 text-left">
                <p className="text-s text-[11px] font-bold uppercase">Assigned Employee</p>
              </th>
              <th className="border-b border-border px-5 py-3 text-left">
                <p className="text-s text-[11px] font-bold uppercase">Due Date</p>
              </th>
              <th className="border-b border-border px-5 py-3 text-left"></th>
            </tr>
          </thead>
          <tbody className="bg-card">
            {paginatedTasks.map((task, index) => {
              const rowBgColor = index % 2 === 0 ? 'bg-card' : 'bg-muted';
              const className = `py-3 px-5 ${
                index === paginatedTasks.length - 1 ? '' : 'border-b border-border'
              } text-card-foreground ${rowBgColor}`;

              const employee = employees.find((e) => e.employee_id === task.assigned_to);
              const employeeName = employee
                ? `${employee.firstName} ${employee.lastName}`
                : 'Unassigned';

              return (
                <tr key={task.task_id}>
                  <td className={className}>{currentPage * itemsPerPage + index + 1}</td>
                  <td className={className}>{task.title}</td>
                  <td className={className}>{task.columnName}</td>
                  <td className={className}>{task.priority}</td>
                  <td className={className}>{employeeName}</td>
                  <td className={className}>
                    {task.end_date ? new Date(task.end_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className={className}>
                    {/* KanbanTask Component */}
                    <KanbanTask
                      key={`${task.task_id}-KanbanTask`}
                      task={task}
                      employees={employees}
                      column_id={getColumnIdByName(task.columnName)}
                      tools={tools}
                      parts={parts}
                      onGone={() => {
                        const newTasks = tasks.filter((t) => t.task_id !== task.task_id);
                        setTasks(newTasks);
                      }}
                      triggerRefresh={triggerRefresh}
                      type="list"
                    />
                  </td>
                </tr>
              );
            })}
            {paginatedTasks.length === 0 && (
              <tr>
                <td className="px-4 py-2 border-b text-center" colSpan={7}>
                  No tasks found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between px-4 py-2">
        <div></div>
        <div className="flex items-center">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className={`rounded px-4 py-2 ${
              currentPage === 0
                ? 'cursor-not-allowed bg-muted text-muted-foreground'
                : 'bg-primary text-primary-foreground'
            }`}
          >
            ⮜
          </button>
          <span className="ml-2 mr-2 text-sm font-medium text-foreground">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={(currentPage + 1) * itemsPerPage >= filteredTasks.length}
            className={`rounded px-4 py-2 ${
              (currentPage + 1) * itemsPerPage >= filteredTasks.length
                ? 'cursor-not-allowed bg-muted text-muted-foreground'
                : 'bg-primary text-primary-foreground'
            }`}
          >
            ➤
          </button>
        </div>
        <div></div>
      </div>
    </div>
  );
}

export default ListBoard;
