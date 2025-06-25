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

function PlaceholderSvg({ className }) {
  return (
    <svg 
      version="1.1" 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 360 360" 
      className={className}
    >
      <path d="M0 0 C33.66 0 67.32 0 102 0 C102 10.89 102 21.78 102 33 C79.23 33 56.46 33 33 33 C33 44.55 33 56.1 33 68 C55.77 68 78.54 68 102 68 C102 79.22 102 90.44 102 102 C79.23 102 56.46 102 33 102 C33 124.44 33 146.88 33 170 C22.11 170 11.22 170 0 170 C0 113.9 0 57.8 0 0 Z " fill="currentColor" transform="translate(163,180)"/>
      <path d="M0 0 C33.33 0 66.66 0 101 0 C101 10.89 101 21.78 101 33 C89.78 33 78.56 33 67 33 C67 78.21 67 123.42 67 170 C56.11 170 45.22 170 34 170 C34 124.79 34 79.58 34 33 C22.78 33 11.56 33 0 33 C0 22.11 0 11.22 0 0 Z " fill="currentColor" transform="translate(249,10)"/>
      <path d="M0 0 C10.89 0 21.78 0 33 0 C33 56.1 33 112.2 33 170 C22.11 170 11.22 170 0 170 C0 147.56 0 125.12 0 102 C-11.22 102 -22.44 102 -34 102 C-34 90.78 -34 79.56 -34 68 C-22.78 68 -11.56 68 0 68 C0 45.56 0 23.12 0 0 Z " fill="currentColor" transform="translate(112,10)"/>
      <path d="M0 0 C10.89 0 21.78 0 33 0 C33 11.22 33 22.44 33 34 C44.22 34 55.44 34 67 34 C67 45.22 67 56.44 67 68 C55.78 68 44.56 68 33 68 C33 101.66 33 135.32 33 170 C22.11 170 11.22 170 0 170 C0 113.9 0 57.8 0 0 Z " fill="currentColor" transform="translate(10,10)"/>
    </svg>
  );
}

export default function NftTxHistory({ address, chainId }) {
  const [txs, setTxs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 4;
  const zeroAddress = "0x0000000000000000000000000000000000000000";
  const { chain } = useAccount();
  const [expandedIndexes, setExpandedIndexes] = useState({});

  const getChainLabel = (chainId) => {
    switch (chainId) { case 1: return "Ethereum"; case 8453: return "Base"; case 137: return "Polygon"; case 42161: return "Arbitrum"; case 10: return "Optimism"; case 11155111: return "Sepolia"; case 56: return "BNB"; default: return "Base"; }
  };  

  const getExplorerBaseUrl = (chainId) => {
    switch (chainId) { case 1: return "https://etherscan.io"; case 8453: return "https://basescan.org"; case 137: return "https://polygonscan.com"; case 42161: return "https://arbiscan.io"; case 10: return "https://optimistic.etherscan.io"; case 56: return "https://bscscan.com"; case 11155111: return "https://sepolia.etherscan.io"; default: return "https://etherscan.io"; }
  };

  useEffect(() => {
    if (!address || !chainId) return;
    
    setIsLoading(true);
    setPage(1);
    setExpandedIndexes({});

    const ALCHEMY_BASE_URL = ALCHEMY_URLS[chainId];
    if (!ALCHEMY_BASE_URL) {
      setIsLoading(false);
      return;
    }

    const fetchTxsAndMetadata = async () => {
        try {
            const fetchBody = (addrField, addrValue) => ({
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "alchemy_getAssetTransfers", params: [{ fromBlock: "0x0", [addrField]: addrValue, category: ["erc721", "erc1155"], withMetadata: true, excludeZeroValue: true, maxCount: "0x64" }] })
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
                if(!seenTxIdentifiers.has(uniqueId)) { uniqueTxs.push(tx); seenTxIdentifiers.add(uniqueId); }
            }
            
            let processedTxs = uniqueTxs.map(tx => {
                let type = "Unknown";
                const sentByMe = tx.from.toLowerCase() === address.toLowerCase();
                const receivedByMe = tx.to.toLowerCase() === address.toLowerCase();
                if (tx.from.toLowerCase() === zeroAddress && receivedByMe) { type = 'Minted'; } 
                else if (tx.to.toLowerCase() === zeroAddress && sentByMe) { type = 'Burned'; }
                else if (sentByMe) { type = 'Sent'; } 
                else if (receivedByMe) { type = 'Received'; }
                return { ...tx, _type: type };
            }).filter(tx => tx._type !== "Unknown");

            // **FIX:** Fetch full metadata for each transaction before setting state
            const enrichedTxsPromises = processedTxs.map(async (tx) => {
                try {
                    const apiKey = "SLNvhiAdM71qDKy7veyeWn9ZD8XO11oY";
                    const metadataRes = await fetch(
                        `${ALCHEMY_BASE_URL}/getNFTMetadata?contractAddress=${tx.rawContract.address}&tokenId=${tx.tokenId}`,
                        { headers: { accept: "application/json" } }
                    );
                    const metadata = await metadataRes.json();

                    // Use the full collection name, fallback to the asset symbol
                    const displayName = metadata.collection?.name || metadata.contract?.name || tx.asset;
                    
                    let displayImage = null;
                    const rawUrl = metadata.image?.originalUrl || metadata.image?.cachedUrl || metadata.image?.pngUrl || metadata.raw?.metadata?.image || '';
                    if (typeof rawUrl === 'string' && rawUrl.trim() !== '') {
                        displayImage = rawUrl.trim().startsWith("ipfs://")
                        ? rawUrl.trim().replace("ipfs://", "https://ipfs.io/ipfs/")
                        : rawUrl.trim();
                    }

                    // Return a new object with the correct data
                    return { ...tx, displayName, displayImage };
                } catch (e) {
                    console.error("Failed to fetch metadata for a token:", e);
                    // If metadata fails, return the original tx with fallbacks
                    return { ...tx, displayName: tx.asset, displayImage: null };
                }
            });

            const enrichedTxs = await Promise.all(enrichedTxsPromises);
            
            const sortedTxs = enrichedTxs.sort((a,b) => new Date(b.metadata.blockTimestamp) - new Date(a.metadata.blockTimestamp));
    
            setTxs(sortedTxs);
        } catch (err) {
            console.error("Error fetching NFT transaction history:", err);
        } finally {
            setIsLoading(false);
        }
    };

    fetchTxsAndMetadata();
  }, [address, chainId]);

	const shortenAddress = (addr) => { if (!addr) return ""; return addr.slice(0, 6) + "..." + addr.slice(-4); }; 
	const formatShortDate = (dateStr) => { const d = new Date(dateStr); return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + ", " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }); };
    const paginated = txs.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="p-4 bg-white border-b2 dark:bg-dark-200 shadow">
	<div className="flex justify-between items-center mb-2">
	  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">NFT Transactions</h3>
	  <span className="text-sm text-gray-500 dark:text-gray-400 uppercase">{getChainLabel(chain?.id)}</span>
	</div>
      <div className="space-y-2">
        {isLoading ? (
          <p className="text-gray-600 dark:text-white text-sm">Loading transactions...</p>
        ) : paginated.length === 0 ? (
          <p className="text-gray-600 dark:text-white text-sm">No recent NFT transactions.</p>
        ) : (
          paginated.map((tx, i) => (
            <div key={`${tx.hash}-${i}`} className="text-sm text-gray-200 dark:text-gray-100 border-b border-gray-200 dark:border-gray-100 pb-2">
            <div className="flex items-center gap-3 w-full">

              <div className="flex-shrink-0">
                {/* Image is now rendered directly from the tx object */}
                {tx.displayImage ? (
                  <img 
                    src={tx.displayImage} 
                    alt={tx.displayName}
                    className="w-10 h-10 rounded object-cover bg-gray-200 flex-shrink-0 border border-black dark:border-white"
                  />
                ) : (
                  <PlaceholderSvg className="w-10 h-10 p-1 text-black dark:text-white border border-black dark:border-white" />
                )}
              </div>

              <div className="flex-grow min-w-0">

                <div className="flex justify-between items-center">
                  <div className="text-black dark:text-white"><strong>{tx._type}</strong></div>
                  <div className="flex items-center">
                    {tx._type === "Sent" && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="w-5 h-5 ml-2 fill-black dark:fill-white"><path d="M77.17187,170.82861a3.99971,3.99971,0,0,1,0-5.65722L182.34277,60H92a4,4,0,0,1,0-8H192c.0166,0,.03174.0047.04834.00488a4.02377,4.02377,0,0,1,.73437.074c.12159.02411.23389.06927.35108.10412a2.30534,2.30534,0,0,1,.77588.32282c.103.05633.21045.10168.30908.16772a4.02182,4.02182,0,0,1,.58691.47919c.00684.007.01563.01154.02246.01862l.01417.01684a4.0149,4.0149,0,0,1,.48388.5929c.06738.1001.11328.20856.16992.313a3.85529,3.85529,0,0,1,.19776.37573,3.97336,3.97336,0,0,1,.12646.40607c.03321.114.07715.223.10059.34094A3.98826,3.98826,0,0,1,196,56V156a4,4,0,0,1-8,0V65.657L82.82812,170.82861a3.99971,3.99971,0,0,1-5.65625,0ZM216,211.99609H40a4,4,0,0,0,0,8H216a4,4,0,0,0,0-8Z" /></svg>}
                    {tx._type === "Received" && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="w-5 h-5 ml-2 fill-black dark:fill-white"><path d="M53.17187,114.82471a3.99992,3.99992,0,0,1,5.65625-5.65723L124,174.33936V31.99609a4,4,0,0,1,8,0V174.33936l65.17187-65.17188a3.99992,3.99992,0,1,1,5.65625,5.65723l-72,72c-.00683.00708-.01562.01172-.02246.01855a4.01055,4.01055,0,0,1-.58691.47925c-.10059.06714-.209.11328-.314.17041a3.961,3.961,0,0,1-.37452.197,3.91774,3.91774,0,0,1-.40918.12695c-.11279.03321-.2207.07715-.33789.1001a3.91693,3.91693,0,0,1-1.5664,0c-.11719-.023-.2251-.06689-.33789-.1001a3.91774,3.91774,0,0,1-.40918-.12695,3.961,3.961,0,0,1-.37452-.197c-.105-.05713-.21337-.10327-.314-.17041a4.01055,4.01055,0,0,1-.58691-.47925c-.00684-.00683-.01563-.01147-.02247-.01855ZM216,211.99609H40a4,4,0,0,0,0,8H216a4,4,0,0,0,0-8Z" /></svg>}
                    {tx._type === "Burned" && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="w-5 h-5 ml-2 fill-black dark:fill-white"><path d="M108,40a4.0002,4.0002,0,0,1,4-4h32a4,4,0,0,1,0,8H112A4.0002,4.0002,0,0,1,108,40Zm36,172H112a4,4,0,0,0,0,8h32a4,4,0,0,0,0-8ZM208,36H184a4,4,0,0,0,0,8h24a4.00458,4.00458,0,0,1,4,4V71.99951a4,4,0,0,0,8,0V48A12.01375,12.01375,0,0,0,208,36Zm8,71.99951a4.0002,4.0002,0,0,0-4,4v32a4,4,0,0,0,8,0v-32A4.0002,4.0002,0,0,0,216,107.99951Zm-176,40a4.0002,4.0002,0,0,0,4-4v-32a4,4,0,1,0-8,0v32A4.0002,4.0002,0,0,0,40,147.99951ZM72,212H48a4.00427,4.00427,0,0,1-4-4V184a4,4,0,0,0-8,0v24a12.01343,12.01343,0,0,0,12,12H72a4,4,0,0,0,0-8ZM50.96,37.30908A4.0003,4.0003,0,0,0,45.04,42.69092l160,175.99951a4,4,0,1,0,5.91992-5.38086Z" /></svg>}
                    {tx._type === "Minted" && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="w-5 h-5 ml-2 fill-black dark:fill-white"><path d="M208,36H48A12.01312,12.01312,0,0,0,36,48V208a12.01312,12.01312,0,0,0,12,12H208a12.01312,12.01312,0,0,0,12-12V48A12.01312,12.01312,0,0,0,208,36Zm4,172a4.004,4.004,0,0,1-4,4H48a4.004,4.004,0,0,1-4-4V177.65631l33.17187-33.171a4.00208,4.00208,0,0,1,5.65723,0l20.68652,20.68652a12.011,12.011,0,0,0,16.96973,0l44.68652-44.68652a4.00208,4.00208,0,0,1,5.65723,0L212,161.65625Zm0-57.65625L176.48535,114.8291a11.99916,11.99916,0,0,0-16.96973,0L114.8291,159.51562a4.00681,4.00681,0,0,1-5.65723,0L88.48535,138.8291a12.01009,12.01009,0,0,0-16.96973,0L44,166.34393V48a4.004,4.004,0,0,1,4-4H208a4.004,4.004,0,0,1,4,4ZM108.001,92v.00195a8.001,8.001,0,1,1,0-.00195Z" /></svg>}
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm mt-1">
                  {/* Name is now rendered directly from the tx object */}
                  <div className="text-black dark:text-white font-medium truncate" title={`${tx.displayName} #${parseInt(tx.tokenId, 16)}`}>
                    {tx.displayName} #{parseInt(tx.tokenId, 16)}
                  </div>
                  <div className="text-black dark:text-white">{formatShortDate(tx.metadata.blockTimestamp)}</div>
                </div>
              </div>
            </div>
              <div className="flex items-center justify-between text-black dark:text-white mt-1">
                <a href={`${getExplorerBaseUrl(chainId)}/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" className="underline">View on Explorer</a>
                <button onClick={() => setExpandedIndexes(prev => ({ ...prev, [i]: !prev[i] }))} className="text-xs underline">
                  {expandedIndexes[i] ? "Hide" : "Details"}
                </button>
              </div>
              {expandedIndexes[i] && (
                <div className="mt-2 space-y-1 text-xs">
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