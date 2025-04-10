'use client';

import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { fetchNftMetadata, mintNft } from '@/lib/mintNft';
import { toast } from 'react-hot-toast';
import { fetchTrackersData, fetchStreak, addNFT, fetchNFTsList } from '@/lib/tracker';
import { web3 } from '@coral-xyz/anchor';
import { useRouter } from 'next/navigation';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

const NFT_OPTIONS = [
  {
    days: 3,
    mintAddress: 'FXcgEvSA9EP3wE1VztJb4Zf8n6fBZBuv9riswT18dn1d',
    title: '3-Day Streak NFT',
    description: 'Reward for maintaining a 3-day streak',
  },
  {
    days: 7,
    mintAddress: 'HWTizpsNyqj9yNzS2YWVPZf4ZwYrpyqkuBkZ3Kwu2DPU',
    title: '7-Day Streak NFT',
    description: 'Reward for maintaining a 7-day streak',
  },
  {
    days: 30,
    mintAddress: 'CMGWzhDsR8nC7oVNrF75RHF3JDMvDVCsaSC7NHi68aww',
    title: '30-Day Streak NFT',
    description: 'Reward for maintaining a 30-day streak',
  },
];

interface Tracker {
  id: number;
  title: string;
  description: string;
}

interface NFT {
  mintAddress: string | PublicKey;
  imageBuffer?: ArrayBuffer;
  imageUri?: string;
  jsonMetadata?: any;
  blobUrl?: string;
}

interface NFTMetadataItem {
  key: string;
  value: string;
}

export default function NFTPage() {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
//   const connection = new web3.Connection("http://127.0.0.1:8899", "confirmed");
  const { connection } = useConnection();
  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [trackerStreaks, setTrackerStreaks] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoadingNfts, setIsLoadingNfts] = useState(false);
  const [blobUrls, setBlobUrls] = useState<Record<string, string>>({});
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAllNfts, setShowAllNfts] = useState(false);

  // Cleanup function for blob URLs
  useEffect(() => {
    return () => {
      Object.values(blobUrls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [blobUrls]);

  useEffect(() => {
    const fetchData = async () => {
      if (!connected || !publicKey) {
        router.push('/');
        return;
      }

      try {
        const fetchedTrackers = await fetchTrackersData(connection);
        console.log("fetchedTrackers", fetchedTrackers);
        setTrackers(fetchedTrackers);

        // Fetch streaks for each tracker
        const streaks: Record<number, number> = {};
        for (const tracker of fetchedTrackers) {
          try {
            const streak = await fetchStreak(connection, tracker.id);
            // Check if the streak is still valid (within 2 days buffer)
            const currentTimeInSecs = Math.floor(Date.now() / 1000); // Current time in epoch seconds
            const lastStreakDateInSecs = Number(streak.lastStreakDate);
            const secondsInTwoDays = 2 * 24 * 60 * 60; // 2 days in seconds
            const secsSinceLastStreak = currentTimeInSecs - lastStreakDateInSecs;
            
            // If more than 2 days have passed since the last streak update, set streak to 0
            if (secsSinceLastStreak > secondsInTwoDays) {
              console.log(`Streak expired for tracker ${tracker.id}. Last update: ${lastStreakDateInSecs}, Current: ${currentTimeInSecs}`);
              streaks[tracker.id] = 0;
            } else {
              streaks[tracker.id] = Number(streak.streak);
            }
            streaks[tracker.id] = Number(streak.streak);
          } catch (error) {
            console.error(`Error fetching streak for tracker ${tracker.id}:`, error);
            streaks[tracker.id] = 0;
          }
        }
        setTrackerStreaks(streaks);

        // Fetch user's NFTs
        setIsLoadingNfts(true);
        const userNfts = await fetchNFTsList(connection);
        console.log("userNfts", userNfts);
        const nftsWithMetadata: NFT[] = [];
        
        for (const nft of userNfts) {
          console.log("nft", nft);
          
          // Extract metadata from the array
          const name = nft.nftInfo.metadata.find((m: NFTMetadataItem) => m.key === 'name')?.value || 'Unnamed NFT';
          const description = nft.nftInfo.metadata.find((m: NFTMetadataItem) => m.key === 'description')?.value || '';
          const imageUri = nft.nftInfo.metadata.find((m: NFTMetadataItem) => m.key === 'image')?.value || '';
          const trackerName = nft.nftInfo.metadata.find((m: NFTMetadataItem) => m.key === 'trackerName')?.value || '';
          const trackerId = nft.nftInfo.metadata.find((m: NFTMetadataItem) => m.key === 'trackerId')?.value || '';
          const mintTimestamp = nft.nftInfo.metadata.find((m: NFTMetadataItem) => m.key === 'mintTimestamp')?.value || '';

          const nftData = {
            mintAddress: nft.nftInfo.nftAddress,
            imageUri,
            jsonMetadata: {
              name,
              description,
              image: imageUri,
              trackerName,
              trackerId,
              mintTimestamp
            }
          };
          
          nftsWithMetadata.push(nftData);
        }
        console.log("metadata", nftsWithMetadata);
        setNfts(nftsWithMetadata);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch tracker data');
      } finally {
        setIsInitialized(true);
        setIsLoadingNfts(false);
      }
    };

    fetchData();
  }, [connected, publicKey, router]);

  const getEligibleNFT = (streak: number, trackerId: number) => {
    // Find the latest NFT for this tracker
    const trackerNfts = nfts.filter(nft => 
      nft.jsonMetadata?.trackerId === trackerId.toString()
    ).sort((a, b) => {
      const timestampA = parseInt(a.jsonMetadata?.mintTimestamp || '0');
      const timestampB = parseInt(b.jsonMetadata?.mintTimestamp || '0');
      return timestampB - timestampA; // Sort by most recent first
    });

    const latestNft = trackerNfts[0];
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

    if (latestNft) {
      const mintTimestamp = parseInt(latestNft.jsonMetadata?.mintTimestamp || '0');
      const daysSinceMint = (currentTime - mintTimestamp) / (24 * 60 * 60);

      // Find the days requirement of the last minted NFT
      let lastMintedDays = 0;
      if (latestNft.mintAddress.toString() === NFT_OPTIONS[0].mintAddress) lastMintedDays = 3;
      else if (latestNft.mintAddress.toString() === NFT_OPTIONS[1].mintAddress) lastMintedDays = 7;
      else if (latestNft.mintAddress.toString() === NFT_OPTIONS[2].mintAddress) lastMintedDays = 30;

      // If user has a 3-day NFT, next target is 7 days
      if (lastMintedDays === 3 && streak >= 7) {
        return NFT_OPTIONS[1];
      }
      // If user has a 7-day NFT, next target is 30 days
      else if (lastMintedDays === 7 && streak >= 30) {
        return NFT_OPTIONS[2];
      }
      // If user has the 30-day NFT, no more NFTs to earn
      else if (lastMintedDays === 30) {
        return null;
      }
    } else {
      // No NFTs yet, check for first eligible NFT
      if (streak >= 30) return NFT_OPTIONS[2];
      if (streak >= 7) return NFT_OPTIONS[1];
      if (streak >= 3) return NFT_OPTIONS[0];
    }

    return null;
  };

  const handleMintNFT = async (eligibleNFT: any, tracker: Tracker) => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setIsLoading(true);
      const nftMint = await mintNft(eligibleNFT.mintAddress.toString(), publicKey.toString());
      if (nftMint) {
        console.log("nftMint", nftMint);
        
        // Add retry mechanism for fetching metadata
        let retries = 5;
        let nftMetadata = null;
        
        while (retries > 0 && !nftMetadata) {
          try {
            nftMetadata = await fetchNftMetadata(nftMint);
            if (!nftMetadata) {
              console.log(`Retry ${6 - retries}: Metadata is null, retrying...`);
              if (retries > 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
              }
            }
          } catch (error) {
            console.log(`Retry ${6 - retries}: Error fetching metadata, retrying...`);
            if (retries > 1) {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }
          retries--;
        }

        if (nftMetadata) {
          // Only proceed with addNFT if we have valid metadata
          const success = await addNFT(connection, nftMint, nftMetadata, eligibleNFT, tracker);
          if (success) {
            console.log("NFT added successfully!");
            toast.success('NFT minted and added successfully!');
          } else {
            toast.error('Failed to add NFT to tracker');
          }
        } else {
          toast.error('NFT was minted but metadata could not be fetched. Please refresh the page in a few moments.');
        }
      }
    } catch (error) {
      console.error('Error minting NFT:', error);
      toast.error('Failed to mint NFT');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center py-8">
            <p className="text-lg text-gray-300">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center gap-3 mb-2">
          <span role="img" aria-label="trophy" className="text-4xl">🏆</span>
          <h1 className="text-4xl font-bold text-white">Your Streak Rewards</h1>
        </div>
        <p className="text-xl text-gray-300 mb-12">Stay consistent. Earn exclusive NFTs.</p>

        {!connected ? (
          <div className="text-center py-8">
            <p className="text-lg text-gray-300">Please connect your wallet to view your streak rewards</p>
          </div>
        ) : (
          <>
            {/* NFTs Section */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <span role="img" aria-label="box" className="text-3xl">📦</span>
                <h2 className="text-2xl font-bold text-white">Your Minted NFTs</h2>
              </div>
              
              {isLoadingNfts ? (
                <div className="text-center py-8">
                  <p className="text-lg text-gray-300">Loading your NFTs...</p>
                </div>
              ) : nfts.length === 0 ? (
                <div className="text-center py-8 bg-gray-800 rounded-lg shadow-md">
                  <p className="text-lg text-gray-300">You don't have any NFTs yet</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {(showAllNfts ? nfts : nfts.slice(0, 2)).map((nft, index) => (
                    <div 
                      key={index} 
                      className="bg-gray-800 rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow flex items-center gap-4"
                      onClick={() => {
                        setSelectedNFT(nft);
                        setIsModalOpen(true);
                      }}
                    >
                      <div className="w-24 h-24 flex-shrink-0">
                        {nft.imageUri ? (
                          <img 
                            src={nft.imageUri}
                            alt={nft.jsonMetadata?.name || 'NFT'} 
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-700 flex items-center justify-center rounded-lg">
                            <span role="img" aria-label="question" className="text-2xl">❓</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold text-white">
                          {nft.jsonMetadata?.name || 'Unnamed NFT'}
                        </h3>
                        <p className="text-sm text-gray-400 mb-1">
                          {nft.jsonMetadata?.trackerName ? `Tracker: ${nft.jsonMetadata.trackerName}` : 'Tracker: Unknown'}
                        </p>
                        <p className="text-xs text-gray-500 truncate font-mono">
                          {typeof nft.mintAddress === 'object' ? 
                            nft.mintAddress.toString().slice(0, 4) + '...' + nft.mintAddress.toString().slice(-4) : 
                            nft.mintAddress.slice(0, 4) + '...' + nft.mintAddress.slice(-4)}
                        </p>
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-900 text-green-300 rounded-full text-sm mt-1">
                          <span role="img" aria-label="checkmark" className="text-xs">✅</span>
                          Claimed
                        </div>
                      </div>
                    </div>
                  ))}
                  {nfts.length > 2 && (
                    <button 
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium mt-2"
                      onClick={() => setShowAllNfts(!showAllNfts)}
                    >
                      {showAllNfts ? 'Show Less' : `Show ${nfts.length - 2} More`}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* NFT Modal */}
            {isModalOpen && selectedNFT && (
              <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full relative">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="flex flex-col items-center">
                    <div className="w-full aspect-square max-w-md mb-4">
                      {selectedNFT.imageUri ? (
                        <img 
                          src={selectedNFT.imageUri}
                          alt={selectedNFT.jsonMetadata?.name || 'NFT'} 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                          <span role="img" aria-label="question" className="text-4xl">❓</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-2">
                      {selectedNFT.jsonMetadata?.name || 'Unnamed NFT'}
                    </h3>
                    <a
                      href={`https://explorer.solana.com/address/${typeof selectedNFT.mintAddress === 'object' ? selectedNFT.mintAddress.toString() : selectedNFT.mintAddress}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:text-blue-300 mb-2 inline-flex items-center gap-1"
                    >
                      View on Solana
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    {selectedNFT.jsonMetadata?.description && (
                      <p className="text-gray-300 text-center mt-2">
                        {selectedNFT.jsonMetadata.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Eligible Rewards Section */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <span role="img" aria-label="target" className="text-3xl">🎯</span>
                <h2 className="text-2xl font-bold text-white">Eligible Rewards</h2>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {trackers.map((tracker) => {
                  const streak = trackerStreaks[tracker.id] || 0;
                  const eligibleNFT = getEligibleNFT(streak, tracker.id);

                  return (
                    <div
                      key={`tracker-${tracker.id}`}
                      className="bg-gray-800 rounded-lg shadow-md p-6"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <span role="img" aria-label="fire" className="text-3xl">🔥</span>
                        <h3 className="text-xl font-semibold text-white">{tracker.title}</h3>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        <p className="text-lg text-gray-300">Current Streak: {streak} days</p>
                      </div>

                      {eligibleNFT ? (
                        <>
                          <p className="text-lg text-green-400 mb-4">
                            You are eligible for: {eligibleNFT.title}
                          </p>
                          <button
                            onClick={() => handleMintNFT(eligibleNFT, tracker)}
                            disabled={isLoading}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-lg font-semibold rounded-lg transition-colors"
                          >
                            {isLoading ? 'Minting...' : 'Mint NFT'}
                          </button>
                        </>
                      ) : (
                        <p className="text-lg text-gray-400">
                          Keep going! You need {streak < 3 ? 3 - streak : streak < 7 ? 7 - streak : 30 - streak} more days to earn an NFT.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
