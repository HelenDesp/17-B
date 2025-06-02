"use client";

import { useState, useEffect } from "react";
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
  clientId: "40cb8b1796ed4c206ecd1445911c5ab8", // Replace with your client ID
});

const contractAddress = "0x28D744dAb5804eF913dF1BF361E06Ef87eE7FA47"; // Replace with your ERC721 contract address

const smartWalletConfig = smartWallet({
  factoryAddress: "0x10046F0E910Eea3Bc03a23CAb8723bF6b405FBB2", // Verify for Base
  gasless: false, // Set to true only if relayer is configured
  client,
  personalWallets: [embeddedWallet()],
});

export default function BatchNFTTransfer() {
  const account = useActiveAccount();
  const { mutate: sendTransaction } = useSendTransaction();
  const [recipient, setRecipient] = useState("");
  const [status, setStatus] = useState("");
  const [txInProgress, setTxInProgress] = useState(false);
  const [contract, setContract] = useState(null);

  const { data: nfts, isLoading, error } = useOwnedNFTs({
    contract: getContract({
      client,
      chain: base,
      address: contractAddress,
    }),
    address: account?.address,
  });

  useEffect(() => {
    const c = getContract({
      client,
      chain: base,
      address: contractAddress,
    });
    setContract(c);
  }, []);

  const smartWalletConnected = !!account && account.isSmartAccount && !!account.address;

  const handleBatchTransfer = async () => {
    setStatus("");
    if (!recipient || !recipient.startsWith("0x") || recipient.length !== 42) {
      setStatus("❌ Invalid recipient address.");
      return;
    }
    if (!smartWalletConnected) {
      setStatus("❌ Please connect your Smart Wallet.");
      return;
    }
    if (!nfts || nfts.length === 0) {
      setStatus("❌ No NFTs to transfer.");
      return;
    }
    if (!contract) {
      setStatus("❌ NFT contract not loaded.");
      return;
    }

    setTxInProgress(true);
    setStatus("⏳ Sending batch transaction...");
    try {
      const batchCalls = nfts.map((nft) =>
        prepareContractCall({
          contract,
          method: "safeTransferFrom",
          params: [account.address, recipient, nft.tokenId],
        })
      );
      console.log("Batch calls prepared:", batchCalls);

      if (typeof account.execute === "function") {
        await account.execute(batchCalls);
      } else {
        await sendTransaction(batchCalls);
      }
      setStatus("✅ All NFTs transferred successfully.");
    } catch (error) {
      console.error("Batch transfer error:", error);
      setStatus(`❌ Batch transaction failed: ${error.message}`);
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
      <div className="bg-white dark:bg-dark-200 rounded-xl shadow-card dark:shadow-card-dark p-6 mt-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Batch Transfer NFTs
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
        {isLoading && <p>Loading NFTs...</p>}
        {error && <p>Error loading NFTs: {error.message}</p>}
        {!isLoading && !error && (!nfts || nfts.length === 0) && (
          <p>No NFTs owned.</p>
        )}
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
          onClick={handleBatchTransfer}
          disabled={txInProgress || !smartWalletConnected || !nfts || nfts.length === 0}
          className="w-full py-2 px-4 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
        >
          {txInProgress ? "Transferring..." : "Transfer All NFTs"}
        </button>
        {!smartWalletConnected && (
          <div className="mt-4 text-sm text-yellow-700 bg-yellow-100 rounded p-2 border border-yellow-300">
            To batch transfer, please connect your Smart Wallet above!
            <br />
            <strong>How:</strong> Click "Connect Wallet", select "Smart Wallet (MetaMask)" in the popup.
          </div>
        )}
        {status && (
          <p className="mt-4 text-sm text-gray-700 dark:text-gray-200">
            {status}
          </p>
        )}
        <div className="mt-6 text-xs text-gray-600 dark:text-gray-400">
          <strong>Tip:</strong> Batch transfers use Smart Wallet multicall to send all NFTs in one transaction.
          <br />
          Ensure your Smart Wallet has sufficient gas (ETH on Base).
        </div>
      </div>
    </ThirdwebProvider>
  );
}