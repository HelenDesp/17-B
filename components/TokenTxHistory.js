import React, { useEffect, useState } from "react";

const ALCHEMY_BASE_URL = "https://base-mainnet.g.alchemy.com/v2/oQKmm0fzZOpDJLTI64W685aWf8j1LvDr";

export default function TokenTxHistory({ address, chainId }) {
  const [txs, setTxs] = useState([]);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const zeroAddress = "0x28D744dAb5804eF913dF1BF361E06Ef87eE7FA47";

  useEffect(() => {
    if (!address || !chainId) return;

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

        // Exclude all NFTs (ERC-721 & ERC-1155)
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
  txGroup.some(t =>
    t.from === zeroAddress &&
    t.to?.toLowerCase() === address.toLowerCase()
  )
) {
  type = "Sent (Minted)";
} else if (sentTx) {
  type = "Sent";
} else if (receivedTx) {
  type = "Received";
}

if (sentTx && receivedTx) {
  const swapToken = receivedTx.asset || sentTx.asset;
  type = `Swapped (${swapToken})`;
} else if (
  txGroup.some(t =>
    t.from === zeroAddress &&
    t.to?.toLowerCase() === address.toLowerCase()
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

  const paginated = txs.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="p-4 bg-white dark:bg-dark-200 rounded shadow">
      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Token Transactions</h3>
      <div className="space-y-2">
        {paginated.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-sm">No recent transactions.</p>
        ) : (
          paginated.map((tx, i) => (
            <div key={i} className="text-sm text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
              <div><strong>Type:</strong> {tx._type}</div>
              <div><strong>Token:</strong> {tx.asset || "ETH"}</div>
              <div><strong>Amount:</strong> {tx.value}</div>
              <div><strong>From:</strong> {tx.from}</div>
              <div><strong>To:</strong> {tx.to}</div>
              <div><strong>Block:</strong> {parseInt(tx.blockNum, 16)}</div>
              <div><strong>Date:</strong> {new Date(tx.metadata.blockTimestamp).toLocaleString()}</div>
            </div>
          ))
        )}
      </div>
      {txs.length > perPage && (
        <div className="flex justify-between items-center mt-4 text-sm">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-700 dark:text-gray-300">Page {page}</span>
          <button
            onClick={() => setPage((p) => (p * perPage < txs.length ? p + 1 : p))}
            disabled={page * perPage >= txs.length}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}