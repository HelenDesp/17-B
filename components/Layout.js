import React, { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { useTheme } from "../context/ThemeContext";
import { useAccount } from "wagmi";

// --- 1. Import your page components ---
// We'll create simple placeholders for now.
// You should replace these with your actual components.
const Dashboard = () => <div className="p-6"><h1>Dashboard Content</h1></div>;
const Nfts = () => <div className="p-6"><h1>NFTs Content</h1></div>;
const Tokens = () => <div className="p-6"><h1>Tokens Content</h1></div>;
const Transfer = () => <div className="p-6"><h1>Transfer Content</h1></div>;
const History = () => <div className="p-6"><h1>History Content</h1></div>;
const Settings = () => <div className="p-6"><h1>Settings Content</h1></div>;


export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useTheme();
  const { isConnected } = useAccount();
  const [isMobile, setIsMobile] = useState(false);

  // --- 2. Add state to manage the active view ---
  const [activeTab, setActiveTab] = useState("dashboard");


  // Handle mobile detection
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Close sidebar on mobile when switching routes (now tabs)
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [activeTab, isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // --- 3. Add function to render the correct content component ---
  const renderContent = () => {
    switch (activeTab) {
      case "nfts":
        return <Nfts />;
      case "tokens":
        return <Tokens />;
      case "transfer":
        return <Transfer />;
      case "history":
        return <History />;
      case "settings":
        return <Settings />;
      case "dashboard":
      default:
        // By default, it shows the original content from index.js
        return children; 
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-light-100 dark:bg-dark-300 transition-colors duration-200">
      <Header toggleSidebar={toggleSidebar} />

      <div className="flex flex-1">
        {/* Mobile backdrop for sidebar */}
        {sidebarOpen && isConnected && isMobile && (
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          ></div>
        )}

        {/* Sidebar */}
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
            {/* --- 4. Pass the state and setter to the Sidebar --- */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        )}

        {/* Main content */}
        <main
          className={`flex-grow p-4 sm:p-6 lg:p-8 w-full transition-all duration-200`}
        >
          <div className="max-w-7xl mx-auto">
            {/* Gradient background for non-connected state */}
            {!isConnected && (
              <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-100 dark:from-primary-900/20 dark:via-secondary-900/20 dark:to-primary-800/20 animate-pulse-slow opacity-40 dark:opacity-20"></div>
              </div>
            )}

            {/* --- 5. Render the dynamic content --- */}
            <div className="relative">{renderContent()}</div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
