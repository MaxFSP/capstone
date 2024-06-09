import EmployeeTable from "../_components/employeeTable";
import { Card, CardHeader } from "@nextui-org/card";
import CreateUserButton from "../_components/createUserButton";

function UserMaganement() {
  return (
    <main className=" background-black mb-8  mt-12  flex flex-col  gap-12">
      <div>
        <Card>
          <CardHeader className="mb-8 flex items-center justify-between bg-gray-700 p-6">
            <p className="text-l text-white">Usuarios activos</p>
            <CreateUserButton />
          </CardHeader>
          <EmployeeTable />
        </Card>
      </div>
    </main>
  );
}

export default UserMaganement;
