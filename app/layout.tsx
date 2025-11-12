import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blackjack Strategy Trainer",
  description: "Master basic blackjack strategy with interactive training",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-felt min-h-screen">
        {children}
      </body>
    </html>
  );
}
