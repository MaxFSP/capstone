import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Capstone",
  description: "Kanban like progressive web app",
  generator: "Next.js",
  manifest: "/manifest.json",
  keywords: ["nextjs", "nextjs13", "next13", "pwa", "next-pwa"],
  authors: [{ name: "Max" }],
  icons: [{ rel: "icon", url: "/fav.ico" }],
};

export const viewport =
  "width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover, minimum-scale=1";

function TopNav() {
  return (
    <nav className="flex justify-between  border-b bg-gray-800 p-4 text-xl font-semibold  text-white">
      <div>Logo</div>
      <div>Sign in</div>
    </nav>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} flex flex-col gap-4`}>
      <body>
        <TopNav />
        {children}
      </body>
    </html>
  );
}
