import React, { useState, useEffect, useMemo } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { useTheme } from "../context/ThemeContext";
import { useAccount, useSignMessage } from "wagmi";
import AsciiComingSoon from './AsciiComingSoon';
import PalMojiDashboard from "./PalMojiDashboard";
// --- UPDATED: Import from our new central file ---
import { auth } from '../firebase/clientApp';
import { signInWithCustomToken } from 'firebase/auth';

const GET_NONCE_URL = "https://us-central1-palmoji-app.cloudfunctions.net/getNonceToSign";
const VERIFY_SIGNATURE_URL = "https://us-central1-palmoji-app.cloudfunctions.net/verifySignature";


// --- Placeholder Components ---
const NFTs = () => <div className="p-6"><h1>NFTs Content</h1></div>;
const Tokens = () => <div className="p-6"><h1>Tokens Content</h1></div>;
const Activity = () => <div className="p-6"><h1>Activity Content</h1></div>;
const Earn = () => <div className="p-6"><h1 className="text-2xl font-bold">Earn [Coming Soon...]</h1><AsciiComingSoon /></div>;
const Scoreboard = () => <div className="p-6"><h1 className="text-2xl font-bold">Scoreboard [Coming Soon...]</h1><AsciiComingSoon /></div>;
const Settings = () => <div className="p-6"><h1 className="text-2xl font-bold">Settings [Coming Soon...]</h1><AsciiComingSoon /></div>;


export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useTheme();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // --- SIWE (Sign-In With Ethereum) Logic ---
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
        setFirebaseUser(user);
        setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleSignIn = async () => {
        if (isAuthReady && isConnected && address && (!firebaseUser || firebaseUser.uid.toLowerCase() !== address.toLowerCase())) {
            try {
                console.log("Attempting to sign in with wallet...");
                const nonceRes = await fetch(GET_NONCE_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ address }),
                });
                if (!nonceRes.ok) throw new Error('Failed to get nonce');
                const { nonce } = await nonceRes.json();

                const signature = await signMessageAsync({ message: nonce });

                const verifyRes = await fetch(VERIFY_SIGNATURE_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    // --- FIX: Send the original nonce along with the signature ---
                    body: JSON.stringify({ address, signature, nonce }),
                });
                
                if (!verifyRes.ok) {
                    throw new Error('Signature verification failed');
                }
                
                const { token } = await verifyRes.json();

                await signInWithCustomToken(auth, token);
                console.log("Successfully signed in to Firebase with wallet.");

            } catch (error) {
                console.error("SIWE Error:", error);
            }
        }
    };

    handleSignIn();
  }, [isAuthReady, isConnected, address, firebaseUser, signMessageAsync]);
  
  // --- END of SIWE Logic ---

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [activeTab, isMobile]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const renderContent = () => {
    switch (activeTab) {
      case "nfts": return <NFTs />;		
      case "tokens": return <Tokens />;		
      case "palmoji": return <PalMojiDashboard />;
      case "activity": return <Activity />;
      case "earn": return <Earn />;
      case "scoreboard": return <Scoreboard />;
      case "settings": return <Settings />;
      case "dashboard":
      default: return children; 
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-light-100 dark:bg-dark-300 transition-colors duration-200">
      <Header toggleSidebar={toggleSidebar} />
      <div className="flex flex-1">
        {sidebarOpen && isConnected && isMobile && (
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          ></div>
        )}
        {isConnected && (
          <div
            className={`${
              isMobile
                ? `fixed z-30 h-full w-64 transition-transform duration-300 ease-in-out transform ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                  }`
                : "sticky top-0 h-screen w-64 shrink-0"
            }`}
          >
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        )}
        <main className={`flex-grow p-4 sm:p-6 lg:p-8 w-full transition-all duration-200`}>
          <div className="max-w-7xl mx-auto">
            {!isConnected && (
              <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-100 dark:from-primary-900/20 dark:via-secondary-900/20 dark:to-primary-800/20 animate-pulse-slow opacity-40 dark:opacity-20"></div>
              </div>
            )}
            <div className="relative">{renderContent()}</div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}