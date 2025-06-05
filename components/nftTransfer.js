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

// Helper for option list
const TRANSFER_MODES = [
  { value: "single", label: "Single" },
  { value: "multiple", label: "Multiple" },
  { value: "all", label: "All" },
];

export default function NFTTransfer({ nfts, selectedNFTsFromDashboard, setSelectedNFTsFromDashboard, chainId = 8453 }) {
  const { address } = useAccount();
  const [recipient, setRecipient] = useState("");
  const [mode, setMode] = useState("single");
  const [selectedTokenId, setSelectedTokenId] = useState(null); // single
  const [localSelectedNFTs, setLocalSelectedNFTs] = useState([]); // multiple
  const [status, setStatus] = useState("");
  const [txInProgress, setTxInProgress] = useState(false);

  // Tooltip states
  const [showApprovalExplanation, setShowApprovalExplanation] = useState(false);
  const [showBatchExplanation, setShowBatchExplanation] = useState(false);
  const [showSingleTooltip, setShowSingleTooltip] = useState(false);

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

  // Helper: Which NFTs are being transferred this time?
  const getNFTsToTransfer = () => {
    if (mode === "single") {
      const nft = nfts.find(nft => nft.tokenId === selectedTokenId);
      return nft ? [nft] : [];
    }
    if (mode === "multiple") {
      // Use selection from Dashboard/NFTViewer if present
      return (selectedNFTsFromDashboard?.length ? nfts.filter(nft => selectedNFTsFromDashboard.includes(String(nft.tokenId))) : localSelectedNFTs.map(tokenId => nfts.find(nft => nft.tokenId === tokenId))).filter(Boolean);
    }
    if (mode === "all") {
      return nfts;
    }
    return [];
  };

  const handleTransfer = async () => {
    if (!recipient || !recipient.startsWith("0x") || recipient.length !== 42) {
      setStatus("❌ Invalid recipient address.");
      return;
    }

    const nftsToTransfer = getNFTsToTransfer();

    if (!nftsToTransfer.length) {
      setStatus("❌ Please select NFT(s) to transfer.");
      return;
    }

    setTxInProgress(true);
    setStatus("⏳ Sending transaction...");

    try {
      const gas = await getLowGasFee();

      if (mode === "single") {
        setShowSingleTooltip(true);
        setShowApprovalExplanation(false);
        setShowBatchExplanation(false);

        await writeContractAsync({
          address: contractAddress,
          abi: erc721TransferAbi,
          functionName: "safeTransferFrom",
          args: [address, recipient, nftsToTransfer[0].tokenId],
          ...gas
        });
        setShowSingleTooltip(false);
        setStatus("✅ NFT transferred successfully.");
      } else {
        // --- MULTIPLE/ALL BATCH MODE ---
        setShowSingleTooltip(false);
        // Check approval for batch helper
        const isApproved = await client.readContract({
          address: contractAddress,
          abi: erc721TransferAbi,
          functionName: "isApprovedForAll",
          args: [address, batchHelperAddress]
        });

        if (!isApproved) {
          setShowApprovalExplanation(true);
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
        setShowBatchExplanation(true);

        // Build batch arrays
        const targets = [];
        const values = [];
        const datas = [];

        for (const nft of nftsToTransfer) {
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
        setStatus("✅ Selected NFTs transferred in one transaction.");
        if (mode === "multiple" && setSelectedNFTsFromDashboard) {
          setSelectedNFTsFromDashboard([]); // reset selection
        }
      }
    } catch (error) {
      setShowSingleTooltip(false);
      setShowApprovalExplanation(false);
      setShowBatchExplanation(false);
      console.error(error);
      setStatus("❌ Transaction failed.");
    } finally {
      setTxInProgress(false);
    }
  };

  // Checkbox UI for "multiple" mode selection (local)
  const toggleSelectNFT = (tokenId) => {
    setLocalSelectedNFTs(prev =>
      prev.includes(tokenId)
        ? prev.filter(id => id !== tokenId)
        : [...prev, tokenId]
    );
  };

  // ---- UI ----
  return (
    <div className="bg-white dark:bg-dark-200 rounded-xl shadow-card dark:shadow-card-dark p-6 mt-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Transfer Your NFT(s)
      </h2>

      {/* Mode select as square checkboxes (styled as a select group) */}
      <div className="mb-4 flex gap-4">
        {TRANSFER_MODES.map(opt => (
          <button
            key={opt.value}
            className={`flex items-center px-3 py-2 border rounded shadow-sm text-base font-medium transition
              ${mode === opt.value
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-gray-100 dark:bg-dark-100 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-600'
              }`}
            onClick={() => {
              setMode(opt.value);
              setShowSingleTooltip(false);
              setShowApprovalExplanation(false);
              setShowBatchExplanation(false);
              setStatus("");
              // Reset selection if switching away from "multiple"
              if (opt.value !== "multiple") setLocalSelectedNFTs([]);
            }}
            type="button"
          >
            <span
              className={`w-5 h-5 border mr-2 flex items-center justify-center rounded-sm 
                ${mode === opt.value ? 'bg-white border-primary-600' : 'bg-gray-200 border-gray-400'}`}
            >
              {mode === opt.value && (
                <svg className="w-3 h-3 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" />
                </svg>
              )}
            </span>
            {opt.label}
          </button>
        ))}
      </div>

      {/* NFT selection for single/multiple/all */}
      {mode === "single" && (
        <div className="mb-4">
          <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
            Select NFT:
          </label>
          <select
            value={selectedTokenId || ""}
            onChange={e => setSelectedTokenId(e.target.value)}
            className="w-full p-2 border rounded dark:bg-dark-300 dark:text-white"
          >
            <option value="">-- Select NFT --</option>
            {nfts.map(nft => (
              <option key={nft.tokenId} value={nft.tokenId}>
                #{nft.tokenId} — {nft.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {mode === "multiple" && (
        <div className="mb-4">
          <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
            Select NFTs to transfer:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {nfts.map(nft => (
              <label
                key={nft.tokenId}
                className={`flex items-center p-2 border rounded cursor-pointer
                  ${localSelectedNFTs.includes(nft.tokenId)
                    ? 'bg-primary-100 border-primary-600'
                    : 'bg-gray-50 dark:bg-dark-100 border-gray-200 dark:border-dark-400'
                  }`}
              >
                <input
                  type="checkbox"
                  checked={localSelectedNFTs.includes(nft.tokenId)}
                  onChange={() => toggleSelectNFT(nft.tokenId)}
                  className="mr-2 accent-primary-600"
                />
                <span>#{nft.tokenId} — {nft.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4">
        <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
          Recipient Wallet Address:
        </label>
        <input
          type="text"
          value={recipient}
          onChange={e => setRecipient(e.target.value)}
          placeholder="0x..."
          className="w-full p-2 border rounded dark:bg-dark-300 dark:text-white"
        />
      </div>

      {/* Tooltip Explanations */}
      {showSingleTooltip && (
        <div className="mb-2 p-2 bg-green-100 rounded">
          <b>Single Transfer:</b> You’ll see a wallet popup for transferring your selected NFT.
        </div>
      )}
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
        {txInProgress ? "Transferring..." : mode === "single"
          ? "Transfer NFT"
          : mode === "multiple"
          ? "Transfer Selected NFTs"
          : "Transfer All NFTs"}
      </button>

      {status && (
        <p className="mt-4 text-sm text-gray-700 dark:text-gray-200">
          {status}
        </p>
      )}
    </div>
  );
}
