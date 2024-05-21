/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");
import nextPWA from "next-pwa";

/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV !== "development",
  },
};

const withPWA = nextPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

// Export the combined configuration for Next.js with PWA support
export default withPWA(nextConfig);

// /** @type {import("next").NextConfig} */
// const config = {
//   reactStrictMode: true, // Enable React strict mode for improved error handling
//   swcMinify: true, // Enable SWC minification for improved performance
//   compiler: {
//     removeConsole: process.env.NODE_ENV !== "development", // Remove console.log in production
//   },
// };

// // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
// const withPWA = nextPWA({
//   dest: "public",
//   disable: process.env.NODE_ENV === "development", // Disable PWA in development
//   register: true, // Register the PWA service worker
//   skipWaiting: true, // Skip waiting for service worker activation
// });

// // eslint-disable-next-line @typescript-eslint/no-unsafe-call
// export default withPWA(config);
