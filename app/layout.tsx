import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Providers & Components
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/QueryProvider";
import LayoutContent from "@/components/common/LayoutContent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Luxora Estates — Premium Real Estate",
    template: "%s | Luxora Estates",
  },
  description:
    "Discover premium luxury properties across India. Luxora Estates connects elite buyers, sellers, and builders on one exclusive platform.",
  keywords: ["luxury real estate", "premium properties", "India estates", "buy property", "sell property"],
  openGraph: {
    title: "Luxora Estates — Premium Real Estate",
    description: "Discover premium luxury properties across India.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <TooltipProvider>
            <LayoutContent>
              {children}
            </LayoutContent>
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  );
}