import React, { useEffect, useState, useRef } from "react";
import { useAccount } from "wagmi";

const ALCHEMY_URLS = {
  1: "https://eth-mainnet.g.alchemy.com/v2/oQKmm0fzZOpDJLTI64W685aWf8j1LvDr",
  8453: "https://base-mainnet.g.alchemy.com/v2/oQKmm0fzZOpDJLTI64W685aWf8j1LvDr",
  42161: "https://arb-mainnet.g.alchemy.com/v2/oQKmm0fzZOpDJLTI64W685aWf8j1LvDr",
  10: "https://opt-mainnet.g.alchemy.com/v2/oQKmm0fzZOpDJLTI64W685aWf8j1LvDr",
  137: "https://polygon-mainnet.g.alchemy.com/v2/oQKmm0fzZOpDJLTI64W685aWf8j1LvDr",
  56: "https://bnb-mainnet.g.alchemy.com/v2/oQKmm0fzZOpDJLTI64W685aWf8j1LvDr",
  11155111: "https://eth-sepolia.g.alchemy.com/v2/oQKmm0fzZOpDJLTI64W685aWf8j1LvDr", 
};

// Optimized name resolution cache
const nameCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function resolveNamesForAddresses(addresses, chainId) {
  const uniqueAddresses = [...new Set(addresses)].filter(addr => addr && addr !== '0x0000000000000000000000000000000000000000');
  const uncachedAddresses = [];
  const results = {};

  // Check cache first
  for (const address of uniqueAddresses) {
    const cacheKey = `${address.toLowerCase()}-${chainId}`;
    const cached = nameCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      results[address.toLowerCase()] = cached.name;
    } else {
      uncachedAddresses.push(address);
    }
  }

  if (uncachedAddresses.length === 0) {
    return results;
  }

  // Batch resolve names for uncached addresses
  try {
    // For Base chain, try BNS first, then ENS as fallback
    if (chainId === 8453) {
      // Use Coinbase's OnchainKit API for BNS resolution
      const bnsPromises = uncachedAddresses.map(async (address) => {
        try {
          const response = await fetch(`https://api.coinbase.com/v2/public/address-book/resolve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              addresses: [address],
              chains: ['base']
            })
          });
          const data = await response.json();
          return { address: address.toLowerCase(), name: data.data?.[address]?.name || null };
        } catch {
          return { address: address.toLowerCase(), name: null };
        }
      });

      const bnsResults = await Promise.all(bnsPromises);
      
      // For addresses without BNS, try ENS
      const addressesWithoutBNS = bnsResults.filter(r => !r.name).map(r => r.address);
      
      if (addressesWithoutBNS.length > 0) {
        const ensPromises = addressesWithoutBNS.map(async (address) => {
          try {
            const response = await fetch(`https://api.ensideas.com/ens/resolve/${address}`);
            const data = await response.json();
            return { address: address.toLowerCase(), name: data.name || null };
          } catch {
            return { address: address.toLowerCase(), name: null };
          }
        });

        const ensResults = await Promise.all(ensPromises);
        
        // Merge BNS and ENS results
        for (const bnsResult of bnsResults) {
          if (bnsResult.name) {
            results[bnsResult.address] = bnsResult.name;
          }
        }
        
        for (const ensResult of ensResults) {
          if (ensResult.name && !results[ensResult.address]) {
            results[ensResult.address] = ensResult.name;
          }
        }
      } else {
        // All addresses have BNS names
        for (const bnsResult of bnsResults) {
          if (bnsResult.name) {
            results[bnsResult.address] = bnsResult.name;
          }
        }
      }
    } else {
      // For other chains, use ENS
      const ensPromises = uncachedAddresses.map(async (address) => {
        try {
          const response = await fetch(`https://api.ensideas.com/ens/resolve/${address}`);
          const data = await response.json();
          return { address: address.toLowerCase(), name: data.name || null };
        } catch {
          return { address: address.toLowerCase(), name: null };
        }
      });

      const ensResults = await Promise.all(ensPromises);
      for (const result of ensResults) {
        if (result.name) {
          results[result.address] = result.name;
        }
      }
    }

    // Cache the results
    for (const address of uncachedAddresses) {
      const cacheKey = `${address.toLowerCase()}-${chainId}`;
      nameCache.set(cacheKey, {
        name: results[address.toLowerCase()] || null,
        timestamp: Date.now()
      });
    }
  } catch (error) {
    console.error("Error resolving names:", error);
  }

  return results;
}

function AddressDisplay({ address, chainId, getExplorerBaseUrl, shortenAddress, resolvedNames }) {
  if (!address) return <span>-</span>;
  
  const displayName = resolvedNames[address.toLowerCase()] || shortenAddress(address);

  return (
    <a
      href={`${getExplorerBaseUrl(chainId)}/address/${address}`}
      target="_blank"
      rel="noopener noreferrer"
      className="underline text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
      title={address}
    >
      {displayName}
    </a>
  );
}

export default function TokenTxHistory({ address, chainId, isConnected }) {
  const [txs, setTxs] = useState([]);
  const [resolvedNames, setResolvedNames] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const perPage = 4;
  
  const fetchController = useRef({ lastFetchedKey: null });
  const { chain } = useAccount();

  const getChainLabel = (chainId) => {
    switch (chainId) {
      case 1: return "Ethereum";
      case 8453: return "Base";
      case 137: return "Polygon";
      case 42161: return "Arbitrum";
      case 10: return "Optimism";
      case 11155111: return "Sepolia";
      case 56: return "BNB";
      default: return "Unknown";
    }
  };  

  const getExplorerBaseUrl = (chainId) => {
    switch (chainId) {
      case 1: return "https://etherscan.io";
      case 8453: return "https://basescan.org";
      case 137: return "https://polygonscan.com";
      case 42161: return "https://arbiscan.io";
      case 10: return "https://optimistic.etherscan.io";
      case 56: return "https://bscscan.com";
      case 11155111: return "https://sepolia.etherscan.io";
      default: return "https://etherscan.io";
    }
  };

  const shortenAddress = (addr) => {
    if (!addr) return "";
    return addr.slice(0, 6) + "..." + addr.slice(-4);
  };

  const formatShortDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
             ", " +
             d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "Invalid Date";
    }
  };

  const formatValue = (value, decimals = 18) => {
    try {
      if (!value) return "0";
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (numValue === 0) return "0";
      if (numValue < 0.00001) return numValue.toExponential(2);
      return numValue.toFixed(Math.min(6, Math.max(2, 6 - Math.floor(Math.log10(numValue)))));
    } catch {
      return "0";
    }
  };

  useEffect(() => {
    if (!address || !chainId || !isConnected) {
      setTxs([]);
      setResolvedNames({});
      setError(null);
      return;
    }

    const currentFetchKey = `${address}-${chainId}`;
    if (fetchController.current.lastFetchedKey === currentFetchKey) {
      return; 
    }
    
    const ALCHEMY_BASE_URL = ALCHEMY_URLS[chainId];
    if (!ALCHEMY_BASE_URL) {
      setError(`Chain ${chainId} not supported`);
      return;
    }

    const fetchTxs = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log(`Fetching transactions for ${address} on chain ${chainId}`);
        
        // Make separate requests for sent and received transactions
        const [sentResponse, receivedResponse] = await Promise.all([
          fetch(ALCHEMY_BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: 1,
              method: "alchemy_getAssetTransfers",
              params: [{ 
                fromBlock: "0x0", 
                fromAddress: address, 
                category: ["external", "erc20"], 
                withMetadata: true, 
                excludeZeroValue: true, 
                maxCount: "0x32" 
              }]
            })
          }),
          fetch(ALCHEMY_BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: 2,
              method: "alchemy_getAssetTransfers",
              params: [{ 
                fromBlock: "0x0", 
                toAddress: address, 
                category: ["external", "erc20"], 
                withMetadata: true, 
                excludeZeroValue: true, 
                maxCount: "0x32" 
              }]
            })
          })
        ]);

        if (!sentResponse.ok) {
          throw new Error(`HTTP error on sent transactions! status: ${sentResponse.status}`);
        }
        
        if (!receivedResponse.ok) {
          throw new Error(`HTTP error on received transactions! status: ${receivedResponse.status}`);
        }

        const [sentData, receivedData] = await Promise.all([
          sentResponse.json(),
          receivedResponse.json()
        ]);
        
        console.log('Alchemy sent response:', sentData);
        console.log('Alchemy received response:', receivedData);
        
        if (sentData.error) {
          throw new Error(`Sent transactions error: ${sentData.error.message}`);
        }
        
        if (receivedData.error) {
          throw new Error(`Received transactions error: ${receivedData.error.message}`);
        }

        const sentTxs = sentData.result?.transfers || [];
        const receivedTxs = receivedData.result?.transfers || [];
        
        console.log(`Found ${sentTxs.length} sent and ${receivedTxs.length} received transactions`);
        
        if (sentTxs.length === 0 && receivedTxs.length === 0) {
          setTxs([]);
          setResolvedNames({});
          fetchController.current.lastFetchedKey = currentFetchKey;
          return;
        }

        const all = [...sentTxs, ...receivedTxs];
        
        // Filter out NFTs for now, focus on tokens and ETH
        const filtered = all.filter(tx => 
          tx.category === "external" || tx.category === "erc20"
        );
        
        console.log(`After filtering: ${filtered.length} transactions`);
        
        // Collect all unique addresses for batch name resolution
        const allAddresses = new Set();
        filtered.forEach(tx => {
          if (tx.from && tx.from !== '0x0000000000000000000000000000000000000000') {
            allAddresses.add(tx.from);
          }
          if (tx.to && tx.to !== '0x0000000000000000000000000000000000000000') {
            allAddresses.add(tx.to);
          }
        });

        // Group transactions by hash and determine type
        const hashMap = new Map();
        for (const tx of filtered) { 
          if (!hashMap.has(tx.hash)) { 
            hashMap.set(tx.hash, []); 
          } 
          hashMap.get(tx.hash).push(tx); 
        }
        
        // Sort by timestamp (newest first)
        const txList = Array.from(hashMap.entries()).sort((a, b) => 
          new Date(b[1][0].metadata.blockTimestamp) - new Date(a[1][0].metadata.blockTimestamp)
        );

        const processedTxs = [];
        const seenHashes = new Set();

        for (const [hash, txGroup] of txList) {
          if (seenHashes.has(hash)) continue;
          seenHashes.add(hash);
          
          const userAddress = address.toLowerCase();
          const sentTx = txGroup.find(t => t.from?.toLowerCase() === userAddress);
          const receivedTx = txGroup.find(t => t.to?.toLowerCase() === userAddress);
          
          let type = "Unknown";
          let primaryTx = txGroup[0];
          
          if (sentTx && receivedTx) {
            // This is likely a swap
            type = "Swap";
            primaryTx = sentTx; // Use sent transaction as primary
          } else if (sentTx) {
            type = "Sent";
            primaryTx = sentTx;
          } else if (receivedTx) {
            type = "Received";  
            primaryTx = receivedTx;
          }
          
          processedTxs.push({ 
            ...primaryTx, 
            _type: type,
            _txGroup: txGroup // Store full group for detailed view
          });
        }

        console.log(`Processed ${processedTxs.length} unique transactions`);
        setTxs(processedTxs);

        // Batch resolve names for all addresses
        if (allAddresses.size > 0) {
          console.log(`Resolving names for ${allAddresses.size} addresses`);
          const names = await resolveNamesForAddresses([...allAddresses], chainId);
          console.log(`Resolved ${Object.keys(names).length} names`);
          setResolvedNames(names);
        }

        fetchController.current.lastFetchedKey = currentFetchKey;
      } catch (err) {
        console.error("Error fetching token tx history:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTxs();
  }, [address, chainId, isConnected]);

  const [expandedIndexes, setExpandedIndexes] = useState({});
  const paginated = txs.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(txs.length / perPage);

  if (loading) {
    return (
      <div className="p-4 bg-white border-2 dark:bg-gray-800 shadow">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Token Transactions</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400 uppercase">{getChainLabel(chainId)}</span>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Loading transactions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white border-2 dark:bg-gray-800 shadow">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Token Transactions</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400 uppercase">{getChainLabel(chainId)}</span>
        </div>
        <p className="text-red-500 dark:text-red-400 text-sm">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white border-2 dark:bg-gray-800 shadow">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Token Transactions</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400 uppercase">{getChainLabel(chainId)}</span>
      </div>
      <div className="space-y-2">
        {paginated.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No recent transactions found.</p>
        ) : (
          paginated.map((tx, i) => (
            <div key={`${tx.hash}-${i}`} className="text-sm border-b border-gray-200 dark:border-gray-600 pb-2">
              <div className="flex justify-between items-center">
                <div className="text-black dark:text-white">
                  <strong>{tx._type}</strong>
                  {tx._type === "Swap" && (
                    <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                      SWAP
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setExpandedIndexes(prev => ({ ...prev, [i]: !prev[i] }))}
                  className="text-xs underline text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                >
                  {expandedIndexes[i] ? "Hide" : "Details"}
                </button>
              </div>
              
              <div className="flex justify-between text-sm mt-1">
                <div className="text-black dark:text-white">
                  <span className="font-medium">{tx.asset || "ETH"}</span>
                  <span className="ml-2">{formatValue(tx.value)}</span>
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {formatShortDate(tx.metadata.blockTimestamp)}
                </div>
              </div>
              
              <div className="flex items-center justify-between text-black dark:text-white mt-1">
                <a
                  href={`${getExplorerBaseUrl(chainId)}/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                >
                  View on Explorer
                </a>

                {tx._type === "Sent" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 256 256"
                    className="w-5 h-5 ml-2 fill-red-500 dark:fill-red-400"
                  >
                    <path d="M77.17187,170.82861a3.99971,3.99971,0,0,1,0-5.65722L182.34277,60H92a4,4,0,0,1,0-8H192c.0166,0,.03174.0047.04834.00488a4.02377,4.02377,0,0,1,.73437.074c.12159.02411.23389.06927.35108.10412a2.30534,2.30534,0,0,1,.77588.32282c.103.05633.21045.10168.30908.16772a4.02182,4.02182,0,0,1,.58691.47919c.00684.007.01563.01154.02246.01862l.01417.01684a4.0149,4.0149,0,0,1,.48388.5929c.06738.1001.11328.20856.16992.313a3.85529,3.85529,0,0,1,.19776.37573,3.97336,3.97336,0,0,1,.12646.40607c.03321.114.07715.223.10059.34094A3.98826,3.98826,0,0,1,196,56V156a4,4,0,0,1-8,0V65.657L82.82812,170.82861a3.99971,3.99971,0,0,1-5.65625,0ZM216,211.99609H40a4,4,0,0,0,0,8H216a4,4,0,0,0,0-8Z" />
                  </svg>
                )}

                {tx._type === "Received" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 256 256"
                    className="w-5 h-5 ml-2 fill-green-500 dark:fill-green-400"
                  >
                    <path d="M53.17187,114.82471a3.99992,3.99992,0,0,1,5.65625-5.65723L124,174.33936V31.99609a4,4,0,0,1,8,0V174.33936l65.17187-65.17188a3.99992,3.99992,0,1,1,5.65625,5.65723l-72,72c-.00683.00708-.01562.01172-.02246.01855a4.01055,4.01055,0,0,1-.58691.47925c-.10059.06714-.209.11328-.314.17041a3.961,3.961,0,0,1-.37452.197,3.91774,3.91774,0,0,1-.40918.12695c-.11279.03321-.2207.07715-.33789.1001a3.91693,3.91693,0,0,1-1.5664,0c-.11719-.023-.2251-.06689-.33789-.1001a3.91774,3.91774,0,0,1-.40918-.12695,3.961,3.961,0,0,1-.37452-.197c-.105-.05713-.21337-.10327-.314-.17041a4.01055,4.01055,0,0,1-.58691-.47925c-.00684-.00683-.01563-.01147-.02247-.01855ZM216,211.99609H40a4,4,0,0,0,0,8H216a4,4,0,0,0,0-8Z" />
                  </svg>
                )}

                {tx._type === "Swap" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 256 256"
                    className="w-5 h-5 ml-2 fill-blue-500 dark:fill-blue-400"
                  >
                    <path d="M132,40V216a4,4,0,0,1-8,0V40a4,4,0,0,1,8,0ZM99.69434,129.52966a3.95348,3.95348,0,0,0,.12548-.40527c.0337-.11389.07764-.223.10108-.34094a4.01026,4.01026,0,0,0,0-1.5669c-.02344-.11792-.06738-.22693-.10108-.34082a3.95868,3.95868,0,0,0-.12548-.40552,4.0404,4.0404,0,0,0-.20362-.38623c-.05517-.10058-.09912-.20532-.16357-.30175a4.02777,4.02777,0,0,0-.50147-.61292L66.82812,93.17188a3.99957,3.99957,0,0,0-5.65624,5.65624L86.34277,124H16a4,4,0,0,0,0,8H86.34277L61.17188,157.17188a3.99957,3.99957,0,1,0,5.65624,5.65624l31.99756-31.99743a4.02777,4.02777,0,0,0,.50147-.61292c.06445-.09643.1084-.20129.16357-.302A4.00758,4.00758,0,0,0,99.69434,129.52966ZM240,124H169.65723l25.17089-25.17188a3.99957,3.99957,0,1,0-5.65624-5.65624l-31.99756,31.99743a4.02777,4.02777,0,0,0-.50147.61292c-.06445.097-.10889.20239-.16455.30359a2.34888,2.34888,0,0,0-.32861.79162c-.03369.1134-.07715.2218-.10059.33911a4.01026,4.01026,0,0,0,0,1.5669c.02344.11731.06738.22583.10059.33911a2.34963,2.34963,0,0,0,.32861.7915c.05566.1012.1001.20655.16455.30371a4.02777,4.02777,0,0,0,.50147.61292l31.99756,31.99743a3.99957,3.99957,0,0,0,5.65624-5.65624L169.65723,132H240a4,4,0,0,0,0-8Z" />
                  </svg>
                )}
              </div>
              
              {expandedIndexes[i] && (
                <div className="mt-2 space-y-1 text-xs bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  <div className="text-black dark:text-white">
                    <strong>From:</strong> <AddressDisplay 
                      address={tx.from} 
                      chainId={chainId} 
                      getExplorerBaseUrl={getExplorerBaseUrl} 
                      shortenAddress={shortenAddress} 
                      resolvedNames={resolvedNames}
                    />
                  </div>
                  <div className="text-black dark:text-white">
                    <strong>To:</strong> <AddressDisplay 
                      address={tx.to} 
                      chainId={chainId} 
                      getExplorerBaseUrl={getExplorerBaseUrl} 
                      shortenAddress={shortenAddress} 
                      resolvedNames={resolvedNames}
                    />
                  </div>
                  <div className="text-black dark:text-white">
                    <strong>Block:</strong> {parseInt(tx.blockNum, 16)}
                  </div>
                  <div className="text-black dark:text-white">
                    <strong>Hash:</strong> 
                    <a 
                      href={`${getExplorerBaseUrl(chainId)}/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 underline text-blue-600 dark:text-blue-400"
                    >
                      {shortenAddress(tx.hash)}
                    </a>
                  </div>
                  <div className="text-black dark:text-white">
                    <strong>Date:</strong> {new Date(tx.metadata.blockTimestamp).toLocaleString()}
                  </div>
                  {tx.rawContract && (
                    <div className="text-black dark:text-white">
                      <strong>Token Contract:</strong> 
                      <AddressDisplay 
                        address={tx.rawContract.address} 
                        chainId={chainId} 
                        getExplorerBaseUrl={getExplorerBaseUrl} 
                        shortenAddress={shortenAddress} 
                        resolvedNames={resolvedNames}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 text-sm">
          <div className="flex gap-2">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              First
            </button>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              &lt;
            </button>
          </div>

          <div className="text-gray-700 dark:text-gray-300">
            Page {page} / {totalPages}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              &gt;
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
}