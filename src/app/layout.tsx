import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Stoic Book 3D — В чём наше благо?",
  description: "Интерактивный 3D модуль с вращающейся книгой стоической философии. Цитаты Марка Аврелия и Эпиктета.",
  keywords: ["стоицизм", "3D книга", "Марк Аврелий", "Эпиктет", "философия", "Three.js", "React"],
  authors: [{ name: "Stoic Book 3D Team" }],
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
