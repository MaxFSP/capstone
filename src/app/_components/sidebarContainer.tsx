import React from "react";
import SideBar from "./sidebar";
import { getUserName } from "../../server/queries";

export default async function SidebarContainer() {
  const user = await getUserName();

  return <SideBar user={user} />;
}
