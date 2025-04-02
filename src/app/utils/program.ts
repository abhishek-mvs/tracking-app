import { AnchorProvider, BN, web3 } from '@coral-xyz/anchor';
import { Program } from "@coral-xyz/anchor";
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import { TrackingSystem } from '../../../idl';
import tracking_system from '../../../tracking_system.json' assert { type: 'json' };
import { program } from '@coral-xyz/anchor/dist/cjs/native/system';

export const PROGRAM_ID = new PublicKey('7TBRqAzFS8FLEjHU2ppAWkU4Um8kQeBztmkLZUNjTrKB');

export const getProgram = (provider: AnchorProvider) => {    
  return new Program<TrackingSystem>(tracking_system, provider);
};

export const getProgramStatePda = () => {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('program_state')],
    PROGRAM_ID
  );
  return pda;
};


export const getTrackerRegistryPda = () => {
  const [trackerRegistryPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("tracker_registry")],
    PROGRAM_ID
  );
  return trackerRegistryPda;
}; 


export const getTrackerPda = (title: string) => {
  const [trackerPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("tracker"), Buffer.from(title)],
    PROGRAM_ID
  );
  return trackerPda;
}; 

export const getTrackingDataPda = (provider: AnchorProvider, trackerId: number) => {
  const [trackingDataPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("tracking_data"),
      provider.wallet.publicKey.toBuffer(),
      new Uint8Array(new Array(13).fill(trackerId)),
    ],
    PROGRAM_ID
  );
  return trackingDataPda;
};

export const getTrackerStatsPda = (trackerId: number, normalizedTestDate: number) => {
  const [trackerStatsPda] = PublicKey.findProgramAddressSync(
    [
        Buffer.from("tracker_stats"),
        new Uint8Array(new Array(13).fill(trackerId)),
        new Uint8Array(new Array(13).fill(normalizedTestDate)),
    ],
    PROGRAM_ID
  );
  return trackerStatsPda;
}; 

export const getTrackerStreakPda = (provider: AnchorProvider, trackerId: number) => {
  const [trackerStreakPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("tracker_streak"),
      provider.wallet.publicKey.toBuffer(),
      new Uint8Array(new Array(13).fill(trackerId)),
    ],
    PROGRAM_ID
  );
  return trackerStreakPda;
};

export const getTrackerStatsListPda = (trackerId: number) => {
  const [trackerStatsListPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("tracker_stats_list"),
      new Uint8Array(new Array(18).fill(trackerId)),
    ],
    PROGRAM_ID
  );
  return trackerStatsListPda;
};

export const getNormalizedCurrentDate = () => {
    const currentDate = Math.floor(Date.now() / 1000);
    const oneDay = 86400;
    return Math.floor(currentDate / oneDay) * oneDay - 1 * oneDay;
};