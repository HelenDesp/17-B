import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useDisplayName } from "./useDisplayName";

// Moralis API Key provided by you
const MORALIS_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImE2YWU4Y2E2LWNiNWUtNDJmNi1hYjQ5LWUzZWEwZTM5NTI2MSIsIm9yZ0lkIjoiNDQ1NTcxIiwidXNlcklkIjoiNDU4NDM4IiwidHlwZUlkIjoiMDhiYmI4YTgtMzQxYy00YTJhLTk2NGUtN2FlMGZmMzI2ODUxIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NDY1NDA1MzgsImV4cCI6NDkwMjMwMDUzOH0._O5uiNnyo2sXnJDbre0_9mDklKTmrj90Yn2HXJJnZRk";

function AddressDisplay({ address, chainId, getExplorerBaseUrl, shortenAddress }) {
  const { displayName, isNameLoading } = useDisplayName(address);
  const nameToShow = isNameLoading ? "Resolving..." : displayName && !displayName.startsWith("0x") ? displayName : shortenAddress(address);
  return (
    <a href={`${getExplorerBaseUrl(chainId)}/address/${address}`} target="_blank" rel="noopener noreferrer" className="underline text-black dark:text-white" title={address}>
      {nameToShow}
    </a>
  );
}

// Helper function to get a clean image URL from the Moralis metadata
function getMoralisNftImageUrl(tx) {
  // Moralis often provides normalized metadata with a direct HTTP link.
  let imageUrl = tx.metadata?.image || '';

  // As a fallback, handle IPFS links if Moralis hasn't converted them
  if (typeof imageUrl === 'string' && imageUrl.startsWith("ipfs://")) {
    return imageUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  
  // Return the found URL or a placeholder
  return imageUrl || 'https://placehold.co/40';
}


export default function NftTxHistory({ address, chainId }) {
  const [txs, setTxs] = useState([]);
  const [page, setPage] = useState(1);
  const perPage = 4;
  const zeroAddress = "0x0000000000000000000000000000000000000000";
  const { chain } = useAccount();

  const getChainLabel = (chainId) => {
    switch (chainId) { case 1: return "Ethereum"; case 8453: return "Base"; case 137: return "Polygon"; case 42161: return "Arbitrum"; case 10: return "Optimism"; case 11155111: return "Sepolia"; case 56: return "BNB"; default: return "Base"; }
  };  

  const getExplorerBaseUrl = (chainId) => {
    switch (chainId) { case 1: return "https://etherscan.io"; case 8453: return "https://basescan.org"; case 137: return "https://polygonscan.com"; case 42161: return "https://arbiscan.io"; case 10: return "https://optimistic.etherscan.io"; case 56: return "https://bscscan.com"; case 11155111: return "https://sepolia.etherscan.io"; default: return "https://etherscan.io"; }
  };
  
  // Helper to convert wagmi chain ID to Moralis chain name
  const getMoralisChainHex = (cId) => {
      const mapping = {
          1: '0x1',
          137: '0x89',
          8453: '0x2105',
          42161: '0xa4b1',
          10: '0xa',
          56: '0x38',
          11155111: '0xaa36a7'
      };
      return mapping[cId] || '0x1'; // Default to Ethereum
  }

  useEffect(() => {
    if (!address || !chainId) return;

    const fetchMoralisTxs = async () => {
        const moralisChain = getMoralisChainHex(chainId);
        const options = {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'X-API-Key': MORALIS_API_KEY
            }
        };

      try {
        const res = await fetch(`https://deep-index.moralis.io/api/v2.2/${address}/nft/transfers?chain=${moralisChain}`, options);
        const data = await res.json();
        
        const processedTxs = (data.result || []).map(tx => {
            let type = "Unknown";
            // Moralis uses `from_address` and `to_address`
            const sentByMe = tx.from_address.toLowerCase() === address.toLowerCase();
            const receivedByMe = tx.to_address.toLowerCase() === address.toLowerCase();

            if (tx.from_address.toLowerCase() === zeroAddress && receivedByMe) {
                type = 'Minted';
            } else if (tx.to_address.toLowerCase() === zeroAddress && sentByMe) {
                type = 'Burned';
            } else if (sentByMe) {
                type = 'Sent';
            } else if (receivedByMe) {
                type = 'Received';
            }

            // Return a unified object structure similar to the Alchemy version for consistency
            return {
                ...tx,
                _type: type,
                asset: tx.name, // Collection name from Moralis
                rawContract: { address: tx.token_address },
                tokenId: tx.token_id,
                from: tx.from_address,
                to: tx.to_address,
                hash: tx.transaction_hash,
                metadata: { blockTimestamp: tx.block_timestamp }
            };
        }).filter(tx => tx._type !== "Unknown");

        setTxs(processedTxs);

      } catch (err) {
        console.error("Error fetching Moralis NFT history:", err);
      }
    };

    fetchMoralisTxs();
  }, [address, chainId]);

	const shortenAddress = (addr) => { if (!addr) return ""; return addr.slice(0, 6) + "..." + addr.slice(-4); }; 
	const formatShortDate = (dateStr) => { const d = new Date(dateStr); return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + ", " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }); };
	const [expandedIndexes, setExpandedIndexes] = useState({});
    const paginated = txs.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="p-4 bg-white border-b2 dark:bg-dark-200 shadow">
	<div className="flex justify-between items-center mb-2">
	  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">NFT Transactions</h3>
	  <span className="text-sm text-gray-500 dark:text-gray-400 uppercase">{getChainLabel(chain?.id)}</span>
	</div>
      <div className="space-y-2">
        {paginated.length === 0 ? (
          <p className="text-gray-600 dark:text-white text-sm">No recent NFT transactions.</p>
        ) : (
          paginated.map((tx, i) => (
            <div key={`${tx.hash}-${tx.token_id}-${i}`} className="text-sm text-gray-200 dark:text-gray-100 border-b border-gray-200 dark:border-gray-100 pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img 
                    src={getMoralisNftImageUrl(tx)} 
                    alt={tx.asset}
                    className="w-10 h-10 rounded object-cover bg-gray-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-black dark:text-white"><strong>{tx._type}</strong></div>
                    <div className="flex justify-between text-sm mt-1">
                      <div className="text-black dark:text-white font-medium truncate pr-2" title={`${tx.asset} #${tx.tokenId}`}>
                        {tx.asset} #{tx.tokenId}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end pl-2">
                    <button onClick={() => setExpandedIndexes(prev => ({ ...prev, [i]: !prev[i] }))} className="text-xs underline text-black dark:text-white">
                        {expandedIndexes[i] ? "Hide" : "Details"}
                    </button>
                    <div className="text-black dark:text-white text-xs whitespace-nowrap mt-4">{formatShortDate(tx.metadata.blockTimestamp)}</div>
                </div>
              </div>

              {expandedIndexes[i] && (
                <div className="mt-2 pl-12 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-black dark:text-white">
                    <a href={`${getExplorerBaseUrl(chainId)}/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" className="underline">View on Explorer</a>
                    {(tx._type === "Sent" || tx._type === "Burned") && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="w-5 h-5 ml-2 fill-black dark:fill-white"><path d="M77.17187,170.82861a3.99971,3.99971,0,0,1,0-5.65722L182.34277,60H92a4,4,0,0,1,0-8H192c.0166,0,.03174.0047.04834.00488a4.02377,4.02377,0,0,1,.73437.074c.12159.02411.23389.06927.35108.10412a2.30534,2.30534,0,0,1,.77588.32282c.103.05633.21045.10168.30908.16772a4.02182,4.02182,0,0,1,.58691.47919c.00684.007.01563.01154.02246.01862l.01417.01684a4.0149,4.0149,0,0,1,.48388.5929c.06738.1001.11328.20856.16992.313a3.85529,3.85529,0,0,1,.19776.37573,3.97336,3.97336,0,0,1,.12646.40607c.03321.114.07715.223.10059.34094A3.98826,3.98826,0,0,1,196,56V156a4,4,0,0,1-8,0V65.657L82.82812,170.82861a3.99971,3.99971,0,0,1-5.65625,0ZM216,211.99609H40a4,4,0,0,0,0,8H216a4,4,0,0,0,0-8Z" /></svg>}
				    {(tx._type === "Received" || tx._type === "Minted") && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="w-5 h-5 ml-2 fill-black dark:fill-white"><path d="M53.17187,114.82471a3.99992,3.99992,0,0,1,5.65625-5.65723L124,174.33936V31.99609a4,4,0,0,1,8,0V174.33936l65.17187-65.17188a3.99992,3.99992,0,1,1,5.65625,5.65723l-72,72c-.00683.00708-.01562.01172-.02246.01855a4.01055,4.01055,0,0,1-.58691.47925c-.10059.06714-.209.11328-.314.17041a3.961,3.961,0,0,1-.37452.197,3.91774,3.91774,0,0,1-.40918.12695c-.11279.03321-.2207.07715-.33789.1001a3.91693,3.91693,0,0,1-1.5664,0c-.11719-.023-.2251-.06689-.33789-.1001a3.91774,3.91774,0,0,1-.40918-.12695,3.961,3.961,0,0,1-.37452-.197c-.105-.05713-.21337-.10327-.314-.17041a4.01055,4.01055,0,0,1-.58691-.47925c-.00684-.00683-.01563-.01147-.02247-.01855ZM216,211.99609H40a4,4,0,0,0,0,8H216a4,4,0,0,0,0-8Z" /></svg>}
                  </div>
                  <div className="text-black dark:text-white"><strong>From:</strong> <AddressDisplay address={tx.from} chainId={chainId} getExplorerBaseUrl={getExplorerBaseUrl} shortenAddress={shortenAddress} /></div>
                  <div className="text-black dark:text-white"><strong>To:</strong> <AddressDisplay address={tx.to} chainId={chainId} getExplorerBaseUrl={getExplorerBaseUrl} shortenAddress={shortenAddress} /></div>
				  <div className="text-black dark:text-white"><strong>Block:</strong> {tx.block_number}</div>
				  <div className="text-black dark:text-white"><strong>Date:</strong> {new Date(tx.metadata.blockTimestamp).toLocaleString()}</div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
		{txs.length > perPage && (
		  <div className="flex justify-between items-center mt-4 text-sm">
			<div className="flex gap-2">
			  <button onClick={() => setPage(1)} disabled={page === 1} className="px-2 py-1 border rounded disabled:opacity-50">First</button>
			  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-2 py-1 border rounded disabled:opacity-50">&lt;</button>
			</div>
			<div className="text-gray-700 dark:text-gray-300">Page {page} / {Math.min(15, Math.ceil(txs.length / 4))}</div>
			<div className="flex gap-2">
			  <button onClick={() => setPage((p) => Math.min(Math.ceil(txs.length / 4), p + 1))} disabled={page * 4 >= Math.min(txs.length, 60)} className="px-2 py-1 border rounded disabled:opacity-50">&gt;</button>
			  <button onClick={() => setPage(Math.min(15, Math.ceil(txs.length / 4)))} disabled={page === Math.min(15, Math.ceil(txs.length / 4))} className="px-2 py-1 border rounded disabled:opacity-50">Last</button>
			</div>
		  </div>
		)}
    </div>
  );
}