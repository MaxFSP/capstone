import "../styles/globals.css";

// Clerk
import { SignedIn, SignedOut } from "@clerk/nextjs";

// Fonts
import { GeistSans } from "geist/font/sans";

// Types
import type { Metadata } from "next";

// Providers
import { Providers } from "./providers";

// Components
import SidebarContainer from "./_components/sidebarContainer";

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
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${GeistSans.variable} flex flex-col gap-4 dark`}
    >
      <body className="bg-black">
        <Providers>
          <SignedIn>
            <div className="flex flex-col lg:flex-row">
              <SidebarContainer />
              <main className="ml-0 flex-grow p-5 transition-all duration-300 ease-in-out lg:ml-64">
                {children}
              </main>
              {modal}
            </div>
          </SignedIn>
          <SignedOut>{children}</SignedOut>
        </Providers>
      </body>
    </html>
  );
}
