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
  useConnect,
} from "thirdweb/react";
import { smartWallet, embeddedWallet } from "thirdweb/wallets";

const client = createThirdwebClient({
  clientId: "40cb8b1796ed4c206ecd1445911c5ab8",
});

const nftContractAddress = "0x28D744dAb5804eF913dF1BF361E06Ef87eE7FA47";

const smartWalletConfig = smartWallet({
  factoryAddress: "0x10046F0E910Eea3Bc03a23CAb8723bF6b405FBB2",
  gasless: false,                // keep false while testing
  client,
  personalWallets: [embeddedWallet()],
});

export default function NFTSmartWalletTransfer({ nfts }) {
  const account = useActiveAccount();          // smart-wallet context
  const { connect } = useConnect();

  const [contract, setContract]       = useState(null);
  const [recipient, setRecipient]     = useState("");
  const [selectedTokenIds, setIds]    = useState([]);
  const [status, setStatus]           = useState("");
  const [txInProgress, setBusy]       = useState(false);

  /* ————————————————— load ERC-721 contract ————————————————— */
  useEffect(() => {
    (async () => {
      setContract(
        getContract({ client, chain: base, address: nftContractAddress })
      );
    })();
  }, []);

  /* ————————————————— handlers ————————————————— */
  const handleCheckbox = (id) =>
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const connectSmartWallet = async () => {
    try {
      await connect(smartWalletConfig);
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to connect Smart Wallet.");
    }
  };

  const handleBatchTransfer = async () => {
    /* basic guards */
    if (!recipient.match(/^0x[a-fA-F0-9]{40}$/))
      return setStatus("❌ Invalid recipient address.");
    if (!account || !contract)      return setStatus("❌ Wallet not connected.");
    if (selectedTokenIds.length === 0)
      return setStatus("❌ Please select at least one NFT.");

    setBusy(true);
    setStatus("⏳ Sending batch transaction …");

    try {
      /* build multicall */
      const batchCalls = selectedTokenIds.map((id) =>
        prepareContractCall({
          contract,
          method: "safeTransferFrom",
          params: [account.address, recipient, id],
        })
      );

      /* 🔑 this actually submits the multicall */
      await account.execute(batchCalls);

      setStatus("✅ NFTs transferred in one smart-wallet tx.");
    } catch (err) {
      console.error(err);
      setStatus("❌ Transaction failed.");
    } finally {
      setBusy(false);
    }
  };

  /* ————————————————— UI ————————————————— */
  return (
    <div className="p-6 rounded-xl shadow-md bg-white dark:bg-dark-200 mt-6">
      <h2 className="text-xl font-semibold mb-4">
        Smart-Wallet NFT Batch Transfer
      </h2>

      <ConnectButton client={client} />

      <button
        onClick={connectSmartWallet}
        className="mt-4 w-full py-2 bg-blue-600 text-white rounded"
      >
        Connect Smart Wallet
      </button>

      {/* NFT picker */}
      <div className="my-4">
        <label className="block mb-1 text-sm">Select NFTs:</label>
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
          {nfts.map(({ tokenId, name }) => (
            <label key={tokenId} className="text-sm">
              <input
                type="checkbox"
                checked={selectedTokenIds.includes(tokenId)}
                onChange={() => handleCheckbox(tokenId)}
                className="mr-1"
              />
              #{tokenId} — {name}
            </label>
          ))}
        </div>
      </div>

      {/* recipient */}
      <input
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        placeholder="Recipient 0x…"
        className="w-full p-2 border rounded mb-4"
      />

      <button
        onClick={handleBatchTransfer}
        disabled={txInProgress}
        className="w-full py-2 bg-primary-600 text-white rounded disabled:opacity-50"
      >
        {txInProgress ? "Transferring…" : "Batch Transfer"}
      </button>

      {status && <p className="mt-4 text-sm">{status}</p>}
    </div>
  );
}
