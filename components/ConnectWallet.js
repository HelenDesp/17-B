import { useAccount, useDisconnect } from "wagmi";
import { modal } from "../context";
import { useEffect, useState } from "react";

export default function ConnectWallet() {
  // For hydration issues in Next.js, use client-side only rendering
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  // Only show the component after it has mounted to avoid hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleConnect = () => {
    modal.open();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  // Don't render until client-side
  if (!mounted) return null;

  return (
    <div className="flex items-center">
{isConnected ? (
  <div className="relative inline-block">
    {/* Invisible but functional appkit-button */}
    <appkit-button className="absolute inset-0 w-full h-full opacity-0 pointer-events-none m-0 p-0" />

    {/* Your visible clickable address */}
    <button
      onClick={() => document.querySelector("appkit-button")?.click()}
      className="relative z-10 px-4 py-2 rounded-md bg-gray-100 dark:bg-dark-100 text-gray-800 dark:text-gray-200 text-sm font-mono hover:bg-gray-200 dark:hover:bg-dark-200 transition-colors"
    >
      {address.substring(0, 6)}...{address.substring(address.length - 4)}
    </button>
  </div>
) : (
  <button
    onClick={handleConnect}
    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
  >
    Connect Wallet
  </button>
)}
    </div>
  );
}
