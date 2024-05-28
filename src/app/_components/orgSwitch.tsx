"use client";

import { useState, useEffect, useRef } from "react";
import { useOrganizationList } from "@clerk/nextjs";

export const CustomOrgSwitcher = () => {
  const { isLoaded, setActive, userMemberships } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSetActive = async (organizationId: string) => {
    if (setActive) {
      try {
        await setActive({ organization: organizationId });
        setIsOpen(false);
      } catch (error) {
        console.error("Failed to set active organization:", error);
      }
    }
  };

  if (!isLoaded) {
    return <>Loading</>;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="rounded-full bg-gray-200 p-2 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
        onClick={toggleDropdown}
      >
        <svg
          className="h-6 w-6 text-gray-900 dark:text-gray-100"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 12h2m4 0h-2m-6 4h2m4 0h-2m-6 4h2m4 0h-2M4 16h.01M4 12h.01M4 8h.01M4 4h.01M12 4v16m-4-4h.01M8 8h.01M8 12h.01M8 16h.01M12 4h.01M12 8h.01M12 12h.01M12 16h.01M12 20h.01"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute bottom-full left-0 z-10 mb-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <ul className="py-1 text-black dark:text-white">
            {userMemberships.data?.map((mem) => (
              <li
                onClick={() => handleSetActive(mem.organization.id)}
                key={mem.id}
                className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <span>{mem.organization.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
