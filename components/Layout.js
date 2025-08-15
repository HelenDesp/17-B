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
  const [authStatus, setAuthStatus] = useState('idle'); // 'idle', 'signing', 'signed', 'error'
  const [authError, setAuthError] = useState(null);
  const [lastAttemptedAddress, setLastAttemptedAddress] = useState(null);

  // --- SIWE (Sign-In With Ethereum) Logic ---
  useEffect(() => {
    console.log('Setting up Firebase auth listener...');
    const unsubscribe = auth.onAuthStateChanged((user) => {
        console.log('Firebase auth state changed:', user ? user.uid : 'null');
        setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleSignIn = async () => {
        // Reset auth status when wallet disconnects
        if (!isConnected || !address) {
            console.log('Wallet disconnected or no address');
            setAuthStatus('idle');
            setAuthError(null);
            setLastAttemptedAddress(null);
            return;
        }

        // Check if already signed in with correct address
        if (firebaseUser && firebaseUser.uid.toLowerCase() === address.toLowerCase()) {
            console.log('Already signed in with correct address:', address);
            if (authStatus !== 'signed') {
                setAuthStatus('signed');
            }
            return;
        }

        // Prevent signing in for same address multiple times
        if (lastAttemptedAddress === address && authStatus !== 'idle') {
            console.log('Already attempted sign-in for this address:', address, 'with status:', authStatus);
            return;
        }

        // Only start sign-in if we're in idle state
        if (authStatus !== 'idle') {
            console.log('Auth status is not idle:', authStatus, 'skipping sign-in attempt');
            return;
        }

        try {
            console.log('Starting SIWE flow for address:', address);
            setAuthStatus('signing');
            setAuthError(null);
            setLastAttemptedAddress(address);

            // Step 1: Get nonce from backend
            console.log('Requesting nonce from:', GET_NONCE_URL);
            const nonceRes = await fetch(GET_NONCE_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ address }),
            });

            console.log('Nonce response status:', nonceRes.status);
            
            if (!nonceRes.ok) {
                const errorText = await nonceRes.text();
                console.error('Nonce request failed:', errorText);
                throw new Error(`Failed to get nonce: ${nonceRes.status} ${errorText}`);
            }

            const nonceData = await nonceRes.json();
            console.log('Nonce received:', nonceData);

            if (!nonceData.nonce) {
                throw new Error('No nonce returned from server');
            }

            // Step 2: Sign the nonce
            console.log('Requesting signature for nonce:', nonceData.nonce);
            const signature = await signMessageAsync({ message: nonceData.nonce });
            console.log('Signature obtained:', signature.substring(0, 20) + '...');

            // Step 3: Verify signature and get Firebase token
            console.log('Verifying signature with:', VERIFY_SIGNATURE_URL);
            const verifyRes = await fetch(VERIFY_SIGNATURE_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ address, signature }),
            });

            console.log('Verification response status:', verifyRes.status);
            
            // Handle user creation scenario
            if (verifyRes.status === 409) {
                console.log("User created, attempting sign-in again after delay...");
                setTimeout(() => {
                    setAuthStatus('idle');
                    setLastAttemptedAddress(null); // Reset to allow retry
                }, 1000);
                return;
            }

            if (!verifyRes.ok) {
                const errorText = await verifyRes.text();
                console.error('Signature verification failed:', errorText);
                throw new Error(`Signature verification failed: ${verifyRes.status} ${errorText}`);
            }

            const verifyData = await verifyRes.json();
            console.log('Verification successful, token received');

            if (!verifyData.token) {
                throw new Error('No Firebase token returned from verification');
            }

            // Step 4: Sign in to Firebase
            console.log('Signing in to Firebase with custom token...');
            await signInWithCustomToken(auth, verifyData.token);
            
            console.log("Successfully signed in to Firebase with wallet.");
            setAuthStatus('signed');

        } catch (error) {
            console.error("SIWE Error:", error);
            setAuthError(error.message);
            setAuthStatus('error');
            
            // Don't auto-retry to prevent loops - let user manually retry
            console.log('Sign-in failed, manual retry required');
        }
    };

    // Use a timeout to debounce the effect and prevent rapid re-execution
    const timeoutId = setTimeout(() => {
        if (isConnected && address && authStatus === 'idle' && (!firebaseUser || firebaseUser.uid.toLowerCase() !== address.toLowerCase())) {
            handleSignIn();
        }
    }, 100); // Small delay to prevent rapid re-execution

    return () => clearTimeout(timeoutId);
  }, [isConnected, address, firebaseUser, signMessageAsync, authStatus, lastAttemptedAddress]);
  
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

  // Debug component to show auth status
  const AuthDebugInfo = () => {
    if (process.env.NODE_ENV === 'production') return null;
    
    return (
      <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded text-xs z-50">
        <div>Wallet: {isConnected ? 'Connected' : 'Disconnected'}</div>
        <div>Address: {address ? address.substring(0, 10) + '...' : 'None'}</div>
        <div>Auth Status: {authStatus}</div>
        <div>Firebase User: {firebaseUser ? firebaseUser.uid.substring(0, 10) + '...' : 'None'}</div>
        {authError && <div className="text-red-300">Error: {authError}</div>}
      </div>
    );
  };

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
            
            {/* Show loading state when signing */}
            {authStatus === 'signing' && isConnected && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-800 dark:text-white">Signing in with your wallet...</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Please check your wallet for signature request</p>
                </div>
              </div>
            )}

            {/* Show error state */}
            {authStatus === 'error' && authError && (
              <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-4">
                <p><strong>Authentication Error:</strong> {authError}</p>
                <button 
                  onClick={() => {
                    setAuthStatus('idle');
                    setAuthError(null);
                    setLastAttemptedAddress(null); // Reset to allow retry
                  }}
                  className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
                >
                  Retry
                </button>
              </div>
            )}
            
            <div className="relative">{renderContent()}</div>
          </div>
        </main>
      </div>
      <Footer />
      <AuthDebugInfo />
    </div>
  );
}