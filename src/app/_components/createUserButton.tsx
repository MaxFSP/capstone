"use client";

import { Button } from "@nextui-org/button";
import Link from "next/link";

function CreateUserButton() {
  const create = "newUser";
  return (
    <Link
      href={`/user/${create}`}
      className="text-blue-gray-600 text-xs font-semibold"
    >
      <Button color="primary">Create a new user</Button>
    </Link>
  );
}

export default CreateUserButton;
