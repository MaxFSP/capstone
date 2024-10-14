/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import EmployeeTable from '../_components/employeeTable';
import { getAllOrgs, getAllUsers } from '~/server/queries/queries';
import { getLocations } from '~/server/queries/location/queries';
import { getEmployees } from '~/server/queries/employee/queries';
import CardLayout from '../_components/cardLayout';
import CreateUser from '../_components/createUser';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import TableComponent from '../_components/tableComponent';
import { getMachineries } from '~/server/queries/machinery/queries';
import { getUsers } from '~/server/queries/user/queries';
import { getWorkOrders } from '~/server/queries/workOrder/queries';

const employeeColumns = [
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'job', label: 'Job' },
];

const workOrderColumns = [
  { key: 'name', label: 'Name' },
  { key: 'machine_serial', label: 'Machine' },
  { key: 'userName', label: 'Assigned User' },
];

async function UserManagement() {
  const users = await getAllUsers();
  const orgs = await getAllOrgs();
  const locations = await getLocations();
  let employees = await getEmployees();
  const machines = await getMachineries();
  const userData = await getUsers();
  const workOrders = await getWorkOrders();
  // Filter out employees that are not active
  employees = employees.filter((employee) => employee.state === 1);

  const userMap = new Map<
    string,
    {
      org: { id: string; name: string } | { id: string; name: string }[];
    }
  >();

  users.forEach((user) => {
    userMap.set(user.username, user);
  });

  // Enrich userData with orgName from userMap
  const enrichedUserData = userData.map((user) => {
    const correspondingUser = userMap.get(user.username);
    let orgName = 'Unknown';

    if (correspondingUser?.org) {
      if (Array.isArray(correspondingUser.org)) {
        // If org is an array, concatenate all organization names
        orgName = correspondingUser.org.map((org) => org.name).join(', ');
      } else {
        // If org is a single object
        orgName = correspondingUser.org.name;
      }
    }

    return {
      ...user,
      orgName,
    };
  });
  // Find the serial and the username of the ids in workOrders
  const workOrdersWithSerial = workOrders.map((workOrder) => {
    const machine = machines.find((machine) => machine.machine_id === workOrder.machine_id);
    return { ...workOrder, machine_serial: machine?.serial_number };
  });

  const workOrdersWithUsername = workOrdersWithSerial.map((workOrder) => {
    const user = userData.find((user) => user.user_id === workOrder.assigned_user);
    return {
      ...workOrder,
      userName: `${user?.first_name} ${user?.last_name}`,
    };
  });

  return (
    <Tabs defaultValue="users">
      <TabsList className="m-4 grid grid-cols-3 rounded-lg border border-border bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] dark:bg-[hsl(var(--accent))] dark:text-[hsl(var(--accent-foreground))] sm:w-full md:w-1/2">
        <TabsTrigger
          value="users"
          className="rounded-lg bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--popover))] data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-[hsl(var(--primary-foreground))] "
        >
          Users
        </TabsTrigger>
        <TabsTrigger
          value="employees"
          className="rounded-lg bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--popover))] data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-[hsl(var(--primary-foreground))] "
        >
          Employees
        </TabsTrigger>
        <TabsTrigger
          value="workOrders"
          className="rounded-lg bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--popover))] data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-[hsl(var(--primary-foreground))] "
        >
          Work Orders
        </TabsTrigger>
      </TabsList>
      <TabsContent value="users">
        <CardLayout>
          <p className="text-l text-[hsl(var(--muted-foreground))] dark:text-[hsl(var(--accent-foreground))]">
            Users
          </p>
          <CreateUser orgs={orgs} />
        </CardLayout>
        <EmployeeTable users={users} orgs={orgs} />
      </TabsContent>
      <TabsContent value="employees">
        <TableComponent
          data={employees}
          columns={employeeColumns}
          valueType="Employee"
          locations={locations}
        />
      </TabsContent>
      <TabsContent value="workOrders">
        <TableComponent
          data={workOrdersWithUsername}
          columns={workOrderColumns}
          valueType="WorkOrder"
          users={enrichedUserData}
          machines={machines}
        />
      </TabsContent>
    </Tabs>
  );
}

export default UserManagement;
