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

export default function TrackerDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
//   const connection = new web3.Connection("http://127.0.0.1:8899", "confirmed");
  const { connection } = useConnection();
  const trackerTitle = decodeURIComponent(params.id);
  const [count, setCount] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<TrackerStats | null>(null);
  const [streak, setStreak] = useState<number>(0);
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
      const trackerStats = getTrackerStatsPda(trackerId, normalizedCurrentDate);

      const stats = await program.methods
      .getTrackerStats(trackerId, new BN(normalizedCurrentDate))
      // @ts-ignore - Account structure is correct but TypeScript types are mismatched
      .accounts({
        trackerStats: trackerStats,
        tracker: trackerPda,
      } as any)
      .view();

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

      setStreak(Number(streak.streak));
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold">{trackerTitle}</h1>
        </div>
        <WalletMultiButton />
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
          <h2 className="text-xl font-bold mb-4">Tracker Stats</h2>
          {stats && (
            <div className="mb-4">
              <div className="text-lg">Total Count: {stats.totalCount}</div>
              <div className="text-lg">Unique Users: {stats.uniqueUsers}</div>
              <div className="text-lg">Your Streak: {streak} days</div>
            </div>
          )}
          <div className="mt-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="count">
              Today's Count
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="count"
              type="number"
              placeholder="Enter today's count"
              value={count}
              onChange={(e) => setCount(e.target.value)}
            />
            <button
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={handleAddData}
              disabled={loading || !count}
            >
              {loading ? 'Adding...' : 'Add Data'}
            </button>
          </div>
        </div>

        {trackerList.length > 0 && (
          <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
            <h2 className="text-xl font-bold mb-4">No-Smoking Streak & Track Status</h2>
            <TrackerStreakGraph trackerList={trackerList} trackerStatsList={trackerStatsList} />
          </div>
        )}
      </div>
    </div>
  );
} 