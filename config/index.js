import { http, createStorage, cookieStorage } from "wagmi";
import {
  mainnet,
  base,
  sepolia,
  polygon,
  optimism,
  arbitrum,
  bsc,
  holesky
} from "@reown/appkit/networks";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { createAppKit } from "@reown/appkit/react";
import { QueryClient } from "@tanstack/react-query";

// 1. Project ID
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || "YOUR_PROJECT_ID";
if (!projectId) {
  console.warn("Project ID is not defined. Get one from https://cloud.reown.com");
}

// 2. App Metadata
const metadata = {
  name: "Web3 Wallet App",
  description: "A simple dApp for transferring tokens and viewing balances",
  url: "https://web3-wallet-app.com",
  icons: ["https://example.com/icon.png"],
};

// 3. Supported networks
export const networks = [
  mainnet,
  base,
  holesky,
  sepolia,
  polygon,
  optimism,
  arbitrum,
  bsc,
];

// 4. WagmiAdapter Configuration with the critical 'transports' property.
// This is the most important part for ensuring correct fee calculation on all networks.
export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  projectId,
  networks,
  // This block ensures the correct fee logic is used for each network.
  transports: networks.reduce((map, network) => {
    map[network.id] = http();
    return map;
  }, {}),
});

// We export the final wagmi config for the provider
export const config = wagmiAdapter.wagmiConfig;

// 5. Create and export the AppKit Modal from this central file
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  metadata,
  defaultNetwork: base,
  features: {
    analytics: true,
  },
  themeMode: "auto",
  themeVariables: {
    "--w3m-accent": "#7F7F7F",
    "--w3m-font-family": "'Cygnito Mono', sans-serif",
    "--wui-color-accent-glass-010": "#ffffff",
    "--wui-color-accent-100": "#000000",
    "--wui-color-accent-glass-010-dark": "#000000",
    "--wui-color-accent-100-dark": "#ffffff",
  },
});

// 6. Create and export the QueryClient
export const queryClient = new QueryClient();