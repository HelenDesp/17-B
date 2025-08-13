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
		<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		  <path d="M8.4 3H4.6C4.03995 3 3.75992 3 3.54601 3.10899C3.35785 3.20487 3.20487 3.35785 3.10899 3.54601C3 3.75992 3 4.03995 3 4.6V8.4C3 8.96005 3 9.24008 3.10899 9.45399C3.20487 9.64215 3.35785 9.79513 3.54601 9.89101C3.75992 10 4.03995 10 4.6 10H8.4C8.96005 10 9.24008 10 9.45399 9.89101C9.64215 9.79513 9.79513 9.64215 9.89101 9.45399C10 9.24008 10 8.96005 10 8.4V4.6C10 4.03995 10 3.75992 9.89101 3.54601C9.79513 3.35785 9.64215 3.20487 9.45399 3.10899C9.24008 3 8.96005 3 8.4 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
		  <path d="M19.4 3H15.6C15.0399 3 14.7599 3 14.546 3.10899C14.3578 3.20487 14.2049 3.35785 14.109 3.54601C14 3.75992 14 4.03995 14 4.6V8.4C14 8.96005 14 9.24008 14.109 9.45399C14.2049 9.64215 14.3578 9.79513 14.546 9.89101C14.7599 10 15.0399 10 15.6 10H19.4C19.9601 10 20.2401 10 20.454 9.89101C20.6422 9.79513 20.7951 9.64215 20.891 9.45399C21 9.24008 21 8.96005 21 8.4V4.6C21 4.03995 21 3.75992 20.891 3.54601C20.7951 3.35785 20.6422 3.20487 20.454 3.10899C20.2401 3 19.9601 3 19.4 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
		  <path d="M19.4 14H15.6C15.0399 14 14.7599 14 14.546 14.109C14.3578 14.2049 14.2049 14.3578 14.109 14.546C14 14.7599 14 15.0399 14 15.6V19.4C14 19.9601 14 20.2401 14.109 20.454C14.2049 20.6422 14.3578 20.7951 14.546 20.891C14.7599 21 15.0399 21 15.6 21H19.4C19.9601 21 20.2401 21 20.454 20.891C20.6422 20.7951 20.7951 20.6422 20.891 20.454C21 20.2401 21 19.9601 21 19.4V15.6C21 15.0399 21 14.7599 20.891 14.546C20.7951 14.3578 20.6422 14.2049 20.454 14.109C20.2401 14 19.9601 14 19.4 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
		  <path d="M8.4 14H4.6C4.03995 14 3.75992 14 3.54601 14.109C3.35785 14.2049 3.20487 14.3578 3.10899 14.546C3 14.7599 3 15.0399 3 15.6V19.4C3 19.9601 3 20.2401 3.10899 20.454C3.20487 20.6422 3.35785 20.7951 3.54601 20.891C3.75992 21 4.03995 21 4.6 21H8.4C8.96005 21 9.24008 21 9.45399 20.891C9.64215 20.7951 9.79513 20.6422 9.89101 20.454C10 20.2401 10 19.9601 10 19.4V15.6C10 15.0399 10 14.7599 9.89101 14.546C9.79513 14.3578 9.64215 14.2049 9.45399 14.109C9.24008 14 8.96005 14 8.4 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
		</svg>
      ),
      path: "dashboard",
    },
    {
      title: "NFTs",
      icon: (
		<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		  <path d="M4.27209 20.7279L10.8686 14.1314C11.2646 13.7354 11.4627 13.5373 11.691 13.4632C11.8918 13.3979 12.1082 13.3979 12.309 13.4632C12.5373 13.5373 12.7354 13.7354 13.1314 14.1314L19.6839 20.6839M14 15L16.8686 12.1314C17.2646 11.7354 17.4627 11.5373 17.691 11.4632C17.8918 11.3979 18.1082 11.3979 18.309 11.4632C18.5373 11.5373 18.7354 11.7354 19.1314 12.1314L22 15M10 9C10 10.1046 9.10457 11 8 11C6.89543 11 6 10.1046 6 9C6 7.89543 6.89543 7 8 7C9.10457 7 10 7.89543 10 9ZM6.8 21H17.2C18.8802 21 19.7202 21 20.362 20.673C20.9265 20.3854 21.3854 19.9265 21.673 19.362C22 18.7202 22 17.8802 22 16.2V7.8C22 6.11984 22 5.27976 21.673 4.63803C21.3854 4.07354 20.9265 3.6146 20.362 3.32698C19.7202 3 18.8802 3 17.2 3H6.8C5.11984 3 4.27976 3 3.63803 3.32698C3.07354 3.6146 2.6146 4.07354 2.32698 4.63803C2 5.27976 2 6.11984 2 7.8V16.2C2 17.8802 2 18.7202 2.32698 19.362C2.6146 19.9265 3.07354 20.3854 3.63803 20.673C4.27976 21 5.11984 21 6.8 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
		</svg>
      ),
      path: "nfts",
    },
    {
      title: "Tokens",
      icon: (
		<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		  <path d="M12 17C12 19.7614 14.2386 22 17 22C19.7614 22 22 19.7614 22 17C22 14.2386 19.7614 12 17 12C14.2386 12 12 14.2386 12 17ZM12 17C12 15.8742 12.3721 14.8353 13 13.9995V5M12 17C12 17.8254 12.2 18.604 12.5541 19.2901C11.7117 20.0018 9.76584 20.5 7.5 20.5C4.46243 20.5 2 19.6046 2 18.5V5M13 5C13 6.10457 10.5376 7 7.5 7C4.46243 7 2 6.10457 2 5M13 5C13 3.89543 10.5376 3 7.5 3C4.46243 3 2 3.89543 2 5M2 14C2 15.1046 4.46243 16 7.5 16C9.689 16 11.5793 15.535 12.4646 14.8618M13 9.5C13 10.6046 10.5376 11.5 7.5 11.5C4.46243 11.5 2 10.6046 2 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
		<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		  <path d="M12 6V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
		</svg>
      ),
      path: "activity",
    },
    {
      title: "Earns",
      icon: (
		<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		  <path d="M13.5295 8.35186C12.9571 8.75995 12.2566 9 11.5 9C9.567 9 8 7.433 8 5.5C8 3.567 9.567 2 11.5 2C12.753 2 13.8522 2.65842 14.4705 3.64814M6 20.0872H8.61029C8.95063 20.0872 9.28888 20.1277 9.61881 20.2086L12.3769 20.8789C12.9753 21.0247 13.5988 21.0388 14.2035 20.9214L17.253 20.3281C18.0585 20.1712 18.7996 19.7854 19.3803 19.2205L21.5379 17.1217C22.154 16.5234 22.154 15.5524 21.5379 14.9531C20.9832 14.4134 20.1047 14.3527 19.4771 14.8103L16.9626 16.6449C16.6025 16.9081 16.1643 17.0498 15.7137 17.0498H13.2855L14.8311 17.0498C15.7022 17.0498 16.4079 16.3633 16.4079 15.5159V15.2091C16.4079 14.5055 15.9156 13.892 15.2141 13.7219L12.8286 13.1417C12.4404 13.0476 12.0428 13 11.6431 13C10.6783 13 8.93189 13.7988 8.93189 13.7988L6 15.0249M20 6.5C20 8.433 18.433 10 16.5 10C14.567 10 13 8.433 13 6.5C13 4.567 14.567 3 16.5 3C18.433 3 20 4.567 20 6.5ZM2 14.6L2 20.4C2 20.9601 2 21.2401 2.10899 21.454C2.20487 21.6422 2.35785 21.7951 2.54601 21.891C2.75992 22 3.03995 22 3.6 22H4.4C4.96005 22 5.24008 22 5.45399 21.891C5.64215 21.7951 5.79513 21.6422 5.89101 21.454C6 21.2401 6 20.9601 6 20.4V14.6C6 14.0399 6 13.7599 5.89101 13.546C5.79513 13.3578 5.64215 13.2049 5.45399 13.109C5.24008 13 4.96005 13 4.4 13L3.6 13C3.03995 13 2.75992 13 2.54601 13.109C2.35785 13.2049 2.20487 13.3578 2.10899 13.546C2 13.7599 2 14.0399 2 14.6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
		</svg>
      ),
      path: "earns",
    },
    {
      title: "Scoreboard",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 15C8.68629 15 6 12.3137 6 9V3.44444C6 3.0306 6 2.82367 6.06031 2.65798C6.16141 2.38021 6.38021 2.16141 6.65798 2.06031C6.82367 2 7.0306 2 7.44444 2H16.5556C16.9694 2 17.1763 2 17.342 2.06031C17.6198 2.16141 17.8386 2.38021 17.9397 2.65798C18 2.82367 18 3.0306 18 3.44444V9C18 12.3137 15.3137 15 12 15ZM12 15V18M18 4H20.5C20.9659 4 21.1989 4 21.3827 4.07612C21.6277 4.17761 21.8224 4.37229 21.9239 4.61732C22 4.80109 22 5.03406 22 5.5V6C22 6.92997 22 7.39496 21.8978 7.77646C21.6204 8.81173 20.8117 9.62038 19.7765 9.89778C19.395 10 18.93 10 18 10M6 4H3.5C3.03406 4 2.80109 4 2.61732 4.07612C2.37229 4.17761 2.17761 4.37229 2.07612 4.61732C2 4.80109 2 5.03406 2 5.5V6C2 6.92997 2 7.39496 2.10222 7.77646C2.37962 8.81173 3.18827 9.62038 4.22354 9.89778C4.60504 10 5.07003 10 6 10M7.44444 22H16.5556C16.801 22 17 21.801 17 21.5556C17 19.5919 15.4081 18 13.4444 18H10.5556C8.59188 18 7 19.5919 7 21.5556C7 21.801 7.19898 22 7.44444 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
