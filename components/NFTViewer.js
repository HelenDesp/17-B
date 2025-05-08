
"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";

const INFURA_PROJECT_ID = "84e6a231877a49598bc05167fe403466";
const BASE_RPC = `https://base-mainnet.infura.io/v3/${INFURA_PROJECT_ID}`;
const CONTRACT_ADDRESS = "0x28D744dAb5804eF913dF1BF361E06Ef87eE7FA47";

// Minimal ERC-721 ABI
const ERC721_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)"
];

export default function NFTViewer() {
  const { address, isConnected } = useAccount();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!address) return;
      setLoading(true);
      try {
        const provider = new ethers.providers.JsonRpcProvider(BASE_RPC);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ERC721_ABI, provider);

        const balance = await contract.balanceOf(address);
        const nftPromises = [];

        for (let i = 0; i < balance.toNumber(); i++) {
          nftPromises.push(
            contract.tokenOfOwnerByIndex(address, i).then(async (tokenId) => {
              const uri = await contract.tokenURI(tokenId);
              const metadataUrl = uri.startsWith("ipfs://")
                ? uri.replace("ipfs://", "https://ipfs.io/ipfs/")
                : uri;
              const meta = await fetch(metadataUrl).then((res) => res.json());
              const image = meta.image?.startsWith("ipfs://")
                ? meta.image.replace("ipfs://", "https://ipfs.io/ipfs/")
                : meta.image;

              return {
                tokenId: tokenId.toString(),
                name: meta.name || `Token #${tokenId}`,
                image,
              };
            })
          );
        }

        const results = await Promise.all(nftPromises);
        setNfts(results);
      } catch (err) {
        console.error("Failed to fetch NFTs from Infura:", err);
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
