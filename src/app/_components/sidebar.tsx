"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import { CustomOrgSwitcher } from "./orgSwitch";

export default function Sidebar({ user, org }: { user: string; org: string }) {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 transform bg-gray-800 p-5 text-white ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0`}
      >
        <div>
          <div className="mb-10 flex items-center justify-between">
            <span className="text-2xl font-bold">Logo</span>
            <button
              onClick={toggleMenu}
              className="text-white focus:outline-none lg:hidden"
              aria-label="Close menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <nav>
            <ul>
              <li className="mb-2">
                <Link
                  href="/"
                  className="block rounded px-3 py-2 hover:bg-gray-700"
                  onClick={toggleMenu}
                >
                  Home
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  href="/dashboard"
                  className="block rounded px-3 py-2 hover:bg-gray-700"
                  onClick={toggleMenu}
                >
                  Dashboard
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  href="#"
                  className="block rounded px-3 py-2 hover:bg-gray-700"
                  onClick={toggleMenu}
                >
                  Inventory
                </Link>
              </li>

              {org == "administrativo" && (
                <li className="mb-2">
                  <Link
                    href="/management"
                    className="block rounded px-3 py-2 hover:bg-gray-700"
                    onClick={toggleMenu}
                  >
                    User Management
                  </Link>
                </li>
              )}
              {org == "test" && (
                <li className="mb-2">
                  <Link
                    href="/test"
                    className="block rounded px-3 py-2 hover:bg-gray-700"
                    onClick={toggleMenu}
                  >
                    Test
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <UserButton />
            <span className="ml-3 text-sm">{user}</span>
          </div>
          <CustomOrgSwitcher />
        </div>
      </div>

      {/* Topbar */}
      {!isOpen && (
        <div className="flex w-full justify-between bg-gray-800 p-4 text-xl font-semibold text-white lg:hidden">
          <div>
            <button
              onClick={toggleMenu}
              className="text-white focus:outline-none"
              aria-label="Open menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>
            <span className="ml-3">Logo</span>
          </div>
        </div>
      )}
    </div>
  );
}
