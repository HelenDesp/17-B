import { useEffect, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import {
  createPublicClient,
  http,
  encodeFunctionData,
} from "viem";
import { base } from "viem/chains";

import { createWallet, smartWallet } from "@thirdweb-dev/wallets";

/* ──────────────────────────────────────────────── ABIs */
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

const smartWalletAbi = [
  {
    name: "executeBatch",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "targets", type: "address[]" },
      { name: "values", type: "uint256[]" },
      { name: "data", type: "bytes[]" },
    ],
    outputs: [],
  },
];

/* ──────────────────────────────────────────────── Component */
export default function NFTTransfer({ nfts }) {
  const { address: eoa } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [recipient, setRecipient] = useState("");
  const [mode, setMode] = useState("single");
  const [selectedTokenId, setSelectedTokenId] = useState(null);
  const [status, setStatus] = useState("");
  const [txInProgress, setTxInProgress] = useState(false);
  const [smartWalletAddress, setSmartWalletAddress] = useState("");

  const NFT_ADDRESS = "0x28D744dAb5804eF913dF1BF361E06Ef87eE7FA47";
  const client = createPublicClient({ chain: base, transport: http() });

  useEffect(() => {
    const setupSmartWallet = async () => {
      if (!eoa) return;

      const personalWallet = createWallet("local");
      await personalWallet.connect();

      const smartWalletInstance = smartWallet({
        factoryAddress: "0x10046F0E910Eea3Bc03a23CAb8723bF6b405FBB2",
        chain: base,
        clientId: "40cb8b1796ed4c206ecd1445911c5ab8",
        gasless: false,
      });

      await smartWalletInstance.connect({ personalWallet });
      const swAddress = await smartWalletInstance.getAddress();
      setSmartWalletAddress(swAddress);
    };

    setupSmartWallet();
  }, [eoa]);

  const handleTransfer = async () => {
    if (!recipient.match(/^0x[a-fA-F0-9]{40}$/)) {
      setStatus("❌ Invalid recipient address.");
      return;
    }

    if (mode === "single" && !selectedTokenId) {
      setStatus("❌ Please select an NFT to transfer.");
      return;
    }

    setTxInProgress(true);
    setStatus("⏳ Sending transaction…");

    try {
      if (mode === "single") {
        await writeContractAsync({
          address: NFT_ADDRESS,
          abi: erc721Abi,
          functionName: "safeTransferFrom",
          args: [eoa, recipient, BigInt(selectedTokenId)],
        });
        setStatus("✅ NFT transferred successfully.");
      } else {
        const approved = await client.readContract({
          address: NFT_ADDRESS,
          abi: erc721Abi,
          functionName: "isApprovedForAll",
          args: [eoa, smartWalletAddress],
        });

        if (!approved) {
          await writeContractAsync({
            address: NFT_ADDRESS,
            abi: erc721Abi,
            functionName: "setApprovalForAll",
            args: [smartWalletAddress, true],
          });
        }

        const tokenIds = nfts.map((n) => BigInt(n.tokenId));
        const targets = tokenIds.map(() => NFT_ADDRESS);
        const values = tokenIds.map(() => 0n);
        const data = tokenIds.map((id) =>
          encodeFunctionData({
            abi: erc721Abi,
            functionName: "safeTransferFrom",
            args: [smartWalletAddress, recipient, id],
          })
        );

        await writeContractAsync({
          address: smartWalletAddress,
          abi: smartWalletAbi,
          functionName: "executeBatch",
          args: [targets, values, data],
        });

        setStatus("✅ All selected NFTs transferred in one tx.");
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Transaction failed – check console.");
    } finally {
      setTxInProgress(false);
    }
  };

  return (
    <div className="bg-white dark:bg-dark-200 rounded-xl shadow-card dark:shadow-card-dark p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4">Transfer Your NFT(s)</h2>

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
          Batch (Smart Wallet)
        </label>
      </div>

      {mode === "single" && (
        <div className="mb-4">
          <label className="block mb-1 text-sm">Select NFT:</label>
          <select
            value={selectedTokenId || ""}
            onChange={(e) => setSelectedTokenId(e.target.value)}
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

      <div className="mb-4">
        <label className="block mb-1 text-sm">Recipient Wallet Address:</label>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="0x…"
          className="w-full p-2 border rounded"
        />
      </div>

      <button
        onClick={handleTransfer}
        disabled={txInProgress}
        className="w-full py-2 px-4 bg-primary-600 text-white rounded disabled:opacity-50"
      >
        {txInProgress
          ? "Transferring…"
          : mode === "single"
          ? "Transfer NFT"
          : "Transfer Selected NFTs"}
      </button>

      {status && <p className="mt-4 text-sm">{status}</p>}
    </div>
  );
}