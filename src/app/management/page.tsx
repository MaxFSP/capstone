import EmployeeTable from "../_components/employeeTable";
import { getAllOrgs, getAllUsers } from "~/server/queries/queries";
import { getLocations } from "~/server/queries/location/queries";
import { getEmployees } from "~/server/queries/employee/queries";
import CardLayout from "../_components/cardLayout";
import CreateUser from "../_components/createUser";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import TableComponent from "../_components/tableComponent";
import { getMachineries } from "~/server/queries/machinery/queries";
import { getUsers } from "~/server/queries/user/queries";
import { getWorkOrders } from "~/server/queries/workOrder/queries";

const employeeColumns = [
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "job", label: "Job" },
];

const workOrderColumns = [
  { key: "name", label: "Name" },
  { key: "machine_serial", label: "Machine" },
  { key: "userName", label: "Assigned User" },
];

async function UserMaganement() {
  const users = await getAllUsers();
  const orgs = await getAllOrgs();
  const locations = await getLocations();
  const employees = await getEmployees();
  const machines = await getMachineries();
  const userData = await getUsers();
  const workOrders = await getWorkOrders();

  //find the serial and the username of the ids in workOrders

  const workOrdersWithSerial = workOrders.map((workOrder) => {
    const machine = machines.find(
      (machine) => machine.machine_id === workOrder.machine_id,
    );
    return { ...workOrder, machine_serial: machine?.serial_number };
  });

  const workOrdersWithUsername = workOrdersWithSerial.map((workOrder) => {
    const user = userData.find(
      (user) => user.user_id === workOrder.assigned_user,
    );
    return {
      ...workOrder,
      userName: user?.first_name + " " + user?.last_name,
    };
  });

  return (
    <Tabs defaultValue="users">
      <TabsList className="m-4 grid grid-cols-3 sm:w-full md:w-1/2">
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="employees">Employees</TabsTrigger>
        <TabsTrigger value="workOrders">Work Orders</TabsTrigger>
      </TabsList>
      <TabsContent value="users">
        <CardLayout>
          <p className="text-l text-white">Users</p>
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
          users={userData}
          machines={machines}
        />
      </TabsContent>
    </Tabs>
  );
}

export default UserMaganement;
