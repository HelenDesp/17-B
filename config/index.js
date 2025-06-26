import { http, createStorage, cookieStorage } from "wagmi";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import {
  mainnet,
  base,
  sepolia,
  polygon,
  optimism,
  arbitrum,
  holesky,
  bsc,
} from "@reown/appkit/networks";

// Get projectId from https://cloud.reown.com
export const projectId =
  process.env.NEXT_PUBLIC_PROJECT_ID || "YOUR_PROJECT_ID";

if (!projectId) {
  console.warn(
    "Project ID is not defined. Consider getting one from https://cloud.reown.com"
  );
}

// Define networks you want to support
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

// Create a mapping of network IDs to transports
// This ensures your app uses reliable RPC endpoints for each chain
const transports = {};
networks.forEach(network => {
  transports[network.id] = http();
});


// Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks,
  // ADD THIS LINE: Explicitly define the transport for each network
  transports,
});

export const config = wagmiAdapter.wagmiConfig;
