import { useAppKit } from "@reown/appkit/react";

export default function CustomWalletButton() {
  const { open } = useAppKit();

  return (
    <button
      onClick={() => open()}
      className="mx-auto block border-4 border-gray-900 dark:border-white bg-light-100 text-gray-900 dark:bg-dark-300 dark:text-white px-6 py-2 text-sm [font-family:'Cygnito_Mono',sans-serif] uppercase tracking-wide rounded-none transition-colors duration-200 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black"
    >
      Connect Wallet
    </button>
  );
}