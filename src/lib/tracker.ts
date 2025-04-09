import { getNormalizedCurrentDate, getTrackerPda, getTrackerRegistryPda, getTrackerStatsListPda, getTrackerStatsPda, getTrackerStreakPda, getTrackingDataPda } from "@/utils/program";
import { getProgram } from "@/utils/program";
import { AnchorProvider, BN } from "@coral-xyz/anchor";
import { Connection } from "@solana/web3.js";

export async function fetchTrackers(connection: Connection) {
    try {
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

        return trackerNames;
    } catch (error) {
        console.error('Error fetching trackers:', error);
        return [];
    }
}   

export async function fetchTracker(connection: Connection, trackerTitle: any) {
    try {
        const provider = new AnchorProvider(connection, window.solana, {
            commitment: 'confirmed',
            preflightCommitment: 'confirmed'
      });
      const program = getProgram(provider);
      const trackerPda = getTrackerPda(trackerTitle);
      const tracker = await program.account.tracker.fetch(trackerPda);
      return tracker;
    } catch (error) {
        console.error('Error fetching tracker:', error);
        return null;
    }
}

export async function fetchStats(connection: Connection, trackerId: any, trackerTitle: any) {
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

        return stats;
    } catch (error) {
        console.error('Error fetching stats:', error);
        return 0;
    }
}   

export async function fetchStreak(connection: Connection, trackerId: any) {
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

        return streak;
    } catch (error) {
        console.error('Error fetching streak:', error);
        return 0;
    }
}

export async function fetchTrackerList(connection: Connection, trackerId: any) {
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
      console.log("formattedTracks", formattedTracks);

      return formattedTracks;
    } catch (error) {
        console.error('Error fetching tracker list:', error);
        return [];
    }
}

export async function fetchTrackerStatusList(connection: Connection, trackerId: any) {
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

      return formattedStats;
    } catch (error) {
        console.error('Error fetching tracker status list:', error);
        return [];
    }
}       