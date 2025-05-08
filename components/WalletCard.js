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
import { useAccount, useBalance } from "wagmi";

export default function WalletCard() {
  const { address, isConnected } = useAccount();
  const { data: ethBalance } = useBalance({
    address,
    enabled: !!address,
  });

  if (!isConnected) return null;

  // Format address for display
  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl p-6 text-white relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-medium text-white/90">
              Ethereum Wallet
            </h3>
            <p className="text-sm text-white/70">Main Account</p>
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
          <div className="text-2xl font-bold">
            {ethBalance
              ? parseFloat(ethBalance.formatted).toFixed(4)
              : "0.0000"}{" "}
            {ethBalance?.symbol || "ETH"}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2">
          <button
            className="bg-white/20 hover:bg-white/30 transition-colors py-2 px-4 rounded-lg text-sm font-medium"
            onClick={() =>
              window.open(`https://etherscan.io/address/${address}`, "_blank")
            }
          >
            View on Explorer
          </button>
          <button className="bg-white hover:bg-white/90 transition-colors py-2 px-4 rounded-lg text-sm font-medium text-primary-600">
            Receive
          </button>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-white opacity-10 rounded-full"></div>
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-40 h-40 bg-white opacity-10 rounded-full"></div>
    </div>
  );
}
