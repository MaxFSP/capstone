/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

"use client";
import { useState, type ChangeEvent } from "react";
import { MachineryDataViewDialog } from "./ViewMachineryDialog";
import { PartDataViewDialog } from "./ViewPartDialog";
import { ToolDataViewDialog } from "./ViewToolDialog";
import { SmallMachineryDialog } from "./smallMachineryDialog";
import { SmallPartDialog } from "./smallPartDialog";
import { SmallToolDialog } from "./smallToolDialog";
import { type ILocation } from "~/server/types/ILocation";
import { CreateNewStockDialog } from "./createNewStock";
import { EmployeeDataViewDialog } from "./ViewEmployeeDialog";
import { type Machinery } from "~/server/types/IMachinery";
import { type User } from "~/server/types/IUser";
import { WorkOrderDataViewDialog } from "./ViewWorkOrderDialog";

interface TableColumn {
  key: string;
  label: string;
  type?: string; // Optional type to handle special rendering cases
}

const TableComponent = (props: {
  data: any[];
  columns: TableColumn[];
  valueType: string;
  locations?: ILocation[];
  users?: User[];
  machines?: Machinery[];
}) => {
  const { data, columns, valueType, locations, users, machines } = props;
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const filteredData = data.filter((item) => {
    const matchesSearch = columns.some(
      (col) =>
        item[col.key] &&
        item[col.key]
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
    );

    return matchesSearch;
  });

  const handleNextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = filteredData.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage,
  );

  return (
    <div className="px-0 pb-2 pt-0">
      <div className="px-4 py-4 md:flex md:items-center md:space-x-4">
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSearchTerm(e.target.value)
          }
          className="mb-2 w-full rounded-md border  p-2 md:mb-0 md:flex-1"
        />
        <div className="flex-1">
          <CreateNewStockDialog
            locations={locations}
            type={valueType}
            users={users}
            machines={machines}
          />
        </div>
      </div>
      <div className="hidden p-4 md:block">
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th className="border-b border-gray-700 px-5 py-3 text-left">
                <p className="text-s text-[11px] font-bold uppercase text-gray-400">
                  ID
                </p>
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="border-b border-gray-700 px-5 py-3 text-left"
                >
                  <p className="text-s text-[11px] font-bold uppercase text-gray-400">
                    {col.label}
                  </p>
                </th>
              ))}
              <th className="border-b border-gray-700 px-5 py-3 text-left"></th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => {
              const className = `py-3 px-5 ${
                index === data.length - 1 ? "" : "border-b border-gray-700"
              } text-white`;

              return (
                <tr key={item.id + "Table" + index}>
                  <td className={className}>
                    {currentPage * itemsPerPage + index + 1}
                  </td>
                  {columns.map((col, colIndex) => (
                    <td
                      key={`${item.id}-${col.key}-${colIndex}`}
                      className={className}
                    >
                      {item[col.key].toString()}
                    </td>
                  ))}
                  <td className={className}>
                    {valueType === "Machinery" ? (
                      <MachineryDataViewDialog
                        key={item.model + "Machinery" + item.serial_number}
                        title="View"
                        data={item}
                        locations={locations!}
                      />
                    ) : valueType === "Part" ? (
                      <PartDataViewDialog
                        key={item.part_number + "Part" + item.part_id}
                        title="View"
                        data={item}
                        locations={locations!}
                      />
                    ) : valueType === "Tool" ? (
                      <ToolDataViewDialog
                        key={item.name + "Tool" + item.tool_id}
                        title="View"
                        data={item}
                        locations={locations!}
                      />
                    ) : valueType === "Employee" ? (
                      <EmployeeDataViewDialog
                        key={item.phone_number + "Employee" + item.employee_id}
                        index={0}
                        title="View"
                        size="lg"
                        data={item}
                      />
                    ) : valueType === "WorkOrder" ? (
                      <WorkOrderDataViewDialog
                        key={item.name + "WorkOrder" + item.order_id}
                        title="View"
                        data={item}
                        size="lg"
                        index={0}
                        users={users!}
                        machines={machines!}
                      />
                    ) : (
                      ""
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="block md:hidden">
        {paginatedData.map((item, index) =>
          valueType === "Machinery" ? (
            <SmallMachineryDialog
              key={item.machine_id + "Small" + "Machinery"}
              index={currentPage * itemsPerPage + index + 1}
              data={item}
              locations={locations!}
            />
          ) : valueType === "Part" ? (
            <SmallPartDialog
              key={item.part_id + "Small" + "Part"}
              index={currentPage * itemsPerPage + index + 1}
              data={item}
              locations={locations!}
            />
          ) : valueType === "Tool" ? (
            <SmallToolDialog
              key={item.tool_id + "Small" + "Tool"}
              index={currentPage * itemsPerPage + index + 1}
              data={item}
              locations={locations!}
            />
          ) : valueType === "Employee" ? (
            <EmployeeDataViewDialog
              key={item.employee_id + "Small" + "Employee"}
              title="View"
              index={currentPage * itemsPerPage + index + 1}
              size="sm"
              data={item}
            />
          ) : valueType === "WorkOrder" ? (
            <WorkOrderDataViewDialog
              key={item.order_id + "Small" + "WorkOrder"}
              title="View"
              index={currentPage * itemsPerPage + index + 1}
              size="sm"
              data={item}
              users={users!}
              machines={machines!}
            />
          ) : (
            ""
          ),
        )}
      </div>
      <div className="flex justify-between px-4 py-2">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 0}
          className={`rounded px-4 py-2 ${
            currentPage === 0
              ? "cursor-not-allowed bg-gray-600 text-gray-400"
              : "bg-blue-500 text-white"
          }`}
        >
          Previous
        </button>
        <div className="flex items-center">
          <span className="text-sm font-medium text-white">
            Page {currentPage + 1} of {totalPages}
          </span>
        </div>
        <button
          onClick={handleNextPage}
          disabled={(currentPage + 1) * itemsPerPage >= filteredData.length}
          className={`rounded px-4 py-2 ${
            (currentPage + 1) * itemsPerPage >= filteredData.length
              ? "cursor-not-allowed bg-gray-600 text-gray-400"
              : "bg-blue-500 text-white"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TableComponent;
