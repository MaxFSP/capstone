"use client";
import { useState } from "react";
import { Avatar } from "@nextui-org/react";
import { type ClerkUser } from "../../server/types/IClerkUser";
import EditUser from "./editUser";
import SmallEditUser from "./smallEditUser";
import { type Org } from "../../server/types/org";

export default function EmployeeTable(props: {
  users: ClerkUser[];
  orgs: Org[];
}) {
  const { users, orgs } = props;
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
    <div className="px-4 pb-2 pt-0">
      <div className="rounded-lg bg-background px-4 py-4 shadow-lg md:flex md:items-center md:space-x-4">
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-2 w-full rounded-md border border-border bg-background p-2 text-foreground md:mb-0 md:flex-1"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="mb-2 w-full rounded-md border border-border bg-background p-2 text-foreground md:mb-0 md:flex-1"
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
          className="mb-2 w-full rounded-md border border-border bg-primary p-2 text-primary-foreground hover:bg-accent hover:text-accent-foreground md:mb-0 md:flex-1"
        >
          {showDisabled ? "Hide Disabled" : "Show Disabled"}
        </button>
      </div>
      <div className="hidden rounded-lg bg-background p-4 shadow-lg md:block">
        <table className="w-full table-auto rounded-lg border border-border shadow-md">
          <thead className="bg-primary text-primary-foreground">
            <tr>
              {["ID", "User", "Role", "Status", ""].map((el) => (
                <th
                  key={el}
                  className="border-b border-border px-5 py-3 text-left"
                >
                  <p className="text-[11px] font-bold uppercase">{el}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-card">
            {paginatedUsers.map(
              (
                { id, img, firstName, lastName, username, email, org, online },
                index,
              ) => {
                const rowBgColor = index % 2 === 0 ? "bg-card" : "bg-muted";
                const className = `py-3 px-5 ${
                  index === users.length - 1 ? "" : "border-b border-border"
                } text-card-foreground ${rowBgColor}`;
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
                          <p className="text-s font-semibold text-foreground">
                            {firstName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className={className}>
                      <p className="text-xs font-semibold text-foreground">
                        {org.name}
                      </p>
                    </td>
                    <td className={className}>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-3 w-3 rounded-full ${statusClass}`}
                        ></div>
                        <p className="text-xs font-semibold text-foreground">
                          {statusText}
                        </p>
                      </div>
                    </td>
                    <td className={className}>
                      <EditUser
                        orgs={orgs}
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
      <div className="block rounded-lg bg-background p-4 shadow-lg md:hidden">
        {paginatedUsers.map(
          ({ id, img, firstName, lastName, username, email, org, online }) => {
            return (
              <SmallEditUser
                key={id}
                orgs={orgs}
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
        <div></div>
        <div className="flex items-center">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className={`rounded px-4 py-2 ${
              currentPage === 0
                ? "cursor-not-allowed bg-muted text-muted-foreground"
                : "bg-primary text-primary-foreground"
            }`}
          >
            ⮜
          </button>
          <span className="ml-2 mr-2 text-sm font-medium text-foreground">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={(currentPage + 1) * itemsPerPage >= filteredUsers.length}
            className={`rounded px-4 py-2 ${
              (currentPage + 1) * itemsPerPage >= filteredUsers.length
                ? "cursor-not-allowed bg-muted text-muted-foreground"
                : "bg-primary text-primary-foreground"
            }`}
          >
            ➤
          </button>
        </div>
        <div></div>
      </div>
    </div>
  );
}
