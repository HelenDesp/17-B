import React, { useState, useEffect } from "react";
import { useAppKit } from "@reown/appkit/react";

export default function TokenActions() {
  const { open, session } = useAppKit();
  const [smartWalletReady, setSmartWalletReady] = useState(false);

  useEffect(() => {
    const check = async () => {
      const isReady = await session?.isConnected?.();
      setSmartWalletReady(isReady);
    };
    check();
  }, [session]);

  const handleSend = () => open({ view: "Send" });
  const handleBuy = () => open({ view: "OnRampProviders" });
  const handleSwap = () => open({ view: "Swap" });

  return (
    <section className="p-4 bg-white dark:bg-dark-200 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Token Actions
      </h2>

      {!smartWalletReady && (
        <div className="mb-4 text-sm text-yellow-700 bg-yellow-100 border border-yellow-300 rounded p-2">
          ⚠️ To use <strong>Send</strong>, click your wallet address (top right) and complete the Smart Wallet setup.
        </div>
      )}

      <div className="flex flex-wrap gap-4">
        <button
          onClick={handleBuy}
          className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Buy Tokens
        </button>

        <button
          onClick={handleSend}
          disabled={!smartWalletReady}
          className={`px-5 py-2 rounded transition-colors ${
            smartWalletReady
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Send Tokens
        </button>

        <button
          onClick={handleSwap}
          className="px-5 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
        >
          Swap Tokens
        </button>
      </div>
    </section>
  );
}
