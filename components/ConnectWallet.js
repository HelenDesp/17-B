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
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
