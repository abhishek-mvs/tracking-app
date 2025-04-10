import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SolanaWalletProvider } from "../components/WalletProvider";
import { Toaster } from "react-hot-toast";
import Navigation from "../components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tracking App",
  description: "A Solana-based tracking application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SolanaWalletProvider>
          <Toaster position="top-right" />
          <Navigation />
          <main className="min-h-screen bg-gray-50">{children}</main>
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
