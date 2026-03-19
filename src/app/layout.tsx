"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";
import { AppProvider } from "@/components/AppProvider";
import { RouterProvider } from "@/components/Router";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Todoist</title>
        <meta name="description" content="Todoist clone - Task management app" />
      </head>
      <body className={inter.className}>
        <RouterProvider>
          <AppProvider>
            <AppShell />
          </AppProvider>
        </RouterProvider>
      </body>
    </html>
  );
}
