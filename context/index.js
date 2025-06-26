// UPDATED: Import 'networks' from your main config file
import { wagmiAdapter, projectId, networks } from "../config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
// UPDATED: Only import 'base' directly as it's needed for the defaultNetwork property
import { base } from "@reown/appkit/networks";
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
  // UPDATED: Use the 'networks' array imported from your config
  networks: networks,
  defaultNetwork: base,
  metadata: metadata,
  features: {
    analytics: true,
  },
  themeMode: "auto",
  themeVariables: {
    "--w3m-accent": "#7F7F7F",
    "--w3m-font-family": "'Cygnito Mono', sans-serif",

    // ✅ Fix the accent glass background and text color
    "--wui-color-accent-glass-010": "#ffffff", // light background for light theme
    "--wui-color-accent-100": "#000000",       // text color for light theme

    "--wui-color-accent-glass-010-dark": "#000000", // dark background for dark theme
    "--wui-color-accent-100-dark": "#ffffff",       // text color for dark theme
  }
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