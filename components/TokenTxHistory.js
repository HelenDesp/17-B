import React, { useEffect, useState } from "react";

const ALCHEMY_BASE_URL = "https://base-mainnet.g.alchemy.com/v2/oQKmm0fzZOpDJLTI64W685aWf8j1LvDr";
const zeroAddress = "0x0000000000000000000000000000000000000000";

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
            params: [
              {
                fromBlock: "0x0",
                toBlock: "latest",
                fromAddress: address,
                toAddress: address,
                category: ["external", "erc20"],
                withMetadata: true,
                excludeZeroValue: true,
                maxCount: "0x32",
              },
            ],
          }),
        });

        const data = await res.json();
        const raw = data.result?.transfers || [];

        // Group by transaction hash
        const grouped = raw.reduce((acc, tx) => {
          const hash = tx.hash;
          if (!acc[hash]) acc[hash] = [];
          acc[hash].push(tx);
          return acc;
        }, {});

        const parsed = Object.values(grouped).map((txGroup) => {
          let type = "Unknown";
          const sentTx = txGroup.find((t) => t.from?.toLowerCase() === address.toLowerCase());
          const receivedTx = txGroup.find((t) => t.to?.toLowerCase() === address.toLowerCase());
          const minted = txGroup.some((t) => t.from === zeroAddress);

          // Swapped: Sent + Received in same hash
          if (sentTx && receivedTx && sentTx.hash === receivedTx.hash && sentTx.asset !== receivedTx.asset) {
            const tokenName = receivedTx.asset || sentTx.asset;
            type = `Swapped (${tokenName})`;
          }
          // Sent (Minted): sent ETH + minted token (from 0x0) in same hash
          else if (
            sentTx &&
            minted &&
            txGroup.some(
              (t) => t.from === zeroAddress && t.to?.toLowerCase() === address.toLowerCase()
            )
          ) {
            type = "Sent (Minted)";
          }
          // Bridged: heuristics — sent ETH and only ETH, no receipt from known tokens, and generic contract call
          else if (
            sentTx &&
            sentTx.asset === "ETH" &&
            txGroup.length === 1 &&
            !minted &&
            sentTx.to?.startsWith("0x") &&
            sentTx.to?.toLowerCase() !== address.toLowerCase()
          ) {
            type = "Bridged";
          }
          // Fallbacks
          else if (sentTx) type = "Sent";
          else if (receivedTx) type = "Received";

          const mainTx = sentTx || receivedTx || txGroup[0];

          return {
            hash: mainTx.hash,
            blockNum: parseInt(mainTx.blockNum, 16),
            date: new Date(mainTx.metadata.blockTimestamp).toLocaleString(),
            from: mainTx.from,
            to: mainTx.to,
            asset: mainTx.asset,
            value: mainTx.value,
            type,
          };
        });

        // Sort from most recent to oldest
        const sorted = parsed.sort((a, b) => b.blockNum - a.blockNum);
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
          paginated.map((tx, i) => (
            <div
              key={i}
              className="text-sm text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2"
            >
              <div><strong>Type:</strong> {tx.type}</div>
              <div><strong>Token:</strong> {tx.asset || "ETH"}</div>
              <div><strong>Amount:</strong> {tx.value}</div>
              <div><strong>From:</strong> {tx.from}</div>
              <div><strong>To:</strong> {tx.to}</div>
              <div><strong>Block:</strong> {tx.blockNum}</div>
              <div><strong>Date:</strong> {tx.date}</div>
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
