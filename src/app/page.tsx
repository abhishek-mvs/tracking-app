'use client';

import { useState, useEffect } from 'react';
import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useConnection } from '@solana/wallet-adapter-react';
import { AnchorProvider, BN, web3 } from '@coral-xyz/anchor';
import { getProgram, getProgramStatePda, getTrackingDataPda, getTrackerStatsPda, getTrackerPda, getTrackerRegistryPda, PROGRAM_ID, getTrackerStreakPda, getNormalizedCurrentDate, getTrackerStatsListPda } from './utils/program';
import { useRouter } from 'next/navigation';

// Add type declaration for window.solana
declare global {
  interface Window {
    solana?: any;
  }
}

interface Tracker {
  id: number;
  title: string;
  description: string;
}

interface TrackerStats {
  totalCount: number;
  uniqueUsers: number;
}

interface TrackerStat {
  date: number;
  totalCount: number;
  uniqueUsers: number;
}

interface TrackerData {
  date: number;
  count: number;
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
      fetchTrackers();
    }
  }, [connected]);

  const fetchTrackers = async () => {
    if (!publicKey) return;

    try {
      setLoading(true);
      const provider = new AnchorProvider(connection, window.solana, {
        commitment: 'confirmed',
        preflightCommitment: 'confirmed'
      });
      const program = getProgram(provider);
      
      const trackerRegistry = getTrackerRegistryPda();
      const trackerNames = await program.methods
      .getAllTrackers()
      .accounts({
        trackerRegistry: trackerRegistry,
      })
      .view();
      
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

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-8 gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Tracking Dashboard</h1>
        <WalletMultiButton />
      </div>

      {connected ? (
        <div className="grid grid-cols-1 gap-4 sm:gap-8">
          <div className="bg-white shadow-md rounded px-4 sm:px-8 pt-4 sm:pt-6 pb-4 sm:pb-8">
            <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Select Tracker</h2>
            {loading ? (
              <div className="text-center py-2 sm:py-4">Loading trackers...</div>
            ) : (
              <div className="space-y-2">
                {trackers.map((tracker) => (
                  <button
                    key={tracker}
                    className="w-full text-left p-2 sm:p-3 rounded bg-gray-100 hover:bg-gray-200"
                    onClick={() => handleTrackerSelect(tracker)}
                  >
                    <div className="font-semibold text-sm sm:text-base">{tracker}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-base sm:text-xl">Please connect your wallet to view and add tracking data.</p>
        </div>
      )}
    </div>
  );
}
