import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
// import Link from "next/link"; // No longer needed for this navigation model
// import { useRouter } from "next/router"; // No longer needed
import { useAppKit } from "@reown/appkit/react";
import { useDisplayName } from "./useDisplayName";

// --- MODIFICATION: Component now accepts 'activeTab' and 'setActiveTab' props ---
export default function Sidebar({ activeTab, setActiveTab }) {
  const { isConnected, address, chain } = useAccount();
  const { open } = useAppKit();
  const [mounted, setMounted] = useState(false);

  const { displayName } = useDisplayName();

  const formatChainName = (name) => {
    if (!name) return "";
    const lower = name.toLowerCase();
    if (lower.includes("arbitrum")) return "Arbitrum";
    if (lower.includes("bnb")) return "BNB";
    if (lower.includes("polygon")) return "Polygon";
    if (lower.includes("optimism") || lower.includes("op ")) return "Optimism";
    if (lower.includes("base")) return "Base";
    if (lower.includes("sepolia")) return "Sepolia";
    if (lower.includes("ethereum")) return "Ethereum";
    return name;
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatSidebarDisplayName = (name, addr) => {
    if (!name || name.startsWith("0x") || name === "Resolving...") {
      if (!addr) return "";
      return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
    }
    return name;
  };

  if (!mounted || !isConnected) return null;

  // Using simple strings as identifiers for each tab
  const menuItems = [
    {
      title: "Dashboard",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      ),
      path: "dashboard",
    },
    {
      title: "NFTs",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      ),
      path: "nfts",
    },
    {
      title: "Tokens",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
        </svg>
      ),
      path: "tokens",
    },
    {
      title: "PalMoji",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      ),
      path: "palmoji",
    },
    {
      title: "Activity",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      ),
      path: "activity",
    },
    {
      title: "Earns",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      ),
      path: "earns",
    },
    {
      title: "Scoreboard",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      ),
      path: "scoreboard",
    },	
    {
      title: "Settings",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 15C8.68629 15 6 12.3137 6 9V3.44444C6 3.0306 6 2.82367 6.06031 2.65798C6.16141 2.38021 6.38021 2.16141 6.65798 2.06031C6.82367 2 7.0306 2 7.44444 2H16.5556C16.9694 2 17.1763 2 17.342 2.06031C17.6198 2.16141 17.8386 2.38021 17.9397 2.65798C18 2.82367 18 3.0306 18 3.44444V9C18 12.3137 15.3137 15 12 15ZM12 15V18M18 4H20.5C20.9659 4 21.1989 4 21.3827 4.07612C21.6277 4.17761 21.8224 4.37229 21.9239 4.61732C22 4.80109 22 5.03406 22 5.5V6C22 6.92997 22 7.39496 21.8978 7.77646C21.6204 8.81173 20.8117 9.62038 19.7765 9.89778C19.395 10 18.93 10 18 10M6 4H3.5C3.03406 4 2.80109 4 2.61732 4.07612C2.37229 4.17761 2.17761 4.37229 2.07612 4.61732C2 4.80109 2 5.03406 2 5.5V6C2 6.92997 2 7.39496 2.10222 7.77646C2.37962 8.81173 3.18827 9.62038 4.22354 9.89778C4.60504 10 5.07003 10 6 10M7.44444 22H16.5556C16.801 22 17 21.801 17 21.5556C17 19.5919 15.4081 18 13.4444 18H10.5556C8.59188 18 7 19.5919 7 21.5556C7 21.801 7.19898 22 7.44444 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      path: "settings",
    },
  ];

  return (
    <div className="h-full flex flex-col bg-white border-r-2 border-dark-200 dark:bg-dark-200 dark:border-light-200 shadow-lg">
      <div className="px-2 py-4 border-b border-black dark:border-white">
        <div className="flex items-center space-x-3 w-full">
          <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-black dark:text-white rotate-180" viewBox="0 0 4160 4160" fill="currentColor">
              <path d="M0 2080 l0 -2080 2080 0 2080 0 0 2080 0 2080 -2080 0 -2080 0 0 -2080z m3840 0 l0 -1760 -1760 0 -1760 0 0 1760 0 1760 1760 0 1760 0 0 -1760z"/>
              <path d="M1983 3300 c-157 -24 -280 -87 -393 -200 -85 -85 -130 -156 -166 -259 -85 -246 -29 -510 150 -699 217 -229 528 -284 815 -145 278 134 432 456 367 765 -53 248 -265 467 -506 522 -85 20 -202 27 -267 16z m233 -341 c32 -12 77 -41 110 -71 138 -127 164 -321 64 -478 -179 -276 -607 -196 -675 126 -61 292 219 528 501 423z"/>
              <path d="M1855 1555 c-301 -47 -585 -180 -778 -365 l-71 -67 108 -104 c60 -57 112 -106 117 -107 5 -2 35 20 67 49 420 385 1159 386 1564 1 52 -49 60 -53 75 -41 46 36 213 194 213 202 0 14 -101 107 -183 168 -188 140 -423 235 -670 268 -103 14 -341 12 -442 -4z"/>
            </svg>
          </div>
          <div className="flex-grow min-w-0 pr-1">
            <div className="flex justify-between items-center mb-1">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-200" style={{ fontFamily: "'Cygnito Mono', sans-serif" }}>
                WELCOME
              </div>
              {isConnected && chain && (
                <button
                  onClick={() => open({ view: 'Networks' })}
                  className="flex items-center text-sm uppercase text-green-800 dark:text-green-200"
                  style={{ fontFamily: "'Cygnito Mono', sans-serif" }}
                >
                  {formatChainName(chain.name)}
                  <svg xmlns="http://www.w3.org/2000/svg" className="ml-0.5 -mr-1 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 1L5 8h10l-5-7zm0 18l5-7H5l5 7z" />
                  </svg>
                </button>
              )}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {formatSidebarDisplayName(displayName, address)}
            </div>
          </div>
        </div>
      </div>

{/* --- MODIFICATION: Corrected Navigation Logic --- */}
      <nav className="flex-grow overflow-y-auto py-2">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => (
            <li key={item.title}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  // Special action for the Activity tab
                  if (item.path === 'activity') {
                    open({ view: 'Account' });
                  } else {
                    setActiveTab(item.path);
                  }
                }}
                className={`flex items-center space-x-3 px-4 py-3 transition-colors font-medium rounded-none border ${
                    activeTab === item.path
                      ? "text-black dark:text-white border-black dark:border-white"
                      : "text-gray-700 dark:text-gray-300 border-transparent hover:bg-gray-100 dark:hover:bg-dark-100"
                  }`}
              >
                <span className="w-5 h-5">{item.icon}</span>
                <span>{item.title}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
