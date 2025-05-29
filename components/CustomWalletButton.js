import { useAppKit } from "@reown/appkit/react";

export default function CustomWalletButton() {
  const { open } = useAppKit();

  return (
    <button
      onClick={() => open()}
      className="mx-auto block border-4 border-gray-900 dark:border-white bg-light-100 text-gray-900 dark:bg-dark-300 dark:text-white px-6 py-2 text-sm font-mono uppercase tracking-wide rounded-none transition-colors duration-200"
    >
      Connect Wallet
    </button>
  );
}