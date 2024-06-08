import FullPageUserView from "~/app/common/full-page-user";

export default function CreateUserPage({
  params: { id: userId },
}: {
  params: { id: string };
}) {
  return (
    <div className="flex h-full min-h-0 w-full min-w-0 overflow-y-hidden">
      <FullPageUserView id={userId} />
    </div>
  );
}
