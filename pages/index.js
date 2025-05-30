import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Dashboard from "../components/Dashboard";
import Head from "next/head";

// Your fallback landing content
function Landing() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black text-center px-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Welcome to your Web3 Wallet
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Connect your wallet to continue.
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const { isConnected, status } = useAccount();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Ensure this runs only on client
    setHydrated(true);
  }, []);

  if (!hydrated || status === "loading") return null;

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
        {isConnected ? <Dashboard /> : <Landing />}
      </Layout>
    </>
  );
}