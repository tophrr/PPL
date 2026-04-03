import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kitalakuin",
  description: "A Next.js app scaffold with working tests and local styling.",
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
