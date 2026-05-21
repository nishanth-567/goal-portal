import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/shared/Providers";

export const metadata: Metadata = {
  title: "GOALPOCALYPSE — Performance War Room",
  description: "Goal Setting & Tracking Portal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning style={{ backgroundColor: "rgb(8,8,12)" }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          html, body, #__next { 
            background-color: rgb(8, 8, 12) !important; 
            color: white !important;
            min-height: 100vh;
          }
        `}</style>
      </head>
      <body style={{ backgroundColor: "rgb(8,8,12)", color: "white", margin: 0, minHeight: "100vh" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
