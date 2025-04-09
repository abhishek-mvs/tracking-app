'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { mintNft } from '@/lib/mintNft';
import { toast } from 'react-hot-toast';

const NFT_OPTIONS = [
  {
    days: 3,
    mintAddress: 'CHtoyS3DykTcEi6jTgFP6hhJyG55AKwAUVzJLexafKxz',
    title: '3-Day Streak NFT',
    description: 'Reward for maintaining a 3-day streak',
  },
  {
    days: 7,
    mintAddress: 'AJvaQdmiKixog6JuXa4Hub6DnTb42ULSGTRAFootByLa',
    title: '7-Day Streak NFT',
    description: 'Reward for maintaining a 7-day streak',
  },
  {
    days: 30,
    mintAddress: 'DvbZu2i1b9bpt4w37trV3wsdwBaYRyTRydWbH4d6goMz',
    title: '30-Day Streak NFT',
    description: 'Reward for maintaining a 30-day streak',
  },
];

export default function NFTPage() {
  const { publicKey, connected } = useWallet();
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // TODO: Replace with actual streak fetching logic
  useEffect(() => {
    // Fetch current streak from your backend or local storage
    const fetchStreak = async () => {
      // Example: Fetch streak from localStorage
      const streak = localStorage.getItem('currentStreak');
      setCurrentStreak(streak ? parseInt(streak) : 0);
    };
    fetchStreak();
  }, []);

  const handleMintNFT = async (mintAddress: string) => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setIsLoading(true);
      await mintNft(mintAddress, publicKey.toString());
      toast.success('NFT minted successfully!');
    } catch (error) {
      console.error('Error minting NFT:', error);
      toast.error('Failed to mint NFT');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Streak Rewards</h1>
          <p className="mt-2 text-lg text-gray-600">
            Current Streak: {currentStreak} days
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {NFT_OPTIONS.map((nft) => (
            <div
              key={nft.days}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-900">{nft.title}</h2>
              <p className="mt-2 text-gray-600">{nft.description}</p>
              <div className="mt-4">
                <button
                  onClick={() => handleMintNFT(nft.mintAddress)}
                  disabled={!connected || currentStreak < nft.days || isLoading}
                  className={`w-full px-4 py-2 rounded-md text-white font-medium ${
                    !connected || currentStreak < nft.days
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {!connected
                    ? 'Connect Wallet'
                    : currentStreak < nft.days
                    ? `Requires ${nft.days} day streak`
                    : isLoading
                    ? 'Minting...'
                    : 'Mint NFT'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
