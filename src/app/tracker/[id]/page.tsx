'use client';

import { useState, useEffect } from 'react';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { AnchorProvider, BN, web3 } from '@coral-xyz/anchor';
import { getProgram, getTrackingDataPda, getTrackerStatsPda, getTrackerPda, getTrackerStreakPda, getNormalizedCurrentDate, getTrackerStatsListPda } from '../../utils/program';
import { useRouter } from 'next/navigation';
import TrackerStreakGraph from '../../components/TrackerStreakGraph';
import { PublicKey } from '@solana/web3.js';

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

interface StreakData {
  streak: number;
  longestStreak: number;
  lastStreakDate: number;
  longestStreakDate: number;
}

export default function TrackerDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
//   const connection = new web3.Connection("http://127.0.0.1:8899", "confirmed");
  const { connection } = useConnection();
  const trackerTitle = decodeURIComponent(params.id);
  const [count, setCount] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<TrackerStats | null>(null);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [trackerStatsList, setTrackerStatsList] = useState<TrackerStat[]>([]);
  const [trackerList, setTrackerList] = useState<TrackerData[]>([]);
  const [trackerId, setTrackerId] = useState<any | null>(null);

  useEffect(() => {
    if (!connected) {
      router.push('/');
      return;
    }

    const fetchTracker = async () => {
      try {
        const provider = new AnchorProvider(connection, window.solana, {
          commitment: 'confirmed',
          preflightCommitment: 'confirmed'
        });
        const program = getProgram(provider);
        const trackerPda = getTrackerPda(trackerTitle);
        const tracker = await program.account.tracker.fetch(trackerPda);
        setTrackerId(tracker.id);
      } catch (error) {
        console.error('Error fetching tracker:', error);
        router.push('/');
      }
    };

    fetchTracker();
  }, [connected, params.id]);

  useEffect(() => {
    if (connected && trackerId !== null) {
      fetchStats();
      fetchStreak();
      fetchTrackerStatusList();
      fetchTrackerList();
    }
  }, [connected, trackerId]);

  const fetchStats = async () => {
    if (!publicKey || trackerId === null) return;

    try {
      const provider = new AnchorProvider(connection, window.solana, {
        commitment: 'confirmed',
        preflightCommitment: 'confirmed'
      });
      const program = getProgram(provider);
      
      const normalizedCurrentDate = getNormalizedCurrentDate();
      const trackerPda = getTrackerPda(trackerTitle);
      const trackerStatsPda = getTrackerStatsPda(trackerId, normalizedCurrentDate);

      console.log("trackerStatsPda", trackerStatsPda.toBase58());
      const stats = await program.methods
      .getTrackerStats(trackerId, new BN(normalizedCurrentDate))
      // @ts-ignore - Account structure is correct but TypeScript types are mismatched
      .accounts({
        trackerStats: trackerStatsPda,
        tracker: trackerPda,
      } as any)
      .view();
      console.log("stats", stats);
      setStats(stats as TrackerStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchStreak = async () => {
    if (!publicKey || trackerId === null) return;

    try {
      const provider = new AnchorProvider(connection, window.solana, {
        commitment: 'confirmed',
        preflightCommitment: 'confirmed'
      });
      const program = getProgram(provider);
    
      const trackerStreakPda = getTrackerStreakPda(provider, trackerId);

      const streak = await program.methods
      .getUserStreak(trackerId)
      .accounts({
        trackerStreak: trackerStreakPda,
        user: provider.wallet.publicKey,
      })
      .view();

      setStreakData({
        streak: Number(streak.streak),
        longestStreak: Number(streak.longestStreak),
        lastStreakDate: Number(streak.lastStreakDate),
        longestStreakDate: Number(streak.longestStreakDate)
      });
    } catch (error) {
      console.error('Error fetching streak:', error);
    }
  };

  const fetchTrackerList = async () => {
    if (!publicKey || trackerId === null) return;

    try {
      const provider = new AnchorProvider(connection, window.solana, {
        commitment: 'confirmed',
        preflightCommitment: 'confirmed'
      });
      const program = getProgram(provider);
      const trackingDataPda = getTrackingDataPda(provider, trackerId);

      const tracks = await program.methods
      .getUserTrackingData(trackerId)
      .accounts({
        trackingData: trackingDataPda,
        user: provider.wallet.publicKey,
      })
      .view();
      
      const formattedTracks = tracks.map((track: any) => ({
        date: track.date.toNumber(),
        count: track.count,
      }));
      
      setTrackerList(formattedTracks);
    } catch (error) {
      console.error('Error fetching tracker list:', error);
    }
  };

  const fetchTrackerStatusList = async () => {
    if (!publicKey || trackerId === null) return;

    try {
      const provider = new AnchorProvider(connection, window.solana, {
        commitment: 'confirmed',
        preflightCommitment: 'confirmed'
      });
      const program = getProgram(provider);
    
      const trackerStatsListPda = getTrackerStatsListPda(trackerId);
      const stats = await program.methods
      .getAllTrackerStats(trackerId)
      .accounts({
        trackerStatsList: trackerStatsListPda,
      })
      .view();
      
      const formattedStats = stats.map((stat: any) => ({
        date: stat.date.toNumber(),
        totalCount: stat.totalCount,
        uniqueUsers: stat.uniqueUsers
      }));
      console.log("formattedStats", formattedStats);
      setTrackerStatsList(formattedStats);
    } catch (error) {
      console.error('Error fetching tracker status list:', error);
    }
  };

  const handleAddData = async () => {
    if (!publicKey || trackerId === null || !count) return;

    try {
      setLoading(true);
      const provider = new AnchorProvider(connection, window.solana, {
        commitment: 'confirmed',
        preflightCommitment: 'confirmed'
      });
      const program = getProgram(provider);
      const trackerPda = getTrackerPda(trackerTitle);
      const trackingData = getTrackingDataPda(provider, trackerId);
      
      const normalizedCurrentDate = getNormalizedCurrentDate();
      const trackingStatsPda = getTrackerStatsPda(trackerId, normalizedCurrentDate);
      const trackerStreakPda = getTrackerStreakPda(provider, trackerId);
      const trackerStatsListPda = getTrackerStatsListPda(trackerId);

      await program.methods
      .addTrackingData(trackerId, parseInt(count), new BN(normalizedCurrentDate))
      .accounts({
        trackingData: trackingData,
        tracker: trackerPda,
        user: provider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
        trackerStats: trackingStatsPda,
        trackerStreak: trackerStreakPda,
        trackerStatsList: trackerStatsListPda,
      } as any)
      .rpc();

      setCount('');
      fetchStats();
      fetchStreak();
      fetchTrackerStatusList();
      fetchTrackerList();
    } catch (error) {
      console.error('Error adding tracking data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="flex justify-between items-center mb-4 sm:mb-8 gap-2">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => router.push('/')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1.5 sm:py-2 px-2.5 sm:px-4 rounded text-xs sm:text-base flex items-center"
          >
            <span className="mr-1">←</span>
            <span>Back</span>
          </button>
          <h1 className="text-xl sm:text-3xl font-bold whitespace-nowrap">{trackerTitle}</h1>
        </div>
        <div className="scale-[0.85] sm:scale-100 origin-right">
          <WalletMultiButton />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
        {/* Left Block - Personal Streak Details */}
        <div className="bg-white shadow-md rounded px-4 sm:px-8 pt-4 sm:pt-6 pb-4 sm:pb-8">
          <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Your Streak Details</h2>
          {streakData && (
            <div className="space-y-3">
              <div className="text-base sm:text-lg">
                <span className="font-semibold">Current Streak:</span> {streakData.streak} days
              </div>
              <div className="text-base sm:text-lg">
                <span className="font-semibold">Longest Streak:</span> {streakData.longestStreak} days
              </div>
              <div className="text-base sm:text-lg">
                <span className="font-semibold">Last Streak Date:</span> {new Date(streakData.lastStreakDate * 1000).toLocaleDateString()}
              </div>
              <div className="text-base sm:text-lg">
                <span className="font-semibold">Longest Streak Date:</span> {new Date(streakData.longestStreakDate * 1000).toLocaleDateString()}
              </div>
            </div>
          )}
          <div className="mt-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Did you maintain your streak today?
            </label>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <button
                className="flex-1 bg-green-500 hover:bg-green-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded focus:outline-none focus:shadow-outline text-sm sm:text-base"
                onClick={() => {
                  setCount('1');
                  handleAddData();
                }}
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Hurray! 🎉'}
              </button>
              <button
                className="flex-1 bg-red-500 hover:bg-red-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded focus:outline-none focus:shadow-outline text-sm sm:text-base"
                onClick={() => {
                  setCount('0');
                  handleAddData();
                }}
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Nah! 😔'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Block - Community Stats */}
        <div className="bg-white shadow-md rounded px-4 sm:px-8 pt-4 sm:pt-6 pb-4 sm:pb-8">
          <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Community Stats</h2>
          {stats && (
            <div className="space-y-3">
              <div className="text-base sm:text-lg">
                <span className="font-semibold">Total Users Today:</span> {stats.uniqueUsers}
              </div>
              <div className="text-base sm:text-lg">
                <span className="font-semibold">Total Check-ins Today:</span> {stats.totalCount}
              </div>
              <div className="text-base sm:text-lg">
                <span className="font-semibold">Success Rate:</span> {((stats.totalCount / stats.uniqueUsers) * 100).toFixed(1)}%
              </div>
            </div>
          )}
        </div>

        {trackerList.length > 0 && (
          <div className="col-span-1 sm:col-span-2 bg-white shadow-md rounded px-4 sm:px-8 pt-4 sm:pt-6 pb-4 sm:pb-8">
            <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">No-Smoking Streak & Track Status</h2>
            <TrackerStreakGraph trackerList={trackerList} trackerStatsList={trackerStatsList} />
          </div>
        )}
      </div>
    </div>
  );
} 