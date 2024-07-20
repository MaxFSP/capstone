export const dynamic = "force-dynamic";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center text-white">
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
  );
}
