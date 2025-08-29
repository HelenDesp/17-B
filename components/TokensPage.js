import React, { useState, useEffect } from 'react';
import { useAccount, useBalance } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import WalletCard from './WalletCard';
import TokenActions from './TokenActions';
import TokenTxHistory from './TokenTxHistory';
import TokenTransfer from './TokenTransfer';
import { createPublicClient, http, defineChain } from "viem";

export default function TokensPage() {
  const { address, chain, isConnected } = useAccount();
  const { data: ethBalance } = useBalance({ address, enabled: !!address });
  const { open } = useAppKit();
  const [gasPriceGwei, setGasPriceGwei] = useState(null);

  // --- NEW: Fetches Gas Price ---
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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tokens</h1>
      
      {/* --- NEW: Info Grid Added --- */}
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
      
      {/* --- Main Component Layout --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <WalletCard />
          <TokenTxHistory address={address} chainId={chain?.id} isConnected={isConnected} />
        </div>
        
        {/* Right Column */}
        <div className="space-y-6">
          <TokenActions />
          <TokenTransfer />
        </div>
      </div>
    </div>
  );
}