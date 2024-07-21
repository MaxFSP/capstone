import {
  getAllOrgs,
  getOrgByUserId,
  getUserByIdClerk,
} from "~/server/queries/queries";
import EditUser from "../_components/editUser";
import CreateUser from "../_components/createUser";

export default async function FullPageUserView(props: { id: string }) {
  const { id } = props;
  if (id === "newUser") {
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
  const user = await getUserByIdClerk(id);
  const orgs = await getAllOrgs();
  const currentOrg = await getOrgByUserId(id);

  return <EditUser user={user} orgs={orgs} currentOrg={currentOrg} />;
}
