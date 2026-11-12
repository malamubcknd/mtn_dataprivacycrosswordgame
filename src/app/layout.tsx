import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MTN Data Privacy Crossword Challenge",
  description: "Data Privacy Week crossword challenge"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}