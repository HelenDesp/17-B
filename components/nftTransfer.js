"use client";

import { useEffect, useState } from "react";
import {
  createThirdwebClient,
  getContract,
  prepareContractCall,
} from "thirdweb";
import { base } from "thirdweb/chains";
import {
  ThirdwebProvider,
  ConnectButton,
  useActiveAccount,
  useSendTransaction,
} from "thirdweb/react";
import {
  smartWallet,
  embeddedWallet,
} from "thirdweb/wallets";
import { useAccount, useWriteContract } from "wagmi";

// ERC721 abi for legacy EOA transfer
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

const client = createThirdwebClient({
  clientId: "40cb8b1796ed4c206ecd1445911c5ab8",
});

const contractAddress =
  "0x28D744dAb5804eF913dF1BF361E06Ef87eE7FA47";

const smartWalletConfig = smartWallet({
  factoryAddress:
    "0x147FB891Ee911562a7C70E5Eb7F7a4D9f0681f29",
  gasless: true, // fallback to user-paying if no relayer/billing
  client,
  personalWallets: [embeddedWallet()],
});

export default function NFTTransfer({ nfts }) {
  // Standard EOA hooks
  const { address: wagmiAddress } = useAccount();
  const { writeContractAsync } = useWriteContract();
  // Smart Wallet (multicall batch)
  const account = useActiveAccount();
  const { mutate: sendTransaction } = useSendTransaction();

  // UI state
  const [recipient, setRecipient] = useState("");
  const [mode, setMode] = useState("single");
  const [selectedTokenId, setSelectedTokenId] =
    useState(null);
  const [status, setStatus] = useState("");
  const [txInProgress, setTxInProgress] = useState(false);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    if (!contract && mode === "batch") {
      const c = getContract({
        client,
        chain: base,
        address: contractAddress,
      });
      setContract(c);
    }
  }, [mode, contract]);

  // Helper to check smart wallet state
  const smartWalletConnected =
    !!account &&
    account.isSmartAccount &&
    !!account.address;

  const handleTransfer = async () => {
    setStatus("");
    if (
      !recipient ||
      !recipient.startsWith("0x") ||
      recipient.length !== 42
    ) {
      setStatus("❌ Invalid recipient address.");
      return;
    }

    // Single NFT transfer via wagmi/MetaMask EOA
    if (mode === "single") {
      if (!selectedTokenId) {
        setStatus("❌ Please select an NFT to transfer.");
        return;
      }
      if (!wagmiAddress) {
        setStatus(
          "❌ Please connect MetaMask for single transfer.",
        );
        return;
      }
      setTxInProgress(true);
      setStatus("⏳ Sending transaction...");
      try {
        await writeContractAsync({
          address: contractAddress,
          abi: erc721TransferAbi,
          functionName: "safeTransferFrom",
          args: [wagmiAddress, recipient, selectedTokenId],
        });
        setStatus("✅ NFT transferred successfully.");
      } catch (error) {
        console.error(error);
        setStatus("❌ Transaction failed.");
      } finally {
        setTxInProgress(false);
      }
      return;
    }

    // Batch: Smart Wallet multicall
    if (!smartWalletConnected) {
      setStatus(
        "❌ Smart Wallet not connected. Please connect your Smart Wallet above to enable batch transfer.",
      );
      return;
    }
    if (!nfts.length) {
      setStatus("❌ No NFTs to transfer.");
      return;
    }
    if (!contract) {
      setStatus("❌ NFT contract not loaded.");
      return;
    }
    setTxInProgress(true);
    setStatus(
      "⏳ Sending batch transaction via Smart Wallet...",
    );
    try {
      const fromAddress = account.address;
      const batchCalls = nfts.map((nft) =>
        prepareContractCall({
          contract,
          method: "safeTransferFrom",
          params: [fromAddress, recipient, nft.tokenId],
        }),
      );
      if (typeof account.execute === "function") {
        await account.execute(batchCalls);
      } else {
        // fallback
        await sendTransaction(batchCalls);
      }
      setStatus(
        "✅ All NFTs transferred in one batch transaction.",
      );
    } catch (error) {
      console.error(error);
      setStatus("❌ Batch transaction failed.");
    } finally {
      setTxInProgress(false);
    }
  };

  return (
    <ThirdwebProvider
      client={client}
      activeChain={base}
      wallets={[smartWalletConfig]}
    >
      {/* Smart Wallet debug panel */}
      <div
        style={{
          fontSize: "12px",
          color: "blue",
          marginBottom: 8,
        }}
      >
        <strong>Smart Wallet Debug Info:</strong>
        <br />
        account: {account ? "connected" : "not connected"}
        <br />
        isSmartAccount: {String(account?.isSmartAccount)}
        <br />
        walletType: {String(account?.walletType)}
        <br />
        smartWallet address: {String(account?.address)}
        <br />
        wagmiAddress: {String(wagmiAddress)}
      </div>
      <div className="bg-white dark:bg-dark-200 rounded-xl shadow-card dark:shadow-card-dark p-6 mt-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Transfer Your NFT(s)
        </h2>
        <ConnectButton client={client} />
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
            Batch (One transaction via Smart Wallet)
          </label>
        </div>
        {mode === "single" && (
          <div className="mb-4">
            <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
              Select NFT:
            </label>
            <select
              value={selectedTokenId || ""}
              onChange={(e) =>
                setSelectedTokenId(e.target.value)
              }
              className="w-full p-2 border rounded dark:bg-dark-300 dark:text-white"
            >
              <option value="">-- Select NFT --</option>
              {nfts.map((nft) => (
                <option
                  key={nft.tokenId}
                  value={nft.tokenId}
                >
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
          disabled={
            txInProgress ||
            (mode === "batch" && !smartWalletConnected)
          }
          className="w-full py-2 px-4 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
        >
          {txInProgress
            ? "Transferring..."
            : mode === "single"
              ? "Transfer NFT"
              : "Transfer All NFTs (Batch Transaction)"}
        </button>
        {mode === "batch" && !smartWalletConnected && (
          <div className="mt-4 text-sm text-yellow-700 bg-yellow-100 rounded p-2 border border-yellow-300">
            To batch transfer, please connect your Smart
            Wallet above!
            <br />
            <strong>How:</strong> Click "Connect Wallet",
            select "Smart Wallet (MetaMask)" in the popup.
          </div>
        )}
        {status && (
          <p className="mt-4 text-sm text-gray-700 dark:text-gray-200">
            {status}
          </p>
        )}
        <div className="mt-6 text-xs text-gray-600 dark:text-gray-400">
          <strong>Tip:</strong> Single: MetaMask/EOA. Batch:
          Smart Wallet multicall (all NFTs at once).
          <br />
          Users must have gas in their MetaMask or Smart
          Wallet for transfers.
          <br />
        </div>
      </div>
    </ThirdwebProvider>
  );
}
