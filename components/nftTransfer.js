import { useState } from "react";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { encodeFunctionData } from "viem";
import { base } from "viem/chains";

const erc721Abi = [
  {
    name: "transferFrom",
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
    name: "ownerOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "owner", type: "address" }]
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
  }
];

const isApprovedForAllAbi = [
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

const executorAbi = [
  {
    name: "execute",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "calls", type: "bytes[]" },
      { name: "targets", type: "address[]" }
    ],
    outputs: []
  }
];

export default function BatchTransfer({ nfts }) {
  const { address: sender } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const [recipient, setRecipient] = useState("");
  const [status, setStatus] = useState("");
  const [txInProgress, setTxInProgress] = useState(false);
  const [mode, setMode] = useState("batch");
  const [selectedTokenId, setSelectedTokenId] = useState(null);

  const nftContract = "0x28D744dAb5804eF913dF1BF361E06Ef87eE7FA47";
  const executorAddress = "0xca006CDA54644010aa869Ced9DDaAe85b54937Ba";

  // PATCHED handleTransfer for deep debugging
  const handleTransfer = async () => {
    if (!recipient.startsWith("0x") || recipient.length !== 42) {
      setStatus("❌ Invalid recipient address");
      return;
    }

    if (mode === "single" && !selectedTokenId) {
      setStatus("❌ Please select a token");
      return;
    }

    setTxInProgress(true);
    setStatus("⏳ Validating...");

    try {
      if (mode === "single") {
        await writeContractAsync({
          address: nftContract,
          abi: erc721Abi,
          functionName: "transferFrom",
          args: [sender, recipient, BigInt(selectedTokenId)],
          chain: base,
          gas: 120000n,
        });
        setStatus("✅ Single transfer successful.");
      } else {
        const calls = [];
        const targets = [];

        // DEBUG: Log owner and approval for each NFT
        for (let nft of nfts) {
          const owner = await publicClient.readContract({
            address: nftContract,
            abi: erc721Abi,
            functionName: "ownerOf",
            args: [BigInt(nft.tokenId)]
          });

          const approved = await publicClient.readContract({
            address: nftContract,
            abi: isApprovedForAllAbi,
            functionName: "isApprovedForAll",
            args: [owner, executorAddress]
          });

          console.log(`TokenID: ${nft.tokenId} | owner: ${owner} | isApprovedForAll: ${approved}`);

          if (owner.toLowerCase() !== sender.toLowerCase()) {
            console.warn(`Skipping token ${nft.tokenId} not owned by sender`);
            continue;
          }

          if (!approved) {
            setStatus(`⏳ Approving executor for token ${nft.tokenId}...`);
            const tx = await writeContractAsync({
              address: nftContract,
              abi: erc721Abi,
              functionName: "setApprovalForAll",
              args: [executorAddress, true],
              chain: base
            });
            setStatus(`✅ Approval tx sent for token ${nft.tokenId}. Waiting for confirmation...`);
            // Wait for block confirmation (optional, but safest)
            await new Promise(resolve => setTimeout(resolve, 12000));
          }

          calls.push(
            encodeFunctionData({
              abi: erc721Abi,
              functionName: "transferFrom",
              args: [sender, recipient, BigInt(nft.tokenId)]
            })
          );
          targets.push(nftContract);
        }

        if (calls.length === 0) {
          setStatus("❌ No valid NFTs to transfer");
          setTxInProgress(false);
          return;
        }

        // Estimate gas dynamically
        const estimatedGas = await publicClient.estimateContractGas({
          address: executorAddress,
          abi: executorAbi,
          functionName: "execute",
          args: [calls, targets],
        });
        console.log(`Estimated gas for batch: ${estimatedGas.toString()}`);

        setStatus("⏳ Sending batch...");

        await writeContractAsync({
          address: executorAddress,
          abi: executorAbi,
          functionName: "execute",
          args: [calls, targets],
          chain: base,
          gas: estimatedGas
        });

        setStatus("✅ Batch transfer submitted!");
      }
    } catch (err) {
      console.error("Batch transfer error:", err);
      setStatus(`❌ Transfer failed: ${err.shortMessage || err.message || "Unknown error"}`);
    } finally {
      setTxInProgress(false);
    }
  };

  return (
    <div className="bg-white dark:bg-dark-200 p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">NFT Transfer</h2>

      <div className="mb-4">
        <label className="mr-4">
          <input
            type="radio"
            value="batch"
            checked={mode === "batch"}
            onChange={() => setMode("batch")}
            className="mr-1"
          />
          Batch Transfer
        </label>
        <label className="ml-4">
          <input
            type="radio"
            value="single"
            checked={mode === "single"}
            onChange={() => setMode("single")}
            className="mr-1"
          />
          Single Transfer
        </label>
      </div>

      {mode === "single" && (
        <div className="mb-4">
          <label className="block text-sm mb-1">Select NFT</label>
          <select
            value={selectedTokenId || ""}
            onChange={(e) => setSelectedTokenId(e.target.value)}
            className="w-full p-2 border rounded"
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

      <input
        type="text"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        placeholder="Recipient address"
        className="w-full p-2 mb-4 border rounded"
      />

      <button
        onClick={handleTransfer}
        disabled={txInProgress}
        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {txInProgress ? "Transferring..." : "Transfer NFT(s)"}
      </button>

      {status && <p className="mt-4 text-sm text-gray-800">{status}</p>}
    </div>
  );
}
