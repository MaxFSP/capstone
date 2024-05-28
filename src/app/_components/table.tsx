import EmployeeTable from "./employeeTable";
import { Card, CardHeader } from "@nextui-org/card";

export default function Table() {
  return (
    <div>
      <Card>
        <CardHeader className="mb-8 bg-gray-700 p-6">
          <p color="white text-l">Usurios activos</p>
        </CardHeader>
        <EmployeeTable />
      </Card>
    </div>
  );
}
