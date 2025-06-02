"use client";

import { useEffect, useState } from "react";
import {
  createThirdwebClient,
  getContract,
} from "thirdweb";
import { base } from "thirdweb/chains";
import {
  ThirdwebProvider,
  ConnectButton,
  useActiveAccount,
  useSendTransaction,
  useConnect,
} from "thirdweb/react";
import {
  smartWallet,
  embeddedWallet,
} from "thirdweb/wallets";
import { safeTransferFrom } from "thirdweb/extensions/erc721";

const client = createThirdwebClient({
  clientId: "40cb8b1796ed4c206ecd1445911c5ab8",
});

const nftContractAddress = "0x28D744dAb5804eF913dF1BF361E06Ef87eE7FA47";

const smartWalletConfig = smartWallet({
  factoryAddress: "0x10046F0E910Eea3Bc03a23CAb8723bF6b405FBB2", // smart wallet factory
  gasless: true,
  client,
  personalWallets: [embeddedWallet()],
});

export default function NFTSmartWalletTransfer({ nfts }) {
  const account = useActiveAccount();
  const [recipient, setRecipient] = useState("");
  const [selectedTokenIds, setSelectedTokenIds] = useState([]);
  const [status, setStatus] = useState("");
  const [txInProgress, setTxInProgress] = useState(false);
  const { mutate: sendTransaction } = useSendTransaction();
  const { connect } = useConnect();
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const load = async () => {
      const c = getContract({
        client,
        chain: base,
        address: nftContractAddress,
      });
      setContract(c);
    };
    load();
  }, []);

  const handleCheckboxChange = (tokenId) => {
    setSelectedTokenIds((prev) =>
      prev.includes(tokenId)
        ? prev.filter((id) => id !== tokenId)
        : [...prev, tokenId]
    );
  };

  const handleConnectSmartWallet = async () => {
    try {
      await connect(smartWalletConfig);
    } catch (err) {
      console.error("Failed to connect Smart Wallet:", err);
      setStatus("❌ Failed to connect Smart Wallet.");
    }
  };

  const handleBatchTransfer = async () => {
    if (!recipient || !recipient.startsWith("0x") || recipient.length !== 42) {
      setStatus("❌ Invalid recipient address.");
      return;
    }

    if (!account || !contract) {
      setStatus("❌ Wallet not connected.");
      return;
    }

    if (selectedTokenIds.length === 0) {
      setStatus("❌ Please select at least one NFT.");
      return;
    }

    setTxInProgress(true);
    setStatus("⏳ Sending batch transaction via Smart Wallet...");

    try {
      const batchCalls = selectedTokenIds.map((tokenId) =>
        safeTransferFrom({
          contract,
          from: account.address,
          to: recipient,
          tokenId,
        })
      );

      // ⚠️ This is the line that causes false positive success
      await sendTransaction(batchCalls);

      setStatus("✅ NFTs transferred in one smart wallet transaction.");
    } catch (err) {
      console.error(err);
      setStatus("❌ Transaction failed.");
    } finally {
      setTxInProgress(false);
    }
  };

  return (
    <div className="p-6 rounded-xl shadow-md bg-white dark:bg-dark-200 mt-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Smart Wallet NFT Batch Transfer
      </h2>

      <ConnectButton client={client} />

      <button
        onClick={handleConnectSmartWallet}
        className="mt-4 w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Connect Smart Wallet
      </button>

      <div className="mb-4 mt-4">
        <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
          Select NFTs:
        </label>
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
          {nfts.map((nft) => (
            <label key={nft.tokenId} className="text-sm text-gray-700 dark:text-white">
              <input
                type="checkbox"
                checked={selectedTokenIds.includes(nft.tokenId)}
                onChange={() => handleCheckboxChange(nft.tokenId)}
                className="mr-1"
              />
              #{nft.tokenId} — {nft.name}
            </label>
          ))}
        </div>
      </div>

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
        onClick={handleBatchTransfer}
        disabled={txInProgress}
        className="w-full py-2 px-4 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
      >
        {txInProgress ? "Transferring..." : "Batch Transfer via Smart Wallet"}
      </button>

      {status && (
        <p className="mt-4 text-sm text-gray-700 dark:text-gray-200">{status}</p>
      )}
    </div>
  );
}
