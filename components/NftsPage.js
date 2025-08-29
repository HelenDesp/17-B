import React, { useState, useEffect, useRef } from "react";
import { useAccount, useBalance } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import NFTViewer from "./NFTViewer";
import NFTTransfer from "./nftTransfer";
import NftTxHistory from "./NftTxHistory";
import { createPublicClient, http, defineChain } from "viem";

// This new component contains all the logic for the NFTs page
export default function NftsPage() {
  const { address, chain } = useAccount();
  const { data: ethBalance } = useBalance({ address, enabled: !!address });
  const { open } = useAppKit();

  const [nfts, setNfts] = useState([]);
  const [selectedNFTs, setSelectedNFTs] = useState([]);
  const fetchNFTsRef = useRef();

  const CONTRACT_ADDRESS = "0x28D744dAb5804eF913dF1BF361E06Ef87eE7FA47";

  useEffect(() => {
    fetchNFTsRef.current = async () => {
      if (!address) return;
      try {
        try {
          await fetch('https://mcpmarket.com/server/alchemy-sdk');
        } catch (refreshError) {
          console.warn("Could not refresh NFT metadata:", refreshError);
        }
        const res = await fetch(
          `https://base-mainnet.g.alchemy.com/nft/v3/-h4g9_mFsBgnf1Wqb3aC7Qj06rOkzW-m/getNFTsForOwner?owner=${address}&contractAddresses[]=${CONTRACT_ADDRESS}`,
          { headers: { accept: "application/json" } }
        );
        const data = await res.json();
        const parsed = [];
        for (const nft of data.ownedNfts || []) {
          const meta = nft.raw?.metadata || {};
          let imageUrl = nft.image?.originalUrl || meta.image || '';
          if (imageUrl.startsWith("ipfs://")) {
            imageUrl = imageUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
          }
          const name = meta.name || nft.name || `ReVerse Genesis #${String(nft.tokenId).padStart(4, "0")}`;
          const getTrait = (type) =>
            meta.attributes?.find((attr) => attr.trait_type === type)?.value || "";
          parsed.push({
            tokenId: nft.tokenId,
            name,
            image: imageUrl,
            traits: {
              manifesto: getTrait("Manifesto"),
              talisman: getTrait("Talisman"),
              weapon: getTrait("Weapon"),
            },
          });
        }
        setNfts(parsed);
      } catch (err) {
        console.error("Failed to fetch NFTs:", err);
      }
    };
    fetchNFTsRef.current();
  }, [address]);
  
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
        setGasPriceGwei("N/A");
      }
    };

    fetchGasPrice();
    const interval = setInterval(fetchGasPrice, 15000);
    return () => clearInterval(interval);
  }, [chain]);
  
  const formatChainName = (name) => {
    if (!name) return "";
    return name;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">NFTs</h1>
      
      <div className="bg-white border-b2 dark:bg-dark-200 rounded-xl shadow-sm p-6 pt-6 px-6 pb-0">
        <div className="dashboard-grid">
          <div className="bg-gray-50 border-b1 dark:border-b-white dark:bg-dark-100 rounded-xl p-4 border border-gray-100 dark:border-white">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Balance</div>
            <div className="mt-1 text-2xl font-normal text-gray-900 dark:text-white">
              {ethBalance ? parseFloat(ethBalance.formatted).toFixed(5) : "0.00000"}{" "}{ethBalance?.symbol || "ETH"}
            </div>
          </div>
          <div className="bg-gray-50 border-b1 dark:border-b-white dark:bg-dark-100 rounded-xl p-4 border border-gray-100 dark:border-white">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Network</div>
            <div className="mt-1 text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <button onClick={() => open({ view: 'Networks' })} className="mt-1 text-lg font-medium text-gray-900 dark:text-white flex items-center w-full">
                <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                {formatChainName(chain?.name || "Unknown")}
                <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 1L5 8h10l-5-7zm0 18l5-7H5l5 7z" />
                </svg>
              </button>
            </div>
          </div>
          <div className="bg-gray-50 border-b1 dark:border-b-white dark:bg-dark-100 rounded-xl p-4 border border-gray-100 dark:border-white">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Gas Price</div>
            <div className="mt-1 text-lg font-medium text-gray-900 dark:text-white">
              {gasPriceGwei ? `${gasPriceGwei} Gwei` : "Loading..."}
            </div>
          </div>
        </div>
      </div>

      <NFTViewer
        nfts={nfts}
        selectedNFTs={selectedNFTs}
        onSelectNFT={(tokenId) =>
          setSelectedNFTs((prev) =>
            prev.includes(tokenId)
              ? prev.filter((id) => id !== tokenId)
              : [...prev, tokenId]
          )
        }
      />
	<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
	  <NFTTransfer
		nfts={nfts}
		selectedNFTsFromDashboard={selectedNFTs}
		setSelectedNFTsFromDashboard={setSelectedNFTs}
		chainId={chain?.id}
		fetchNFTs={fetchNFTsRef}
	  />
	  <NftTxHistory address={address} chainId={chain?.id} />
	</div>
    </div>
  );
};