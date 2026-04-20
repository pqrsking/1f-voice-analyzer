import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SPROUT — 子供のアイデアを世界へ",
  description:
    "Children's ideas become real inventions. SPROUT connects young dreamers with engineers worldwide.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
