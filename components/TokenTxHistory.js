import React, { useEffect, useState } from "react";

const ALCHEMY_BASE_URL = "https://base-mainnet.g.alchemy.com/v2/oQKmm0fzZOpDJLTI64W685aWf8j1LvDr";

export default function TokenTxHistory({ address, chainId }) {
  const [txs, setTxs] = useState([]);
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    if (!address || !chainId) return;

    const fetchTxs = async () => {
      try {
        const res = await fetch(ALCHEMY_BASE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "alchemy_getAssetTransfers",
params: [{
  fromBlock: "0x0",
  address: address,
  category: ["external", "erc20"],
  withMetadata: true,
  excludeZeroValue: true,
  maxCount: "0x32"
}]
          })
        });
        const data = await res.json();
        setTxs(data.result.transfers || []);
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
        {paginated.map((tx, i) => (
          <div key={i} className="text-sm text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
            <div><strong>Token:</strong> {tx.asset || "ETH"}</div>
            <div><strong>Amount:</strong> {tx.value}</div>
            <div><strong>From:</strong> {tx.from}</div>
            <div><strong>To:</strong> {tx.to}</div>
            <div><strong>Block:</strong> {parseInt(tx.blockNum, 16)}</div>
            <div><strong>Date:</strong> {new Date(tx.metadata.blockTimestamp).toLocaleString()}</div>
          </div>
        ))}
      </div>
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
    </div>
  );
}