import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const title = "The Celestial Mirror — The Ptolemaic Cosmos";
const description =
  "An interactive 3D visualization of the Ptolemaic architecture of the cosmos — Earth, the seven planetary spheres, the Stellatum, the Primum Mobile, and the Empyrean beyond — with its parallel in LLM architecture.";
const siteUrl = "https://celestial-llm-mirror.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  verification: {
    google: "uhfJzeNk7rNMvUFE6Y1LYudFlvIR8OXTbolQlDO5eJM",
  },
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: "The Celestial Mirror",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body
        className="flex min-h-full flex-col bg-black"
        suppressHydrationWarning
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
