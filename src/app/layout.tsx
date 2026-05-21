import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/toaster";
import { PwaRegistrar } from "@/components/PwaRegistrar";
import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
  title: "IRIS | Barangay East Tapinac",
  description:
    "Incident Reporting and Information System for Barangay East Tapinac",
  icons: {
    icon: [
      { url: "/EastTapinac.png", sizes: "16x16", type: "image/png" },
      { url: "/EastTapinac.png", sizes: "32x32", type: "image/png" },
      { url: "/EastTapinac.png", sizes: "48x48", type: "image/png" },
      { url: "/EastTapinac.png", sizes: "192x192", type: "image/png" },
      { url: "/EastTapinac.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/EastTapinac.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: [
      { url: "/EastTapinac.png", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "IRIS",
    statusBarStyle: "default",
  },
  applicationName: "IRIS",
};

export const viewport: Viewport = {
  themeColor: "#1E4FA3",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className="antialiased font-sans"
      >
        {children}
        <Toaster />
        <PwaRegistrar />
      </body>
    </html>
  );
}
