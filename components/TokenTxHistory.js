import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useDisplayName } from "./useDisplayName"; // <-- IMPORT YOUR HOOK

const ALCHEMY_URLS = {
  1: "https://eth-mainnet.g.alchemy.com/v2/oQKmm0fzZOpDJLTI64W685aWf8j1LvDr",
  8453: "https://base-mainnet.g.alchemy.com/v2/oQKmm0fzZOpDJLTI64W685aWf8j1LvDr",
  42161: "https://arb-mainnet.g.alchemy.com/v2/oQKmm0fzZOpDJLTI64W685aWf8j1LvDr",
  10: "https://opt-mainnet.g.alchemy.com/v2/oQKmm0fzZOpDJLTI64W685aWf8j1LvDr",
  137: "https://polygon-mainnet.g.alchemy.com/v2/oQKmm0fzZOpDJLTI64W685aWf8j1LvDr",
  56: "https://bnb-mainnet.g.alchemy.com/v2/oQKmm0fzZOpDJLTI64W685aWf8j1LvDr",
  11155111: "https://eth-sepolia.g.alchemy.com/v2/oQKmm0fzZOpDJLTI64W685aWf8j1LvDr",
};

// --- HELPER COMPONENT USING YOUR REFACTORED HOOK ---
function AddressDisplay({ address, chainId, getExplorerBaseUrl, shortenAddress }) {
  // Use your powerful, reusable hook for any address
  const { displayName, isNameLoading } = useDisplayName(address);

  // Determine what to show: the resolved name, a loading state, or the shortened address
  const nameToShow = isNameLoading
    ? "Resolving..."
    : displayName && !displayName.startsWith("0x")
    ? displayName
    : shortenAddress(address);

  return (
    <a
      href={`${getExplorerBaseUrl(chainId)}/address/${address}`}
      target="_blank"
      rel="noopener noreferrer"
      className="underline text-black dark:text-white"
      title={address}
    >
      {nameToShow}
    </a>
  );
}

export default function TokenTxHistory({ address, chainId }) {
  const [txs, setTxs] = useState([]);
  const [page, setPage] = useState(1);
  const perPage = 4;
  
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
      default: return "Base";
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

  useEffect(() => {
    if (!address || !chainId) return;
    const ALCHEMY_BASE_URL = ALCHEMY_URLS[chainId];
    if (!ALCHEMY_BASE_URL) return;

    const fetchTxs = async () => {
      try {
        const [sentRes, receivedRes] = await Promise.all([
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

        const sent = await sentRes.json();
        const received = await receivedRes.json();
        const all = [...(sent.result?.transfers || []), ...(received.result?.transfers || [])];

        const filtered = all.filter(tx => tx.category !== "erc721" && tx.category !== "erc1155");

        const grouped = [];
        const seenHashes = new Set();
        const hashMap = new Map();
        for (const tx of filtered) {
          if (!hashMap.has(tx.hash)) {
            hashMap.set(tx.hash, []);
          }
          hashMap.get(tx.hash).push(tx);
        }

        const txList = Array.from(hashMap.entries()).sort((a, b) =>
          new Date(b[1][0].metadata.blockTimestamp) - new Date(a[1][0].metadata.blockTimestamp)
        );

        for (const [hash, txGroup] of txList) {
          if (seenHashes.has(hash)) continue;
          seenHashes.add(hash);
          const sentTx = txGroup.find(t => t.from?.toLowerCase() === address.toLowerCase());
          const receivedTx = txGroup.find(t => t.to?.toLowerCase() === address.toLowerCase());
          let type = "Unknown";
          if (sentTx && receivedTx) {
            type = `Swapped (${receivedTx.asset || sentTx.asset})`;
          } else if (sentTx) {
            type = "Sent";
          } else if (receivedTx) {
            type = "Received";
          }
          grouped.push({
            ...(sentTx || receivedTx || txGroup[0]),
            _type: type
          });
        }
        setTxs(grouped);
      } catch (err) {
        console.error("Error fetching token tx history:", err);
      }
    };
    fetchTxs();
  }, [address, chainId]);

	const shortenAddress = (addr) => {
	  if (!addr) return "";
	  return addr.slice(0, 6) + "..." + addr.slice(-4);
	}; 

	const formatShortDate = (dateStr) => {
	  const d = new Date(dateStr);
	  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
			 ", " +
			 d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
	};
	
	const [expandedIndexes, setExpandedIndexes] = useState({});
	const paginated = txs.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="p-4 bg-white border-b2 dark:bg-dark-200 shadow">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Token Transactions</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400 uppercase">{getChainLabel(chain?.id)}</span>
      </div>
      <div className="space-y-2">
        {paginated.length === 0 ? (
          <p className="text-gray-600 dark:text-white text-sm">No recent transactions.</p>
        ) : (
          paginated.map((tx, i) => (
            <div key={i} className="text-sm text-gray-200 dark:text-gray-100 border-b border-gray-200 dark:border-gray-100 pb-2">
              <div className="flex justify-between items-center">
                <div className="text-black dark:text-white"><strong>{tx._type}</strong></div>
                <button onClick={() => setExpandedIndexes(prev => ({ ...prev, [i]: !prev[i] }))} className="text-xs underline text-black dark:text-white">
                  {expandedIndexes[i] ? "Hide" : "Details"}
                </button>
              </div>
				<div className="flex justify-between text-sm mt-1">
				  <div className="text-black dark:text-white">{tx.asset || "ETH"} – {parseFloat(tx.value).toFixed(5)}</div>
				  <div className="text-black dark:text-white">{formatShortDate(tx.metadata.blockTimestamp)}</div>
				</div>
				<div className="flex items-center justify-between text-black dark:text-white">
				  <a href={`${getExplorerBaseUrl(chainId)}/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" className="underline">View on Explorer</a>
				</div>
              {expandedIndexes[i] && (
                <div className="mt-2 space-y-1 text-xs">
                  <div className="text-black dark:text-white"><strong>From:</strong>{' '}
                    <AddressDisplay address={tx.from} chainId={chainId} getExplorerBaseUrl={getExplorerBaseUrl} shortenAddress={shortenAddress}/>
                  </div>
                  <div className="text-black dark:text-white"><strong>To:</strong>{' '}
                    <AddressDisplay address={tx.to} chainId={chainId} getExplorerBaseUrl={getExplorerBaseUrl} shortenAddress={shortenAddress}/>
                  </div>
					<div className="text-black dark:text-white"><strong>Block:</strong> {parseInt(tx.blockNum, 16)}</div>
					<div className="text-black dark:text-white"><strong>Date:</strong> {new Date(tx.metadata.blockTimestamp).toLocaleString()}</div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      {/* Pagination UI can be added here if needed */}
    </div>
  );
}