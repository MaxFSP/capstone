"use client";
import { useState } from "react";
import { CardBody } from "@nextui-org/card";
import { Avatar } from "@nextui-org/avatar";
import Link from "next/link";
import { type Employee } from "../types/employee";

export default function EmployeeTable(props: { users: Employee[] }) {
  const { users } = props;
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showDisabled, setShowDisabled] = useState(false);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email[0]!.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter ? user.org.name === roleFilter : true;
    const matchesStatus = showDisabled ? true : user.online;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <CardBody className="overflow-x-scroll px-0 pb-2 pt-0">
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
      <div className="hidden md:block">
        <table className="w-full min-w-[640px] table-auto">
          <thead>
            <tr>
              {["User", "Role", "Status", ""].map((el) => (
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
            {filteredUsers.map(
              ({ id, img, firstName, email, org, online }, key) => {
                const className = `py-3 px-5 ${
                  key === users.length - 1 ? "" : "border-b border-blue-gray-50"
                }`;
                const statusClass = online ? "bg-green-500" : "bg-red-500";
                const statusText = online ? "Enabled" : "Disabled";

                return (
                  <tr key={id}>
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
                      <Link
                        href={`/user/${id}`}
                        className="text-blue-gray-600 text-xs font-semibold"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              },
            )}
          </tbody>
        </table>
      </div>
      <div className="block md:hidden">
        {filteredUsers.map(({ id, img, firstName, org, online }) => {
          const statusClass = online ? "bg-green-500" : "bg-red-500";

          return (
            <Link
              key={id}
              href={`/user/${id}`}
              className="border-blue-gray-50 flex items-center gap-4 border-b px-5 py-4"
            >
              <Avatar src={img} alt={firstName} size="lg" />
              <div className="flex w-full flex-col justify-center">
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold">{firstName}</p>
                  <div className="flex items-center gap-2 pr-5">
                    <div className="text-blue-gray-600 text-sm font-semibold">
                      {org.name}
                    </div>
                    <div
                      className={`ml-6 h-3 w-3 rounded-full ${statusClass}`}
                    ></div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </CardBody>
  );
}
