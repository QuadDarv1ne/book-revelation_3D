import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { ServiceWorkerRegistration } from "@/components/ui/ServiceWorkerRegistration";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial", "sans-serif"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: true,
  fallback: ["monospace", "courier", "monospace"],
});

export const metadata: Metadata = {
  title: "Stoic Book 3D — В чём наше благо?",
  description: "Интерактивный 3D модуль с вращающейся книгой стоической философии. Цитаты Марка Аврелия и Эпиктета.",
  keywords: ["стоицизм", "3D книга", "Марк Аврелий", "Эпиктет", "философия", "Three.js", "React"],
  authors: [{ name: "Stoic Book 3D Team" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Stoic Book 3D",
  },
  openGraph: {
    title: "Stoic Book 3D — В чём наше благо?",
    description: "Интерактивный 3D модуль с цитатами стоических философов",
    type: "website",
    locale: "ru_RU",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stoic Book 3D — В чём наше благо?",
    description: "Интерактивный 3D модуль с цитатами стоических философов",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#07070d" />
        <meta name="color-scheme" content="dark light" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Analytics />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
