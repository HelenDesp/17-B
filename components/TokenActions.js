import React, { useEffect, useState } from "react";
import { useAppKit } from "@reown/appkit/react";
import { encodeFunctionData } from "viem";
import { erc20Abi } from "viem/abis";

export default function TokenActions() {
  const { open, session } = useAppKit();
  const [supportsSendCalls, setSupportsSendCalls] = useState(false);

  useEffect(() => {
    const checkCapabilities = async () => {
      try {
        const caps = await session.getCapabilities();
        setSupportsSendCalls(caps.includes("sendCalls"));
      } catch (err) {
        console.error("Failed to get capabilities:", err);
      }
    };
    checkCapabilities();
  }, [session]);

  const handleBuy = () => open({ view: "OnRampProviders" });
  const handleSwap = () => open({ view: "Swap" });

  const handleSend = async () => {
    try {
      if (!supportsSendCalls) {
        alert("Smart Wallet does not support sendCalls. Please use the wallet UI.");
        return;
      }

      const recipient = prompt("Enter recipient address:");
      if (!recipient) return;

      const amountInput = prompt("Enter amount to send (e.g., 10):");
      if (!amountInput) return;
      const amount = BigInt(Number(amountInput) * 10 ** 6); // for 6 decimals like USDC

      const tokenAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // replace with correct token address

      const call = {
        to: tokenAddress,
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: "transfer",
          args: [recipient, amount],
        }),
        chainId: 8453, // Base chain ID
      };

      const id = await session.sendCalls([call]);
      console.log("Send call submitted, ID:", id);
    } catch (err) {
      console.error("Send transaction failed:", err);
    }
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
