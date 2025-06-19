import React, { useEffect, useState } from "react";
import { useAccount, useBalance, useDisconnect, useEnsName } from "wagmi";
import { useTheme } from "../context/ThemeContext";
import { useRouter } from "next/router";
import { useAppKit } from "@reown/appkit/react";
import { useName } from '@coinbase/onchainkit/identity';
import { base, mainnet, sepolia } from 'viem/chains';

// --- Your Main Header Component ---
export default function Header({ toggleSidebar }) {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { theme, toggleTheme } = useTheme();
  const { open } = useAppKit();
  
  // --- 1. BNS HOOK (for Base only) ---
  // This hook resolves names on Base. It might fall back to ENS.
  const { data: baseName, isLoading: isBnsLoading } = useName({
    address,
    chain: base,
    enabled: isConnected && chain?.id === base.id,
  });
  
  // --- 2. ENS HOOK (for comparison on Base, and for display on Mainnet/Sepolia) ---
  // We now enable this hook on Base as well, specifically for our comparison logic.
  const { data: ensName, isLoading: isEnsLoading } = useEnsName({
    address,
    chainId: 1,
    enabled: isConnected && (chain?.id === base.id || chain?.id === mainnet.id || chain?.id === sepolia.id),
  });

  const handleWalletModal = () => {
    open({ view: "Account" });
  };

  const router = useRouter();
  const isHomePage = router.pathname === "/";
  const { data: ethBalance } = useBalance({ address, enabled: !!address });
  const [ethUsd, setEthUsd] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    const fetchEthPrice = async () => {
      if (!chain?.id) return;
      const nativeIdMap = {
        1: 'ethereum', 8453: 'ethereum', 42161: 'ethereum',
        10: 'ethereum', 137: 'matic-network', 56: 'binancecoin',
        11155111: 'ethereum',
      };
      const coinId = nativeIdMap[chain.id];
      if (!coinId) return;

      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        if (data[coinId]?.usd) setEthUsd(data[coinId].usd);
      } catch (err) {
        console.error('Error fetching price:', err);
      }
    };
    fetchEthPrice();
  }, [chain]);  

  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };
  
  if (!mounted) return null;

  // --- 3. ROBUST DISPLAY LOGIC WITH COMPARISON ---
  let finalResolvedName = null;
  // Consolidate loading states. Show loading if either relevant hook is active.
  const isNameLoading = (chain?.id === base.id && isBnsLoading) || 
                      ((chain?.id === mainnet.id || chain?.id === sepolia.id) && isEnsLoading);

  if (isConnected && address) {
    switch (chain?.id) {
      case base.id:
        // ONLY set the name if the BNS hook returned a name AND it's different from the ENS name.
        if (baseName && baseName !== ensName) {
          finalResolvedName = baseName;
        }
        break;
      
      case mainnet.id:
      case sepolia.id:
        finalResolvedName = ensName;
        break;
    }
  }

  const displayName = isNameLoading
    ? "Resolving..."
    : finalResolvedName || formatAddress(address);


  return (
    <header className="relative sticky top-0 z-50 bg-white overflow-x-hidden w-full max-w-full shadow-md dark:bg-dark-200 dark:shadow-white/38 transition-colors duration-200">
		<div className="header-container flex items-center justify-between px-2 w-full max-w-[100vw] overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 h-0.5 z-10 bg-dark-200 dark:bg-white pointer-events-none max-w-full overflow-hidden" />
        <div className="header-logo">
          {isConnected && (
            <button
              onClick={toggleSidebar}
              className="-ml-1 mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors md:hidden"
              aria-label="Toggle sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          {!isConnected ? (
            <div className="w-[128px] xsm:w-[104px] aspect-[484/165] text-black dark:text-white dark:invert">
              {/* SVG Logo */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 484 165" className="w-full h-full" fill="currentColor" shapeRendering="crispEdges">
                <path d="M0 0 C39.93 0 79.86 0 121 0 C121 3.63 121 7.26 121 11 C135.52 11 150.04 11 165 11 C165 14.63 165 18.26 165 22 C168.63 22 172.26 22 176 22 C176 29.26 176 36.52 176 44 C179.63 44 183.26 44 187 44 C187 47.63 187 51.26 187 55 C190.63 55 194.26 55 198 55 C198 62.26 198 69.52 198 77 C201.63 77 205.26 77 209 77 C209 84.26 209 91.52 209 99 C216.26 99 223.52 99 231 99 C231 91.74 231 84.48 231 77 C234.63 77 238.26 77 242 77 C242 69.74 242 62.48 242 55 C245.63 55 249.26 55 253 55 C253 51.37 253 47.74 253 44 C256.63 44 260.26 44 264 44 C264 36.74 264 29.48 264 22 C267.63 22 271.26 22 275 22 C275 18.37 275 14.74 275 11 C289.52 11 304.04 11 319 11 C319 7.37 319 3.74 319 0 C362.56 0 406.12 0 451 0 C451 3.63 451 7.26 451 11 C447.37 11 443.74 11 440 11 C440 14.63 440 18.26 440 22 C436.37 22 432.74 22 429 22 C429 25.63 429 29.26 429 33 C425.37 33 421.74 33 418 33 C418 36.63 418 40.26 418 44 C388.96 44 359.92 44 330 44 C330 47.63 330 51.26 330 55 C322.74 55 315.48 55 308 55 C308 62.26 308 69.52 308 77 C304.37 77 300.74 77 297 77 C297 80.63 297 84.26 297 88 C293.37 88 289.74 88 286 88 C286 95.26 286 102.52 286 110 C282.37 110 278.74 110 275 110 C275 113.63 275 117.26 275 121 C271.37 121 267.74 121 264 121 C264 124.63 264 128.26 264 132 C260.37 132 256.74 132 253 132 C253 135.63 253 139.26 253 143 C249.37 143 245.74 143 242 143 C242 146.63 242 150.26 242 154 C238.37 154 234.74 154 231 154 C231 157.63 231 161.26 231 165 C223.74 165 216.48 165 209 165 C209 161.37 209 157.74 209 154 C205.37 154 201.74 154 198 154 C198 150.37 198 146.74 198 143 C194.37 143 190.74 143 187 143 C187 139.37 187 135.74 187 132 C183.37 132 179.74 132 176 132 C176 128.37 176 124.74 176 121 C172.37 121 168.74 121 165 121 C165 117.37 165 113.74 165 110 C161.37 110 157.74 110 154 110 C154 102.74 154 95.48 154 88 C150.37 88 146.74 88 143 88 C143 84.37 143 80.74 143 77 C139.37 77 135.74 77 132 77 C132 69.74 132 62.48 132 55 C124.74 55 117.48 55 110 55 C110 51.37 110 47.74 110 44 C62.81 44 15.62 44 -33 44 C-33 40.37 -33 36.74 -33 33 C-29.37 33 -25.74 33 -22 33 C-22 29.37 -22 25.74 -22 22 C-18.37 22 -14.74 22 -11 22 C-11 18.37 -11 14.74 -11 11 C-7.37 11 -3.74 11 0 11 C0 7.37 0 3.74 0 0 Z " fill="#000000" transform="translate(33,0)"/><path d="M0 0 C32.67 0 65.34 0 99 0 C99 36.63 99 73.26 99 111 C62.7 111 26.4 111 -11 111 C-11 107.37 -11 103.74 -11 100 C-25.52 100 -40.04 100 -55 100 C-55 96.37 -55 92.74 -55 89 C-62.26 89 -69.52 89 -77 89 C-77 85.37 -77 81.74 -77 78 C-73.37 78 -69.74 78 -66 78 C-66 74.37 -66 70.74 -66 67 C-62.37 67 -58.74 67 -55 67 C-55 59.74 -55 52.48 -55 45 C-47.74 45 -40.48 45 -33 45 C-33 48.63 -33 52.26 -33 56 C-25.74 56 -18.48 56 -11 56 C-11 59.63 -11 63.26 -11 67 C10.78 67 32.56 67 55 67 C55 59.74 55 52.48 55 45 C29.59 45 4.18 45 -22 45 C-22 37.74 -22 30.48 -22 23 C-18.37 23 -14.74 23 -11 23 C-11 19.37 -11 15.74 -11 12 C-7.37 12 -3.74 12 0 12 C0 8.04 0 4.08 0 0 Z " fill="#000000" transform="translate(385,54)"/><path d="M0 0 C50.82 0 101.64 0 154 0 C154 3.63 154 7.26 154 11 C157.63 11 161.26 11 165 11 C165 14.63 165 18.26 165 22 C168.63 22 172.26 22 176 22 C176 29.26 176 36.52 176 44 C179.63 44 183.26 44 187 44 C187 47.63 187 51.26 187 55 C190.63 55 194.26 55 198 55 C198 58.63 198 62.26 198 66 C201.63 66 205.26 66 209 66 C209 73.26 209 80.52 209 88 C190.85 88 172.7 88 154 88 C154 84.37 154 80.74 154 77 C150.37 77 146.74 77 143 77 C143 73.37 143 69.74 143 66 C139.37 66 135.74 66 132 66 C132 58.74 132 51.48 132 44 C106.59 44 81.18 44 55 44 C55 58.52 55 73.04 55 88 C36.85 88 18.7 88 0 88 C0 58.96 0 29.92 0 0 Z " fill="#000000" transform="translate(0,77)"/>
              </svg>
            </div>
          ) : (
            <div className="w-[104px] aspect-[484/165] hidden [@media(min-width:300px)]:block text-black dark:text-white dark:invert" style={{ marginLeft: "0px" }}>
              {/* SVG Logo */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 484 165" className="w-full h-full" fill="currentColor" shapeRendering="crispEdges">
                 <path d="M0 0 C39.93 0 79.86 0 121 0 C121 3.63 121 7.26 121 11 C135.52 11 150.04 11 165 11 C165 14.63 165 18.26 165 22 C168.63 22 172.26 22 176 22 C176 29.26 176 36.52 176 44 C179.63 44 183.26 44 187 44 C187 47.63 187 51.26 187 55 C190.63 55 194.26 55 198 55 C198 62.26 198 69.52 198 77 C201.63 77 205.26 77 209 77 C209 84.26 209 91.52 209 99 C216.26 99 223.52 99 231 99 C231 91.74 231 84.48 231 77 C234.63 77 238.26 77 242 77 C242 69.74 242 62.48 242 55 C245.63 55 249.26 55 253 55 C253 51.37 253 47.74 253 44 C256.63 44 260.26 44 264 44 C264 36.74 264 29.48 264 22 C267.63 22 271.26 22 275 22 C275 18.37 275 14.74 275 11 C289.52 11 304.04 11 319 11 C319 7.37 319 3.74 319 0 C362.56 0 406.12 0 451 0 C451 3.63 451 7.26 451 11 C447.37 11 443.74 11 440 11 C440 14.63 440 18.26 440 22 C436.37 22 432.74 22 429 22 C429 25.63 429 29.26 429 33 C425.37 33 421.74 33 418 33 C418 36.63 418 40.26 418 44 C388.96 44 359.92 44 330 44 C330 47.63 330 51.26 330 55 C322.74 55 315.48 55 308 55 C308 62.26 308 69.52 308 77 C304.37 77 300.74 77 297 77 C297 80.63 297 84.26 297 88 C293.37 88 289.74 88 286 88 C286 95.26 286 102.52 286 110 C282.37 110 278.74 110 275 110 C275 113.63 275 117.26 275 121 C271.37 121 267.74 121 264 121 C264 124.63 264 128.26 264 132 C260.37 132 256.74 132 253 132 C253 135.63 253 139.26 253 143 C249.37 143 245.74 143 242 143 C242 146.63 242 150.26 242 154 C238.37 154 234.74 154 231 154 C231 157.63 231 161.26 231 165 C223.74 165 216.48 165 209 165 C209 161.37 209 157.74 209 154 C205.37 154 201.74 154 198 154 C198 150.37 198 146.74 198 143 C194.37 143 190.74 143 187 143 C187 139.37 187 135.74 187 132 C183.37 132 179.74 132 176 132 C176 128.37 176 124.74 176 121 C172.37 121 168.74 121 165 121 C165 117.37 165 113.74 165 110 C161.37 110 157.74 110 154 110 C154 102.74 154 95.48 154 88 C150.37 88 146.74 88 143 88 C143 84.37 143 80.74 143 77 C139.37 77 135.74 77 132 77 C132 69.74 132 62.48 132 55 C124.74 55 117.48 55 110 55 C110 51.37 110 47.74 110 44 C62.81 44 15.62 44 -33 44 C-33 40.37 -33 36.74 -33 33 C-29.37 33 -25.74 33 -22 33 C-22 29.37 -22 25.74 -22 22 C-18.37 22 -14.74 22 -11 22 C-11 18.37 -11 14.74 -11 11 C-7.37 11 -3.74 11 0 11 C0 7.37 0 3.74 0 0 Z " fill="#000000" transform="translate(33,0)"/><path d="M0 0 C32.67 0 65.34 0 99 0 C99 36.63 99 73.26 99 111 C62.7 111 26.4 111 -11 111 C-11 107.37 -11 103.74 -11 100 C-25.52 100 -40.04 100 -55 100 C-55 96.37 -55 92.74 -55 89 C-62.26 89 -69.52 89 -77 89 C-77 85.37 -77 81.74 -77 78 C-73.37 78 -69.74 78 -66 78 C-66 74.37 -66 70.74 -66 67 C-62.37 67 -58.74 67 -55 67 C-55 59.74 -55 52.48 -55 45 C-47.74 45 -40.48 45 -33 45 C-33 48.63 -33 52.26 -33 56 C-25.74 56 -18.48 56 -11 56 C-11 59.63 -11 63.26 -11 67 C10.78 67 32.56 67 55 67 C55 59.74 55 52.48 55 45 C29.59 45 4.18 45 -22 45 C-22 37.74 -22 30.48 -22 23 C-18.37 23 -14.74 23 -11 23 C-11 19.37 -11 15.74 -11 12 C-7.37 12 -3.74 12 0 12 C0 8.04 0 4.08 0 0 Z " fill="#000000" transform="translate(385,54)"/><path d="M0 0 C50.82 0 101.64 0 154 0 C154 3.63 154 7.26 154 11 C157.63 11 161.26 11 165 11 C165 14.63 165 18.26 165 22 C168.63 22 172.26 22 176 22 C176 29.26 176 36.52 176 44 C179.63 44 183.26 44 187 44 C187 47.63 187 51.26 187 55 C190.63 55 194.26 55 198 55 C198 58.63 198 62.26 198 66 C201.63 66 205.26 66 209 66 C209 73.26 209 80.52 209 88 C190.85 88 172.7 88 154 88 C154 84.37 154 80.74 154 77 C150.37 77 146.74 77 143 77 C143 73.37 143 69.74 143 66 C139.37 66 135.74 66 132 66 C132 58.74 132 51.48 132 44 C106.59 44 81.18 44 55 44 C55 58.52 55 73.04 55 88 C36.85 88 18.7 88 0 88 C0 58.96 0 29.92 0 0 Z " fill="#000000" transform="translate(0,77)"/>
              </svg>
            </div>
          )}
        </div>

        <div className="header-wallet-info flex items-center">
          <button onClick={toggleTheme} className="flex items-center gap-2 xsm:px-1 px-3 py-2 text-dark-200 dark:text-light-200 transition-colors xsm:ml-3" aria-label="Toggle dark mode">
		  {isHomePage && ( <span className="text-sm uppercase text-dark-200 dark:text-light-200 [@media(max-width:540px)]:hidden" > THEME </span> )}
		  {theme === "dark" ? ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" > <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /> </svg> ) : ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" > <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /> </svg> )}
		  </button>
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

          {isConnected ? (
            <button
              onClick={handleWalletModal}
              className="ml-2 inline-block truncate xsm:px-2 px-4 py-1.5 border-2 border-gray-900 dark:border-white bg-light-100 text-gray-900 dark:bg-dark-300 dark:text-white text-sm font-cygnito uppercase tracking-wide rounded-none transition-colors duration-200 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black sm-mid:max-w-[210px] xsm:max-w-[170px] [@media(max-width:360px)]:max-w-[130px]"
            >
              {displayName}
            </button>
          ) : (
            <button
              onClick={() => open({ view: "Connect" })}
              className="ml-2 xsm:border-2 border-4 xsm:px-2 px-4 py-1.5 border-gray-900 dark:border-white bg-light-100 text-gray-900 dark:bg-dark-300 dark:text-white text-sm font-cygnito uppercase tracking-wide rounded-none transition-colors duration-200 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}