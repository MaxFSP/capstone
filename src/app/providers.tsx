import { NextUIProvider } from "@nextui-org/react";
import { esMX } from "@clerk/localizations";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider localization={esMX}>
      <NextUIProvider>{children}</NextUIProvider>
    </ClerkProvider>
  );
}
