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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* App Introduction */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
            Track Your Daily Progress
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Build better habits and achieve your goals with our blockchain-powered habit tracking app. 
            Earn exclusive NFTs as rewards for maintaining your streaks.
          </p>
        </div>

        {connected ? (
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-gray-800 shadow-lg rounded-xl px-6 sm:px-8 py-6 sm:py-8">
              <h2 className="text-2xl font-bold mb-6 text-white">Select Tracker</h2>
              {loading ? (
                <div className="text-center py-4 text-gray-300 text-lg">Loading trackers...</div>
              ) : (
                <div className="space-y-3">
                  {trackers.map((tracker) => (
                    <div key={tracker} className="space-y-1">
                      <button
                        className="w-full text-left p-4 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-all duration-200 ease-in-out transform hover:scale-[1.02]"
                        onClick={() => handleTrackerSelect(tracker)}
                      >
                        <div className="font-semibold text-lg">{tracker}</div>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto mb-16">
            <div className="text-center bg-gray-800 rounded-xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold text-white mb-4">Get Started</h2>
              <p className="text-gray-300 text-lg mb-6">Connect your wallet to start tracking your habits and earning NFT rewards.</p>
              <div className="inline-block">
                <WalletMultiButton />
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-800 rounded-xl shadow-lg p-8 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-gray-700">
            <div className="flex flex-col items-center text-center pt-4 sm:pt-0">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-white mb-3">Track Daily Habits</h3>
              <p className="text-gray-400 text-lg">Monitor your progress and build consistent habits with daily tracking.</p>
            </div>
            <div className="flex flex-col items-center text-center pt-8 sm:pt-0 sm:px-8">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold text-white mb-3">Earn NFT Rewards</h3>
              <p className="text-gray-400 text-lg">Get unique NFTs for maintaining streaks of 3, 7, and 30 days.</p>
            </div>
            <div className="flex flex-col items-center text-center pt-8 sm:pt-0">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-white mb-3">Community Stats</h3>
              <p className="text-gray-400 text-lg">See how others are doing and stay motivated with community statistics.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
