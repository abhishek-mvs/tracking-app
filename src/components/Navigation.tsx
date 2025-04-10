'use client';

import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function Navigation() {
  return (
    <nav className="bg-gray-800 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex space-x-4">
            <Link
              href="/"
              className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/nft"
              className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              NFTs
            </Link>
          </div>
          <div className="flex items-center">
            <WalletMultiButton />
          </div>
        </div>
      </div>
    </nav>
  );
} 