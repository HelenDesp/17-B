import React, { useEffect, useState } from "react";
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

// --- CHANGE 1 of 2: Removed 'export default' from the function declaration ---
function TokenTxHistory({ address, chainId }) {
  const [txs, setTxs] = useState([]);
  const [page, setPage] = useState(1);
  const perPage = 4;
  const maxTxs = txs.slice(0, 60);

  const zeroAddress = "0x0000000000000000000000000000000000000000";
  
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

        const filtered = all.filter(tx =>
          tx.category !== "erc721" &&
          tx.category !== "erc1155"
        );

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
          const allTokens = txGroup.map(t => t.asset).filter(Boolean);

          let type = "Unknown";

			if (sentTx && receivedTx) {
			  const swapToken = receivedTx.asset || sentTx.asset;
			  type = `Swapped (${swapToken})`;
			} else if (
			  sentTx &&
			  txGroup.some(
				t =>
				  t.to?.toLowerCase() === address.toLowerCase() &&
				  t.from?.toLowerCase() !== address.toLowerCase() &&
				  t.asset !== sentTx.asset
			  )
			) {
			  type = "Sent (Minted)";
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
          <p className="text-gray-500 dark:text-white text-sm">No recent transactions.</p>
        ) : (
          paginated.map((tx, i) => (
            <div key={i} className="text-sm text-gray-200 dark:text-gray-100 border-b border-gray-200 dark:border-gray-100 pb-2">
              <div className="flex justify-between items-center">
                <div className="text-black dark:text-white"><strong>{tx._type}</strong></div>
                <button
                  onClick={() => setExpandedIndexes(prev => ({ ...prev, [i]: !prev[i] }))}
                  className="text-xs underline text-black dark:text-white"
                >
                  {expandedIndexes[i] ? "Hide" : "Details"}
                </button>
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
					  <path d="M132,40V216a4,4,0,0,1-8,0V40a4,4,0,0,1,8,0ZM99.69434,129.52966a3.95348,3.95348,0,0,0,.12548-.40527c.0337-.11389.07764-.223.10108-.34094a4.01026,4.01026,0,0,0,0-1.5669c-.02344-.11792-.06738-.22693-.10108-.34082a3.95868,3.95868,0,0,0-.12548-.40552,4.0404,4.0404,0,0,0-.20362-.38623c-.05517-.10058-.09912-.20532-.16357-.30175a4.02777,4.02777,0,0,0-.50147-.61292L66.82812,93.17188a3.99957,3.99957,0,0,0-5.65624,5.65624L86.34277,124H16a4,4,0,0,0,0,8H86.34277L61.17188,157.17188a3.99957,3.99957,0,1,0,5.65624,5.65624l31.99756-31.99743a4.02777,4.02777,0,0,0,.50147-.61292c.06445-.09643.1084-.20129.16357-.302A4.00758,4.00758,0,0,0,99.69434,129.52966ZM240,124H169.65723l25.17089-25.17188a3.99957,3.99957,0,1,0-5.65624-5.65624l-31.99756,31.99743a4.02777,4.02777,0,0,0-.50147.61292c-.06445.097-.10889.20239-.16455.30359a2.34888,2.34888,0,0,0-.32861.79162c-.03369.1134-.07715.2218-.10059.33911a4.01026,4.01026,0,0,0,0,1.5669c.02344.11731.06738.22583.10059.33911a2.34963,2.34963,0,0,0,.32861.7915c.05566.1012.1001.20655.16455.30371a4.02777,4.02777,0,0,0,.50147.61292l31.99756,31.99743a3.99957,3.99957,0,0,0,5.65624-5.65624L169.65723,132H240a4,4,0,0,0,0-8Z" />
					</svg>
				  )}
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