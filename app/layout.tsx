import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "mei",
  icons: {
    icon: [{ url: "/favicon.ico?v=2", type: "image/x-icon" }],
    shortcut: "/favicon.ico?v=2",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
