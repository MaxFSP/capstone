import EmployeeTable from "../_components/employeeTable";
import { getAllOrgs, getAllUsers } from "~/server/queries/queries";
import CardLayout from "../_components/cardLayout";
import CreateUser from "../_components/createUser";

async function UserMaganement() {
  const users = await getAllUsers();
  const orgs = await getAllOrgs();

  return (
    <div>
      <CardLayout>
        <p className="text-l text-white">Users</p>
        <CreateUser orgs={orgs} />
      </CardLayout>
      <EmployeeTable users={users} />
    </div>
  );
}

export default UserMaganement;
