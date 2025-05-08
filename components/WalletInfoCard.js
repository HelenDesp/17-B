import React, { useState } from "react";
import { useAccount, useBalance } from "wagmi";

export default function WalletInfoCard() {
  const { address, isConnected, chain } = useAccount();
  const { data: ethBalance } = useBalance({
    address,
    enabled: !!address,
  });
  const [copied, setCopied] = useState(false);

  if (!isConnected) return null;

  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm p-5 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Connected Wallet
      </h2>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Address
          </div>
          <div className="flex items-center">
            <div className="text-sm font-medium text-gray-900 dark:text-white mr-2">
              {formatAddress(address)}
            </div>
            <button
              onClick={copyAddress}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {copied ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Network
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {chain?.name || "Ethereum Mainnet"}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Balance
          </div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {ethBalance
              ? parseFloat(ethBalance.formatted).toFixed(4)
              : "0.0000"}{" "}
            {ethBalance?.symbol || "ETH"}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Chain ID
          </div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {chain?.id || "1"}
          </div>
        </div>

        <div className="flex space-x-2 mt-4">
          <button
            onClick={() =>
              window.open(`https://etherscan.io/address/${address}`, "_blank")
            }
            className="flex-1 py-2 px-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium transition-colors"
          >
            View on Explorer
          </button>
          <button
            onClick={() => {}}
            className="flex-1 py-2 px-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
          >
            Show QR Code
          </button>
        </div>
      </div>
    </div>
  );
}
