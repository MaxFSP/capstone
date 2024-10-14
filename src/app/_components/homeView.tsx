import { PercentageChart } from './percentageChart';
import { FaTasks, FaUser, FaUsers, FaChartLine, FaClipboardList } from 'react-icons/fa';
import { ScrollArea } from '~/components/ui/scroll-area';
import { type Task } from '~/server/types/ITasks';
import { type Employee } from '~/server/types/IEmployee';
import { type Column } from '~/server/types/IColumns';
import RedirectButton from './redirectButton';
import { getFullName } from '~/server/queries/queries';
import { getWorkOrderBySessionId } from '~/server/queries/workOrder/queries';
import { getColumnTasksByWorkOrderId } from '~/server/queries/columnsWorkOrder/queries';
import { getMachineryById, totalMachines } from '~/server/queries/machinery/queries';
import { getTasksByColumnId } from '~/server/queries/columnTasks/queries';
import { getEmployees } from '~/server/queries/employee/queries';
import { totalTools } from '~/server/queries/tool/queries';
import { totalParts } from '~/server/queries/part/queries';

export default async function HomeView() {
  const user = await getFullName();
  const workOrder = await getWorkOrderBySessionId();
  const userName = user;

  const enabledWorkOrders = workOrder.filter((workOrders) => workOrders.state === 1);
  const currentWorkOrder = enabledWorkOrders[0];

  let machineName = '';
  let machineSerial = '';
  let workOrderDescription = '';
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
      workOrderDescription = currentWorkOrder.observations ?? '';
      columns = await getColumnTasksByWorkOrderId(currentWorkOrder.order_id);
      if (columns) {
        const columnIds = columns.map((column) => column.column_id);
        const tasks = await getTasksByColumnId(columnIds);
        const totalTasks = tasks.length;
        if (totalTasks >= 1) {
          const sortedColumns = columns.sort((a, b) => a.position - b.position);
          const lastColumn = sortedColumns[sortedColumns.length - 1];
          if (lastColumn) {
            const tasksInLastColumn = tasks
              .filter((task) => task.column_id === lastColumn.column_id)
              .map((task) => ({
                ...task,
                description: task.description ?? '',
              }));
            completedTasks = tasksInLastColumn.length;
            totalOngoingTasks = totalTasks - completedTasks;

            latestTasks = tasks
              .filter((task) => task.state === 1)
              .map((task) => ({
                ...task,
                description: task.description ?? '',
                priority: task.priority as 'Low' | 'Medium' | 'High',
              }))
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 10);
          }
        }
        employees = (await getEmployees()).map((employee) => ({
          ...employee,
          bloodType: employee.bloodType,
        }));
        employees = employees.filter((employee) => employee.state === 1);
        keyMetrics.totalMachines = await totalMachines();
        keyMetrics.totalParts = await totalParts();
        keyMetrics.totalTool = await totalTools();
      }
    }
  }

  if (!currentWorkOrder) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-primary">Welcome back, {userName}!</h1>
          <div className="mt-8">
            <h2 className="text-3xl font-extrabold text-primary">No Current Work Order</h2>
            <p className="mt-4 text-lg">
              There are no ongoing work orders at the moment. Please check back later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const tasksWithEmployee = latestTasks.map((task) => {
    const employee = employees.find((employee) => employee.employee_id === task.assigned_to);
    return {
      ...task,
      assigned_to: employee?.firstName + ' ' + employee?.lastName,
    };
  });
  const tasksWithColumn = tasksWithEmployee.map((task) => {
    const column = columns.find((column) => column.column_id === task.column_id);
    return {
      ...task,
      column: column?.title,
    };
  });

  return (
    <div className="mt-4 flex flex-col gap-4 overflow-hidden bg-background text-foreground md:flex-row">
      <div className="space-y-6 p-4 md:w-1/2">
        <h1 className="mb-6 text-center text-4xl font-extrabold text-primary">
          WELCOME {userName} TO THE MANAGEMENT SYSTEM OF RUDAN MAQUINARIAS
        </h1>
        <div className="space-y-4 rounded-lg bg-muted p-6 shadow-md">
          <h2 className="flex items-center text-2xl font-bold text-foreground">
            <FaUser className="mr-2" /> Currently working on:
          </h2>
          <p className="text-lg text-foreground">
            {machineName} -{'  '}
            <span className="font-semibold">{machineSerial}</span>
          </p>
        </div>
        <div className="space-y-4 rounded-lg bg-primary p-6 shadow-md">
          <h2 className="text-2xl font-bold text-primary-foreground">
            General work order description:
          </h2>
          <p className="text-lg text-primary-foreground">{workOrderDescription}</p>
        </div>
        <div className="space-y-4 rounded-lg bg-muted p-6 shadow-md">
          <p className="text-lg text-foreground">
            You have a total of{' '}
            <span className="font-semibold text-primary">{totalOngoingTasks}</span> tasks ongoing
          </p>
          <p className="text-lg text-foreground">
            You have completed{' '}
            <span className="font-semibold text-destructive">{completedTasks}</span> tasks
          </p>
        </div>
        <div className="flex flex-grow flex-col space-y-4 rounded-lg bg-muted p-6 shadow-md">
          <h2 className="flex items-center text-2xl font-bold text-foreground">
            <FaTasks className="mr-2" /> Latest tasks added:
          </h2>
          <ScrollArea className="h-60 w-full flex-grow rounded-md border border-border p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {tasksWithColumn.map((task, index) => (
                <div key={index} className="rounded-lg bg-background p-4 shadow-md">
                  <p className="text-lg text-foreground">
                    <span className="font-semibold">Name:</span> {task.title}
                  </p>
                  <p className="text-lg text-foreground">
                    <span className="font-semibold">Start Date:</span>{' '}
                    {task.start_date.toDateString()}
                  </p>
                  <p className="text-lg text-foreground">
                    <span className="font-semibold">Employee in charge:</span> {task.assigned_to}
                  </p>
                  <p className="text-lg text-foreground">
                    <span className="font-semibold">Column:</span> {task.column}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
      <div className="flex flex-col justify-center space-y-4 p-4 md:w-1/2">
        <div className="flex flex-grow flex-col justify-between rounded-lg bg-muted p-6 shadow-md">
          <PercentageChart completedTasks={completedTasks} tasksOngoing={totalOngoingTasks} />
          <div className="mt-4 space-y-4">
            <div className="flex flex-col items-center justify-center rounded-lg bg-background p-4 shadow-md md:flex-row md:justify-between">
              <div className="mb-4 text-lg text-foreground md:mb-0 md:mr-4">
                <FaClipboardList className="mr-2 inline-block" />
                Total Machines: {keyMetrics.totalMachines}
              </div>
              <div className="mb-4 text-lg text-foreground md:mb-0 md:mr-4">
                <FaChartLine className="mr-2 inline-block" />
                Total Parts: {keyMetrics.totalParts}
              </div>
              <div className="text-lg text-foreground">
                <FaClipboardList className="mr-2 inline-block" />
                Total Tools: {keyMetrics.totalTool}
              </div>
            </div>
            <RedirectButton />
          </div>
        </div>
        <div className="space-y-4 rounded-lg bg-muted p-6 shadow-md">
          <h2 className="flex items-center text-2xl font-bold text-foreground">
            <FaUsers className="mr-2" /> Employee List
          </h2>
          <ScrollArea className="h-60 w-full flex-1 rounded-md border border-border p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {employees.map((employee, index) => (
                <div key={index} className="rounded-lg bg-background p-4 shadow-md">
                  <p className="text-lg text-foreground">
                    <span className="font-semibold">Name:</span>{' '}
                    {employee.firstName + ' ' + employee.lastName}
                  </p>
                  <p className="text-lg text-foreground">
                    <span className="font-semibold">Job:</span> {employee.job}
                  </p>
                  <p className="text-lg text-foreground">
                    <span className="font-semibold">Blood Type:</span> {employee.bloodType}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
