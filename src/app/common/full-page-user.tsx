import { getAllOrgs, getOrgByUserId, getUserById } from "~/server/queries";
import EditUser from "../_components/editUser";
import CreateUser from "../_components/createUser";

export default async function FullPageUserView(props: { id: string }) {
  if (props.id === "newUser") {
    const departments = await getAllOrgs();
    return (
      <CreateUser
        user={{
          firstName: "",
          lastName: "",
          username: "",
          email: [""],
          password: "",
        }}
        departments={departments}
      />
    );
  }
  const user = await getUserById(props.id);
  const departments = await getOrgByUserId(user.id);

  return <EditUser user={user} departments={departments} />;
}
