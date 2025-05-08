"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

const getImageUrl = (nft) => {
  const media = nft.media?.[0];
  let image = "";

  if (typeof media?.cachedUrl === "string") {
    image = media.cachedUrl;
  } else if (typeof media?.thumbnailUrl === "string") {
    image = media.thumbnailUrl;
  } else if (typeof media?.pngUrl === "string") {
    image = media.pngUrl;
  } else if (typeof media?.originalUrl === "string") {
    image = media.originalUrl;
  } else if (typeof nft.rawMetadata?.image === "string") {
    image = nft.rawMetadata.image;
  } else if (typeof nft.metadata?.image === "string") {
    image = nft.metadata.image;
  } else if (typeof nft.image === "string") {
    image = nft.image;
  }

  if (image.startsWith("ipfs://ipfs/")) {
    image = image.replace("ipfs://ipfs/", "https://ipfs.io/ipfs/");
  } else if (image.startsWith("ipfs://")) {
    image = image.replace("ipfs://", "https://ipfs.io/ipfs/");
  }

  console.log("Resolved image:", image);
  return image;
};

const getNFTTitle = (nft) =>
  nft.title || nft.name || nft.metadata?.name || nft.rawMetadata?.name || "Untitled";

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
          `https://eth-mainnet.g.alchemy.com/nft/v3/oQKmm0fzZOpDJLTI64W685aWf8j1LvDr/getNFTsForOwner?owner=${address}`
        );
        const data = await res.json();
        setNfts(data.ownedNfts || []);
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
                src={getImageUrl(nft)}
                alt={getNFTTitle(nft)}
                className="w-full h-40 object-cover rounded-md"
              />
              <div className="mt-2 text-sm font-medium text-gray-800 dark:text-white">
                {getNFTTitle(nft)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
