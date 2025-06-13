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
    "--w3m-border-radius-master": "4px",
    "--w3m-border-radius-button": "4px",
    "--w3m-border-radius-input": "4px",
    "--w3m-border-radius-modal": "4px",
    "--w3m-font-family": "'Cygnito Mono', sans-serif",  
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
