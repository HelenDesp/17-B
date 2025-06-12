"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useBalance } from "wagmi";
import { formatUnits } from "ethers";

// List of popular tokens with their addresses on different networks
const popularTokens = {
  // Mainnet
  1: [
    {
      symbol: "USDT",
      name: "Tether",
      logo: "usdt.svg",
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      decimals: 6,
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      logo: "usdc.svg",
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      decimals: 6,
    },
    {
      symbol: "DAI",
      name: "Dai Stablecoin",
      logo: "dai.svg",
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      decimals: 18,
    },
    {
      symbol: "WBTC",
      name: "Wrapped Bitcoin",
      logo: "wrappedbtc.svg",
      address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      decimals: 8,
    },
    {
      symbol: "LINK",
      name: "Chainlink",
      logo: "link.svg",
      address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
      decimals: 18,
    },
  ],
  // Add token addresses for other networks as needed
  137: [
    {
      symbol: "USDT",
      name: "Tether",
      address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      decimals: 6,
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      decimals: 6,
    },
    {
      symbol: "DAI",
      name: "Dai Stablecoin",
      address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
      decimals: 18,
    },
    {
      symbol: "WBTC",
      name: "Wrapped Bitcoin",
      address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
      decimals: 8,
    },
    {
      symbol: "LINK",
      name: "Chainlink",
      address: "0xb0897686c545045aFc77CF20eC7A532E3120E0F1",
      decimals: 18,
    },
  ],
  8453: [
    {
      symbol: "USDC",
      name: "USD Coin",
      logo: "usdc.svg",
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      decimals: 6,
    },
    {
      symbol: "USDT",
      name: "Tether",
      logo: "usdt.svg",
      address: "0x4200000000000000000000000000000000000006",
      decimals: 6,
    },
    {
      symbol: "DAI",
      name: "Dai Stablecoin",
      logo: "dai.svg",
      address: "0x4200000000000000000000000000000000000005",
      decimals: 18,
    },
    {
      symbol: "WBTC",
      name: "Wrapped Bitcoin",
      logo: "wrappedbtc.svg",
      address: "0x4200000000000000000000000000000000000042",
      decimals: 8,
    },
  ],  
};

// Simple ERC20 ABI for balanceOf method
const erc20Abi = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
];

export default function TokenBalances() {
  const { address, isConnected, chain } = useAccount();
  const [tokens, setTokens] = useState([]);
  const [tokenPrices, setTokenPrices] = useState({});

  // Get ETH balance
  const { data: ethBalance } = useBalance({
    address,
    enabled: !!address,
  });
  
const [ethUsd, setEthUsd] = useState(null);  

	useEffect(() => {
	  if (chain?.id && popularTokens[chain.id]) {
		setTokens(popularTokens[chain.id]);
	  } else {
		// Default to Ethereum mainnet if chain is not supported
		setTokens(popularTokens[1]);
	  }
	}, [chain]);
	
useEffect(() => {
  const fetchEthPrice = async () => {
    if (!chain?.id) return;

    const nativeIdMap = {
      1: 'ethereum',           // Ethereum Mainnet
      8453: 'ethereum',        // Base chain (uses ETH)
      42161: 'ethereum',       // Arbitrum
      10: 'ethereum',          // Optimism
      137: 'matic-network',    // Polygon = MATIC
      56: 'binancecoin',       // BNB
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

  
  useEffect(() => {
    if (!chain?.id || !popularTokens[chain.id]) return;

    const fetchAllTokenPrices = async () => {
      const platformMap = {
        1: "ethereum",
        137: "polygon-pos",
        8453: "base",
        42161: "arbitrum-one",
        10: "optimistic-ethereum",
        56: "binance-smart-chain",
      };

      const platform = platformMap[chain.id];
      if (!platform) return;

      const tokenList = popularTokens[chain.id];
      const addresses = tokenList.map(t => t.address.toLowerCase()).join(",");

      const url = `https://api.coingecko.com/api/v3/simple/token_price/${platform}?contract_addresses=${addresses}&vs_currencies=usd`;

      try {
        const res = await fetch(url);
        const data = await res.json();
        setTokenPrices(data);
      } catch (err) {
        console.warn("Failed to fetch token prices:", err);
      }
    };

    fetchAllTokenPrices();
  }, [chain]);


if (!isConnected) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Token Balances
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Connect your wallet to view balances
        </p>
      </div>
    );
  }

  // return (
  //   <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
  //     <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
  //       Token Balances
  //     </h2>

  //     <div className="grid gap-4">
  //       {/* ETH Balance */}
  //       <div className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-700 rounded-md">
  //         <div className="flex items-center gap-2">
  //           <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
  //             <span className="text-blue-600 dark:text-blue-300 font-semibold">
  //               ETH
  //             </span>
  //           </div>
  //           <span className="font-medium text-gray-700 dark:text-gray-300">
  //             Ethereum
  //           </span>
  //         </div>
  //         <span className="text-gray-900 dark:text-white font-medium">
  //           {ethBalance ? Number(ethBalance.formatted).toFixed(4) : "0.0000"}{" "}
  //           ETH
  //         </span>
  //       </div>

  //       {/* ERC20 Token Balances */}
  //       {tokens.map((token) => (
  //         <TokenBalance key={token.address} token={token} address={address} tokenPrices={tokenPrices} />
  //       ))}
  //     </div>
  //   </div>
  // );
  return (
    <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Token Balances
      </h2>

      <div className="space-y-3">
        {/* ETH Balance */}
        <div className="token-balance-item">
          <div className="flex items-center gap-3">
            <div className="token-icon bg-blue-100 dark:bg-blue-900">
              <span className="text-base text-blue-600 dark:text-blue-300">
                <img
                  src={"/ethereum.svg"}
                  alt={"Ethereum"}
                  className="w-5 h-5 rounded-full"
                />
              </span>
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                Ethereum
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase hidden sm:block">
			  {(() => {
				switch (chain?.id) {
				  case 1:
					return "Native Token";
				  case 8453:
					return "Base";
				  case 137:
					return "Polygon";
				  case 42161:
					return "Arbitrum";
				  case 10:
					return "Optimism";
				  case 11155111:
					return "Sepolia";
				  case 56:
					return "BNB";
				  default:
					return "Base";
				}
			  })()}				
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium text-gray-900 dark:text-white">
              {ethBalance ? Number(ethBalance.formatted).toFixed(5) : "0.00000"}{" "}
              ETH
            </div>
			<div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
			  ${ethBalance && ethUsd ? (Number(ethBalance.formatted) * ethUsd).toFixed(2) : "0.00"}
			</div>
          </div>
        </div>

        {/* ERC20 Token Balances */}
        {tokens.map((token) => (
          <div key={token.address} className="token-balance-item">
            <div className="flex items-center gap-3">
              <div
                className={`token-icon ${token.color} bg-opacity-20 dark:bg-opacity-30`}
              >
                <span className="text-base">
                  {" "}
                  <img
                    src={token.logo}
                    alt={token.symbol}
                    className="w-5 h-5 rounded-full"
                  />
                </span>
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {token.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                  {token.symbol}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-gray-900 dark:text-white">
                {/* For demo purposes, just showing 0.0000 for all tokens */}
                0.0000 {token.symbol}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                $0.00
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TokenBalance({ token, address, tokenPrices }) {
  const { data: balance } = useReadContract({
    address: token.address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address],
    enabled: !!address,
  });

  const formatted = balance ? Number(formatUnits(balance, token.decimals)) : 0;
  const usdRate = tokenPrices?.[token.address.toLowerCase()]?.usd || 0;
  const usdValue = (formatted * usdRate).toFixed(2);

  return (
    <div>
      <div className="font-medium text-gray-900 dark:text-white">
        {formatted.toFixed(5)} {token.symbol}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
        ${usdValue}
      </div>
    </div>
  );
}
