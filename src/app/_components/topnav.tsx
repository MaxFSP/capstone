import { SignedIn, UserButton } from "@clerk/nextjs";

function TopNav() {
  return (
    <nav className="flex justify-between  border-b bg-gray-800 p-4 text-xl font-semibold  text-white">
      <div>Rudan Maquinarias</div>
      <div>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </nav>
  );
}

export default TopNav;
