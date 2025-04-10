'use client';

import { useState, useEffect } from 'react';
import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useConnection } from '@solana/wallet-adapter-react';
import { AnchorProvider, BN, web3 } from '@coral-xyz/anchor';
import { getProgram, getProgramStatePda, getTrackingDataPda, getTrackerStatsPda, getTrackerPda, getTrackerRegistryPda, PROGRAM_ID, getTrackerStreakPda, getNormalizedCurrentDate, getTrackerStatsListPda } from '../utils/program';
import { useRouter } from 'next/navigation';
import { fetchTrackers } from '../lib/tracker';

// Add type declaration for window.solana
declare global {
  interface Window {
    solana?: any;
  }
}

export default function HomePage() {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  // const connection = new web3.Connection("http://127.0.0.1:8899", "confirmed");
  const { connection } = useConnection();
  const [trackers, setTrackers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (connected) {
      fetchTrackersList();
    }
  }, [connected]);

  const fetchTrackersList = async () => {
    if (!publicKey) return;

    try {
      setLoading(true);
      const trackerNames = await fetchTrackers(connection);
      setTrackers(trackerNames);
    } catch (error) {
      console.error('Error fetching trackers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackerSelect = (tracker: string) => {
    router.push(`/tracker/${tracker}`);
  };

  const handleNFTSelect = () => {
    router.push(`/nft`);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* App Introduction */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Track Your Daily Progress
          </h1>
          <p className="text-xl text-gray-300 mb-4 max-w-2xl mx-auto">
            Build better habits and achieve your goals with our blockchain-powered habit tracking app. 
            Earn exclusive NFTs as rewards for maintaining your streaks.
          </p>
        </div>

        {connected ? (
          <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6">
            <div className="bg-gray-800 shadow-md rounded-lg px-4 sm:px-8 pt-4 sm:pt-6 pb-4 sm:pb-6">
              <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-white">Select Tracker</h2>
              {loading ? (
                <div className="text-center py-2 text-gray-300">Loading trackers...</div>
              ) : (
                <div className="space-y-2">
                  {trackers.map((tracker) => (
                    <div key={tracker} className="space-y-1">
                      <button
                        className="w-full text-left p-2 sm:p-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-all duration-200 ease-in-out"
                        onClick={() => handleTrackerSelect(tracker)}
                      >
                        <div className="font-semibold text-sm sm:text-base">{tracker}</div>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center bg-gray-800 rounded-lg p-6 shadow-lg max-w-xl mx-auto mb-6">
            <h2 className="text-2xl font-bold text-white mb-3">Get Started</h2>
            <p className="text-gray-300 mb-4">Connect your wallet to start tracking your habits and earning NFT rewards.</p>
            <div className="inline-block">
              <WalletMultiButton />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg flex flex-col h-full">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="text-lg font-semibold text-white mb-2">Track Daily Habits</h3>
            <p className="text-gray-400">Monitor your progress and build consistent habits with daily tracking.</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg flex flex-col h-full">
            <div className="text-3xl mb-2">🏆</div>
            <h3 className="text-lg font-semibold text-white mb-2">Earn NFT Rewards</h3>
            <p className="text-gray-400">Get unique NFTs for maintaining streaks of 3, 7, and 30 days.</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg flex flex-col h-full">
            <div className="text-3xl mb-2">👥</div>
            <h3 className="text-lg font-semibold text-white mb-2">Community Stats</h3>
            <p className="text-gray-400">See how others are doing and stay motivated with community statistics.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
