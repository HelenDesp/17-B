// nftTransfer.js  –  Wagmi single-send  +  smart-wallet batch-send (Base chain)

import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import {
  createPublicClient,
  http,
  encodeFunctionData,
} from "viem";
import { base } from "viem/chains";
import { useActiveAccount } from "thirdweb/react";   // ✅ thirdweb hook

/* ─────────────── ABIs ──────────────── */
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
    outputs: [{ name: "", type: "bool" }],
  },
];

// every Thirdweb smart wallet exposes this signature
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

/* ─────────────── Component ──────────────── */
export default function NFTTransfer({ nfts = [] }) {
  const { address: eoa } = useAccount();                // owner EOA for single send
  const { writeContractAsync } = useWriteContract();
  const { account } = useActiveAccount();               // hydrated AA wallet
  const smartWalletAddress = account?.address;

  /* UI state */
  const [recipient, setRecipient]   = useState("");
  const [mode, setMode]             = useState("single"); // "single" | "batch"
  const [selectedId, setSelectedId] = useState(null);
  const [status, setStatus]         = useState("");
  const [busy, setBusy]             = useState(false);

  /* constants */
  const NFT_ADDRESS = "0x28D744dAb5804eF913dF1BF361E06Ef87eE7FA47";

  /* read-only client for on-chain checks */
  const client = createPublicClient({ chain: base, transport: http() });

  /* ─────────────── handler ──────────────── */
  const handleTransfer = async () => {
    // rudimentary form validation
    if (!recipient.match(/^0x[a-fA-F0-9]{40}$/)) {
      setStatus("❌ Invalid recipient address");
      return;
    }
    if (mode === "single" && !selectedId) {
      setStatus("❌ Select an NFT first");
      return;
    }
    if (mode === "batch" && !smartWalletAddress) {
      setStatus("❌ Connect / hydrate your smart wallet first");
      return;
    }

    try {
      setBusy(true);
      setStatus("⏳ Sending…");

      /* ───────────── single-NFT (EOA) ───────────── */
      if (mode === "single") {
        await writeContractAsync({
          chainId: base.id,                         // ✅ force Base
          address: NFT_ADDRESS,
          abi: erc721Abi,
          functionName: "safeTransferFrom",
          args: [eoa, recipient, BigInt(selectedId)],
        });
        setStatus("✅ NFT transferred");
        return;
      }

      /* ───────────── batch (smart wallet) ───────────── */
      // 1. approve once if needed
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

      // 2. build calldata arrays
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

      // 3. call executeBatch on the AA wallet
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
    <div className="bg-white dark:bg-dark-200 rounded-xl p-6 mt-6 shadow">
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

      {/* NFT selector (single mode) */}
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
