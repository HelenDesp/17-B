
"use client";

import { useEffect, useState } from "react";
import {
  createThirdwebClient,
  getContract,
  prepareContractCall
} from "thirdweb";
import { base } from "thirdweb/chains";
import {
  ThirdwebProvider,
  ConnectButton,
  useActiveAccount,
} from "thirdweb/react";
import {
  smartWallet,
  embeddedWallet
} from "thirdweb/wallets";
import { useAccount, useWriteContract } from "wagmi";

const wagmiAbi = [
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
  }
];

const client = createThirdwebClient({
  clientId: "40cb8b1796ed4c206ecd1445911c5ab8"
});

const nftContractAddress = "0x28D744dAb5804eF913dF1BF361E06Ef87eE7FA47";

const smartWalletConfig = smartWallet({
  factoryAddress: "0x10046F0E910Eea3Bc03a23CAb8723bF6b405FBB2",
  gasless: true,
  client,
  personalWallets: [embeddedWallet()]
});

export default function NFTTransferFinalSmartBatch({ nfts }) {
  const { address: wagmiAddress } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const account = useActiveAccount(); // Thirdweb Smart Wallet
  const [contract, setContract] = useState(null);
  const [recipient, setRecipient] = useState("");
  const [mode, setMode] = useState("single");
  const [selectedSingleId, setSelectedSingleId] = useState("");
  const [selectedBatchIds, setSelectedBatchIds] = useState([]);
  const [status, setStatus] = useState("");
  const [txInProgress, setTxInProgress] = useState(false);

  useEffect(() => {
    const load = async () => {
      const c = getContract({
        client,
        chain: base,
        address: nftContractAddress
      });
      setContract(c);
    };
    load();
  }, []);

  const handleCheckboxChange = (tokenId) => {
    setSelectedBatchIds((prev) =>
      prev.includes(tokenId)
        ? prev.filter((id) => id !== tokenId)
        : [...prev, tokenId]
    );
  };

  const handleTransfer = async () => {
    if (!recipient || !recipient.startsWith("0x") || recipient.length !== 42) {
      setStatus("❌ Invalid recipient address.");
      return;
    }

    if (mode === "single") {
      if (!selectedSingleId) {
        setStatus("❌ Please select an NFT.");
        return;
      }

      try {
        setTxInProgress(true);
        setStatus("⏳ Sending single transaction...");

        await writeContractAsync({
          address: nftContractAddress,
          abi: wagmiAbi,
          functionName: "safeTransferFrom",
          args: [wagmiAddress, recipient, selectedSingleId]
        });

        setStatus("✅ NFT transferred successfully.");
      } catch (err) {
        console.error(err);
        setStatus("❌ Transaction failed.");
      } finally {
        setTxInProgress(false);
      }
    } else {
      if (!account || !account.address || !contract) {
        setStatus("❌ Smart Wallet not connected.");
        return;
      }

      if (selectedBatchIds.length === 0) {
        setStatus("❌ Please select at least one NFT.");
        return;
      }

      try {
        setTxInProgress(true);
        setStatus("⏳ Sending batch transaction via Smart Wallet...");

        const fromAddress = account.address;

        const batchCalls = selectedBatchIds.map((tokenId) =>
          prepareContractCall({
            contract,
            method: "safeTransferFrom",
            params: [fromAddress, recipient, tokenId]
          })
        );

        await account.execute(batchCalls);

        setStatus("✅ NFTs transferred in one smart wallet transaction.");
      } catch (err) {
        console.error(err);
        setStatus("❌ Batch transaction failed.");
      } finally {
        setTxInProgress(false);
      }
    }
  };

  return (
    <ThirdwebProvider client={client} activeChain={base} wallets={[smartWalletConfig]}>
      <div className="p-6 rounded-xl shadow-md bg-white dark:bg-dark-200 mt-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          NFT Transfer
        </h2>

        <ConnectButton client={client} />

        <div className="mb-4 mt-4">
          <label className="mr-4 text-gray-800 dark:text-white">
            <input
              type="radio"
              value="single"
              checked={mode === "single"}
              onChange={() => setMode("single")}
              className="mr-1"
            />
            Single
          </label>
          <label className="text-gray-800 dark:text-white">
            <input
              type="radio"
              value="batch"
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
              value={selectedSingleId}
              onChange={(e) => setSelectedSingleId(e.target.value)}
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

        {mode === "batch" && (
          <div className="mb-4">
            <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
              Select NFTs:
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {nfts.map((nft) => (
                <label key={nft.tokenId} className="text-sm text-gray-700 dark:text-white">
                  <input
                    type="checkbox"
                    checked={selectedBatchIds.includes(nft.tokenId)}
                    onChange={() => handleCheckboxChange(nft.tokenId)}
                    className="mr-1"
                  />
                  #{nft.tokenId} — {nft.name}
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
          {txInProgress
            ? "Transferring..."
            : mode === "single"
            ? "Transfer NFT"
            : "Batch Transfer via Smart Wallet"}
        </button>

        {status && (
          <p className="mt-4 text-sm text-gray-700 dark:text-gray-200">{status}</p>
        )}
      </div>
    </ThirdwebProvider>
  );
}
