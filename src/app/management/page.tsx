import EmployeeTable from "../_components/employeeTable";
import CreateUserButton from "../_components/createUserButton";
import { getAllUsers } from "~/server/queries/queries";
import CardLayout from "../_components/cardLayout";

async function UserMaganement() {
  const users = await getAllUsers();

  return (
    <div>
      <CardLayout>
        <p className="text-l text-white">Users</p>
        <CreateUserButton />
      </CardLayout>
      <EmployeeTable users={users} />
    </div>
  );
}

export default UserMaganement;
