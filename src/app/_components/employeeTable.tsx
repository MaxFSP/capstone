"use client";
import { useState } from "react";
import { Avatar } from "@nextui-org/avatar";
import { type Employee } from "../../server/types/employee";
import EditUser from "./editUser";
import SmallEditUser from "./smallEditUser";

export default function EmployeeTable(props: { users: Employee[] }) {
  const { users } = props;
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showDisabled, setShowDisabled] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email[0]!.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter ? user.org.name === roleFilter : true;
    const matchesStatus = showDisabled ? true : user.online;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleNextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginatedUsers = filteredUsers.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage,
  );

  return (
    <div className="px-0 pb-2 pt-0">
      <div className="px-4 py-4 md:flex md:items-center md:space-x-4">
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-2 w-full rounded-md border p-2 md:mb-0 md:flex-1"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="mb-2 w-full rounded-md border p-2 md:mb-0 md:flex-1"
        >
          <option value="">All Roles</option>
          {[...new Set(users.map((user) => user.org.name))].map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowDisabled(!showDisabled)}
          className="mb-2 w-full rounded-md border p-2 md:mb-0 md:flex-1"
        >
          {showDisabled ? "Hide Disabled" : "Show Disabled"}
        </button>
      </div>
      <div className="hidden p-4 md:block">
        <table className="w-full table-auto">
          <thead>
            <tr>
              {["ID", "User", "Role", "Status", ""].map((el) => (
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
            {paginatedUsers.map(
              (
                { id, img, firstName, lastName, username, email, org, online },
                index,
              ) => {
                const className = `py-3 px-5 ${
                  index === users.length - 1
                    ? ""
                    : "border-b border-blue-gray-50"
                }`;
                const statusClass = online ? "bg-green-500" : "bg-red-500";
                const statusText = online ? "Enabled" : "Disabled";

                return (
                  <tr key={id}>
                    <td className={className}>
                      {currentPage * itemsPerPage + index + 1}
                    </td>
                    <td className={className}>
                      <div className="flex items-center gap-4">
                        <Avatar src={img} alt={firstName} size="sm" />
                        <div>
                          <p color="blue-gray" className="text-s font-semibold">
                            {firstName}
                          </p>
                          <p className="text-blue-gray-400 text-xs">{email}</p>
                        </div>
                      </div>
                    </td>
                    <td className={className}>
                      <p className="text-blue-gray-600 text-xs font-semibold">
                        {org.name}
                      </p>
                    </td>
                    <td className={className}>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-3 w-3 rounded-full ${statusClass}`}
                        ></div>
                        <p className="text-blue-gray-600 text-xs font-semibold">
                          {statusText}
                        </p>
                      </div>
                    </td>
                    <td className={className}>
                      <EditUser
                        user={{
                          id,
                          img,
                          username,
                          firstName,
                          lastName,
                          email,
                          org,
                          online,
                        }}
                      />
                    </td>
                  </tr>
                );
              },
            )}
          </tbody>
        </table>
      </div>
      <div className="block md:hidden">
        {paginatedUsers.map(
          ({ id, img, firstName, lastName, username, email, org, online }) => {
            return (
              <SmallEditUser
                key={id}
                user={{
                  id,
                  img,
                  firstName,
                  lastName,
                  username,
                  email,
                  online,
                  org,
                }}
              />
            );
          },
        )}
      </div>
      <div className="flex justify-between px-4 py-2">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 0}
          className={`rounded px-4 py-2 ${currentPage === 0 ? "cursor-not-allowed bg-gray-300 text-gray-900" : "bg-blue-500 text-white"}`}
        >
          Previous
        </button>
        <div className="flex items-center">
          <span className="text-sm font-medium">
            Page {currentPage + 1} of {totalPages}
          </span>
        </div>
        <button
          onClick={handleNextPage}
          disabled={(currentPage + 1) * itemsPerPage >= filteredUsers.length}
          className={`rounded px-4 py-2 ${(currentPage + 1) * itemsPerPage >= filteredUsers.length ? "cursor-not-allowed bg-gray-300 text-gray-900" : "bg-blue-500 text-white"}`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
