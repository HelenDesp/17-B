import React from "react";
import { useAppKit } from "@reown/appkit/react";

export default function TokenActions() {
  const { open } = useAppKit();

  return (
    <section className="mt-6 p-4 bg-white dark:bg-dark-200 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Token Actions
      </h2>
      <div className="flex flex-wrap gap-4">
        {/* Buy */}
        <button
          onClick={() => open({ view: "OnRampProviders" })}
          className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Buy Tokens
        </button>

        {/* Send */}
        <button
          onClick={() => open({ view: "Send" })}
          className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Send Tokens
        </button>

        {/* Swap */}
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
