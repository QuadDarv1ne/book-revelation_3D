import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { ServiceWorkerRegistration } from "@/components/ui/ServiceWorkerRegistration";
import { WebVitalsMonitor } from "@/components/analytics/WebVitalsMonitor";
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

// CSP для мета-тега (резервный вариант, основной в middleware)
const _cspContent = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'wasm-unsafe-eval' https://vercel.live;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https:;
  font-src 'self' data: https://fonts.gstatic.com;
  connect-src 'self' https://vercel.live https://analytics.vercel.com;
  frame-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  worker-src 'self' blob:;
  child-src 'self' blob:;
`.replace(/\s+/g, ' ').trim();

export const metadata: Metadata = {
  title: {
    default: "Book Revelation 3D — Откровение Книги",
    template: "%s | Book Revelation 3D",
  },
  description: "Интерактивный 3D модуль с вращающейся книгой стоической философии. Цитаты Марка Аврелия, Эпиктета, Стивена Хокинга и других великих мыслителей.",
  keywords: ["стоицизм", "3D книга", "Марк Аврелий", "Эпиктет", "Стивен Хокинг", "философия", "Three.js", "React", "цитаты великих людей"],
  authors: [{ name: "Book Revelation 3D Team" }],
  creator: "Book Revelation 3D Team",
  publisher: "Book Revelation 3D",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Book Revelation 3D",
  },
  openGraph: {
    title: "Book Revelation 3D — Откровение Книги",
    description: "Интерактивный 3D модуль с цитатами стоических философов",
    type: "website",
    locale: "ru_RU",
    siteName: "Book Revelation 3D",
    url: "https://book-revelation-3d.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "Book Revelation 3D — Откровение Книги",
    description: "Интерактивный 3D модуль с цитатами стоических философов",
    creator: "@bookrevelation3d",
  },
  metadataBase: new URL("https://book-revelation-3d.vercel.app"),
  alternates: {
    canonical: "/",
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
        <WebVitalsMonitor />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
