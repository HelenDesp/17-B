import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";

const erc721TransferAbi = [
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
];

export default function NFTTransfer({ nfts }) {
  const { address } = useAccount();
  const [recipient, setRecipient] = useState("");
  const [mode, setMode] = useState("single");
  const [selectedTokenId, setSelectedTokenId] = useState(null);
  const [status, setStatus] = useState("");
  const [txInProgress, setTxInProgress] = useState(false);

  const { writeContractAsync } = useWriteContract();

  const contractAddress = "0x28D744dAb5804eF913dF1BF361E06Ef87eE7FA47";

  const handleTransfer = async () => {
    if (!recipient || !recipient.startsWith("0x") || recipient.length !== 42) {
      setStatus("❌ Invalid recipient address.");
      return;
    }

    if (mode === "single" && !selectedTokenId) {
      setStatus("❌ Please select an NFT to transfer.");
      return;
    }

    setTxInProgress(true);
    setStatus("⏳ Sending transaction...");

    try {
      if (mode === "single") {
        await writeContractAsync({
          address: contractAddress,
          abi: erc721TransferAbi,
          functionName: "safeTransferFrom",
          args: [address, recipient, selectedTokenId],
        });
        setStatus("✅ NFT transferred successfully.");
      } else {
        for (const nft of nfts) {
          await writeContractAsync({
            address: contractAddress,
            abi: erc721TransferAbi,
            functionName: "safeTransferFrom",
            args: [address, recipient, nft.tokenId],
          });
        }
        setStatus("✅ All NFTs transferred successfully.");
      }
    } catch (error) {
      console.error(error);
      setStatus("❌ Transaction failed.");
    } finally {
      setTxInProgress(false);
    }
  };

  return (
    <div className="bg-white dark:bg-dark-200 rounded-xl shadow-card dark:shadow-card-dark p-6 mt-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Transfer Your NFT(s)
      </h2>

      <div className="mb-4">
        <label className="mr-4 font-medium text-gray-700 dark:text-gray-200">
          <input
            type="radio"
            checked={mode === "single"}
            onChange={() => setMode("single")}
            className="mr-1"
          />
          Single
        </label>
        <label className="font-medium text-gray-700 dark:text-gray-200">
          <input
            type="radio"
            checked={mode === "batch"}
            onChange={() => setMode("batch")}
            className="mr-1"
          />
          Batch
        </label>
      </div>

      {mode === "single" && (
        <div className="mb-4">
          <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
            Select NFT:
          </label>
          <select
            value={selectedTokenId || ""}
            onChange={(e) => setSelectedTokenId(e.target.value)}
            className="w-full p-2 border rounded dark:bg-dark-300 dark:text-white"
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
        <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
          Recipient Wallet Address:
        </label>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="0x..."
          className="w-full p-2 border rounded dark:bg-dark-300 dark:text-white"
        />
      </div>

      <button
        onClick={handleTransfer}
        disabled={txInProgress}
        className="w-full py-2 px-4 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
      >
        {txInProgress ? "Transferring..." : mode === "single" ? "Transfer NFT" : "Transfer All NFTs"}
      </button>

      {status && (
        <p className="mt-4 text-sm text-gray-700 dark:text-gray-200">
          {status}
        </p>
      )}
    </div>
  );
}