import {
  getAllOrgs,
  getOrgByUserId,
  getUserByIdClerk,
} from "~/server/queries/queries";
import EditUser from "../_components/editUser";
import CreateUser from "../_components/createUser";

export default async function FullPageUserView(props: { id: string }) {
  if (props.id === "newUser") {
    const orgs = await getAllOrgs();
    return (
      <CreateUser
        user={{
          firstName: "",
          lastName: "",
          username: "",
          email: [""],
          password: "",
        }}
        orgs={orgs}
      />
    );
  }
  const user = await getUserByIdClerk(props.id);
  const orgs = await getAllOrgs();
  const currentOrg = await getOrgByUserId(props.id);

  return <EditUser user={user} orgs={orgs} currentOrg={currentOrg} />;
}
