import { getAllUsers } from "../../server/queries";
import { CardBody } from "@nextui-org/card";
import { Avatar } from "@nextui-org/avatar";
import { Chip } from "@nextui-org/chip";

export default async function EmployeeTable() {
  const users = await getAllUsers();

  return (
    <CardBody className="overflow-x-scroll px-0 pb-2 pt-0">
      <table className="w-full min-w-[640px] table-auto">
        <thead>
          <tr>
            {["user", "function", "status", ""].map((el) => (
              <th
                key={el}
                className="border-blue-gray-50 border-b px-5 py-3 text-left"
              >
                <p className="text-blue-gray-400 text-s text-[11px] font-bold uppercase">
                  {el}
                </p>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map(({ img, name, email, job }, key) => {
            const className = `py-3 px-5 ${
              key === users.length - 1 ? "" : "border-b border-blue-gray-50"
            }`;

            return (
              <tr key={name}>
                <td className={className}>
                  <div className="flex items-center gap-4">
                    <Avatar src={img} alt={name} size="sm" />
                    <div>
                      <p color="blue-gray" className="text-s font-semibold">
                        {name}
                      </p>
                      <p className="text-blue-gray-500 text-xs font-normal">
                        {email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className={className}>
                  <p className="text-blue-gray-600 text-xs font-semibold">
                    {job[0]}
                  </p>
                  <p className="text-blue-gray-500 text-xs font-normal">
                    {job[1]}
                  </p>
                </td>
                <td className={className}>
                  <Chip
                    className="w-fit px-2 py-0.5 text-[11px] font-medium"
                    color="success"
                  >
                    Online
                  </Chip>
                </td>

                <td className={className}>
                  <p className="text-blue-gray-600 text-xs font-semibold">
                    Edit
                  </p>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </CardBody>
  );
}
