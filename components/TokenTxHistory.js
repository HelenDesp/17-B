import React, { useEffect, useState } from "react";

const ALCHEMY_BASE_URL = "https://base-mainnet.g.alchemy.com/v2/oQKmm0fzZOpDJLTI64W685aWf8j1LvDr";

function getTxType(tx, userAddress) {
  const from = tx.from?.toLowerCase();
  const to = tx.to?.toLowerCase();
  const zeroAddress = "0x0000000000000000000000000000000000000000";
  const user = userAddress?.toLowerCase();

  if (from === zeroAddress) return "Minted";
  if (from === user && to === user) return "Self Transfer";
  if (from === user) return "Sent";
  if (to === user) return "Received";
  return "Other";
}

export default function TokenTxHistory({ address, chainId }) {
  const [txs, setTxs] = useState([]);
  const [page, setPage] = useState(1);
  const perPage = 10;

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
                category: ["external", "erc20", "erc721"],
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
                category: ["external", "erc20", "erc721"],
                withMetadata: true,
                excludeZeroValue: true,
                maxCount: "0x32"
              }]
            })
          })
        ]);

        const sent = await sentRes.json();
        const received = await receivedRes.json();
        const combined = [...(sent.result?.transfers || []), ...(received.result?.transfers || [])];

        const sorted = combined
          .filter(tx => tx.metadata?.blockTimestamp)
          .sort((a, b) => new Date(b.metadata.blockTimestamp) - new Date(a.metadata.blockTimestamp));

        setTxs(sorted);
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
          paginated.map((tx, i) => {
            const txType = getTxType(tx, address);
            return (
              <div key={i} className="text-sm text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
                <div><strong>Type:</strong> {txType}</div>
                <div><strong>Token:</strong> {tx.asset || "ETH"}</div>
                <div><strong>Amount:</strong> {tx.value}</div>
                <div><strong>From:</strong> {tx.from}</div>
                <div><strong>To:</strong> {tx.to}</div>
                <div><strong>Block:</strong> {parseInt(tx.blockNum, 16)}</div>
                <div><strong>Date:</strong> {new Date(tx.metadata.blockTimestamp).toLocaleString()}</div>
              </div>
            );
          })
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