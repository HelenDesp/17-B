import { useState, useEffect } from "react";
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

const TRANSFER_MODES = [
  { value: "single", label: "Single" },
  { value: "multiple", label: "Multiple" },
  { value: "all", label: "All" },
];

export default function NFTTransfer({
  nfts,
  selectedNFTsFromDashboard = [],
  setSelectedNFTsFromDashboard,
  chainId = 8453,
  fetchNFTs // <-- this is the new prop for refreshin
}) {
  const { address } = useAccount();
  const [recipient, setRecipient] = useState("");
  const [mode, setMode] = useState("single");
  const [status, setStatus] = useState("");
  const [txInProgress, setTxInProgress] = useState(false);

  useEffect(() => {
    if (mode === "all" && typeof setSelectedNFTsFromDashboard === "function" && nfts.length) {
      setSelectedNFTsFromDashboard(nfts.map(n => n.tokenId));
    }
  }, [mode, nfts, setSelectedNFTsFromDashboard]);  

  const { writeContractAsync } = useWriteContract();

  const contractAddress = "0x28D744dAb5804eF913dF1BF361E06Ef87eE7FA47";
  const batchHelperAddress = getArchetypeBatchAddress(chainId);

  const client = createPublicClient({
    chain: base,
    transport: http()
  });

  const getLowGasFee = async () => {
    const block = await client.getBlock();
    const baseFeePerGas = block.baseFeePerGas ?? 0n;
    const maxPriorityFeePerGas = 1_000_000n; // 0.000001 gwei
    const maxFeePerGas = baseFeePerGas + maxPriorityFeePerGas;
    return { maxPriorityFeePerGas, maxFeePerGas };
  };

  // Which NFTs to transfer:
  const getNFTsToTransfer = () => {
    if (mode === "single") {
      if (!selectedNFTsFromDashboard || selectedNFTsFromDashboard.length === 0) return [];
      const nft = nfts.find(nft => nft.tokenId === selectedNFTsFromDashboard[0]);
      return nft ? [nft] : [];
    }
    if (mode === "multiple") {
      if (!selectedNFTsFromDashboard || selectedNFTsFromDashboard.length === 0) return [];
      return nfts.filter(nft => selectedNFTsFromDashboard.includes(nft.tokenId));
    }
    if (mode === "all") {
      return nfts;
    }
    return [];
  };

  const handleTransfer = async () => {
    setStatus("");
    setTxInProgress(true);

    // Validate recipient
    if (!recipient || !recipient.startsWith("0x") || recipient.length !== 42) {
      setStatus("❌ Invalid recipient address.");
      setTxInProgress(false);
      return;
    }

    const nftsToTransfer = getNFTsToTransfer();

    // Selection error messages
    if (mode === "single") {
      if (!selectedNFTsFromDashboard || selectedNFTsFromDashboard.length === 0) {
        setStatus("❌ Please select NFT to transfer.");
        setTxInProgress(false);
        return;
      }
    }
    if (mode === "multiple") {
      if (!selectedNFTsFromDashboard || selectedNFTsFromDashboard.length === 0) {
        setStatus("❌ Please select NFT(s) to transfer.");
        setTxInProgress(false);
        return;
      }
    }
    if (!nftsToTransfer.length) {
      setStatus("❌ Please select NFT(s) to transfer.");
      setTxInProgress(false);
      return;
    }

    setStatus("⏳ Sending transaction...");

    try {
      const gas = await getLowGasFee();

      if (mode === "single") {
        await writeContractAsync({
          address: contractAddress,
          abi: erc721TransferAbi,
          functionName: "safeTransferFrom",
          args: [address, recipient, nftsToTransfer[0].tokenId],
          ...gas
        });
        setStatus("✅ NFT transferred successfully.");

      } else {
        // Check approval for batch helper
        const isApproved = await client.readContract({
          address: contractAddress,
          abi: erc721TransferAbi,
          functionName: "isApprovedForAll",
          args: [address, batchHelperAddress]
        });

        if (!isApproved) {
          await writeContractAsync({
            address: contractAddress,
            abi: erc721TransferAbi,
            functionName: "setApprovalForAll",
            args: [batchHelperAddress, true],
            ...gas
          });
        }

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

        setStatus(
          mode === "all"
            ? "✅ All NFTs transferred in one transaction."
            : "✅ Selected NFTs transferred in one transaction."
        );
        if (mode === "multiple" && setSelectedNFTsFromDashboard) {
          setSelectedNFTsFromDashboard([]);
        }
      }
	        // --- REFRESH NFTs after transfer ---
	  if (fetchNFTs && typeof fetchNFTs.current === "function") {
		await fetchNFTs.current();
	  }	  
	  
    } catch (error) {
      console.error(error);
      setStatus("❌ Transaction failed.");
    } finally {
      setTxInProgress(false);
    }
  };

  return (
    <div className="bg-white dark:bg-dark-200 border-b2 shadow-card dark:shadow-card-dark p-6 mt-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Transfer Your NFT(s)
      </h2>

      {/* Mode select as square checkboxes (styled as a select group) */}
      <div className="mb-4 flex gap-4">
        {TRANSFER_MODES.map(opt => (
<button
  key={opt.value}
  className={`flex items-center px-3 py-2 border shadow-sm text-base font-medium transition
    ${mode === opt.value
      ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
      : 'bg-white dark:bg-black text-black dark:text-white border-black dark:border-white'
    }`}
  onClick={() => {
    setMode(opt.value);
    setStatus("");
  }}
  type="button"
>
  <span
    className={`rvg-checkbox-trnf w-5 h-5 mr-rvg mr-4 flex items-center justify-center
      ${mode === opt.value ? 'checked' : ''}`}
  />
  {opt.label}
</button>
        ))}
      </div>

      <div className="mb-4">
        <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
          Recipient Wallet Address:
        </label>
        <input
          type="text"
          value={recipient}
          onChange={e => setRecipient(e.target.value)}
          placeholder="0x..."
          className="w-full p-2 border !border-black dark:!border-white bg-white dark:bg-black text-black dark:text-white placeholder-black dark:placeholder-white focus:border-black dark:focus:border-white focus:border-[2px] focus:outline-none focus:ring-0 rounded-none"
        />
      </div>

      <button
        onClick={handleTransfer}
        disabled={txInProgress}
        className="w-full px-4 py-1.5 border-2 border-gray-900 dark:border-white bg-light-100 dark:bg-dark-300 text-gray-900 dark:text-white text-sm [font-family:'Cygnito_Mono',sans-serif] uppercase tracking-wide rounded-none transition-colors duration-200 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-50"
      >
        {txInProgress
          ? "Transferring..."
          : mode === "single"
          ? "Transfer NFT"
          : mode === "multiple"
          ? "Transfer Selected NFTs"
          : "Transfer All NFTs"}
      </button>
      {mode === "single" && selectedNFTsFromDashboard && selectedNFTsFromDashboard.length > 1 && (
        <div className="mt-2 text-xs text-gray-700 dark:text-white text-center">
          Only the first selected NFT will be transferred.
        </div>
      )}

      {status && (
        <p className="mt-4 text-sm text-gray-700 dark:text-gray-200">
          {status}
        </p>
      )}
    </div>
  );
}
