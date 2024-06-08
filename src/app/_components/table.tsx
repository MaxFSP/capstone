import EmployeeTable from "./employeeTable";
import { Card, CardHeader } from "@nextui-org/card";
import CreateUser from "./createUserButton";

export default function Table() {
  return (
    <div>
      <Card>
        <CardHeader className="mb-8 flex items-center justify-between bg-gray-700 p-6">
          <p className="text-l text-white">Usuarios activos</p>
          <CreateUser />
        </CardHeader>
        <EmployeeTable />
      </Card>
    </div>
  );
}
