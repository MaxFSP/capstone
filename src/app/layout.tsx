import '~/styles/globals.css';
import '@uploadthing/react/styles.css';

// UploadThing
import { NextSSRPlugin } from '@uploadthing/react/next-ssr-plugin';
import { extractRouterConfig } from 'uploadthing/server';
import { ourFileRouter } from '~/app/api/uploadthing/core';

// Clerk
import { SignedIn, SignedOut } from '@clerk/nextjs';

// Fonts
import { GeistSans } from 'geist/font/sans';

// Types
import type { Metadata } from 'next';

// Providers
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

// Components
import SidebarContainer from './_components/sidebarContainer';
import { Toaster } from '~/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Capstone',
  description: 'Kanban-like progressive web app',
  generator: 'Next.js',
  manifest: '/manifest.json',
  keywords: ['nextjs', 'nextjs13', 'next13', 'pwa', 'next-pwa'],
  authors: [{ name: 'Max' }],
  icons: [{ rel: 'icon', url: '/fav.ico' }],
};

export const viewport =
  'width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover, minimum-scale=1';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const themeClass = getInitialTheme(); // Custom server-side function to determine initial theme

  return (
    <html className={`${themeClass} ${GeistSans.variable} flex flex-col gap-4`}>
      <body className="bg-background text-foreground">
        <ClerkProvider appearance={{ baseTheme: themeClass === 'dark' ? dark : undefined }}>
          <SignedIn>
            <div className="flex flex-col lg:flex-row">
              <SidebarContainer />
              <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
              <main className="mt-14 w-screen flex-grow transition-all duration-300 ease-in-out">
                {children}
              </main>
              <Toaster />
            </div>
          </SignedIn>
          <SignedOut>{children}</SignedOut>
        </ClerkProvider>
        {/* Script to handle client-side theme switching */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const storedTheme = localStorage.getItem('theme');
                if (storedTheme) {
                  document.documentElement.classList.add(storedTheme);
                }
                document.getElementById('theme-toggle').addEventListener('click', function() {
                  document.documentElement.classList.toggle('dark');
                  const isDark = document.documentElement.classList.contains('dark');
                  localStorage.setItem('theme', isDark ? 'dark' : 'light');
                });
              })();
              `,
          }}
        ></script>
      </body>
    </html>
  );
}

// Server-side function to determine initial theme
function getInitialTheme() {
  // Example logic to determine theme (you can adjust this)
  const prefersDarkMode = false; // Replace with actual logic, e.g., based on cookies, user settings, etc.
  return prefersDarkMode ? 'dark' : '';
}
