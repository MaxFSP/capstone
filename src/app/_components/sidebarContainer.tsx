import React from "react";
import SideBar from "./sidebar";
import { getUserName, getActiveOrg } from "../../server/queries";

export default async function SidebarContainer() {
  const user: string = await getUserName();
  const org: string = await getActiveOrg();

  return <SideBar user={user} org={org} />;
}
