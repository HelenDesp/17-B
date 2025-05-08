"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

// --- begin: extracted helper ---
const extractNFTData = (nftsRaw) => {
  return nftsRaw.map((nft) => {
    const metadata = nft.metadata || nft.rawMetadata || {};
    const tokenId = parseInt(nft.tokenId, 16).toString();

    const name =
      typeof metadata.name === "string" && metadata.name.trim().length > 0
        ? metadata.name
        : `Token #${tokenId}`;

    const image = nft.media?.[0]?.cachedUrl ||
                  (typeof metadata.image === "string"
                    ? metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")
                    : "");

    return {
      tokenId,
      name,
      image,
      description: metadata.description || "",
    };
  });
};
// --- end: extracted helper ---

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
          `https://eth-mainnet.g.alchemy.com/nft/v3/oQKmm0fzZOpDJLTI64W685aWf8j1LvDr/getNFTsForOwner?owner=${address}&withMetadata=true`
        );
        const data = await res.json();
        const cleaned = extractNFTData(data.ownedNfts || []);
        setNfts(cleaned);
      } catch (err) {
        console.error("Failed to fetch NFTs:", err);
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
              <img
                src={nft.image}
                alt={`NFT ${nft.tokenId}`}
                className="w-full h-40 object-cover rounded-md"
              />
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
