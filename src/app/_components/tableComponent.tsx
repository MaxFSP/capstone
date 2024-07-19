/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"use client";
import { useState, type ChangeEvent } from "react";
import { Avatar } from "@nextui-org/avatar";
import Link from "next/link";
import { DataViewDialog } from "./dataViewDialog";

interface TableColumn {
  key: string;
  label: string;
  type?: string; // Optional type to handle special rendering cases
}

const TableComponent = (props: {
  data: any[];
  columns: TableColumn[];
  dbColumns: any[];
}) => {
  const { data, columns } = props;
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
        <div className="lg:flex-1"></div>
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
                <tr key={item.user_id}>
                  <td className={className}>
                    {currentPage * itemsPerPage + index + 1}
                  </td>
                  {columns.map((col) => (
                    <td key={col.key} className={className}>
                      {col.type === "avatar" ? (
                        <Avatar
                          src={item[col.key]}
                          alt="Profile Image"
                          size="sm"
                        />
                      ) : item[col.key] !== undefined ? (
                        item[col.key].toString()
                      ) : (
                        ""
                      )}
                    </td>
                  ))}
                  <td className={className}>
                    <DataViewDialog
                      title="View"
                      dbColumns={props.dbColumns}
                      data={item}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="block md:hidden">
        {paginatedData.map((item, index) => (
          <Link
            key={item.user_id}
            href={`#`}
            className="flex flex-col border-b border-gray-700 px-5 py-4 text-white"
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-base font-semibold">ID</p>
              <div className="flex items-center gap-2">
                {currentPage * itemsPerPage + index + 1}
              </div>
            </div>
            {columns.map((col) => (
              <div
                key={col.key}
                className="mb-2 flex items-center justify-between"
              >
                <p className="text-sm font-medium text-gray-400">{col.label}</p>
                <div className="flex items-center gap-2">
                  {col.type === "avatar" ? (
                    <Avatar src={item[col.key]} alt="Profile Image" size="sm" />
                  ) : item[col.key] !== undefined ? (
                    <span className="text-sm text-gray-200">
                      {item[col.key].toString()}
                    </span>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            ))}
          </Link>
        ))}
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
