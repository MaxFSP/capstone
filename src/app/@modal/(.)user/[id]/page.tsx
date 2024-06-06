import { Modal } from "./modal";
import { getUserById } from "~/server/queries";

export default async function CreateUserModal({
  params: { id: userId },
}: {
  params: { id: string };
}) {
  const user = await getUserById(userId);
  return (
    <Modal>
      <p>{user.email}</p>
    </Modal>
  );
}
