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
  useActiveWallet,
  useConnect,
} from "thirdweb/react";
import { smartWallet, embeddedWallet } from "thirdweb/wallets";

const client = createThirdwebClient({
  clientId: "40cb8b1796ed4c206ecd1445911c5ab8",
});

const nftContractAddress = "0x28D744dAb5804eF913dF1BF361E06Ef87eE7FA47";

const smartWalletConfig = smartWallet({
  factoryAddress: "0x10046F0E910Eea3Bc03a23CAb8723bF6b405FBB2",
  gasless: false,                 // turn false while testing
  client,
  personalWallets: [embeddedWallet()],
});

export default function NFTSmartWalletTransfer({ nfts }) {
  const eoaWallet          = useActiveWallet();  // MetaMask / WalletConnect
  const smartAccount       = useActiveAccount(); // may be EOA or AA
  const { connect }        = useConnect();

  const [contract, setContract] = useState(null);
  const [recipient, setRecipient] = useState("");
  const [selectedIds, setSelected] = useState([]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  /* load ERC-721 contract */
  useEffect(() => {
    (async () => {
      setContract(
        getContract({ client, chain: base, address: nftContractAddress })
      );
    })();
  }, []);

  const toggleId = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  /* -------------- batch transfer -------------- */
  const handleBatch = async () => {
    /* quick checks */
    if (!recipient.match(/^0x[a-fA-F0-9]{40}$/))
      return setStatus("❌ Invalid recipient address.");
    if (!contract) return setStatus("❌ Contract not ready.");
    if (selectedIds.length === 0)
      return setStatus("❌ Please select at least one NFT.");
    if (!eoaWallet)
      return setStatus("❌ Connect MetaMask first (top button).");

    /* ensure AA wallet */
    let smart = smartAccount;
    if (!smart || !smart.isSmartAccount) {
      try {
        smart = await connect(smartWalletConfig);   // hydrates & deploys
      } catch (err) {
        console.error(err);
        return setStatus("❌ Could not activate Smart Wallet.");
      }
    }

    setBusy(true);
    setStatus("⏳ Sending batch transaction …");

    try {
      const calls = selectedIds.map((id) =>
        prepareContractCall({
          contract,
          method: "safeTransferFrom",
          params: [smart.address, recipient, id],
        })
      );

      await smart.execute(calls);                   // one on-chain tx
      setStatus("✅ NFTs transferred in one smart-wallet tx.");
    } catch (err) {
      console.error(err);
      setStatus("❌ Transaction failed.");
    } finally {
      setBusy(false);
    }
  };

  /* UI */
  return (
    <ThirdwebProvider client={client} activeChain={base} wallets={[smartWalletConfig]}>
      <div className="p-6 rounded-xl shadow-md bg-white dark:bg-dark-200 mt-6">
        <h2 className="text-xl font-semibold mb-4">Smart-Wallet NFT Batch Transfer</h2>

        {/* MetaMask / WalletConnect */}
        <ConnectButton client={client} />

        {/* NFT picker */}
        <div className="my-4">
          <label className="block mb-1 text-sm">Select NFTs:</label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {nfts.map(({ tokenId, name }) => (
              <label key={tokenId} className="text-sm">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(tokenId)}
                  onChange={() => toggleId(tokenId)}
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
          onClick={handleBatch}
          disabled={busy}
          className="w-full py-2 bg-primary-600 text-white rounded disabled:opacity-50"
        >
          {busy ? "Transferring…" : "Batch Transfer"}
        </button>

        {status && <p className="mt-4 text-sm">{status}</p>}
      </div>
    </ThirdwebProvider>
  );
}
