import React from "react";
import { useAppKit } from "@reown/appkit/react";

export default function TokenActions() {
  const { open } = useAppKit();

  const chainSafeSend = async () => {
    try {
      // Force hydration via Account first
      await open({ view: "Account" });

      // After hydration, wait 500ms and show Send modal
      setTimeout(() => {
        open({ view: "Send" });
      }, 500);
    } catch (err) {
      console.error("Send failed:", err);
    }
  };

  return (
    <section className="p-4 bg-white dark:bg-dark-200 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Token Actions
      </h2>
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => open({ view: "OnRampProviders" })}
          className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Buy Tokens
        </button>

        <button
          onClick={chainSafeSend}
          className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Send Tokens
        </button>

        <button
          onClick={() => open({ view: "Swap" })}
          className="px-5 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
        >
          Swap Tokens
        </button>
      </div>
    </section>
  );
}
