import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eldar Nebolsin — Pianist",
  description: "Official website of pianist Eldar Nebolsin.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
