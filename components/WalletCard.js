// import React from "react";
// import { useAccount, useBalance } from "wagmi";

// export default function WalletCard() {
//   const { address, isConnected } = useAccount();
//   const { data: ethBalance } = useBalance({
//     address,
//     enabled: !!address,
//   });

//   if (!isConnected) return null;

//   // Format address for display
//   const formatAddress = (addr) => {
//     if (!addr) return "";
//     return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
//   };

//   return (
//     <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl shadow-lg p-6 text-white overflow-hidden relative">
//       {/* Decorative elements */}
//       <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-white opacity-10 rounded-full"></div>
//       <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-40 h-40 bg-white opacity-10 rounded-full"></div>

//       <div className="relative z-10">
//         <div className="flex justify-between items-start mb-6">
//           <div>
//             <h3 className="text-lg font-medium text-white/90">
//               Ethereum Wallet
//             </h3>
//             <p className="text-sm text-white/70">Main Account</p>
//           </div>
//           <div className="flex items-center space-x-1 bg-white/20 rounded-full px-3 py-1">
//             <span className="w-2 h-2 rounded-full bg-green-400"></span>
//             <span className="text-xs font-medium">Connected</span>
//           </div>
//         </div>

//         <div className="mt-4">
//           <div className="text-sm text-white/70">Wallet Address</div>
//           <div className="text-base font-medium mt-1 flex items-center">
//             {formatAddress(address)}
//             <button
//               className="ml-2 p-1 text-white/70 hover:text-white transition-colors"
//               onClick={() => navigator.clipboard.writeText(address)}
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-4 w-4"
//                 viewBox="0 0 20 20"
//                 fill="currentColor"
//               >
//                 <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
//                 <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
//               </svg>
//             </button>
//           </div>
//         </div>

//         <div className="mt-6">
//           <div className="text-sm text-white/70">Balance</div>
//           <div className="text-2xl font-bold mt-1">
//             {ethBalance
//               ? parseFloat(ethBalance.formatted).toFixed(4)
//               : "0.0000"}{" "}
//             {ethBalance?.symbol || "ETH"}
//           </div>
//         </div>

//         <div className="mt-6 flex space-x-2">
//           <button
//             className="flex-1 bg-white/20 hover:bg-white/30 transition-colors py-2 px-4 rounded-lg text-sm font-medium"
//             onClick={() =>
//               window.open(`https://etherscan.io/address/${address}`, "_blank")
//             }
//           >
//             View on Explorer
//           </button>
//           <button className="flex-1 bg-white hover:bg-white/90 transition-colors py-2 px-4 rounded-lg text-sm font-medium text-primary-600">
//             Receive
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// Update this in your WalletCard.js component

import React from "react";
import { useAccount, useBalance, useEnsName } from "wagmi";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";

export default function WalletCard() {
  const { address, isConnected, chain } = useAccount();
  const { data: ethBalance } = useBalance({
    address,
    enabled: !!address,
  });
  
  const { data: ensName } = useEnsName({ address, chainId: 1 });
  
  const [showReceive, setShowReceive] = useState(false);  

  if (!isConnected) return null;

  // Format address for display
  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 6)}`;
  };
  
const getExplorerUrl = (chainId) => {
  switch (chainId) {
    case 1:
      return "https://etherscan.io"; // Ethereum Mainnet
    case 8453:
      return "https://basescan.org"; // Base
    case 137:
      return "https://polygonscan.com"; // Polygon
    case 42161:
      return "https://arbiscan.io"; // Arbitrum One
    case 10:
      return "https://optimistic.etherscan.io"; // Optimism
    case 11155111:
      return "https://sepolia.etherscan.io"; // Sepolia
    case 56:
      return "https://bscscan.com"; // BNB Smart Chain
    default:
      return "https://basescan.org"; // Fallback
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
    case 1: return "/logos/eth.svg";
    case 8453: return "/logos/base.svg";
    case 137: return "/logos/polygon.svg";
    case 42161: return "/logos/arbitrum.svg";
    case 10: return "/logos/op.svg";
    case 56: return "/logos/bnb.svg";
    default: return null;
  }
};

  return (
    <div className="bg-gradient-to-r from-primary-950 to-secondary-950 p-6 text-white relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-medium text-white/90">
              Ethereum Wallet
            </h3>
          <p className="text-sm text-white/70 uppercase">{getChainName(chain?.id)}</p>
          </div>
          <div className="flex items-center px-2 py-1 bg-white/20 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-400 mr-1"></span>
            <span className="text-xs">Connected</span>
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
          className="flex items-center text-sm text-primary-600 hover:underline"
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
