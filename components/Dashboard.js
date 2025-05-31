import React, { useEffect, useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { createPublicClient, http } from "viem";
import { defineChain } from "viem";
import { readContract } from "@wagmi/core";
import NFTViewer from "./NFTViewer";
import NFTTransfer from "./nftTransfer";
import TokenBalances from "./TokenBalances";
import TokenTransfer from "./TokenTransfer";
import WalletCard from "./WalletCard";
import ActivityCard from "./ActivityCard";
import CustomWalletButton from "./CustomWalletButton";

const CONTRACT_ADDRESS = "0x28D744dAb5804eF913dF1BF361E06Ef87eE7FA47";
const CONTRACT_ABI = [
  {
    constant: true,
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ name: "owner", type: "address" }],
    type: "function",
    stateMutability: "view"
  },
  {
    constant: true,
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ name: "", type: "string" }],
    type: "function",
    stateMutability: "view"
  }
];

export default function Dashboard() {
  const { address, isConnected, chain } = useAccount();
  const { data: ethBalance } = useBalance({ address, enabled: !!address });
  const [mounted, setMounted] = useState(false);
  const [nfts, setNfts] = useState([]);
  const [gasPriceGwei, setGasPriceGwei] = useState(null);

  useEffect(() => {
    const fetchGasPrice = async () => {
      if (!chain?.id) return;
      const client = createPublicClient({
        chain: defineChain({
          id: chain.id,
          name: chain.name,
          nativeCurrency: {
            name: chain.nativeCurrency?.name || "ETH",
            symbol: chain.nativeCurrency?.symbol || "ETH",
            decimals: 18,
          },
          rpcUrls: {
            default: {
              http: [chain.rpcUrls?.default?.http?.[0] || ""],
            },
          },
        }),
        transport: http(),
      });
      try {
        const gasPrice = await client.getGasPrice();
        setGasPriceGwei((Number(gasPrice) / 1e9).toFixed(3));
      } catch (e) {
        console.error("Failed to fetch gas price", e);
      }
    };

    fetchGasPrice();
    const interval = setInterval(fetchGasPrice, 15000);
    return () => clearInterval(interval);
  }, [chain]);

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!address || !chain?.id) return;
      const tokenIds = Array.from({ length: 100 }, (_, i) => i + 1); // sample range
      const ownedNFTs = [];

      for (const tokenId of tokenIds) {
        try {
          const owner = await readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: "ownerOf",
            args: [tokenId],
          });

          if (owner.toLowerCase() !== address.toLowerCase()) continue;

          const tokenURI = await readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: "tokenURI",
            args: [tokenId],
          });

          const uri = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
          const metadata = await fetch(uri).then((res) => res.json());

          const image = metadata.image?.startsWith("ipfs://")
            ? metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")
            : metadata.image;

          const getTrait = (type) =>
            metadata.attributes?.find((attr) => attr.trait_type === type)?.value || "";

          ownedNFTs.push({
            tokenId: tokenId.toString(),
            name: metadata.name || `Token #${tokenId}`,
            image,
            traits: {
              manifesto: getTrait("Manifesto"),
              friend: getTrait("Friend"),
              weapon: getTrait("Weapon"),
            },
          });
        } catch {
          continue;
        }
      }

      setNfts(ownedNFTs);
    };

    fetchNFTs();
  }, [address, chain]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="max-w-lg text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Mudelo to your Web3 Wallet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Connect your wallet to view your assets, make transfers, and track
            your transaction history.
          </p>
          <CustomWalletButton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome to your Web3 Wallet
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your crypto assets, make transfers, and track your transaction
          history in one place.
        </p>

        <div className="mt-6 dashboard-grid">
          <div className="bg-gray-50 dark:bg-dark-100 rounded-xl p-4 border border-gray-100 dark:border-dark-300">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Balance
            </div>
            <div className="mt-1 text-2xl font-normal text-gray-900 dark:text-white">
              {ethBalance
                ? parseFloat(ethBalance.formatted).toFixed(5)
                : "0.00000"}{" "}
              {ethBalance?.symbol || "ETH"}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-dark-100 rounded-xl p-4 border border-gray-100 dark:border-dark-300">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Network
            </div>
            <div className="mt-1 text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <span className="w-3 h-3 rounded-full bg-green-400 mr-2"></span>
              {chain?.name || "Ethereum Mainnet"}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-dark-100 rounded-xl p-4 border border-gray-100 dark:border-dark-300">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Gas Price
            </div>
            <div className="mt-1 text-lg font-medium text-gray-900 dark:text-white">
              {gasPriceGwei ? `${gasPriceGwei} Gwei` : "Loading..."}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Average</div>
          </div>
        </div>
      </div>

      <NFTViewer nfts={nfts} />
      <NFTTransfer nfts={nfts} />

      <div className="dashboard-columns">
        <div className="space-y-6">
          <WalletCard />
          <TokenBalances />
        </div>
        <div className="space-y-6">
          <TokenTransfer />
          <ActivityCard />
        </div>
      </div>
    </div>
  );
}