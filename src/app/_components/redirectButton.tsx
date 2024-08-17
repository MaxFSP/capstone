"use client";
import { useRouter } from "next/navigation";

export default function RedirectButton() {
  const router = useRouter();

  return (
    <button
      className="w-full rounded-md bg-primary py-2 font-bold text-primary-foreground transition-colors duration-300 hover:bg-primary-foreground hover:text-primary"
      onClick={() => {
        router.push("/dashboard");
      }}
    >
      Go to Dashboard
    </button>
  );
}
