import React, { useState, useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import TokenBalances from "./TokenBalances";
import TokenTransfer from "./TokenTransfer";
import WalletCard from "./WalletCard";
import ActivityCard from "./ActivityCard";
import NFTViewer from "./NFTViewer";

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected, chain } = useAccount();
  const { data: ethBalance } = useBalance({
    address,
    enabled: !!address,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="max-w-lg text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to your Web3 Wallet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Connect your wallet to view your assets, make transfers, and track
            your transaction history.
          </p>
          <appkit-button />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome to your Web3 Wallet
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your crypto assets, make transfers, and track your transaction
          history in one place.
        </p>

        <div className="mt-6 dashboard-grid">
          {/* Total Balance Card */}
          <div className="bg-gray-50 dark:bg-dark-100 rounded-xl p-4 border border-gray-100 dark:border-dark-300">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Balance
            </div>
            <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {ethBalance
                ? parseFloat(ethBalance.formatted).toFixed(4)
                : "0.0000"}{" "}
              {ethBalance?.symbol || "ETH"}
            </div>
          </div>

          {/* Network Card */}
          <div className="bg-gray-50 dark:bg-dark-100 rounded-xl p-4 border border-gray-100 dark:border-dark-300">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Network
            </div>
            <div className="mt-1 text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <span className="w-3 h-3 rounded-full bg-green-400 mr-2"></span>
              {chain?.name || "Ethereum Mainnet"}
            </div>
          </div>

          {/* Connected Wallet Card */}
          {/* <div className="bg-gray-50 dark:bg-dark-100 rounded-xl p-4 border border-gray-100 dark:border-dark-300">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Connected Wallet
            </div>
            <div className="mt-1 text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-400 mr-2"></div>
              <div className="truncate max-w-[140px]">
                {address
                  ? `${address.substring(0, 6)}...${address.substring(
                      address.length - 4
                    )}`
                  : "Not Connected"}
              </div>
            </div>
          </div> */}

          {/* Gas Price Card */}
          <div className="bg-gray-50 dark:bg-dark-100 rounded-xl p-4 border border-gray-100 dark:border-dark-300">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Gas Price
            </div>
            <div className="mt-1 text-lg font-medium text-gray-900 dark:text-white">
              23 Gwei
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Average
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-columns">
        <div className="space-y-6">
          {/* Wallet Card */}
          <WalletCard />

          {/* Token Balances */}
          <TokenBalances />
        </div>

        <div className="space-y-6">
          {/* Token Transfer */}
          <TokenTransfer />

          {/* Recent Activity */}
          <ActivityCard />
        </div>
      </div>
      <NFTViewer />
</div>
  );
}
