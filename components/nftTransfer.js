// nftTransfer.js — ReVerse Genesis single + batch transfer (wagmi + viem)

import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import {
  createPublicClient,
  http,
  encodeFunctionData,
} from "viem";
import { base } from "viem/chains";
import { useActiveAccount } from "thirdweb/react";    // ✅ Thirdweb AA hook

/* ──────────────── ABIs ──────────────── */
// Minimal ERC-721
const erc721Abi = [
  {
    name: "safeTransferFrom",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "setApprovalForAll",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "operator", type: "address" },
      { name: "approved", type: "bool" },
    ],
    outputs: [],
  },
  {
    name: "isApprovedForAll",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "operator", type: "address" },
    ],
    outputs: [{ type: "bool" }],
  },
];

// Every Thirdweb smart wallet exposes executeBatch
const smartWalletAbi = [
  {
    name: "executeBatch",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "targets", type: "address[]" },
      { name: "values", type: "uint256[]" },
      { name: "data",   type: "bytes[]"   },
    ],
    outputs: [],
  },
];

/* ───────────── Component ───────────── */
export default function NFTTransfer({ nfts = [] }) {
  const { address: eoa } = useAccount();               // owner EOA (single mode)
  const { writeContractAsync } = useWriteContract();
  const activeAccount = useActiveAccount();            // hydrated AA wallet clone
  const smartWalletAddress = activeAccount?.address;   // may be undefined initially

  const [recipient, setRecipient]   = useState("");
  const [mode, setMode]             = useState("single");   // "single" | "batch"
  const [selectedId, setSelectedId] = useState(null);
  const [status, setStatus]         = useState("");
  const [busy, setBusy]             = useState(false);

  const NFT_ADDRESS = "0x28D744dAb5804eF913dF1BF361E06Ef87eE7FA47";
  const client = createPublicClient({ chain: base, transport: http() });

  /* ───────────── Handler ───────────── */
  const handleTransfer = async () => {
    if (!recipient.match(/^0x[a-fA-F0-9]{40}$/)) {
      setStatus("❌ Invalid recipient address");
      return;
    }
    if (mode === "single" && !selectedId) {
      setStatus("❌ Select an NFT first");
      return;
    }
    if (mode === "batch" && !smartWalletAddress) {
      setStatus("⏳ Smart wallet still deploying… please wait");
      return;
    }

    try {
      setBusy(true);
      setStatus("⏳ Sending…");

      /* ───── Single NFT (EOA) ───── */
      if (mode === "single") {
        await writeContractAsync({
          chainId: base.id,                       // 🔹 force Base
          address: NFT_ADDRESS,
          abi: erc721Abi,
          functionName: "safeTransferFrom",
          args: [eoa, recipient, BigInt(selectedId)],
        });
        setStatus("✅ NFT transferred");
        return;
      }

      /* ───── Batch (smart wallet) ───── */
      // 1. Approve wallet once, if not already
      const approved = await client.readContract({
        address: NFT_ADDRESS,
        abi: erc721Abi,
        functionName: "isApprovedForAll",
        args: [eoa, smartWalletAddress],
      });

      if (!approved) {
        await writeContractAsync({
          chainId: base.id,
          address: NFT_ADDRESS,
          abi: erc721Abi,
          functionName: "setApprovalForAll",
          args: [smartWalletAddress, true],
        });
      }

      // 2. Build calldata for each NFT
      const tokenIds = nfts.map((n) => BigInt(n.tokenId));
      const targets = tokenIds.map(() => NFT_ADDRESS);
      const values  = tokenIds.map(() => 0n);
      const data    = tokenIds.map((id) =>
        encodeFunctionData({
          abi: erc721Abi,
          functionName: "safeTransferFrom",
          args: [smartWalletAddress, recipient, id],
        }),
      );

      // 3. Execute batch on wallet clone
      await writeContractAsync({
        chainId: base.id,
        address: smartWalletAddress,
        abi: smartWalletAbi,
        functionName: "executeBatch",
        args: [targets, values, data],
      });

      setStatus("✅ All selected NFTs transferred in one tx");
    } catch (err) {
      console.error(err);
      setStatus("❌ Transaction failed – see console");
    } finally {
      setBusy(false);
    }
  };

  /* ───────────── UI ───────────── */
  return (
    <div className="rounded-xl p-6 bg-white dark:bg-dark-200 shadow mt-6">
      <h2 className="text-xl font-semibold mb-4">Transfer Your NFT(s)</h2>

      {/* mode toggle */}
      <div className="mb-4 space-x-6">
        <label>
          <input
            type="radio"
            checked={mode === "single"}
            onChange={() => setMode("single")}
            className="mr-1"
          />
          Single
        </label>
        <label>
          <input
            type="radio"
            checked={mode === "batch"}
            onChange={() => setMode("batch")}
            className="mr-1"
          />
          Batch&nbsp;(Smart&nbsp;Wallet)
        </label>
      </div>

      {/* NFT selector for single mode */}
      {mode === "single" && (
        <div className="mb-4">
          <label className="block mb-1 text-sm">Select NFT:</label>
          <select
            value={selectedId ?? ""}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">-- Select NFT --</option>
            {nfts.map((nft) => (
              <option key={nft.tokenId} value={nft.tokenId}>
                #{nft.tokenId} — {nft.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* recipient */}
      <div className="mb-4">
        <label className="block mb-1 text-sm">Recipient address:</label>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="0x…"
          className="w-full p-2 border rounded"
        />
      </div>

      {/* action */}
      <button
        onClick={handleTransfer}
        disabled={busy}
        className="w-full py-2 px-4 bg-primary-600 text-white rounded disabled:opacity-50"
      >
        {busy
          ? "Transferring…"
          : mode === "single"
          ? "Transfer NFT"
          : "Transfer Selected NFTs"}
      </button>

      {/* feedback */}
      {status && <p className="mt-4 text-sm">{status}</p>}
    </div>
  );
}
