import type { Metadata } from "next";
import { Inter, Poppins, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
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
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${poppins.variable} ${jetbrainsMono.variable} antialiased font-sans`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}