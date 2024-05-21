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

export const themeColor = [
  { media: "(prefers-color-scheme: dark)", color: "#fff" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
