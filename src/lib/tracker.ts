import { getNFTTrackingPda, getNormalizedCurrentDate, getTrackerPda, getTrackerRegistryPda, getTrackerStatsListPda, getTrackerStatsPda, getTrackerStreakPda, getTrackingDataPda, getUserNftPda } from "@/utils/program";
import { getProgram } from "@/utils/program";
import { AnchorProvider, BN } from "@coral-xyz/anchor";
import { Connection, SystemProgram, PublicKey } from "@solana/web3.js";


export async function fetchTrackersData(connection: Connection) {
    const trackers = await fetchTrackers(connection);
    const trackerDataList: any[] = [];
    for (const tracker of trackers) {
        const trackerData = await fetchTracker(connection, tracker);
        console.log("trackerData", trackerData);
        trackerDataList.push(trackerData);
    }
    return trackerDataList;
}   

export async function fetchTrackers(connection: Connection) {
    try {
        console.log("window.solana", window.solana.publicKey.toBase58());
        console.log("connection", connection);
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

        if (!provider.wallet.publicKey) {
            throw new Error('Wallet not connected');
        }

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

export async function fetchNFTsList(connection: Connection) {
    try {
        const provider = new AnchorProvider(connection, window.solana, {
            commitment: 'confirmed',
            preflightCommitment: 'confirmed'
        });
        const program = getProgram(provider);

        const nftTrackingPda = getNFTTrackingPda(provider);
        const mintAddresses = await program.methods
        .getUserNfts()
        .accounts({
            nftTracking: nftTrackingPda,
            user: provider.wallet.publicKey,
        })
        .view();
        const nfts = [];
        for (const mintAddress of mintAddresses) {
            const nftPda = getUserNftPda(provider, mintAddress);
            const nft = await program.account.userNft.fetch(nftPda);
            nfts.push(nft);
        }
        return nfts;
    } catch (error) {
        console.error('Error fetching NFTs:', error);
        return [];
    }
}

export async function addNFT(connection: Connection, nftMintAddress: string, nftMetadata: any, eligibleNFT: any, tracker: any): Promise<boolean> {
    try {
        const nftMint = new PublicKey(nftMintAddress);
        const provider = new AnchorProvider(connection, window.solana, {
            commitment: 'confirmed',
            preflightCommitment: 'confirmed'
        });
        const program = getProgram(provider);
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const metadata = [
            { key: "name", value: eligibleNFT.title.toString() },
            { key: "description", value: nftMetadata.jsonMetadata.description },
            { key: "trackerName", value: tracker.title.toString() },
            { key: "trackerId", value: tracker.id.toString() },
            { key: "mintTimestamp", value: currentTimestamp.toString() },
            { key: "image", value: nftMetadata.imageUri }
          ]
        console.log("metadata", metadata);
        const nftTrackingPda = getNFTTrackingPda(provider);
        const userNftPda = getUserNftPda(provider, nftMint)
        await program.methods
            .addNft(nftMint, metadata)
            .accounts({
                nftTracking: nftTrackingPda,
                userNft: userNftPda,
                user: provider.wallet.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .rpc();
        return true;
    } catch (error) {
        console.error('Error adding NFT:', error);
        return false;
    }
}
