import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useDisplayName } from "./useDisplayName";

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

function getMoralisNftImageUrl(tx) {
  // The metadata from Moralis is a stringified JSON, so we need to parse it first.
  const metadata = tx.metadata ? JSON.parse(tx.metadata) : null;
  let imageUrl = metadata?.image || '';

  if (typeof imageUrl === 'string' && imageUrl.startsWith("ipfs://")) {
    return imageUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  
  return imageUrl || 'https://placehold.co/40';
}

export default function NftTxHistory({ address, chainId }) {
  const [txs, setTxs] = useState([]);
  const [page, setPage] = useState(1);
  const perPage = 4;
  const zeroAddress = "0x0000000000000000000000000000000000000000";
  const { chain } = useAccount();

  const getChainLabel = (cId) => { /* ... no change ... */ };
  const getExplorerBaseUrl = (cId) => { /* ... no change ... */ };
  const getMoralisChainHex = (cId) => {
      const mapping = { 1: '0x1', 137: '0x89', 8453: '0x2105', 42161: '0xa4b1', 10: '0xa', 56: '0x38', 11155111: '0xaa36a7' };
      return mapping[cId] || '0x1';
  }

  useEffect(() => {
    if (!address || !chainId) return;
    const fetchMoralisTxs = async () => {
        const moralisChain = getMoralisChainHex(chainId);
        const options = {
            method: 'GET',
            headers: { 'accept': 'application/json', 'X-API-Key': MORALIS_API_KEY }
        };

      try {
        const res = await fetch(`https://deep-index.moralis.io/api/v2.2/${address}/nft/transfers?chain=${moralisChain}`, options);
        const data = await res.json();
        
        const processedTxs = (data.result || []).map(tx => {
            let type = "Unknown";
            const sentByMe = tx.from_address.toLowerCase() === address.toLowerCase();
            const receivedByMe = tx.to_address.toLowerCase() === address.toLowerCase();
            if (tx.from_address.toLowerCase() === zeroAddress && receivedByMe) { type = 'Minted'; } 
            else if (tx.to_address.toLowerCase() === zeroAddress && sentByMe) { type = 'Burned'; }
            else if (sentByMe) { type = 'Sent'; } 
            else if (receivedByMe) { type = 'Received'; }
            
            // --- FIX: The original tx object is now preserved correctly ---
            return { ...tx, _type: type };
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
      {/* ... The JSX for the component header ... */}
      <div className="space-y-2">
        {paginated.length === 0 ? (
          <p className="text-gray-600 dark:text-white text-sm">No recent NFT transactions.</p>
        ) : (
          paginated.map((tx, i) => (
            <div key={`${tx.transaction_hash}-${tx.token_id}-${i}`} className="text-sm ...">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img 
                    src={getMoralisNftImageUrl(tx)} 
                    alt={tx.name}
                    className="w-10 h-10 rounded object-cover bg-gray-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-black dark:text-white"><strong>{tx._type}</strong></div>
                    <div className="flex justify-between text-sm mt-1">
                      <div className="text-black dark:text-white font-medium truncate pr-2" title={`${tx.name} #${tx.token_id}`}>
                        {tx.name} #{tx.token_id}
                      </div>
                    </div>
                  </div>
                </div>
                {/* ... JSX for buttons and date ... */}
              </div>

              {expandedIndexes[i] && (
                <div className="mt-2 pl-12 space-y-1 text-xs">
                  {/* --- FIX: Using correct field names from Moralis response --- */}
                  <div className="flex ..."><a href={`${getExplorerBaseUrl(chainId)}/tx/${tx.transaction_hash}`} ...>View on Explorer</a></div>
                  <div className="text-black dark:text-white"><strong>From:</strong> <AddressDisplay address={tx.from_address} ... /></div>
                  <div className="text-black dark:text-white"><strong>To:</strong> <AddressDisplay address={to_address} ... /></div>
                  <div className="text-black dark:text-white"><strong>Block:</strong> {tx.block_number}</div>
                  <div className="text-black dark:text-white"><strong>Date:</strong> {new Date(tx.block_timestamp).toLocaleString()}</div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      {/* ... The JSX for pagination ... */}
    </div>
  );
}