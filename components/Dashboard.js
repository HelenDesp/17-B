import React, { useState, useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import TokenBalances from "./TokenBalances";
import TokenTransfer from "./TokenTransfer";
import WalletCard from "./WalletCard";
import ActivityCard from "./ActivityCard";
import NFTViewer from "./NFTViewer";
import NFTTransfer from "./nftTransfer";
import CustomWalletButton from "./CustomWalletButton";
import { createPublicClient, http } from "viem";
import { readContract } from 'viem/actions';
import { abi as erc721Abi } from './erc721'; 
import { defineChain } from "viem";

const MORALIS_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImE2YWU4Y2E2LWNiNWUtNDJmNi1hYjQ5LWUzZWEwZTM5NTI2MSIsIm9yZ0lkIjoiNDQ1NTcxIiwidXNlcklkIjoiNDU4NDM4IiwidHlwZUlkIjoiMDhiYmI4YTgtMzQxYy00YTJhLTk2NGUtN2FlMGZmMzI2ODUxIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NDY1NDA1MzgsImV4cCI6NDkwMjMwMDUzOH0._O5uiNnyo2sXnJDbre0_9mDklKTmrj90Yn2HXJJnZRk";
const CONTRACT_ADDRESS = "0x28D744dAb5804eF913dF1BF361E06Ef87eE7FA47";

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected, chain } = useAccount();
  const { data: ethBalance } = useBalance({ address, enabled: !!address });
  const [nfts, setNfts] = useState([]);
  const [gasPriceGwei, setGasPriceGwei] = useState(null);

  useEffect(() => {
    const fetchGasPrice = async () => {
      try {
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

        const gasPrice = await client.getGasPrice();
        const gwei = Number(gasPrice) / 1e9;
        setGasPriceGwei(gwei.toFixed(3));
      } catch (err) {
        console.error("Failed to fetch gas price:", err);
      }
    };

    fetchGasPrice();
    const interval = setInterval(fetchGasPrice, 15000);
    return () => clearInterval(interval);
  }, [chain]);

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!address) return;
      try {
        const res = await fetch(
          `https://deep-index.moralis.io/api/v2.2/${address}/nft?chain=base&format=decimal&normalizeMetadata=true&exclude_spam=true&media_items=false`,
          {
            headers: {
              "X-API-Key": MORALIS_API_KEY,
              accept: "application/json",
            },
          }
        );
        const data = await res.json();
		const parsed = (data.result || [])
		  .filter(nft =>
			nft.token_address?.toLowerCase() === CONTRACT_ADDRESS.toLowerCase() &&
			nft.owner_of?.toLowerCase() === address.toLowerCase()
		  )
		  .map(nft => {
			let metadata = {};
			try {
			  metadata = nft.metadata ? JSON.parse(nft.metadata) : {};
			} catch {
			  metadata = {};
			}
			const image = metadata.image?.startsWith("ipfs://")
			  ? metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")
			  : metadata.image;
			const name = (metadata.name || nft.name || `Token #${nft.token_id}`).replace(/^#\\d+\\s*[-–—]*\\s*/, "");
			const getTrait = (type) =>
			  metadata.attributes?.find((attr) => attr.trait_type === type)?.value || "";
			return {
			  tokenId: nft.token_id,
			  name,
			  image,
			  traits: {
				manifesto: getTrait("Manifesto"),
				friend: getTrait("Friend"),
				weapon: getTrait("Weapon"),
			  },
			};
		  });
        
        // Hybrid verification with viem
        const client = createPublicClient({
          chain: defineChain({
            id: 8453,
            name: 'Base',
            nativeCurrency: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: {
              default: {
                http: ['https://mainnet.base.org'],
              },
            },
          }),
          transport: http(),
        });

        const verifiedNFTs = [];
        for (const nft of parsed) {
          try {
            const owner = await readContract(client, {
              abi: erc721Abi,
              address: CONTRACT_ADDRESS,
              functionName: 'ownerOf',
              args: [nft.tokenId],
            });
            if (owner.toLowerCase() === address.toLowerCase()) {
              verifiedNFTs.push(nft);
            }
          } catch (err) {
            console.warn('Verification failed for token', nft.tokenId, err);
          }
        }
        setNfts(verifiedNFTs);
        return;

      } catch (err) {
        console.error("Failed to fetch NFTs from Moralis:", err);
      }
    };
    fetchNFTs();
  }, [address]);

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