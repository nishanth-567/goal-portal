import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/shared/Providers";

export const metadata: Metadata = {
  title: "GOALPOCALYPSE — Performance War Room",
  description: "Goal Setting & Tracking Portal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning style={{ backgroundColor: "#08080C" }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ backgroundColor: "#08080C", color: "white", margin: 0, padding: 0, minHeight: "100vh", fontFamily: "'Space Grotesk', sans-serif" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
