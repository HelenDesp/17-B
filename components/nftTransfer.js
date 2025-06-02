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
  useOwnedNFTs,
} from "thirdweb/react";
import { smartWallet, embeddedWallet } from "thirdweb/wallets";

const client = createThirdwebClient({
  clientId: "40cb8b1796ed4c206ecd1445911c5ab8",
});

const nftContractAddress = "0x28D744dAb5804eF913dF1BF361E06Ef87eE7FA47";

const smartWalletConfig = smartWallet({
  factoryAddress: "0x10046F0E910Eea3Bc03a23CAb8723bF6b405FBB2",
  gasless: false, // Disable gasless unless relayer is configured
  client,
  personalWallets: [embeddedWallet()],
});

export default function NFTSmartWalletTransfer() {
  const account = useActiveAccount();
  const { mutate: sendTransaction } = useSendTransaction();
  const [recipient, setRecipient] = useState("");
  const [selectedTokenIds, setSelectedTokenIds] = useState([]);
  const [status, setStatus] = useState("");
  const [txInProgress, setTxInProgress] = useState(false);
  const [contract, setContract] = useState(null);

  const { data: nfts, isLoading: nftsLoading, error: nftsError } = useOwnedNFTs({
    contract: contract,
    address: account?.address,
  });

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

  useEffect(() => {
    if (nfts) {
      console.log("Owned NFTs:", nfts);
    }
  }, [nfts]);

  const handleCheckboxChange = (tokenId) => {
    setSelectedTokenIds((prev) =>
      prev.includes(tokenId)
        ? prev.filter((id) => id !== tokenId)
        : [...prev, tokenId]
    );
  };

  const handleApproveAll = async () => {
    if (!account || !contract) {
      setStatus("❌ Wallet or contract not loaded.");
      return;
    }
    setTxInProgress(true);
    setStatus("⏳ Approving Smart Wallet for NFT transfers...");
    try {
      const transaction = prepareContractCall({
        contract,
        method: "setApprovalForAll",
        params: [account.address, true],
      });
      await sendTransaction([transaction]);
      setStatus("✅ Smart Wallet approved for transfers.");
    } catch (err) {
      console.error("Approval error:", err);
      setStatus(`❌ Approval failed: ${err.message}`);
    } finally {
      setTxInProgress(false);
    }
  };

  const handleBatchTransfer = async () => {
    if (!recipient || !recipient.startsWith("0x") || recipient.length !== 42) {
      setStatus("❌ Invalid recipient address.");
      return;
    }
    if (!account || !contract) {
      setStatus("❌ Wallet or contract not loaded.");
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
        prepareContractCall({
          contract,
          method: "safeTransferFrom",
          params: [account.address, recipient, tokenId],
        })
      );
      console.log("Batch calls prepared:", batchCalls);

      let txResult;
      if (typeof account.execute === "function") {
        txResult = await account.execute(batchCalls);
      } else {
        txResult = await sendTransaction(batchCalls);
      }
      console.log("Transaction hash:", txResult.transactionHash);
      setStatus(
        `✅ NFTs transferred in one smart wallet transaction. <a href="https://basescan.org/tx/${txResult.transactionHash}" target="_blank" rel="noopener noreferrer">View on Basescan</a>`
      );
    } catch (err) {
      console.error("Batch transfer error:", err);
      setStatus(`❌ Transaction failed: ${err.message}`);
    } finally {
      setTxInProgress(false);
    }
  };

  return (
    <ThirdwebProvider client={client} activeChain={base} wallets={[smartWalletConfig]}>
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
      </div>
      <div className="p-6 rounded-xl shadow-md bg-white dark:bg-dark-200 mt-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Smart Wallet NFT Batch Transfer
        </h2>
        <ConnectButton
          client={client}
          wallets={[smartWalletConfig]}
          chain={base}
          connectModal={{
            title: "Connect Wallet",
            description: "Select 'Smart Wallet (MetaMask)' for batch transfers.",
          }}
        />
        {nftsLoading && <p>Loading NFTs...</p>}
        {nftsError && <p>Error loading NFTs: {nftsError.message}</p>}
        {!nftsLoading && !nftsError && (!nfts || nfts.length === 0) && (
          <p>No NFTs owned.</p>
        )}
        {nfts && nfts.length > 0 && (
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
                  #{nft.tokenId} — {nft.name || "Unnamed"}
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
          onClick={handleApproveAll}
          disabled={txInProgress || !account}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 mb-4"
        >
          {txInProgress ? "Approving..." : "Approve Smart Wallet for Transfers"}
        </button>
        <button
          onClick={handleBatchTransfer}
          disabled={txInProgress || !account || selectedTokenIds.length === 0}
          className="w-full py-2 px-4 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
        >
          {txInProgress ? "Transferring..." : "Batch Transfer via Smart Wallet"}
        </button>
        {status && (
          <p
            className="mt-4 text-sm text-gray-700 dark:text-gray-200"
            dangerouslySetInnerHTML={{ __html: status }}
          />
        )}
      </div>
    </ThirdwebProvider>
  );
}