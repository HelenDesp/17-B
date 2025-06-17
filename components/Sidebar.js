import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAppKit } from "@reown/appkit/react";

export default function Sidebar() {
  const router = useRouter();
  const { isConnected, address, chain } = useAccount();
  const { open } = useAppKit();
  const [mounted, setMounted] = useState(false);
  

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

  if (!mounted) return null;

  if (!isConnected) return null;

  // Format wallet address for display
  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // Menu items with icons
  const menuItems = [
    {
      title: "Dashboard",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      ),
      path: "/",
    },
    {
      title: "NFTs",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
            clipRule="evenodd"
          />
        </svg>
      ),
      path: "#",
    },	
    {
      title: "Tokens",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
            clipRule="evenodd"
          />
        </svg>
      ),
      path: "#",
    },
    {
      title: "Transfer",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
        </svg>
      ),
      path: "#",
    },
    {
      title: "History",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
      ),
      path: "#",
    },
    {
      title: "Settings",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
            clipRule="evenodd"
          />
        </svg>
      ),
      path: "#",
    },
  ];

  return (
    <div className="h-full flex flex-col bg-white border-r-2 border-dark-200 dark:bg-dark-200 dark:border-light-200 shadow-lg">
      {/* User info */}
      <div className="p-4 border-b border-black dark:border-white">
<div className="flex items-center justify-between w-full">
  {/* Avatar on left */}
  <div className="w-10 h-10 flex items-center justify-center">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-10 w-10 text-black dark:text-white rotate-180"
      viewBox="0 0 4160 4160"
      fill="currentColor"
    >
      <path d="M0 2080 l0 -2080 2080 0 2080 0 0 2080 0 2080 -2080 0 -2080 0 0 -2080z m3840 0 l0 -1760 -1760 0 -1760 0 0 1760 0 1760 1760 0 1760 0 0 -1760z"/>
      <path d="M1983 3300 c-157 -24 -280 -87 -393 -200 -85 -85 -130 -156 -166 -259 -85 -246 -29 -510 150 -699 217 -229 528 -284 815 -145 278 134 432 456 367 765 -53 248 -265 467 -506 522 -85 20 -202 27 -267 16z m233 -341 c32 -12 77 -41 110 -71 138 -127 164 -321 64 -478 -179 -276 -607 -196 -675 126 -61 292 219 528 501 423z"/>
      <path d="M1855 1555 c-301 -47 -585 -180 -778 -365 l-71 -67 108 -104 c60 -57 112 -106 117 -107 5 -2 35 20 67 49 420 385 1159 386 1564 1 52 -49 60 -53 75 -41 46 36 213 194 213 202 0 14 -101 107 -183 168 -188 140 -423 235 -670 268 -103 14 -341 12 -442 -4z"/>
    </svg>
  </div>

  {/* WELCOME left + BASE right */}
  <div className="flex justify-between items-center flex-grow px-1">
    <span className="text-sm font-medium text-gray-700 dark:text-gray-200" style={{ fontFamily: "'Cygnito Mono', sans-serif" }}>
      WELCOME
    </span>

    {isConnected && chain && (
      <button
        onClick={() => open({ view: 'Networks' })}
        className="flex items-center text-sm uppercase text-green-800 dark:text-green-200"
        style={{ fontFamily: "'Cygnito Mono', sans-serif" }}
      >
        {formatChainName(chain.name)}
        <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 1L5 8h10l-5-7zm0 18l5-7H5l5 7z" />
        </svg>
      </button>
    )}
  </div>
</div>

            <div className="text-xs text-gray-500 dark:text-gray-400">
              {formatAddress(address)}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-grow overflow-y-auto py-2">
		<ul className="space-y-1 px-2">
		  {menuItems.map((item) => (
			<li key={item.title}>
			  <Link href={item.path} legacyBehavior>
				<a
				  className={
					"flex items-center space-x-3 px-4 py-3 transition-colors font-medium rounded-none border " +
					(router.pathname === item.path
					  ? "text-black dark:text-white border-black dark:border-white"
					  : "text-gray-700 dark:text-gray-300 border-transparent hover:bg-gray-100 dark:hover:bg-dark-100")
				  }
				>
				  <span className="w-5 h-5">{item.icon}</span>
				  <span>{item.title}</span>
				</a>
			  </Link>
			</li>
		  ))}
		</ul>
      </nav>
    </div>
  );
}
