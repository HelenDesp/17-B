import React, { useEffect, useState } from "react";
import { useAppKit } from "@reown/appkit/react";

export default function TokenActions() {
  const { open, session } = useAppKit();
  const [reownReady, setReownReady] = useState(false);

  // Make sure Reown is connected and Smart Wallet is hydrated
  useEffect(() => {
    const check = async () => {
      const ready = await session.isConnected();
      setReownReady(ready);
    };
    check();
  }, [session]);

  const ensureConnected = async () => {
    const connected = await session.isConnected();
    if (!connected) {
      await open({ view: "Connect" });
    }
    return true;
  };

  const handleSend = async () => {
    await ensureConnected();
    open({ view: "Send" });
  };

  const handleBuy = async () => {
    await ensureConnected();
    open({ view: "OnRampProviders" });
  };

  const handleSwap = async () => {
    await ensureConnected();
    open({ view: "Swap" });
  };

  return (
    <section className="p-4 bg-white dark:bg-dark-200 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Token Actions
      </h2>
      <div className="flex flex-wrap gap-4">
        <button
          onClick={handleBuy}
          className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Buy Tokens
        </button>
        <button
          onClick={handleSend}
          className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
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
