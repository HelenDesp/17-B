import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { encodeFunctionData, createPublicClient, http } from "viem";
import { base } from "viem/chains";

// --- Scatter's ArchetypeBatch ABI
const archetypeBatchAbi = [
  {
    name: "executeBatch",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "targets", type: "address[]" },
      { name: "values", type: "uint256[]" },
      { name: "data", type: "bytes[]" }
    ],
    outputs: []
  }
];

// --- Standard ERC-721 ABI fragment
const erc721TransferAbi = [
  {
    name: "safeTransferFrom",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" }
    ],
    outputs: []
  },
  {
    name: "setApprovalForAll",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "operator", type: "address" },
      { name: "approved", type: "bool" }
    ],
    outputs: []
  },
  {
    name: "isApprovedForAll",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "operator", type: "address" }
    ],
    outputs: [{ name: "", type: "bool" }]
  }
];

// --- Scatter's ArchetypeBatch addresses for each chain
function getArchetypeBatchAddress(chainId = 0) {
  if (chainId === 1) {
    return "0x6Bc558A6DC48dEfa0e7022713c23D65Ab26e4Fa7";
  } else if (chainId === 11124) {
    return "0x467177879f29A253680f037F3D30c94F7C6F1ED4";
  } else if (chainId === 2741) {
    return "0x5D4A8C47ae56C02Bdb41D2E5D4957b7A0bE9c619";
  } else {
    // BASE default (or fallback)
    return "0xEa49e7bE310716dA66725c84a5127d2F6A202eAf";
  }
}

export default function NFTTransfer({ nfts, chainId = 8453 }) { // 8453 is Base
  const { address } = useAccount();
  const [recipient, setRecipient] = useState("");
  const [mode, setMode] = useState("single");
  const [selectedTokenId, setSelectedTokenId] = useState(null);
  const [status, setStatus] = useState("");
  const [txInProgress, setTxInProgress] = useState(false);

  // Tooltip states
  const [showApprovalExplanation, setShowApprovalExplanation] = useState(false);
  const [showBatchExplanation, setShowBatchExplanation] = useState(false);

  const { writeContractAsync } = useWriteContract();

  // Your NFT contract address
  const contractAddress = "0x28D744dAb5804eF913dF1BF361E06Ef87eE7FA47";
  // ArchetypeBatch address for selected chain
  const batchHelperAddress = getArchetypeBatchAddress(chainId);

  const client = createPublicClient({
    chain: base,
    transport: http()
  });

  // Get lowest reasonable gas settings dynamically (optional)
  const getLowGasFee = async () => {
    const block = await client.getBlock();
    const baseFeePerGas = block.baseFeePerGas ?? 0n;
    const maxPriorityFeePerGas = 1_000_000n; // 0.000001 gwei
    const maxFeePerGas = baseFeePerGas + maxPriorityFeePerGas;
    return { maxPriorityFeePerGas, maxFeePerGas };
  };

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
      const gas = await getLowGasFee();

      if (mode === "single") {
        setShowApprovalExplanation(false);
        setShowBatchExplanation(false);

        await writeContractAsync({
          address: contractAddress,
          abi: erc721TransferAbi,
          functionName: "safeTransferFrom",
          args: [address, recipient, selectedTokenId],
          ...gas
        });
        setStatus("✅ NFT transferred successfully.");
      } else {
        // --- BATCH MODE ---
        // Check approval for batch helper
        const isApproved = await client.readContract({
          address: contractAddress,
          abi: erc721TransferAbi,
          functionName: "isApprovedForAll",
          args: [address, batchHelperAddress]
        });

        if (!isApproved) {
          setShowApprovalExplanation(true); // Show approval tip
          setShowBatchExplanation(false);

          await writeContractAsync({
            address: contractAddress,
            abi: erc721TransferAbi,
            functionName: "setApprovalForAll",
            args: [batchHelperAddress, true],
            ...gas
          });
        }

        setShowApprovalExplanation(false);
        setShowBatchExplanation(true); // Show batch tip

        // Build batch arrays
        const targets = [];
        const values = [];
        const datas = [];

        for (const nft of nfts) {
          targets.push(contractAddress);
          values.push(0n);
          datas.push(
            encodeFunctionData({
              abi: erc721TransferAbi,
              functionName: "safeTransferFrom",
              args: [address, recipient, BigInt(nft.tokenId)]
            })
          );
        }

        await writeContractAsync({
          address: batchHelperAddress,
          abi: archetypeBatchAbi,
          functionName: "executeBatch",
          args: [targets, values, datas],
          ...gas
        });

        setShowBatchExplanation(false);
        setStatus("✅ All NFTs transferred in one transaction.");
      }
    } catch (error) {
      setShowApprovalExplanation(false);
      setShowBatchExplanation(false);
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

      {/* Tooltip Explanations */}
      {showApprovalExplanation && (
        <div className="mb-2 p-2 bg-yellow-100 rounded">
          <b>Heads up:</b> You’ll see a wallet popup saying “Approve REVERSE with no spend limit.” This is needed for batch transfers and is standard for all NFT dApps.
        </div>
      )}
      {showBatchExplanation && (
        <div className="mb-2 p-2 bg-blue-100 rounded">
          <b>Next step:</b> After approval, you’ll see a wallet popup for “Execute Batch” to transfer your NFTs.
        </div>
      )}

      <button
        onClick={handleTransfer}
        disabled={txInProgress}
        className="w-full py-2 px-4 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
      >
        {txInProgress ? "Transferring..." : mode === "single" ? "Transfer NFT" : "Transfer Selected NFTs"}
      </button>

      {status && (
        <p className="mt-4 text-sm text-gray-700 dark:text-gray-200">
          {status}
        </p>
      )}
    </div>
  );
}
