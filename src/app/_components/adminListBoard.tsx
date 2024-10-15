import { useState, useEffect, type ChangeEvent } from 'react';
import { Input } from '~/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '~/components/ui/select';

import { type RegularWorkOrder } from '~/server/types/IOrders';
import { type User } from '~/server/types/IUser';
import { type Machinery } from '~/server/types/IMachinery';

import { AdminWorkOrderDataViewDialog } from './adminViewWorkOrderDialog';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

// Import icons
import { FaDownload } from 'react-icons/fa';

function AdminListBoard(props: { workOrders: RegularWorkOrder[] }) {
  const { workOrders } = props;

  // Define a type for work orders with columnName
  type WorkOrderWithColumnName = RegularWorkOrder & { columnName: string };

  const [orders, setOrders] = useState<WorkOrderWithColumnName[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<WorkOrderWithColumnName[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedState, setSelectedState] = useState('all');
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(0);
  const [machines, setMachines] = useState<Machinery[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    async function fetchWorkOrderData() {
      try {
        const response = await fetch('/api/getWorkOrderData');
        const data = (await response.json()) as { machinery: Machinery[]; users: User[] };

        setMachines(data.machinery);
        setUsers(data.users);
      } catch (error) {
        console.error('Error fetching work order data:', error);
      }
    }

    void fetchWorkOrderData();
  }, []);
  useEffect(() => {
    // Map workOrders to include columnName based on state
    const allOrders: WorkOrderWithColumnName[] = workOrders.map((order) => {
      let columnName = '';
      if (order.state === 0) {
        columnName = 'On Hold';
      } else if (order.state === 1) {
        columnName = 'In Progress';
      } else if (order.state === 2) {
        columnName = 'Done';
      }
      return { ...order, columnName };
    });

    setOrders(allOrders);
    setFilteredOrders(allOrders);
  }, [workOrders]);

  useEffect(() => {
    // Apply filters
    let filtered = orders;

    if (searchTerm.trim() !== '') {
      filtered = filtered.filter((order) =>
        order.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedUser !== 'all') {
      filtered = filtered.filter((order) => order.assigned_user === parseInt(selectedUser));
    }

    if (selectedState !== 'all') {
      filtered = filtered.filter((order) => order.state.toString() === selectedState);
    }

    setFilteredOrders(filtered);
  }, [searchTerm, selectedUser, selectedState, orders]);

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const paginatedOrders = filteredOrders.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  const handleDownloadButton = async (orderId: number) => {
    try {
      const response = await fetch('/api/generateWorkOrderExcelReport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });

      if (!response.ok) {
        throw new Error('Failed to download Excel file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create a link and trigger a download
      const a = document.createElement('a');
      a.href = url;
      a.download = `Work_Order_Report_${orderId}.xlsx`;
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading Excel file:', error);
    }
  };

  return (
    <div className="px-4 pb-2 pt-0">
      {/* Filters */}
      <div className="rounded-lg px-4 py-4 shadow-lg md:flex md:items-center md:space-x-4">
        {/* Search Input */}
        <Input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="mb-2 w-full rounded-md border border-border bg-background p-2 text-foreground md:mb-0 md:flex-1"
        />

        {/* User Filter */}
        <Select value={selectedUser} onValueChange={setSelectedUser}>
          <SelectTrigger className="w-full sm:w-auto flex-grow">
            <SelectValue placeholder="Filter by user" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.user_id} value={user.user_id.toString()}>
                {`${user.first_name} ${user.last_name}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* State Filter */}
        <Select value={selectedState} onValueChange={setSelectedState}>
          <SelectTrigger className="w-full sm:w-auto flex-grow">
            <SelectValue placeholder="Filter by state" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            <SelectItem value="0">On Hold</SelectItem>
            <SelectItem value="1">In Progress</SelectItem>
            <SelectItem value="2">Done</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table for Larger Screens */}
      <div className="hidden rounded-lg bg-background p-4 shadow-lg md:block">
        <table className="w-full table-auto rounded-lg border border-border shadow-md">
          <thead className="bg-primary text-primary-foreground">
            <tr>
              <th className="border-b border-border px-5 py-3 text-left">
                <p className="text-s text-[11px] font-bold uppercase">ID</p>
              </th>
              <th className="border-b border-border px-5 py-3 text-left">
                <p className="text-s text-[11px] font-bold uppercase">Work Order Name</p>
              </th>
              <th className="border-b border-border px-5 py-3 text-left">
                <p className="text-s text-[11px] font-bold uppercase">State</p>
              </th>
              <th className="border-b border-border px-5 py-3 text-left">
                <p className="text-s text-[11px] font-bold uppercase">Assigned User</p>
              </th>
              <th className="border-b border-border px-5 py-3 text-left">
                <p className="text-s text-[11px] font-bold uppercase">Start Date</p>
              </th>
              <th className="border-b border-border px-5 py-3 text-left"></th>
              <th className="border-b border-border px-5 py-3 text-left"></th>
            </tr>
          </thead>
          <tbody className="bg-card">
            {paginatedOrders.map((order, index) => {
              const rowBgColor = index % 2 === 0 ? 'bg-card' : 'bg-muted';
              const className = `py-3 px-5 ${
                index === paginatedOrders.length - 1 ? '' : 'border-b border-border'
              } text-card-foreground ${rowBgColor}`;

              const user = users.find((u) => u.user_id === order.assigned_user);
              const userName = user ? `${user.first_name} ${user.last_name}` : 'Unassigned';

              let stateName = '';
              if (order.state === 0) {
                stateName = 'On Hold';
              } else if (order.state === 1) {
                stateName = 'In Progress';
              } else if (order.state === 2) {
                stateName = 'Done';
              }

              return (
                <tr key={order.order_id}>
                  <td className={className}>{currentPage * itemsPerPage + index + 1}</td>
                  <td className={className}>{order.name}</td>
                  <td className={className}>{stateName}</td>
                  <td className={className}>{userName}</td>
                  <td className={className}>
                    {order.start_date ? new Date(order.start_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className={className}>
                    {/* AdminWorkOrderDataViewDialog Component */}
                    <AdminWorkOrderDataViewDialog
                      title={order.name}
                      data={order}
                      type="list"
                      users={users}
                      size="lg"
                      machines={machines}
                    />
                  </td>
                  <td className={className}>
                    <FaDownload
                      onClick={() => handleDownloadButton(order.order_id)}
                      className="cursor-pointer text-primary"
                      size={20}
                    />
                  </td>
                </tr>
              );
            })}
            {paginatedOrders.length === 0 && (
              <tr>
                <td className="px-4 py-2 border-b text-center" colSpan={7}>
                  No work orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* List for Smaller Screens */}
      <div className="block rounded-lg bg-background p-4 shadow-lg md:hidden">
        {paginatedOrders.map((order, index) => {
          const user = users.find((u) => u.user_id === order.assigned_user);
          const userName = user ? `${user.first_name} ${user.last_name}` : 'Unassigned';

          let stateName = '';
          if (order.state === 0) {
            stateName = 'On Hold';
          } else if (order.state === 1) {
            stateName = 'In Progress';
          } else if (order.state === 2) {
            stateName = 'Done';
          }

          return (
            <div key={order.order_id}>
              <AdminWorkOrderDataViewDialog
                title="View"
                data={order}
                type="list"
                users={users}
                size="sm"
                machines={machines}
              />
            </div>
          );
        })}
        {paginatedOrders.length === 0 && (
          <div className="text-center text-sm text-muted-foreground">No work orders found.</div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between px-4 py-2">
        <div></div>
        <div className="flex items-center">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className={`rounded px-4 py-2 ${
              currentPage === 0
                ? 'cursor-not-allowed bg-muted text-muted-foreground'
                : 'bg-primary text-primary-foreground'
            }`}
          >
            <FaArrowLeft />
          </button>
          <span className="ml-2 mr-2 text-sm font-medium text-foreground">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={(currentPage + 1) * itemsPerPage >= filteredOrders.length}
            className={`rounded px-4 py-2 ${
              (currentPage + 1) * itemsPerPage >= filteredOrders.length
                ? 'cursor-not-allowed bg-muted text-muted-foreground'
                : 'bg-primary text-primary-foreground'
            }`}
          >
            <FaArrowRight />
          </button>
        </div>
        <div></div>
      </div>
    </div>
  );
}

export default AdminListBoard;
