import { wagmiAdapter, projectId } from "../config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import {
  mainnet,
  base,
  sepolia,
  polygon,
  optimism,
  arbitrum,
  bsc,
} from "@reown/appkit/networks";
import React from "react";
import { cookieToInitialState, WagmiProvider } from "wagmi";

// Set up queryClient
const queryClient = new QueryClient();

// Set up metadata
const metadata = {
  name: "Web3 Wallet App",
  description: "A simple dApp for transferring tokens and viewing balances",
  url: "https://web3-wallet-app.com",
  icons: ["https://example.com/icon.png"],
};

// Create the modal
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet, base, sepolia, polygon, optimism, arbitrum, bsc],
  defaultNetwork: base,
  metadata: metadata,
  features: {
    analytics: true,
  },
  themeMode: "auto",
  themeVariables: {
  "--w3m-accent": "#000000",
  "--w3m-color-mix": "#000000",
  "--w3m-color-mix-strength": 80,
  "--w3m-border-radius-master": "6px",
  "--w3m-font-family": "'Cygnito Mono', sans-serif",

  // Experimental — affects layout paddings and spacing
  "--wui-border-radius-small": "6px",
  "--wui-border-radius-medium": "6px",
  "--wui-border-radius-large": "6px",

  "--wui-spacing-0": "0px",
  "--wui-spacing-xs": "4px",
  "--wui-spacing-s": "8px",
  "--wui-spacing-m": "12px",
  "--wui-spacing-l": "16px",
  "--wui-spacing-2l": "20px", // matches the var in your snippet  
  },
});

function ContextProvider({ children, cookies }) {
  // In pages router, we need to handle cookies differently
  const initialState = cookies
    ? cookieToInitialState(wagmiAdapter.wagmiConfig, cookies)
    : undefined;

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

export default ContextProvider;
