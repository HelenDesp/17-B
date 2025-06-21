import React, { useState } from "react";
import { useAccount, useBalance, useEnsName } from "wagmi";
import { QRCodeSVG } from "qrcode.react";
import { useAppKit } from "@reown/appkit/react"; // <-- 1. Import useAppKit

export default function WalletCard() {
  const { address, isConnected, chain } = useAccount();
  const { open } = useAppKit(); // <-- 2. Get the open function
  const { data: ethBalance } = useBalance({
    address,
    enabled: !!address,
  });
  
  const { data: ensName } = useEnsName({ address, chainId: 1 });
  
  const [showReceive, setShowReceive] = useState(false);  

  if (!isConnected) return null;

  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };
  
  const getExplorerUrl = (chainId) => {
    switch (chainId) {
      case 1:
        return "https://etherscan.io";
      case 8453:
        return "https://basescan.org";
      case 137:
        return "https://polygonscan.com";
      case 42161:
        return "https://arbiscan.io";
      case 10:
        return "https://optimistic.etherscan.io";
      case 11155111:
        return "https://sepolia.etherscan.io";
      case 56:
        return "https://bscscan.com";
      default:
        return "https://basescan.org";
    }
  }; 

  const getChainName = (chainId) => {
    switch (chainId) {
      case 1: return "Ethereum";
      case 8453: return "Base";
      case 137: return "Polygon";
      case 42161: return "Arbitrum";
      case 10: return "Optimism";
      case 11155111: return "Sepolia";
      case 56: return "BNB";
      default: return "Base";
    }
  }; 

  const getChainLogo = (chainId) => {
    switch (chainId) {
      case 1: return "/ethereum.svg";
      case 8453: return "/base.svg";
      case 137: return "/polygon.svg";
      case 42161: return "/arbitrum.svg";
      case 10: return "/optimism.svg";
      case 56: return "/bnb.svg";
      default: return null;
    }
  };

  return (
    <div className="bg-gradient-to-r from-primary-950 to-secondary-950 p-6 text-white relative overflow-hidden">
      <div className="relative z-10">
        {/* --- 3. MODIFIED HEADER SECTION --- */}
        <div className="flex justify-between items-start mb-4">
          {/* Left side: Title remains */}
          <h3 className="text-lg font-medium text-white/90">
            Ethereum Wallet
          </h3>
          {/* Right side: Contains both Status and the new Network button */}
          <div className="flex flex-col items-end space-y-2">
            {/* Connected Status */}
            <div className="flex items-center px-2 py-1 bg-white/20 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-400 mr-1"></span>
              <span className="text-xs">Connected</span>
            </div>

			{/* New Clickable Network Button */}
			<button
			  onClick={() => open({ view: 'Networks' })}
			  // --- 3. MODIFICATION: Reduced padding to make the button narrower ---
			  className="flex items-center px-2 py-1 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
			>
			  {/* --- 1. MODIFICATION: Icon is now on the left --- */}
			  {/* --- 2. MODIFICATION: Icon color is now green --- */}
			  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-400" fill="currentColor" viewBox="0 0 20 20">
				  <path d="M10 1L5 8h10l-5-7zm0 18l5-7H5l5 7z" />
			  </svg>
			  <span className="text-xs font-medium">{getChainName(chain?.id)}</span>
			</button>
          </div>
        </div>

        <div>
          <div className="text-sm text-white/70">Wallet Address</div>
          <div className="text-base font-medium mt-1 flex items-center">
            {formatAddress(address)}
            <button
              className="ml-2 p-1 text-white/70 hover:text-white transition-colors"
              onClick={() => navigator.clipboard.writeText(address)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-sm text-white/70">Balance</div>
          <div className="text-2xl font-normal">
            {ethBalance
              ? parseFloat(ethBalance.formatted).toFixed(5)
              : "0.00000"}{" "}
            {ethBalance?.symbol || "ETH"}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2">
          <button
            className="bg-white/20 hover:bg-white/30 transition-colors py-2 px-4 rounded-lg text-sm font-medium"
			onClick={() =>
			  window.open(`${getExplorerUrl(chain?.id)}/address/${address}`, "_blank")
			}
          >
            View on Explorer
          </button>
			<button
			  className="bg-white hover:bg-white/90 transition-colors py-2 px-4 rounded-lg text-sm font-medium text-secondary-600"
			  onClick={() => setShowReceive(true)}
			>
			  Receive
			</button>
        </div>
      </div>

      {showReceive && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative bg-white dark:bg-gray-800 text-center shadow-lg w-full max-w-sm p-6 border-2 border-black dark:border-white">
            <button
              className="absolute top-3 right-3 border-2 border-black dark:border-white w-8 h-8 flex items-center justify-center transition bg-transparent text-gray-800 dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black hover:border-black dark:hover:border-white rounded cursor-pointer"
              onClick={() => setShowReceive(false)}
              aria-label="Close"
            >
              <span className="text-4xl leading-none font-bold dark:font-bold">&#215;</span>
            </button>

            <h2 className="text-base font-medium mb-4 text-gray-900 dark:text-white">Receive</h2>

            <div className="relative inline-block border border-black dark:border-white p-2 mx-auto">
              <QRCodeSVG value={address} size={160} />
              {getChainLogo(chain?.id) && (
                <img
                  src={getChainLogo(chain?.id)}
                  alt="Chain"
                  className="absolute top-1/2 left-1/2 w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white p-1"
                />
              )}
            </div>

            {ensName ? (
              <>
                <p className="text-sm mt-4 font-medium text-gray-700 dark:text-gray-300">{ensName}</p>
                <p className="text-xs mt-1 text-gray-700 dark:text-gray-300 break-all">{address}</p>
              </>
            ) : (
              <p className="text-sm mt-4 text-gray-700 dark:text-gray-300 break-all">{address}</p>
            )}

            <div className="flex items-center justify-center mt-2 space-x-1">
              <button
                onClick={() => navigator.clipboard.writeText(address)}
                className="flex items-center text-black dark:text-primary-600 hover:underline"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16h8M8 12h8m-8-4h8m-2-4h-4a2 2 0 00-2 2v12a2 2 0 002 2h4a2 2 0 002-2V6a2 2 0 00-2-2z" />
                </svg>
                Copy address
              </button>
            </div>
          </div>
        </div>
      )}	  
	  
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-white opacity-10 rounded-full"></div>
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-40 h-40 bg-white opacity-10 rounded-full"></div>
    </div>
  );
}
