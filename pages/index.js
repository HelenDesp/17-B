import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Dashboard from "../components/Dashboard";
import Head from "next/head";

// Optional fallback UI
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black text-gray-700 dark:text-white">
      <p className="text-lg">Checking wallet...</p>
    </div>
  );
}

export default function Home() {
  const { isConnected, status } = useAccount();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (status !== "loading") {
      // Wait a tick to let any layout shift resolve
      const timeout = setTimeout(() => {
        setReady(true);
      }, 100); // slightly delay to prevent layout jump

      return () => clearTimeout(timeout);
    }
  }, [status]);

  if (!ready) return <LoadingScreen />;

  return (
    <>
      <Head>
        <title>Web3 Wallet App</title>
        <meta
          name="description"
          content="A beautiful Web3 wallet app for managing your crypto assets"
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <Layout>
        {isConnected ? (
          <Dashboard />
        ) : (
          <div className="min-h-screen flex items-center justify-center text-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Connect Your Wallet
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                You need to connect your wallet to access the dashboard.
              </p>
            </div>
          </div>
        )}
      </Layout>
    </>
  );
}
