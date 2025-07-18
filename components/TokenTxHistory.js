import React, { useEffect, useState, useRef } from "react";
import { useAccount } from "wagmi";
import { useDisplayName } from "./useDisplayName";

const ALCHEMY_URLS = {
  1: "https://eth-mainnet.g.alchemy.com/v2/oQKmm0fzZOpDJLTI64W685aWf8j1LvDr",
  8453: "https://base-mainnet.g.alchemy.com/v2/oQKmm0fzZOpDJLTI64W685aWf8j1LvDr",
  42161: "https://arb-mainnet.g.alchemy.com/v2/oQKmm0fzZOpDJLTI64W685aWf8j1LvDr",
  10: "https://opt-mainnet.g.alchemy.com/v2/oQKmm0fzZOpDJLTI64W685aWf8j1LvDr",
  137: "https://polygon-mainnet.g.alchemy.com/v2/oQKmm0fzZOpDJLTI64W685aWf8j1LvDr",
  56: "https://bnb-mainnet.g.alchemy.com/v2/oQKmm0fzZOpDJLTI64W685aWf8j1LvDr",
  11155111: "https://eth-sepolia.g.alchemy.com/v2/oQKmm0fzZOpDJLTI64W685aWf8j1LvDr", 
};

function AddressDisplay({ address, chainId, getExplorerBaseUrl, shortenAddress }) {
  const { displayName, isNameLoading } = useDisplayName(address);

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


export default function TokenTxHistory({ address, chainId, isConnected }) {
  const [txs, setTxs] = useState([]);
  const [page, setPage] = useState(1);
  const perPage = 4;
  const maxTxs = txs.slice(0, 60); // keep only last 60

  const zeroAddress = "0x0000000000000000000000000000000000000000";
  
  // THE FIX: A ref to track if a fetch has been completed for the current data
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
    // Add isConnected to the initial check
    if (!address || !chainId || !isConnected) return;
	setPage(1);

    // Create a unique key for the current address and chain combination
    const currentFetchKey = `${address}-${chainId}`;

    // If we have already fetched for this exact key, stop.
    if (fetchController.current.lastFetchedKey === currentFetchKey) {
      return; 
    }
    
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
              params: [{ fromBlock: "0x0", fromAddress: address, category: ["external", "erc20"], withMetadata: true, excludeZeroValue: true, maxCount: "0x32" }]
            })
          }),
          fetch(ALCHEMY_BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: 2,
              method: "alchemy_getAssetTransfers",
              params: [{ fromBlock: "0x0", toAddress: address, category: ["external", "erc20"], withMetadata: true, excludeZeroValue: true, maxCount: "0x32" }]
            })
          })
        ]);

        const sent = await sentRes.json();
        const received = await receivedRes.json();
        
        if (sent.result && received.result) {
            const all = [...(sent.result?.transfers || []), ...(received.result?.transfers || [])];
            const filtered = all.filter(tx => tx.category !== "erc721" && tx.category !== "erc1155");
            const grouped = [];
            const seenHashes = new Set();
            const hashMap = new Map();
            for (const tx of filtered) { if (!hashMap.has(tx.hash)) { hashMap.set(tx.hash, []); } hashMap.get(tx.hash).push(tx); }
            const txList = Array.from(hashMap.entries()).sort((a, b) => new Date(b[1][0].metadata.blockTimestamp) - new Date(a[1][0].metadata.blockTimestamp));

            for (const [hash, txGroup] of txList) {
                if (seenHashes.has(hash)) continue;
                seenHashes.add(hash);
                const sentTx = txGroup.find(t => t.from?.toLowerCase() === address.toLowerCase());
                const receivedTx = txGroup.find(t => t.to?.toLowerCase() === address.toLowerCase());
                const allTokens = txGroup.map(t => t.asset).filter(Boolean);
                let type = "Unknown";
                if (sentTx && receivedTx) { const swapToken = receivedTx.asset || sentTx.asset; type = `Swapped (${swapToken})`; } 
                else if (sentTx && txGroup.some(t => t.to?.toLowerCase() === address.toLowerCase() && t.from?.toLowerCase() !== address.toLowerCase() && t.asset !== sentTx.asset)) { type = "Sent (Minted)"; }
                else if (sentTx) { type = "Sent"; }
                else if (receivedTx) { type = "Received"; }
                grouped.push({ ...(sentTx || receivedTx || txGroup[0]), _type: type });
            }
            setTxs(grouped);

            // On success, update the ref with the key we just fetched.
            fetchController.current.lastFetchedKey = currentFetchKey;
        }
      } catch (err) {
        console.error("Error fetching token tx history:", err);
      }
    };

    fetchTxs();
  }, [address, chainId, isConnected]); // Add isConnected to the dependency array

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
          <p className="text-gray-500 dark:text-white text-sm">No recent transactions.</p>
        ) : (
          paginated.map((tx, i) => (
            <div key={i} className="text-sm text-gray-200 dark:text-gray-100 border-b border-gray-200 dark:border-gray-100 pb-2">
              <div className="flex justify-between items-center">
                <div className="text-black dark:text-white"><strong>{tx._type}</strong></div>
                {/* --- ICONS ARE NOW HERE --- */}
                <div className="flex items-center">
                  {tx._type?.startsWith("Sent") && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 256 256"
                      className="w-5 h-5 ml-2 fill-black dark:fill-white"
                    >
                      <path d="M77.17187,170.82861a3.99971,3.99971,0,0,1,0-5.65722L182.34277,60H92a4,4,0,0,1,0-8H192c.0166,0,.03174.0047.04834.00488a4.02377,4.02377,0,0,1,.73437.074c.12159.02411.23389.06927.35108.10412a2.30534,2.30534,0,0,1,.77588.32282c.103.05633.21045.10168.30908.16772a4.02182,4.02182,0,0,1,.58691.47919c.00684.007.01563.01154.02246.01862l.01417.01684a4.0149,4.0149,0,0,1,.48388.5929c.06738.1001.11328.20856.16992.313a3.85529,3.85529,0,0,1,.19776.37573,3.97336,3.97336,0,0,1,.12646.40607c.03321.114.07715.223.10059.34094A3.98826,3.98826,0,0,1,196,56V156a4,4,0,0,1-8,0V65.657L82.82812,170.82861a3.99971,3.99971,0,0,1-5.65625,0ZM216,211.99609H40a4,4,0,0,0,0,8H216a4,4,0,0,0,0-8Z" />
                    </svg>
                  )}

                  {tx._type?.startsWith("Received") && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 256 256"
                      className="w-5 h-5 ml-2 fill-black dark:fill-white"
                    >
                      <path d="M53.17187,114.82471a3.99992,3.99992,0,0,1,5.65625-5.65723L124,174.33936V31.99609a4,4,0,0,1,8,0V174.33936l65.17187-65.17188a3.99992,3.99992,0,1,1,5.65625,5.65723l-72,72c-.00683.00708-.01562.01172-.02246.01855a4.01055,4.01055,0,0,1-.58691.47925c-.10059.06714-.209.11328-.314.17041a3.961,3.961,0,0,1-.37452.197,3.91774,3.91774,0,0,1-.40918.12695c-.11279.03321-.2207.07715-.33789.1001a3.91693,3.91693,0,0,1-1.5664,0c-.11719-.023-.2251-.06689-.33789-.1001a3.91774,3.91774,0,0,1-.40918-.12695,3.961,3.961,0,0,1-.37452-.197c-.105-.05713-.21337-.10327-.314-.17041a4.01055,4.01055,0,0,1-.58691-.47925c-.00684-.00683-.01563-.01147-.02247-.01855ZM216,211.99609H40a4,4,0,0,0,0,8H216a4,4,0,0,0,0-8Z" />
                    </svg>
                  )}

                  {tx._type?.startsWith("Swapped") && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 256 256"
                      className="w-5 h-5 ml-2 fill-black dark:fill-white"
                    >
                      <path d="M227.65784,101.63159c-.0553.10071-.09937.20551-.16394.30206a4.01719,4.01719,0,0,1-1.10852,1.10877c-.09864.066-.20557.11121-.30848.16742a2.33715,2.33715,0,0,1-.78735.32648c-.1134.03332-.22192.07721-.33911.10052a4.01545,4.01545,0,0,1-.78345.079h-48a4,4,0,0,1,0-8h38.34375L187.39746,68.60254a84.09569,84.09569,0,0,0-118.79492,0,3.99957,3.99957,0,0,1-5.65625-5.65625,91.99945,91.99945,0,0,1,130.10742,0L220.167,90.05957V51.71582a4,4,0,0,1,8,0v48a4.01058,4.01058,0,0,1-.0791.78345c-.02344.118-.06738.227-.10107.34094a2.3461,2.3461,0,0,1-.329.79138Zm-40.26038,85.76587a84.09569,84.09569,0,0,1-118.79492,0L41.48926,160.28418H79.833a4,4,0,0,0,0-8h-48a4.01754,4.01754,0,0,0-.78375.079c-.116.02313-.22333.06659-.33551.09943a2.33364,2.33364,0,0,0-.78785.326c-.10394.05664-.21185.10241-.3114.169a4.01817,4.01817,0,0,0-1.1084,1.10871c-.06488.0971-.10931.20239-.16479.30365a2.34894,2.34894,0,0,0-.3288.79168c-.03332.11334-.07715.22174-.10046.33905a4.01513,4.01513,0,0,0-.079.78345v48a4,4,0,0,0,8,0V165.94043l27.11328,27.11328a91.99945,91.99945,0,0,0,130.10742,0,3.99957,3.99957,0,0,0-5.65625-5.65625Z"/>
                    </svg>
                  )}
                </div>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <div className="text-black dark:text-white">
                  {tx.asset || "ETH"} – {parseFloat(tx.value).toFixed(5)}
                </div>
                <div className="text-black dark:text-white">{formatShortDate(tx.metadata.blockTimestamp)}</div>
              </div>
              <div className="flex items-center justify-between text-black dark:text-white">
                <a
                  href={`${getExplorerBaseUrl(chainId)}/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  View on Explorer
                </a>
                {/* --- DETAILS/HIDE BUTTON IS NOW HERE --- */}
                <button
                  onClick={() => setExpandedIndexes(prev => ({ ...prev, [i]: !prev[i] }))}
                  className="text-xs underline text-black dark:text-white"
                >
                  {expandedIndexes[i] ? "Hide" : "Details"}
                </button>
              </div>
              {expandedIndexes[i] && (
                <div className="mt-2 space-y-1 text-xs">
                  <div className="text-black dark:text-white"><strong>From:</strong> <AddressDisplay address={tx.from} chainId={chainId} getExplorerBaseUrl={getExplorerBaseUrl} shortenAddress={shortenAddress} /></div>
                  <div className="text-black dark:text-white"><strong>To:</strong> <AddressDisplay address={tx.to} chainId={chainId} getExplorerBaseUrl={getExplorerBaseUrl} shortenAddress={shortenAddress} /></div>
                  <div className="text-black dark:text-white">
                    <strong>Block:</strong> {parseInt(tx.blockNum, 16)}
                  </div>
                  <div className="text-black dark:text-white">
                    <strong>Date:</strong> {new Date(tx.metadata.blockTimestamp).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
		{txs.length > perPage && (
		  <div className="flex justify-between items-center mt-4 text-sm">
			<div className="flex gap-2">
			  <button
				onClick={() => setPage(1)}
				disabled={page === 1}
				className="px-2 py-1 border rounded disabled:opacity-50"
			  >
				First
			  </button>
			  <button
				onClick={() => setPage((p) => Math.max(1, p - 1))}
				disabled={page === 1}
				className="px-2 py-1 border rounded disabled:opacity-50"
			  >
				&lt;
			  </button>
			</div>

			<div className="text-gray-700 dark:text-gray-300">
			  Page {page} / {Math.min(15, Math.ceil(txs.length / 4))}
			</div>

			<div className="flex gap-2">
			  <button
				onClick={() => setPage((p) => Math.min(Math.ceil(txs.length / 4), p + 1))}
				disabled={page * 4 >= Math.min(txs.length, 60)}
				className="px-2 py-1 border rounded disabled:opacity-50"
			  >
				&gt;
			  </button>
			  <button
				onClick={() => setPage(Math.min(15, Math.ceil(txs.length / 4)))}
				disabled={page === Math.min(15, Math.ceil(txs.length / 4))}
				className="px-2 py-1 border rounded disabled:opacity-50"
			  >
				Last
			  </button>
			</div>
		  </div>
		)}
    </div>
  );
}