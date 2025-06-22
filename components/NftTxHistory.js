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
  const nameToShow = isNameLoading ? "Resolving..." : displayName && !displayName.startsWith("0x") ? displayName : shortenAddress(address);
  return (
    <a href={`${getExplorerBaseUrl(chainId)}/address/${address}`} target="_blank" rel="noopener noreferrer" className="underline text-black dark:text-white" title={address}>
      {nameToShow}
    </a>
  );
}

// --- NEW, SMARTER COMPONENT TO FETCH AND CACHE EACH NFT IMAGE ---
function NftImage({ contractAddress, tokenId, cache }) {
  const [imageUrl, setImageUrl] = useState('https://placehold.co/40');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchMetadata = async () => {
      if (!contractAddress || !tokenId) return;

      const cacheKey = `${contractAddress}-${tokenId}`;
      // 1. Check the cache first
      if (cache.current.has(cacheKey)) {
        setImageUrl(cache.current.get(cacheKey));
        setIsLoading(false);
        return;
      }

      // 2. If not in cache, fetch from Alchemy
      try {
        const apiKey = "-h4g9_mFsBgnf1Wqb3aC7Qj06rOkzW-m"; // Alchemy API key
        // The tokenId from getAssetTransfers is in hex, so we convert it to decimal
        const decimalTokenId = parseInt(tokenId, 16);
        const res = await fetch(
          `https://base-mainnet.g.alchemy.com/nft/v3/${apiKey}/getNFTMetadata?contractAddress=${contractAddress}&tokenId=${decimalTokenId}`,
          { headers: { accept: "application/json" } }
        );
        const data = await res.json();
        
        let finalImageUrl = 'https://placehold.co/40'; // Default placeholder
        const rawUrl = data.image?.originalUrl || data.image?.cachedUrl || data.image?.pngUrl || data.raw?.metadata?.image || '';
        
        if (typeof rawUrl === 'string' && rawUrl.trim() !== '') {
          const trimmedUrl = rawUrl.trim();
          if (trimmedUrl.startsWith("ipfs://")) {
            finalImageUrl = trimmedUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
          } else if (trimmedUrl.startsWith("http")) {
            finalImageUrl = trimmedUrl;
          }
        }
        
        // 3. Save to cache and set the image URL
        cache.current.set(cacheKey, finalImageUrl);
        setImageUrl(finalImageUrl);

      } catch (error) {
        console.error("Failed to fetch NFT metadata:", error);
        // Keep the placeholder on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, [contractAddress, tokenId, cache]);
  
  if (isLoading) {
    return <div className="w-10 h-10 rounded object-cover bg-gray-200 flex-shrink-0 animate-pulse" />;
  }

  return (
    <img 
      src={imageUrl} 
      alt={`NFT #${parseInt(tokenId,16)}`}
      className="w-10 h-10 rounded object-cover bg-gray-200 flex-shrink-0"
    />
  );
}


export default function NftTxHistory({ address, chainId }) {
  const [txs, setTxs] = useState([]);
  const [page, setPage] = useState(1);
  const perPage = 4;
  const zeroAddress = "0x0000000000000000000000000000000000000000";
  const { chain } = useAccount();

  // --- NEW: A cache to store image URLs so we don't fetch them repeatedly ---
  const imageUrlCache = useRef(new Map());


  const getChainLabel = (chainId) => {
    switch (chainId) { case 1: return "Ethereum"; case 8453: return "Base"; case 137: return "Polygon"; case 42161: return "Arbitrum"; case 10: return "Optimism"; case 11155111: return "Sepolia"; case 56: return "BNB"; default: return "Base"; }
  };  

  const getExplorerBaseUrl = (chainId) => {
    switch (chainId) { case 1: return "https://etherscan.io"; case 8453: return "https://basescan.org"; case 137: return "https://polygonscan.com"; case 42161: return "https://arbiscan.io"; case 10: return "https://optimistic.etherscan.io"; case 56: return "https://bscscan.com"; case 11155111: return "https://sepolia.etherscan.io"; default: return "https://etherscan.io"; }
  };

  useEffect(() => {
    if (!address || !chainId) return;
    const ALCHEMY_BASE_URL = ALCHEMY_URLS[chainId];
    if (!ALCHEMY_BASE_URL) return;

    // The logic to fetch transactions remains the same
    const fetchTxs = async () => {
        try {
            const fetchBody = (addrField, addrValue) => ({
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "alchemy_getAssetTransfers",
                params: [{ fromBlock: "0x0", [addrField]: addrValue, category: ["erc721", "erc1155"], withMetadata: true, excludeZeroValue: true, maxCount: "0x64" }]
              })
            });
    
            const [sentRes, receivedRes] = await Promise.all([
              fetch(ALCHEMY_BASE_URL, fetchBody("fromAddress", address)),
              fetch(ALCHEMY_BASE_URL, fetchBody("toAddress", address))
            ]);
    
            const sent = await sentRes.json();
            const received = await receivedRes.json();
            const all = [...(sent.result?.transfers || []), ...(received.result?.transfers || [])];
    
            const seenTxIdentifiers = new Set();
            const uniqueTxs = [];
            for (const tx of all) {
                const uniqueId = `${tx.hash}-${tx.asset}-${tx.tokenId}-${tx.from}-${tx.to}`;
                if(!seenTxIdentifiers.has(uniqueId)) {
                    uniqueTxs.push(tx);
                    seenTxIdentifiers.add(uniqueId);
                }
            }
            
            const processedTxs = uniqueTxs.map(tx => {
                let type = "Unknown";
                const sentByMe = tx.from.toLowerCase() === address.toLowerCase();
                const receivedByMe = tx.to.toLowerCase() === address.toLowerCase();
                if (tx.from.toLowerCase() === zeroAddress && receivedByMe) { type = 'Minted'; } 
                else if (tx.to.toLowerCase() === zeroAddress && sentByMe) { type = 'Burned'; }
                else if (sentByMe) { type = 'Sent'; } 
                else if (receivedByMe) { type = 'Received'; }
                return { ...tx, _type: type };
            }).filter(tx => tx._type !== "Unknown");
            
            const sortedTxs = processedTxs.sort((a,b) => new Date(b.metadata.blockTimestamp) - new Date(a.metadata.blockTimestamp));
    
            setTxs(sortedTxs);
        } catch (err) {
            console.error("Error fetching NFT transaction history:", err);
        }
    };

    fetchTxs();
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
            <div key={`${tx.hash}-${i}`} className="text-sm text-gray-200 dark:text-gray-100 border-b border-gray-200 dark:border-gray-100 pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* --- USING THE NEW NftImage COMPONENT --- */}
                  <NftImage 
                    contractAddress={tx.rawContract.address} 
                    tokenId={tx.tokenId} 
                    cache={imageUrlCache}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-black dark:text-white"><strong>{tx._type}</strong></div>
                    <div className="flex justify-between text-sm mt-1">
                      <div className="text-black dark:text-white font-medium truncate pr-2" title={`${tx.asset} #${parseInt(tx.tokenId, 16)}`}>
                        {tx.asset} #{parseInt(tx.tokenId, 16)}
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
				  <div className="text-black dark:text-white"><strong>Block:</strong> {parseInt(tx.blockNum, 16)}</div>
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