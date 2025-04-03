'use client';

import { useState, useEffect } from 'react';
import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useConnection } from '@solana/wallet-adapter-react';
import { AnchorProvider, BN, web3 } from '@coral-xyz/anchor';
import { getProgram, getProgramStatePda, getTrackingDataPda, getTrackerStatsPda, getTrackerPda, getTrackerRegistryPda, PROGRAM_ID, getTrackerStreakPda, getNormalizedCurrentDate, getTrackerStatsListPda } from './utils/program';
import { PublicKey } from '@solana/web3.js';
import TrackerStatsGraph from './components/TrackerStatsGraph';
import TrackerStreakGraph from './components/TrackerStreakGraph';

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
  const { publicKey, connected } = useWallet();
  const connection = new web3.Connection("http://127.0.0.1:8899", "confirmed");
  // const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const [trackers, setTrackers] = useState<string[]>([]);
  const [selectedTracker, setSelectedTracker] = useState<string | null>(null);
  const [trackerId, setTrackerId] = useState<any | null>(null);
  const [count, setCount] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<TrackerStats | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [trackerStatsList, setTrackerStatsList] = useState<TrackerStat[]>([]);
  const [trackerList, setTrackerList] = useState<TrackerData[]>([]);

  useEffect(() => {
    if (connected) {
      fetchTrackers();
    }
  }, [connected]);

  useEffect(() => {
    if (connected && selectedTracker !== null) {
      fetchTracker();
    }
  }, [connected, selectedTracker]);


  useEffect(() => {
    if (connected && trackerId !== null) {
      fetchStats();
      fetchStreak();
      fetchTrackerStatusList();
      fetchTrackerList();
    }
  }, [connected, trackerId]);

  
  const fetchTrackers = async () => {
    if (!publicKey) return;

    try {
      console.log("connection", connection);
      console.log("wallet", anchorWallet);
      const provider = new AnchorProvider(connection, window.solana, {
        commitment: 'confirmed',
        preflightCommitment: 'confirmed'
      });
      console.log("provider", provider.publicKey?.toBase58());
      const program = getProgram(provider);
      
      const trackerRegistry = getTrackerRegistryPda();
      console.log("trackerRegistry", trackerRegistry.toBase58());
      const trackerNames = await program.methods
      .getAllTrackers()
      .accounts({
        trackerRegistry: trackerRegistry,
      })
      .view();
      console.log("trackerNames", trackerNames);
      setTrackers(trackerNames);
    } catch (error) {
      console.error('Error fetching trackers:', error);
    }
  };

  const fetchTracker = async () => {
    if (!publicKey || selectedTracker === null) return;

    try {
      const provider = new AnchorProvider(connection, window.solana, {
        commitment: 'confirmed',  
        preflightCommitment: 'confirmed'
      });
      const program = getProgram(provider);
      const [trackerPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("tracker"), Buffer.from(selectedTracker)],
        program.programId
      );
      const tracker = await program.account.tracker.fetch(trackerPda);
      const trackerIdValue = tracker.id;
      setTrackerId(trackerIdValue);
      console.log("tracker", tracker);
    } catch (error) {
      console.error('Error fetching tracker:', error);
    }
  };

  const fetchStats = async () => {
    if (!publicKey || trackerId === null || selectedTracker === null) return;

    try {
      const provider = new AnchorProvider(connection, window.solana, {
        commitment: 'confirmed',
        preflightCommitment: 'confirmed'
      });
      const program = getProgram(provider);
      const trackerPda = getTrackerPda(selectedTracker);
      
      const normalizedCurrentDate = getNormalizedCurrentDate();
      const trackerStats = getTrackerStatsPda(trackerId, normalizedCurrentDate);

      const stats = await program.methods
      .getTrackerStats(trackerId, new BN(normalizedCurrentDate))
      .accounts({
        trackerStats: trackerStats,
        tracker: trackerPda,
      })
      .view();

      console.log("stats", stats);
      setStats(stats as TrackerStats);
    } catch (error) {
      console.log("error", error);
      console.error('Error fetching stats:', error);
    }
  };

  const fetchStreak = async () => {
    if (!publicKey || selectedTracker === null || trackerId === null) return;

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


      console.log("streak", streak);
      setStreak(Number(streak.streak));
    } catch (error) {
      console.error('Error fetching streak:', error);
    }
  };

  const fetchTrackerList = async () => {
    if (!publicKey || selectedTracker === null || trackerId === null) return;

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
      console.log("tracks", tracks);
      for (const track of tracks) {
        console.log("track date, count", track.date.toNumber(), track.count);
      }
    } catch (error) {
      console.error('Error fetching streak:', error);
    }
  };

  const fetchTrackerStatusList = async () => {
    if (!publicKey || selectedTracker === null || trackerId === null) return;

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
      console.error('Error fetching streak:', error);
    }
  };

  const handleAddData = async () => {
    if (!publicKey || selectedTracker === null || trackerId === null || !count) return;

    try {
      setLoading(true);
      const provider = new AnchorProvider(connection, window.solana, {
        commitment: 'confirmed',
        preflightCommitment: 'confirmed'
      });
      const program = getProgram(provider);
      const trackerPda = getTrackerPda(selectedTracker);
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
      })
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
        <h1 className="text-3xl font-bold">Tracking Dashboard</h1>
        <WalletMultiButton />
      </div>

      {connected ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h2 className="text-xl font-bold mb-4">Select Tracker</h2>
            <div className="space-y-2">
              {trackers.map((tracker) => (
                <button
                  key={tracker}
                  className={`w-full text-left p-3 rounded ${
                    selectedTracker === tracker
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={() => setSelectedTracker(tracker)}
                >
                  <div className="font-semibold">{tracker}</div>
                </button>
              ))}
            </div>
          </div>

          {selectedTracker !== null && (
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
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
          )}
        </div>
      ) : (
        <div className="text-center">
          <p className="text-xl">Please connect your wallet to view and add tracking data.</p>
        </div>
      )}

      {connected && selectedTracker !== null && trackerList.length > 0 && (
        <div className="mt-8 bg-white shadow-md rounded px-8 pt-6 pb-8">
          <h2 className="text-xl font-bold mb-4">No-Smoking Streak & Track Status</h2>
          <TrackerStreakGraph trackerList={trackerList} trackerStatsList={trackerStatsList} />
        </div>
      )}

      {connected && selectedTracker !== null && trackerStatsList.length > 0 && (
        <div className="mt-8 bg-white shadow-md rounded px-8 pt-6 pb-8">
          <h2 className="text-xl font-bold mb-4">Success Rate Over Time</h2>
          <TrackerStatsGraph stats={trackerStatsList} />
        </div>
      )}
    </div>
  );
}
