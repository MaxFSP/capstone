'use client';
import { useState } from 'react';
import { type ClerkUser } from '../../server/types/IClerkUser';
import EditUser from './editUser';
import SmallEditUser from './smallEditUser';
import { type Org } from '../../server/types/org';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar';

export default function EmployeeTable(props: { users: ClerkUser[]; orgs: Org[] }) {
  const { users, orgs } = props;
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showDisabled, setShowDisabled] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email[0].toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole =
      roleFilter === 'all' ||
      (Array.isArray(user.org)
        ? user.org.some((org) => org.name === roleFilter)
        : user.org.name === roleFilter);
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
    (currentPage + 1) * itemsPerPage
  );

  return (
    <div className="px-4 pb-2 pt-0">
      <div className="rounded-lg bg-background px-4 py-4 shadow-lg md:flex md:items-center md:space-x-4">
        <Input
          type="text"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-2 w-full md:mb-0 md:flex-1"
        />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="mb-2 w-full md:mb-0 md:flex-1">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {orgs.map((org) => (
              <SelectItem key={org.id} value={org.name}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={() => setShowDisabled(!showDisabled)}
          className="mb-2 w-full md:mb-0 md:flex-1"
        >
          {showDisabled ? 'Hide Disabled' : 'Show Disabled'}
        </Button>
      </div>
      <div className="hidden rounded-lg bg-background p-4 shadow-lg md:block">
        <table className="w-full table-auto rounded-lg border border-border shadow-md">
          <thead className="bg-primary text-primary-foreground">
            <tr>
              {['ID', 'User', 'Role', 'Status', ''].map((el) => (
                <th key={el} className="border-b border-border px-5 py-3 text-left">
                  <p className="text-[11px] font-bold uppercase">{el}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-card">
            {paginatedUsers.map(
              ({ id, img, firstName, lastName, username, email, org, online }, index) => {
                const rowBgColor = index % 2 === 0 ? 'bg-card' : 'bg-muted';
                const className = `py-3 px-5 ${
                  index === users.length - 1 ? '' : 'border-b border-border'
                } text-card-foreground ${rowBgColor}`;
                const statusClass = online ? 'bg-green-500' : 'bg-red-500';
                const statusText = online ? 'Enabled' : 'Disabled';
                let orgName = '';
                if (Array.isArray(org)) {
                  if (org.some((o) => o.name?.includes('Admin'))) {
                    orgName = 'Admin';
                  } else {
                    orgName = org[0]?.name ?? '';
                  }
                }

                return (
                  <tr key={id}>
                    <td className={className}>{currentPage * itemsPerPage + index + 1}</td>
                    <td className={className}>
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={img} alt={firstName} />
                          <AvatarFallback>{`${firstName[0]}${lastName[0]}`}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-s font-semibold text-foreground">{firstName}</p>
                          <p className="text-xs text-muted-foreground">{email}</p>
                        </div>
                      </div>
                    </td>

                    <td className={className}>
                      <p className="text-xs font-semibold text-foreground">{orgName}</p>
                    </td>
                    <td className={className}>
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${statusClass}`}></div>
                        <p className="text-xs font-semibold text-foreground">{statusText}</p>
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
              }
            )}
          </tbody>
        </table>
      </div>
      <div className="block rounded-lg bg-background p-4 shadow-lg md:hidden">
        {paginatedUsers.map(({ id, img, firstName, lastName, username, email, org, online }) => {
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
        })}
      </div>
      <div className="flex justify-between px-4 py-2">
        <div></div>
        <div className="flex items-center">
          <Button
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            variant={currentPage === 0 ? 'secondary' : 'default'}
          >
            ⮜
          </Button>
          <span className="ml-2 mr-2 text-sm font-medium text-foreground">
            Page {currentPage + 1} of {totalPages}
          </span>
          <Button
            onClick={handleNextPage}
            disabled={(currentPage + 1) * itemsPerPage >= filteredUsers.length}
            variant={
              (currentPage + 1) * itemsPerPage >= filteredUsers.length ? 'secondary' : 'default'
            }
          >
            ➤
          </Button>
        </div>
        <div></div>
      </div>
    </div>
  );
}
