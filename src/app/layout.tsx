import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/shared/Providers";

export const metadata: Metadata = {
  title: "Meridian.",
  description: "Performance Management. Redefined.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning style={{ backgroundColor: "#000000" }}>
      <head>
        <meta name="theme-color" content="#000000" />
      </head>
      <body style={{ backgroundColor: "#000000", color: "#FFFFFF", margin: 0, padding: 0, minHeight: "100vh" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
