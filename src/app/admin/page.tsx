'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useConnection } from '@solana/wallet-adapter-react';
import { AnchorProvider, web3 } from '@coral-xyz/anchor';
import { getProgram, getProgramStatePda, getTrackerPda, getTrackerRegistryPda } from '../../utils/program';

// Add type declaration for window.solana
declare global {
  interface Window {
    solana?: any;
  }
}

export default function AdminPage() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  // const connection = new web3.Connection("http://127.0.0.1:8899", "confirmed");
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateTracker = async () => {
    if (!publicKey || !title || !description) return;

    try {
      setLoading(true);
      const provider = new AnchorProvider(connection, window.solana, {
        commitment: 'confirmed',
        preflightCommitment: 'confirmed'
      });
      const program = getProgram(provider);
      const trackerPda = getTrackerPda(title);
      const trackerRegistryPda = getTrackerRegistryPda();

     
      await program.methods
      .createTracker(title, description)
      .accounts({
        tracker: trackerPda,
        trackerRegistry: trackerRegistryPda,
        user: provider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      } as any)
      .rpc();


      setTitle('');
      setDescription('');
      alert('Tracker created successfully!');
    } catch (error) {
      console.error('Error creating tracker:', error);
      alert('Failed to create tracker');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-8 gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Admin Dashboard</h1>
        <WalletMultiButton />
      </div>

      {connected ? (
        <div className="max-w-md mx-auto">
          <div className="bg-gray-800 shadow-md rounded px-4 sm:px-8 pt-4 sm:pt-6 pb-4 sm:pb-8 mb-4">
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="title">
                Title
              </label>
              <input
                className="shadow appearance-none border border-gray-700 bg-gray-700 rounded w-full py-2 px-3 text-sm sm:text-base text-white leading-tight focus:outline-none focus:shadow-outline"
                id="title"
                type="text"
                placeholder="Enter tracker title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="description">
                Description
              </label>
              <textarea
                className="shadow appearance-none border border-gray-700 bg-gray-700 rounded w-full py-2 px-3 text-sm sm:text-base text-white leading-tight focus:outline-none focus:shadow-outline"
                id="description"
                placeholder="Enter tracker description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm sm:text-base"
                onClick={handleCreateTracker}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Tracker'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-base sm:text-xl text-gray-300">Please connect your wallet to access the admin dashboard.</p>
        </div>
      )}
    </div>
  );
} 