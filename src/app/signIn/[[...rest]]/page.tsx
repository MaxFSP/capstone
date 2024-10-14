import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center pt-20">
      <SignIn routing="hash" appearance={{ elements: { footer: 'hidden' } }} />
    </div>
  );
}
