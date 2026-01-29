import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/shared/Header";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "BreakThru | Visualizing Backend Operations",
  description: "Real-time backend visualization tool for educational and debugging transparency.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased text-white bg-black h-screen overflow-hidden`}>
        <Header />
        <main className="h-full w-full pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}
