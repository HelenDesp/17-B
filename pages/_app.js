import { useEffect, useState } from "react";
import { ThemeProvider } from "../context/ThemeContext"; // Your existing theme provider is fine
import "../styles/globals.css";

// --- 1. Import EVERYTHING from your single config file ---
// This is the key to fixing the issue. We get the final, correct config
// and the necessary providers from one central place.
import { config, queryClient } from '../config'; // Ensure this path is correct
import { QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { cookieToInitialState } from "wagmi/cookie";
import Layout from "../components/Layout"; // Assuming Layout.js is in /components

function MyApp({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // This ensures the app only renders on the client, preventing SSR hydration errors.
    setMounted(true);
  }, []);

  // For cookie handling in pages router
  const [cookieString, setCookieString] = useState(null);
  useEffect(() => {
    setCookieString(document.cookie);
  }, []);
  const initialState = cookieToInitialState(config, cookieString);

  if (!mounted) {
    // Render nothing on the server to avoid SSR issues.
    return null;
  }

  return (
    // --- 2. Set up all providers here, in the correct order ---
    // This structure matches the working example and ensures the config is applied correctly.
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          {/* Your Layout now wraps the page component */}
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default MyApp;