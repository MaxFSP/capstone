import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

function TopNav() {
  return (
    <nav className="flex justify-between  border-b bg-gray-800 p-4 text-xl font-semibold  text-white">
      <div>Logo</div>
      <div>
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </nav>
  );
}

export default TopNav;