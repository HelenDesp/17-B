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
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {/* <button
            onClick={handleDisconnect}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Disconnect
          </button> */}
          <appkit-button />
        </div>
      ) : (
        <button
          onClick={handleConnect}
          className="border-4 border-black dark:border-white text-black dark:text-white bg-transparent px-8 py-2 text-sm font-normal tracking-wide uppercase font-mono rounded-none transition-all duration-300 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
