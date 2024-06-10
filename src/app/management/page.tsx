import EmployeeTable from "../_components/employeeTable";
import { Card, CardHeader } from "@nextui-org/card";
import CreateUserButton from "../_components/createUserButton";
import { getAllUsers } from "~/server/queries";

async function UserMaganement() {
  const users = await getAllUsers();

  return (
    <main className=" background-black mb-8  mt-12  flex flex-col  gap-12">
      <div>
        <Card>
          <CardHeader className="mb-8 flex items-center justify-between bg-gray-700 p-6">
            <p className="text-l text-white">Users</p>
            <CreateUserButton />
          </CardHeader>
          <EmployeeTable users={users} />
        </Card>
      </div>
    </main>
  );
}

export default UserMaganement;
