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
    mintAddress: 'CHtoyS3DykTcEi6jTgFP6hhJyG55AKwAUVzJLexafKxz',
    title: '3-Day Streak NFT',
    description: 'Reward for maintaining a 3-day streak',
  },
  {
    days: 7,
    mintAddress: 'AJvaQdmiKixog6JuXa4Hub6DnTb42ULSGTRAFootByLa',
    title: '7-Day Streak NFT',
    description: 'Reward for maintaining a 7-day streak',
  },
  {
    days: 30,
    mintAddress: 'DvbZu2i1b9bpt4w37trV3wsdwBaYRyTRydWbH4d6goMz',
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

interface UserNFT {
  nftAddress: PublicKey;
  receivedTime: BN;
  metadata: NFTMetadataItem[];
}

interface NFTMetadata {
  imageBuffer?: ArrayBuffer;
  imageUri?: string;
  jsonMetadata?: any;
  blobUrl?: string;
}

export default function NFTPage() {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const connection = new web3.Connection("http://127.0.0.1:8899", "confirmed");
//   const { connection } = useConnection();
  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [trackerStreaks, setTrackerStreaks] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoadingNfts, setIsLoadingNfts] = useState(false);
  const [blobUrls, setBlobUrls] = useState<Record<string, string>>({});

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
          const name = nft.metadata.find((m: NFTMetadataItem) => m.key === 'name')?.value || 'Unnamed NFT';
          const description = nft.metadata.find((m: NFTMetadataItem) => m.key === 'description')?.value || '';
          const imageUri = nft.metadata.find((m: NFTMetadataItem) => m.key === 'image')?.value || '';

          const nftData = {
            mintAddress: nft.nftAddress,
            imageUri,
            jsonMetadata: {
              name,
              description,
              image: imageUri
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

  const getEligibleNFT = (streak: number) => {
    if (streak >= 30) return NFT_OPTIONS[2]; // 30-day NFT
    if (streak >= 7) return NFT_OPTIONS[1]; // 7-day NFT
    if (streak >= 3) return NFT_OPTIONS[0]; // 3-day NFT
    return null;
  };

  const handleMintNFT = async (eligibleNFT: any) => {
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
            if (nftMetadata) {
              const success = await addNFT(connection, nftMint, nftMetadata, eligibleNFT);
              if (success) {
                console.log("NFT added successfully!");
                toast.success('NFT minted and added successfully!');
                break;
              }
              else {
                console.log(`Retry ${6 - retries}: Waiting for NFT metadata...`);
                if (retries > 1) {
                // Wait for 2 seconds before retrying
                await new Promise(resolve => setTimeout(resolve, 2000));
                }
              }
            }
          } catch (error) {
            console.log(`Retry ${6 - retries}: Waiting for NFT metadata...`);
            if (retries > 1) {
              // Wait for 2 seconds before retrying
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }
          retries--;
        }

        if (!nftMetadata) {
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
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center py-8">
            <p className="text-lg text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Streak Rewards</h1>

        {!connected ? (
          <div className="text-center py-8">
            <p className="text-lg text-gray-600">Please connect your wallet to view your streak rewards</p>
          </div>
        ) : (
          <>
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your NFTs</h2>
              {isLoadingNfts ? (
                <div className="text-center py-8">
                  <p className="text-lg text-gray-600">Loading your NFTs...</p>
                </div>
              ) : nfts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-lg text-gray-600">You don't have any NFTs yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nfts.map((nft, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md p-4">
                      <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
                        {nft.blobUrl ? (
                          <img 
                            src={nft.blobUrl}
                            alt="NFT" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to imageUri if blob URL fails
                              if (nft.imageUri) {
                                e.currentTarget.src = nft.imageUri;
                              }
                            }}
                          />
                        ) : nft.imageUri ? (
                          <img 
                            src={nft.imageUri}
                            alt="NFT" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500">No image available</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {nft.jsonMetadata?.name || 'Unnamed NFT'}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {typeof nft.mintAddress === 'object' ? nft.mintAddress.toString() : nft.mintAddress}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6">
              {trackers.map((tracker) => {
                const streak = trackerStreaks[tracker.id] || 0;
                const eligibleNFT = getEligibleNFT(streak);

                return (
                  <div
                    key={`tracker-${tracker.id}`}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <h2 className="text-xl font-semibold text-gray-900">{tracker.title}</h2>
                    <p className="mt-2 text-gray-600">{tracker.description}</p>
                    <div className="mt-4">
                      <p className="text-lg font-medium text-gray-700">
                        Current Streak: {streak} days
                      </p>
                      {eligibleNFT ? (
                        <div className="mt-4">
                          <h3 className="text-lg font-semibold text-green-600">
                            You are eligible for: {eligibleNFT.title}
                          </h3>
                          <p className="mt-2 text-gray-600">{eligibleNFT.description}</p>
                          <button
                            onClick={() => handleMintNFT(eligibleNFT)}
                            disabled={isLoading}
                            className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
                          >
                            {isLoading ? 'Minting...' : 'Mint NFT'}
                          </button>
                        </div>
                      ) : (
                        <p className="mt-4 text-gray-600">
                          Keep going! You need {streak < 3 ? 3 - streak : streak < 7 ? 7 - streak : 30 - streak} more days to earn an NFT.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
