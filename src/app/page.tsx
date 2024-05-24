export const dynamic = "force-dynamic";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="background-black flex min-h-screen flex-col items-center justify-center bg-gradient-to-b text-white">
      <div className="flex flex-col items-center justify-center">
        <p> In development</p>
        <Image
          className="mt-4"
          src={"/images/workinprogress.webp"}
          style={{ objectFit: "contain" }}
          width={720}
          height={720}
          alt="logo"
        />
      </div>
    </main>
  );
}
