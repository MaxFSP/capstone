"use client";
import { useRouter } from "next/navigation";

export default function RedirectButton() {
  const router = useRouter();

  return (
    <button
      className="w-full rounded-md bg-[#ECB365] py-2 font-bold text-black"
      onClick={() => {
        router.push("/dashboard");
      }}
    >
      Go to Dashboard
    </button>
  );
}
