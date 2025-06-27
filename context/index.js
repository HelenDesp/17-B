// This file is likely located at something like `providers/ContextProvider.js` or `pages/_app.js`

// Import everything from your new, central config file
import { config, queryClient } from "../config"; // Adjust the path if your config file is elsewhere
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { cookieToInitialState, WagmiProvider } from "wagmi";

// This component is now much simpler. It only 'provides' the context.
function ContextProvider({ children, cookies }) {
  // Handle cookies for Server-Side Rendering (SSR)
  const initialState = cookies
    ? cookieToInitialState(config, cookies)
    : undefined;

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

export default ContextProvider;