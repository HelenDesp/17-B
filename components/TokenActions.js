import React, { useState } from "react";
import { useAppKit } from "@reown/appkit/react";
import { Across } from "@across-protocol/sdk";
import { createWalletClient, custom, http, parseUnits } from "viem";
import { useAccount } from "wagmi";

const CHAINS = {
  ethereum: { id: 1, name: "Ethereum" },
  base: { id: 8453, name: "Base" },
  arbitrum: { id: 42161, name: "Arbitrum" },
  optimism: { id: 10, name: "Optimism" },
  polygon: { id: 137, name: "Polygon" },
  bsc: { id: 56, name: "BNB Chain" },
};

const TOKENS = ["ETH", "USDC", "USDT", "DAI"];

export default function TokenActions() {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();

  const [fromChain, setFromChain] = useState("base");
  const [toChain, setToChain] = useState("ethereum");
  const [token, setToken] = useState("ETH");
  const [amount, setAmount] = useState("0.01");
  const [loading, setLoading] = useState(false);

  const handleBuy = () => open({ view: "OnRampProviders" });
  const handleSwap = () => open({ view: "Swap" });
  const handleSendFlow = () => open({ view: "Account" });

  const handleBridge = async () => {
    if (!isConnected || !address) {
      alert("Connect your wallet first.");
      return;
    }

    try {
      setLoading(true);

      const walletClient = createWalletClient({
        chain: CHAINS[fromChain],
        transport: custom(window.ethereum),
      });

      const across = new Across({ walletClient });

      const amountInWei = parseUnits(amount, 18);

      const quote = await across.quote({
        token,
        amount: amountInWei,
        fromChainId: CHAINS[fromChain].id,
        toChainId: CHAINS[toChain].id,
      });

      await across.send(quote);

      alert("Bridge transaction sent!");
    } catch (err) {
      console.error("Bridge error:", err);
      alert("Bridge failed: " + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="p-4 bg-white dark:bg-dark-200 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Token Actions
      </h2>
      <div className="flex flex-wrap gap-4 mb-4">
        <button
          onClick={handleBuy}
          className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Buy Tokens
        </button>
        <button
          onClick={handleSwap}
          className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Swap Tokens
        </button>
        <button
          onClick={handleSendFlow}
          className="px-5 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
        >
          Send Tokens
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex gap-4">
          <label className="flex flex-col text-sm text-gray-700 dark:text-white">
            From Chain
            <select value={fromChain} onChange={(e) => setFromChain(e.target.value)} className="px-3 py-1 rounded border">
              {Object.entries(CHAINS).map(([key, chain]) => (
                <option key={key} value={key}>{chain.name}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col text-sm text-gray-700 dark:text-white">
            To Chain
            <select value={toChain} onChange={(e) => setToChain(e.target.value)} className="px-3 py-1 rounded border">
              {Object.entries(CHAINS).map(([key, chain]) => (
                <option key={key} value={key}>{chain.name}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col text-sm text-gray-700 dark:text-white">
            Token
            <select value={token} onChange={(e) => setToken(e.target.value)} className="px-3 py-1 rounded border">
              {TOKENS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="flex flex-col text-sm text-gray-700 dark:text-white">
            Amount
            <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} className="px-3 py-1 rounded border" />
          </label>
        </div>
        <button
          onClick={handleBridge}
          disabled={loading}
          className={`px-5 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Bridging..." : "Bridge Tokens"}
        </button>
      </div>
    </section>
  );
}