import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { metadata as appMetadata } from "./metadata";
import { ClientProviders } from "@/components/ClientProviders";
import GlobalLoader from "@/components/GlobalLoader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = appMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ClientProviders>
          <GlobalLoader />
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
