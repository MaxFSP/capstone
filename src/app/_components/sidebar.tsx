"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { CustomOrgSwitcher } from "./orgSwitch";

export default function Sidebar({ user, org }: { user: string; org: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setIsDarkMode(storedTheme === "dark");
    } else {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    }
  }, []);

  const toggleDarkMode = () => {
    const html = document.documentElement;
    const isDark = html.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    setIsDarkMode(isDark);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 transform bg-muted p-5 text-muted-foreground ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out dark:bg-accent dark:text-accent-foreground`}
      >
        <div>
          <div className="mb-10 flex items-center justify-between">
            <span className="text-2xl font-bold">Rudan Maquinarias</span>
            <button
              onClick={toggleMenu}
              className="text-muted-foreground focus:outline-none dark:text-accent-foreground"
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
                  className="block rounded px-3 py-2 hover:bg-gray-300 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-gray-100"
                  onClick={toggleMenu}
                >
                  Home
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  href="/dashboard"
                  className="block rounded px-3 py-2 hover:bg-gray-300 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-gray-100"
                  onClick={toggleMenu}
                >
                  Dashboard
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  href="/stock"
                  className="block rounded px-3 py-2 hover:bg-gray-300 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-gray-100"
                  onClick={toggleMenu}
                >
                  Stock
                </Link>
              </li>

              {org == "administrativo" && (
                <li className="mb-2">
                  <Link
                    href="/management"
                    className="block rounded px-3 py-2 hover:bg-gray-300 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-gray-100"
                    onClick={toggleMenu}
                  >
                    General Management
                  </Link>
                </li>
              )}
              {org == "test" && (
                <li className="mb-2">
                  <Link
                    href="/test"
                    className="block rounded px-3 py-2 hover:bg-gray-300 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-gray-100"
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
        <div className="fixed z-40 flex w-full items-center justify-between bg-muted p-4 text-xl font-semibold text-muted-foreground dark:bg-accent dark:text-accent-foreground">
          <div className="flex items-center">
            <button
              onClick={toggleMenu}
              className="text-muted-foreground focus:outline-none dark:text-accent-foreground"
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
            <span className="ml-3">Rudan Maquinarias</span>
          </div>
          <button
            onClick={toggleDarkMode}
            id="theme-toggle"
            className="ml-3 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? "🌞" : "🌙"}
          </button>
        </div>
      )}
    </div>
  );
}
