
"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

const MORALIS_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImE2YWU4Y2E2LWNiNWUtNDJmNi1hYjQ5LWUzZWEwZTM5NTI2MSIsIm9yZ0lkIjoiNDQ1NTcxIiwidXNlcklkIjoiNDU4NDM4IiwidHlwZUlkIjoiMDhiYmI4YTgtMzQxYy00YTJhLTk2NGUtN2FlMGZmMzI2ODUxIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NDY1NDA1MzgsImV4cCI6NDkwMjMwMDUzOH0._O5uiNnyo2sXnJDbre0_9mDklKTmrj90Yn2HXJJnZRk";

export default function NFTViewer() {
  const { address, isConnected } = useAccount();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!address) return;
      setLoading(true);
      try {
        const res = await fetch(
          `https://deep-index.moralis.io/api/v2.2/${address}/nft?chain=base&format=decimal&limit=20`,
          {
            headers: {
              "X-API-Key": MORALIS_API_KEY,
              accept: "application/json",
            },
          }
        );
        const data = await res.json();

        const parsed = (data.result || []).map((nft) => {
          let metadata = {};
          try {
            metadata = nft.metadata ? JSON.parse(nft.metadata) : {};
          } catch (e) {
            metadata = {};
          }

          const image = metadata.image?.startsWith("ipfs://")
            ? metadata.image.replace("ipfs://", "https://salmon-left-clam-542.mypinata.cloud/ipfs/")
            : metadata.image;

          return {
            tokenId: nft.token_id,
            name: metadata.name || nft.name || `Token #${nft.token_id}`,
            image,
          };
        });

        setNfts(parsed);
      } catch (err) {
        console.error("Failed to fetch NFTs from Moralis:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [address]);

  if (!isConnected) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          NFTs
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Connect your wallet to view NFTs.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
        NFTs
      </h2>
      {loading ? (
        <p className="text-gray-500">Loading NFTs...</p>
      ) : nfts.length === 0 ? (
        <p className="text-gray-500">No NFTs found for this wallet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {nfts.map((nft, i) => (
            <div
              key={i}
              className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow"
            >
              {nft.image ? (
                <img
                  src={nft.image}
                  alt={nft.name}
                  className="w-full h-40 object-cover rounded-md"
                />
              ) : (
                <div className="w-full h-40 bg-gray-300 dark:bg-gray-600 rounded-md flex items-center justify-center text-sm text-gray-600 dark:text-gray-300">
                  No Image
                </div>
              )}
              <div className="mt-2 text-sm font-medium text-gray-800 dark:text-white">
                #{nft.tokenId} — {nft.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
