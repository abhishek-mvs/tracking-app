'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useConnection } from '@solana/wallet-adapter-react';
import { AnchorProvider } from '@coral-xyz/anchor';
import { getProgram, getProgramStatePda } from '../utils/program';

// Add type declaration for window.solana
declare global {
  interface Window {
    solana?: any;
  }
}

export default function AdminPage() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
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
      const programState = getProgramStatePda();

      await program.methods
        .createTracker(title, description)
        .accounts({
          programState,
          authority: provider.wallet.publicKey,
        })
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <WalletMultiButton />
      </div>

      {connected ? (
        <div className="max-w-md mx-auto">
          <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                Title
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="title"
                type="text"
                placeholder="Enter tracker title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                Description
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="description"
                placeholder="Enter tracker description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
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
          <p className="text-xl">Please connect your wallet to access the admin dashboard.</p>
        </div>
      )}
    </div>
  );
} 