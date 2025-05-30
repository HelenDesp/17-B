import { useAccount } from "wagmi";
import Layout from "../components/Layout";
import Dashboard from "../components/Dashboard";
import Head from "next/head";

export default function Home() {
  const { isConnected } = useAccount();

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
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <Layout>
        <Dashboard />
      </Layout>
    </>
  );
}
