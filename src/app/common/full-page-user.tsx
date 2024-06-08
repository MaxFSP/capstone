import { getOrgByUserId, getUserById } from "~/server/queries";
import PageUser from "../_components/pageUser";

export default async function FullPageUserView(props: { id: string }) {
  const user = await getUserById(props.id);
  const departments = await getOrgByUserId(user.id);
  return <PageUser user={user} departments={departments} />;
}
