import "../styles/globals.css";

import { SignedIn, SignedOut } from "@clerk/nextjs";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import TopNav from "./_components/topnav";

import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { esMX } from "@clerk/localizations";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }} localization={esMX}>
      <html lang="es" className={`${GeistSans.variable} flex flex-col gap-4`}>
        <body>
          <SignedIn>
            <TopNav />
          </SignedIn>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
