
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
  useActiveWallet,
  useConnect,
} from "thirdweb/react";
import {
  smartWallet,
  embeddedWallet,
  walletConnect
} from "thirdweb/wallets";

const client = createThirdwebClient({
  clientId: "40cb8b1796ed4c206ecd1445911c5ab8"
});

const nftContractAddress = "0x28D744dAb5804eF913dF1BF361E06Ef87eE7FA47";

const smartWalletConfig = smartWallet({
  factoryAddress: "0x147FB891Ee911562a7C70E5Eb7F7a4D9f0681f29",
  gasless: true,
  client,
  personalWallets: [walletConnect()]
});

export default function NFTTransferCombinedFixed({ nfts }) {
  const account = useActiveAccount(); // Smart Wallet (after hydration)
  const wallet = useActiveWallet();   // EOA Wallet
  const { connect } = useConnect();

  const [contract, setContract] = useState(null);
  const [recipient, setRecipient] = useState("");
  const [selectedBatchIds, setSelectedBatchIds] = useState([]);
  const [selectedSingleId, setSelectedSingleId] = useState(null);
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

  useEffect(() => {
    const hydrateSmartWallet = async () => {
      try {
        if (wallet && !account) {
          await connect(smartWalletConfig);
        }
      } catch (err) {
        console.error("❌ Smart Wallet hydration failed:", err);
      }
    };
    hydrateSmartWallet();
  }, [wallet]);

  const handleBatchTransfer = async () => {
    if (!account?.address || !contract || !account?.isSmartAccount) {
      setStatus("❌ Smart Wallet not ready.");
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
      const batchCalls = selectedBatchIds.map((tokenId) =>
        prepareContractCall({
          contract,
          method: "safeTransferFrom",
          params: [account.address, recipient, tokenId]
        })
      );
      await account.execute(batchCalls);
      setStatus("✅ Batch transfer complete.");
    } catch (err) {
      console.error(err);
      setStatus("❌ Batch transfer failed.");
    }
  };

  const handleSingleTransfer = async () => {
    if (!wallet || !contract || !selectedSingleId || !recipient) {
      setStatus("❌ Please complete all fields.");
      return;
    }

    try {
      const tx = await contract.write({
        method: "safeTransferFrom",
        params: [wallet.address, recipient, selectedSingleId]
      });
      await tx.wait();
      setStatus("✅ Single NFT transferred.");
    } catch (err) {
      console.error(err);
      setStatus("❌ Single transfer failed.");
    }
  };

  return (
    <ThirdwebProvider client={client} activeChain={base} wallets={[smartWalletConfig]}>
      <div className="p-6 rounded-xl shadow-md bg-white dark:bg-dark-200 mt-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          NFT Transfer (Combined Fixed)
        </h2>

        <ConnectButton client={client} />

        <div className="mt-4 grid gap-4">
          <div>
            <label className="block text-sm mb-1">Recipient Address:</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Single NFT Transfer:</label>
            <select
              onChange={(e) => setSelectedSingleId(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select NFT</option>
              {nfts.map((nft) => (
                <option key={nft.tokenId} value={nft.tokenId}>
                  #{nft.tokenId} — {nft.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleSingleTransfer}
              className="mt-2 w-full py-2 bg-purple-600 text-white rounded"
            >
              Send Single NFT
            </button>
          </div>

          <div>
            <label className="block text-sm mb-1">Batch Transfer (Smart Wallet):</label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {nfts.map((nft) => (
                <label key={nft.tokenId}>
                  <input
                    type="checkbox"
                    checked={selectedBatchIds.includes(nft.tokenId)}
                    onChange={() =>
                      setSelectedBatchIds((prev) =>
                        prev.includes(nft.tokenId)
                          ? prev.filter((id) => id !== nft.tokenId)
                          : [...prev, nft.tokenId]
                      )
                    }
                    className="mr-1"
                  />
                  #{nft.tokenId} — {nft.name}
                </label>
              ))}
            </div>
            <button
              onClick={handleBatchTransfer}
              className="mt-2 w-full py-2 bg-green-600 text-white rounded"
            >
              Batch Transfer via Smart Wallet
            </button>
          </div>

          {status && (
            <div className="text-sm text-gray-700 dark:text-gray-200 mt-2">{status}</div>
          )}
        </div>
      </div>
    </ThirdwebProvider>
  );
}
