import { useState, useEffect } from "react";
import {
  useAccount,
  useSendTransaction,
  useWriteContract,
  useBalance,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseUnits } from "ethers";

// ERC20 transfer ABI
const erc20TransferAbi = [
  {
    constant: false,
    inputs: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    type: "function",
  },
];

// List of popular tokens with their addresses, logos, and colors on different networks
const popularTokens = {
  // Mainnet
  1: [
    {
      symbol: "ETH",
      name: "Ethereum",
      address: null,
      decimals: 18,
      logo: "/ethereum.svg",
      color: "bg-blue-500",
    },
    {
      symbol: "USDT",
      name: "Tether",
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      decimals: 6,
      logo: "/usdt.svg",
      color: "bg-green-500",
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      decimals: 6,
      logo: "/usdc.svg",
      color: "bg-blue-500",
    },
    {
      symbol: "DAI",
      name: "Dai Stablecoin",
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      decimals: 18,
      logo: "/dai.svg",
      color: "bg-yellow-500",
    },
    {
      symbol: "WBTC",
      name: "Wrapped Bitcoin",
      address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      decimals: 8,
      logo: "/wrappedbtc.svg",
      color: "bg-orange-500",
    },
  ],
  // Add other networks here
};

export default function TokenTransfer() {
  const { isConnected, chainId, address, chain } = useAccount();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("ETH");
  const [memo, setMemo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txStatus, setTxStatus] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [amountError, setAmountError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [txStage, setTxStage] = useState(""); // 'preparing', 'pending', 'confirmed', 'reverted'

  // Check balance of selected token
  const { data: ethBalance } = useBalance({
    address,
    enabled: !!address && selectedToken === "ETH",
  });

  // Get tokens based on current chain
  const tokens =
    chain && popularTokens[chain.id]
      ? popularTokens[chain.id]
      : popularTokens[1]; // Default to Ethereum mainnet

  // Find the selected token object
  const token = tokens.find((t) => t.symbol === selectedToken);

  // For ETH transfers
  const { sendTransactionAsync } = useSendTransaction();

  // For ERC20 transfers
  const { writeContractAsync } = useWriteContract();

  // For waiting for transaction receipt
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: isFailure,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    enabled: !!txHash,
  });

  // Update UI based on transaction status
  useEffect(() => {
    if (!txHash) return;

    if (isConfirming) {
      setTxStage("pending");
      setTxStatus("Transaction is being confirmed...");
    } else if (isConfirmed) {
      setTxStage("confirmed");
      setTxStatus(`Transaction confirmed! Block: ${receipt?.blockNumber}`);

      // Save transaction to history
      saveTransactionToHistory({
        id: txHash,
        type: "send",
        status: "confirmed",
        timestamp: new Date().toISOString(),
        amount: amount,
        token: selectedToken,
        from: address,
        to: recipient,
        hash: txHash,
        blockNumber: receipt?.blockNumber
          ? receipt.blockNumber.toString()
          : undefined, // Convert BigInt to string
        memo: memo || undefined,
      });
      // Reset form after successful transaction
      setAmount("");
      setRecipient("");
      setMemo("");
      // Reset the submitting state
      setIsSubmitting(false);
      // After a moment, clear the status
      setTimeout(() => {
        setTxHash(null);
        setTxStatus(null);
        setTxStage("");
      }, 5000);
    } else if (isFailure) {
      setTxStage("reverted");
      setTxStatus("Transaction failed");
      // Reset the submitting state on failure too
      // Save failed transaction to history
      saveTransactionToHistory({
        id: txHash,
        type: "send",
        status: "failed",
        timestamp: new Date().toISOString(),
        amount: amount,
        token: selectedToken,
        from: address,
        to: recipient,
        hash: txHash,
        blockNumber: receipt?.blockNumber
          ? receipt.blockNumber.toString()
          : undefined, // Convert BigInt to string
        memo: memo || undefined,
      });
      setIsSubmitting(false);
    }
  }, [txHash, isConfirming, isConfirmed, isFailure, receipt]);
  // Validate recipient address
  const validateAddress = (addr) => {
    if (!addr) {
      setAddressError("Recipient address is required");
      return false;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) {
      setAddressError("Invalid Ethereum address format");
      return false;
    }

    setAddressError("");
    return true;
  };

  // Validate amount
  const validateAmount = (amt) => {
    if (!amt || parseFloat(amt) <= 0) {
      setAmountError("Amount must be greater than 0");
      return false;
    }

    if (
      selectedToken === "ETH" &&
      ethBalance &&
      parseFloat(amt) > parseFloat(ethBalance.formatted)
    ) {
      setAmountError("Insufficient balance");
      return false;
    }

    setAmountError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    const isAddressValid = validateAddress(recipient);
    const isAmountValid = validateAmount(amount);

    if (!isAddressValid || !isAmountValid) {
      return;
    }

    setIsSubmitting(true);
    setTxStage("preparing");
    setTxStatus("Preparing transaction...");
    setTxHash(null);

    try {
      let hash;

      // Check if we're transferring the native token (ETH, MATIC, etc.)
      if (!token.address) {
        hash = await sendTransactionAsync({
          to: recipient,
          value: parseUnits(amount, token.decimals),
          data: memo
            ? `0x${Buffer.from(memo, "utf8").toString("hex")}`
            : undefined,
        });
      } else {
        // ERC20 transfer
        hash = await writeContractAsync({
          address: token.address,
          abi: erc20TransferAbi,
          functionName: "transfer",
          args: [recipient, parseUnits(amount, token.decimals)],
        });
      }

      setTxHash(hash);
      setTxStage("sent");
      setTxStatus(`Transaction sent! Waiting for confirmation...`);
    } catch (error) {
      console.error("Transaction error:", error);
      setTxStage("error");
      setTxStatus(`Transaction failed: ${error.message}`);
      setIsSubmitting(false);
    }
  };

  const convertBigIntToString = (obj) => {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === "bigint") {
      return obj.toString();
    }

    if (typeof obj === "object") {
      if (Array.isArray(obj)) {
        return obj.map(convertBigIntToString);
      }

      const result = {};
      for (const key in obj) {
        result[key] = convertBigIntToString(obj[key]);
      }
      return result;
    }

    return obj;
  };

  // Function to save transaction to history

  const saveTransactionToHistory = (txData) => {
    try {
      // Get existing transactions from localStorage
      const existingTxsString = localStorage.getItem("transactionHistory");
      const existingTxs = existingTxsString
        ? JSON.parse(existingTxsString)
        : [];

      // Convert BigInt values to strings
      const safeData = convertBigIntToString(txData);

      // Add new transaction to the beginning of the array
      const updatedTxs = [safeData, ...existingTxs].slice(0, 20); // Keep only the last 20 transactions

      // Save back to localStorage
      localStorage.setItem("transactionHistory", JSON.stringify(updatedTxs));
    } catch (error) {
      console.error("Failed to save transaction to history:", error);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-white dark:bg-dark-200 rounded-xl shadow-card dark:shadow-card-dark p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Transfer Tokens
        </h2>
        <div className="flex flex-col items-center justify-center py-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            Connect your wallet to transfer tokens
          </p>
          <button
            onClick={() => {}}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-200 rounded-xl shadow-card dark:shadow-card-dark p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Transfer Tokens
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Token Selection */}
        <div>
          <label
            htmlFor="token"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Select Token
          </label>
          <div className="token-selector">
            {tokens.map((t) => (
              <button
                key={t.symbol}
                type="button"
                onClick={() => setSelectedToken(t.symbol)}
                className={`token-option ${
                  selectedToken === t.symbol
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30"
                    : "border-gray-200 dark:border-dark-100 hover:bg-gray-50 dark:hover:bg-dark-100"
                }`}
              >
                <div
                  className={`w-8 h-8 ${t.color} bg-opacity-20 dark:bg-opacity-30 rounded-full flex items-center justify-center mb-1`}
                >
                  <span className="text-base">
                    <img
                      src={t.logo}
                      alt={t.symbol}
                      className="w-5 h-5 rounded-full"
                    />
                  </span>
                </div>
                <span className="text-xs font-medium text-gray-900 dark:text-white">
                  {t.symbol}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Recipient Address */}
        <div>
          <label
            htmlFor="recipient"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Recipient Address
          </label>
          <input
            id="recipient"
            type="text"
            value={recipient}
            onChange={(e) => {
              setRecipient(e.target.value);
              if (e.target.value) validateAddress(e.target.value);
            }}
            placeholder="0x..."
            className={`w-full p-3 border ${
              addressError
                ? "border-red-500 dark:border-red-500"
                : "border-gray-300 dark:border-gray-600"
            } rounded-lg bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
            required
            disabled={isSubmitting}
          />
          {addressError && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {addressError}
            </p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Amount
          </label>
          <div className="relative">
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (e.target.value) validateAmount(e.target.value);
              }}
              step="any"
              min="0"
              placeholder="0.0"
              className={`w-full p-3 border ${
                amountError
                  ? "border-red-500 dark:border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } rounded-lg bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
              required
              disabled={isSubmitting}
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              <span className="px-3 text-gray-500 dark:text-gray-400 font-medium">
                {selectedToken}
              </span>
            </div>
          </div>
          {amountError && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {amountError}
            </p>
          )}
          {ethBalance && selectedToken === "ETH" && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Balance: {parseFloat(ethBalance.formatted).toFixed(4)} ETH
            </p>
          )}
        </div>

        {/* Memo (optional) */}
        <div>
          <label
            htmlFor="memo"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Memo (optional)
          </label>
          <textarea
            id="memo"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="Add a memo to your transaction..."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 h-20 resize-none"
            disabled={isSubmitting}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
            isSubmitting
              ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
              : "bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800"
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {txStage === "preparing"
                ? "Preparing..."
                : txStage === "pending"
                ? "Confirming..."
                : "Processing..."}
            </span>
          ) : (
            `Send ${selectedToken}`
          )}
        </button>
      </form>

      {/* Transaction Status */}
      {txStatus && (
        <div
          className={`mt-5 p-4 rounded-lg ${
            txStage === "error" || txStage === "reverted"
              ? "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800"
              : txStage === "confirmed"
              ? "bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800"
              : "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
          }`}
        >
          <div className="flex">
            {txStage === "error" || txStage === "reverted" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-red-500 dark:text-red-400 mr-2 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            ) : txStage === "confirmed" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-green-500 dark:text-green-400 mr-2 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2 flex-shrink-0 animate-spin"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <p
              className={`text-sm ${
                txStage === "error" || txStage === "reverted"
                  ? "text-red-700 dark:text-red-300"
                  : txStage === "confirmed"
                  ? "text-green-700 dark:text-green-300"
                  : "text-blue-700 dark:text-blue-300"
              }`}
            >
              {txStatus}
            </p>
          </div>

          {txHash && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Transaction Hash:
              </p>
              <div className="flex items-center">
                <code className="text-xs bg-gray-100 dark:bg-dark-100 px-2 py-1 rounded-md mr-2 flex-1 overflow-x-auto">
                  {txHash}
                </code>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(txHash)}
                  className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                </button>
                <a
                  href={`https://etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 ml-1 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
