import React, { useEffect, useState } from "react";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { useTheme } from "../context/ThemeContext";
import { modal } from "../context";
import { useRouter } from "next/router";
import { useAppKit } from "@reown/appkit/react";
import { useEnsName } from "wagmi";

export default function Header({ toggleSidebar }) {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { theme, toggleTheme } = useTheme();
  const { open } = useAppKit();
  const { data: ensName } = useEnsName({ address, chainId: 1 });
  const handleWalletModal = () => {
  open({ view: "Account" }); // You can also use "Swap", "OnRampProviders", etc.
};
  const router = useRouter();
  const isHomePage = router.pathname === "/";
  const { data: ethBalance } = useBalance({
    address,
    enabled: !!address,
  });
  const [ethUsd, setEthUsd] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);
  
useEffect(() => {
  const fetchEthPrice = async () => {
    if (!chain?.id) return;

    const nativeIdMap = {
      1: 'ethereum',           // Ethereum Mainnet
      8453: 'base',        // Base chain (uses ETH)
      42161: 'arbitrum-one',       // Arbitrum
      10: 'optimistic-ethereum',          // Optimism
      137: 'polygon-pos',    // Polygon = MATIC
      56: 'binance-smart-chain',       // BNB
      11155111: 'ethereum',    // Sepolia (testnet)
    };

    const coinId = nativeIdMap[chain.id];
    if (!coinId) {
      console.warn('Unsupported chain for native token price:', chain.id);
      return;
    }

    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`;
    console.log("Fetching native token price from:", url);

    try {
      const res = await fetch(url);
      const data = await res.json();
      console.log("Coingecko response:", data);

      const price = data[coinId]?.usd;
      if (price) setEthUsd(price);
    } catch (err) {
      console.error('Error fetching price:', err);
    }
  };

  fetchEthPrice();
}, [chain]);  

  const handleConnect = () => {
    modal.open();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  // Format the address for display
  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  if (!mounted) return null;

  return (
    <header className="relative sticky top-0 z-50 bg-white shadow-md dark:bg-dark-200 dark:shadow-white/38 transition-colors duration-200">
      <div className="header-container">
	  <div className="absolute left-0 right-0 bottom-0 h-0.5 md:h-0.5.5 z-10 bg-dark-200 dark:bg-white pointer-events-none" />
        <div className="header-logo">
          {isConnected && (
            <button
              onClick={toggleSidebar}
              className="mr-2 p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors md:hidden"
              aria-label="Toggle sidebar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          )}

          <h1 className="hidden md:block lg:block text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <span>Web3 Wallet App</span>

            {isConnected && chain && (
			<span
			  className="ml-2 inline-flex items-center px-3 py-1 rounded-none text-base font-normal uppercase bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 relative -top-[6px]"
			  style={{ fontFamily: "'Cygnito Mono', sans-serif" }}
			>
			  {chain.name}
			</span>
            )}
          </h1>
        </div>

        <div className="header-wallet-info">
          {/* Theme Toggle Button */}
		<button
		  onClick={toggleTheme}
		  className="flex items-center gap-2 px-3 py-2 text-dark-200 dark:text-light-200 transition-colors"
		  aria-label="Toggle dark mode"
		>
		  {isHomePage && (
			<span
			  className="text-sm uppercase text-dark-200 [font-family:'Cygnito_Mono',sans-serif] dark:text-light-200"
			>
			  THEME
			</span>
		  )}		
		  {theme === "dark" ? (
			<svg
			  xmlns="http://www.w3.org/2000/svg"
			  className="h-6 w-6"  // 🔼 Bigger icon
			  viewBox="0 0 20 20"
			  fill="currentColor"
			>
			  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
			</svg>
		  ) : (
			<svg
			  xmlns="http://www.w3.org/2000/svg"
			  className="h-6 w-6"  // 🔼 Bigger icon
			  viewBox="0 0 20 20"
			  fill="currentColor"
			>
			  <path
				fillRule="evenodd"
				d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
				clipRule="evenodd"
			  />
			</svg>
		  )}
		</button>


          {/* Balance Info for Connected Users */}
			{isConnected && ethBalance && (
			  <div className="hidden sm:flex items-center bg-gray-100 dark:bg-dark-100 px-3 py-1.5 rounded-lg">
				<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
				  {parseFloat(ethBalance.formatted).toFixed(5)} {ethBalance.symbol}
				  {ethUsd && (
					<> / ${ (parseFloat(ethBalance.formatted) * ethUsd).toFixed(2) }</>
				  )}
				</span>
			  </div>
			)}

          {/* Wallet Connection */}
          {/* {isConnected ? (
            <div className="flex items-center">
              <div className="header-address bg-gray-100 dark:bg-dark-100">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {formatAddress(address)}
                </span>
              </div>
              <button
                onClick={handleDisconnect}
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
              >
                <span className="hidden sm:inline">Disconnect</span>
                <span className="sm:hidden">×</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors"
            >
              Connect Wallet
            </button>
          )} */}
{isConnected ? (
  <button
    onClick={handleWalletModal}
	className="px-4 py-1.5 border-2 border-gray-900 dark:border-white bg-light-100 text-gray-900 dark:bg-dark-300 dark:text-white px-4 py-1.5 text-sm [font-family:'Cygnito_Mono',sans-serif] uppercase tracking-wide rounded-none transition-colors duration-200 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black"
  >
    {ensName || formatAddress(address)}
  </button>
) : (
  <button
    onClick={() => open({ view: "Connect" })}
    className="mx-auto block border-4 border-gray-900 dark:border-white bg-light-100 text-gray-900 dark:bg-dark-300 dark:text-white px-6 py-2 text-sm [font-family:'Cygnito_Mono',sans-serif] uppercase tracking-wide rounded-none transition-colors duration-200 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black"
  >
    Connect Wallet
  </button>
)}
        </div>
      </div>
    </header>
  );
}
