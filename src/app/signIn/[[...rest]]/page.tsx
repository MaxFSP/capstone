import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex content-center justify-center pt-20">
      <SignIn routing="hash" />
    </div>
  );
}
