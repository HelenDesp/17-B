import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";

export default function ActivityCard() {
  const { isConnected, address } = useAccount();
  const [transactions, setTransactions] = useState([]);
  const [mounted, setMounted] = useState(false);

  // Load transactions from localStorage when component mounts
  useEffect(() => {
    setMounted(true);

    const loadTransactions = () => {
      try {
        const txHistoryString = localStorage.getItem("transactionHistory");
        const txHistory = txHistoryString ? JSON.parse(txHistoryString) : [];
        setTransactions(txHistory);
      } catch (error) {
        console.error("Failed to load transaction history:", error);
        setTransactions([]);
      }
    };

    // Load transactions initially
    loadTransactions();

    // Set up event listener for storage changes
    const handleStorageChange = (e) => {
      if (e.key === "transactionHistory") {
        loadTransactions();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also set up a timer to check for new transactions periodically
    // (in case transactions are added from the same window)
    const intervalId = setInterval(loadTransactions, 5000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  if (!mounted) return null;

  if (!isConnected) return null;

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}d ago`;
    }
    if (diffHours > 0) {
      return `${diffHours}h ago`;
    }
    if (diffMins > 0) {
      return `${diffMins}m ago`;
    }
    return "Just now";
  };

  // Format address for display
  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // Get icon for transaction type
  const getTransactionIcon = (type, status) => {
    if (status === "pending") {
      return (
        <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-yellow-600 dark:text-yellow-300"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      );
    }

    if (status === "failed") {
      return (
        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-red-600 dark:text-red-300"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      );
    }

    switch (type) {
      case "send":
        return (
          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-red-600 dark:text-red-300"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      case "receive":
        return (
          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-green-600 dark:text-green-300"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      case "swap":
        return (
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-blue-600 dark:text-blue-300"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-600 dark:text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-dark-200 rounded-xl shadow-card dark:shadow-card-dark p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Recent Activity
        </h2>
        <button
          onClick={() => localStorage.removeItem("transactionHistory")}
          className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
        >
          Clear History
        </button>
      </div>

      <div className="space-y-4">
        {transactions.length > 0 ? (
          transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-start space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-dark-100 rounded-lg transition-colors"
            >
              {getTransactionIcon(tx.type, tx.status)}

              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {tx.type === "swap"
                      ? "Swap"
                      : tx.type === "send"
                      ? "Sent"
                      : "Received"}
                  </h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTime(tx.timestamp)}
                  </span>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {tx.type === "swap" ? (
                    <span>
                      Swapped {tx.amount} {tx.token} for {tx.toAmount}{" "}
                      {tx.toToken}
                    </span>
                  ) : tx.type === "send" ? (
                    <span>
                      {tx.amount} {tx.token} to {formatAddress(tx.to)}
                    </span>
                  ) : (
                    <span>
                      {tx.amount} {tx.token} from {formatAddress(tx.from)}
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center mt-1">
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[140px]">
                    {tx.hash.substring(0, 8)}...
                    {tx.hash.substring(tx.hash.length - 6)}
                  </div>

                  <div
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      tx.status === "confirmed"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : tx.status === "failed"
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                    }`}
                  >
                    {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                  </div>
                </div>

                {tx.memo && (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-dark-100 p-2 rounded-md">
                    <span className="font-medium">Memo:</span> {tx.memo}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 dark:text-gray-400">
              No recent activity
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
