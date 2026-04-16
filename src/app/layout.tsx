import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kitalaku.in",
  description: "AI-based content management dashboard for planning, scheduling, approval, and analytics.",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
});

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${lora.variable}`}>
        <main>{children}</main>
      </body>
    </html>
  );
}
