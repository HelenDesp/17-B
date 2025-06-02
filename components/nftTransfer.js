
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
  useConnect,
} from "thirdweb/react";
import {
  smartWallet,
  embeddedWallet
} from "thirdweb/wallets";

const client = createThirdwebClient({
  clientId: "40cb8b1796ed4c206ecd1445911c5ab8"
});

const nftContractAddress = "0x28D744dAb5804eF913dF1BF361E06Ef87eE7FA47";

const smartWalletConfig = smartWallet({
  factoryAddress: "0x147FB891Ee911562a7C70E5Eb7F7a4D9f0681f29",
  gasless: true,
  client,
  personalWallets: [embeddedWallet()]
});

export default function NFTTransferConnector({ nfts }) {
  const account = useActiveAccount();
  const { connect, isConnecting } = useConnect();
  const [contract, setContract] = useState(null);
  const [recipient, setRecipient] = useState("");
  const [selectedBatchIds, setSelectedBatchIds] = useState([]);
  const [status, setStatus] = useState("");

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

  const handleSmartWalletConnect = async () => {
    try {
      setStatus("⏳ Connecting Smart Wallet...");
      await connect(smartWalletConfig);
      setStatus("✅ Smart Wallet connected.");
    } catch (err) {
      console.error("❌ Smart Wallet connection failed:", err);
      setStatus("❌ Smart Wallet connection failed.");
    }
  };

  const handleTransfer = async () => {
    console.log("🧠 account:", account);
    if (!account?.address || !contract) {
      setStatus("❌ Smart Wallet not ready.");
      return;
    }

    if (!account?.isSmartAccount) {
      setStatus("❌ This is not a smart account!");
      return;
    }

    if (!recipient.startsWith("0x") || recipient.length !== 42) {
      setStatus("❌ Invalid recipient address.");
      return;
    }

    if (selectedBatchIds.length === 0) {
      setStatus("❌ Please select at least one NFT.");
      return;
    }

    try {
      setStatus("⏳ Sending batch transaction via Smart Wallet...");
      const batchCalls = selectedBatchIds.map((tokenId) =>
        prepareContractCall({
          contract,
          method: "safeTransferFrom",
          params: [account.address, recipient, tokenId]
        })
      );
      await account.execute(batchCalls);
      setStatus("✅ NFTs transferred in one smart wallet transaction.");
    } catch (err) {
      console.error("🚨 Error during batch transfer:", err);
      setStatus("❌ Batch transaction failed.");
    }
  };

  return (
    <ThirdwebProvider client={client} activeChain={base} wallets={[smartWalletConfig]}>
      <div className="p-6 rounded-xl shadow-md bg-white dark:bg-dark-200 mt-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          NFT Transfer via Smart Wallet
        </h2>

        <ConnectButton client={client} />
        <button
          onClick={handleSmartWalletConnect}
          disabled={isConnecting}
          className="mt-4 w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {isConnecting ? "Connecting..." : "Connect Smart Wallet"}
        </button>

        <div className="mt-4">
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

        <div className="mb-4 mt-4">
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
          className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Batch Transfer via Smart Wallet
        </button>

        {status && (
          <p className="mt-4 text-sm text-gray-700 dark:text-gray-200">{status}</p>
        )}
      </div>
    </ThirdwebProvider>
  );
}
