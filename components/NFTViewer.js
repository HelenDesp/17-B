"use client";
import { useState } from "react";
import axios from "axios";
import { useAccount, useSendTransaction, useWriteContract } from "wagmi";
// UPDATED: Added encodeFunctionData to the import
import { erc20Abi, maxUint256, createPublicClient, http, encodeFunctionData } from "viem";
import { base } from "viem/chains";

export default function NFTViewer({
  nfts,
  selectedNFTs = [],
  onSelectNFT = () => {},
}) {
  const { address, isConnected } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();
  const { writeContractAsync } = useWriteContract();
  
  const [loading] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [formData, setFormData] = useState({ name: "", manifesto: "", friend: "", weapon: "" });
  const [nameError, setNameError] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);
  
  // Mint-related state
  const [mintLoading, setMintLoading] = useState(false);
  const [inviteLists, setInviteLists] = useState([]);
  const [showMintModal, setShowMintModal] = useState(false);
  const [selectedInviteList, setSelectedInviteList] = useState(null);
  const [mintQuantity, setMintQuantity] = useState(1);

  // Collection details for reverse-genesis on Base
  const COLLECTION_SLUG = "reverse-genesis";
  const COLLECTION_ADDRESS = "0x28D744dAb5804eF913dF1BF361E06Ef87eE7FA47";
  const CHAIN_ID = 8453; // Base network

  // Create public client for Base network
  const client = createPublicClient({
    chain: base,
    transport: http()
  });

  // REPLACED: New function for more accurate gas estimation on Base
  const getBaseGasFee = async (transactionRequest = null) => {
    try {
      // Get the latest block to understand current network conditions
      const block = await client.getBlock({ blockTag: 'latest' });
      const baseFeePerGas = block.baseFeePerGas || 0n;
      
      // Get gas price suggestion from the network
      const gasPrice = await client.getGasPrice();
      
      // For EIP-1559 transactions on Base, we need proper fee calculation
      let maxPriorityFeePerGas;
      let maxFeePerGas;
      
      if (baseFeePerGas > 0n) {
        // EIP-1559 transaction
        // Use a small priority fee (e.g., 1 gwei) which is typical for Base
        maxPriorityFeePerGas = BigInt(Math.max(1_000_000_000, Number(gasPrice) / 10)); // At least 1 gwei
        
        // Max fee should be base fee + priority fee with some buffer (1.2x multiplier)
        maxFeePerGas = (baseFeePerGas * 12n) / 10n + maxPriorityFeePerGas;
        
        // Ensure maxFeePerGas is not lower than current gas price
        if (maxFeePerGas < gasPrice) {
          maxFeePerGas = gasPrice;
        }
      } else {
        // Legacy transaction or network doesn't support EIP-1559
        maxFeePerGas = gasPrice;
        maxPriorityFeePerGas = gasPrice;
      }
      
      // Optional: Estimate gas limit if transaction request is provided
      let gasLimit;
      if (transactionRequest) {
        try {
          gasLimit = await client.estimateGas(transactionRequest);
          // Add 20% buffer to gas limit
          gasLimit = (gasLimit * 12n) / 10n;
        } catch (error) {
          console.warn('Gas estimation failed, using default:', error);
          // Fallback to a generous default for contract interactions
          gasLimit = 300000n; 
        }
      }
      
      console.log('Base gas estimation:', {
        baseFeePerGas: baseFeePerGas.toString(),
        maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
        maxFeePerGas: maxFeePerGas.toString(),
        gasPrice: gasPrice.toString(),
        gasLimit: gasLimit?.toString()
      });
      
      const result = { 
        maxPriorityFeePerGas, 
        maxFeePerGas,
        gasPrice // Include legacy gas price as fallback
      };
      
      if (gasLimit) {
        result.gas = gasLimit;
      }
      
      return result;
      
    } catch (error) {
      console.error('Gas estimation error:', error);
      
      // Fallback to a reasonable default for Base network
      const fallbackGasPrice = BigInt(1_000_000_000); // 1 gwei
      return {
        maxPriorityFeePerGas: fallbackGasPrice,
        maxFeePerGas: fallbackGasPrice * 2n, // 2 gwei max
        gasPrice: fallbackGasPrice,
        gas: 300000n // Default gas limit
      };
    }
  };

  const handleChange = (field, value) => setFormData({ ...formData, [field]: value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setNameError("Name is required.");
      return;
    } else {
      setNameError("");
    }
    try {
      await axios.post("https://reversegenesis.org/edata/meta.php", {
        original: selectedNFT.name,
        owner: address,
        name: formData.name,
        manifesto: formData.manifesto,
        friend: formData.friend,
        weapon: formData.weapon,
      });
      setSelectedNFT(null);
      setShowThankYou(true);
    } catch (error) {
      if (error.response?.status === 400 && error.response.data?.error === "Name is required.") {
        setNameError("Name is required.");
      } else {
        console.error("Submission error:", error);
        alert("Failed to submit form. Please try again.");
      }
    }
  };

  const fetchInviteLists = async () => {
    try {
      setMintLoading(true);
      const response = await fetch(
        `https://api.scatter.art/v1/collection/${COLLECTION_SLUG}/eligible-invite-lists${
          address ? `?walletAddress=${address}` : ""
        }`
      );
      const data = await response.json();
      setInviteLists(data);
      setShowMintModal(true);
    } catch (error) {
      console.error("Error fetching invite lists:", error);
      alert("Failed to fetch mint options. Please try again.");
    } finally {
      setMintLoading(false);
    }
  };

  // REPLACED: Updated approveErc20s function to use new gas logic
  const approveErc20s = async (erc20s) => {
    for (const erc20 of erc20s) {
      try {
        // Check current allowance
        const allowanceResponse = await fetch("/api/check-allowance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tokenAddress: erc20.address,
            owner: address,
            spender: COLLECTION_ADDRESS,
            chainId: CHAIN_ID,
          }),
        });
        
        const { allowance } = await allowanceResponse.json();
        
        if (BigInt(allowance) < BigInt(erc20.amount)) {
          // Prepare transaction request for gas estimation
          const txRequest = {
            to: erc20.address,
            data: encodeFunctionData({
              abi: erc20Abi,
              functionName: "approve",
              args: [COLLECTION_ADDRESS, maxUint256],
            }),
            from: address,
          };
          
          // Get gas estimation including gas limit
          const gasConfig = await getBaseGasFee(txRequest);
          
          await writeContractAsync({
            abi: erc20Abi,
            address: erc20.address,
            functionName: "approve",
            args: [COLLECTION_ADDRESS, maxUint256],
            chainId: CHAIN_ID,
            ...gasConfig
          });
        }
      } catch (error) {
        console.error("Error approving ERC20:", error);
        throw error;
      }
    }
  };

  // REPLACED: Updated executeMint function to use new gas logic
  const executeMint = async () => {
    if (!selectedInviteList || !address) return;

    try {
      setMintLoading(true);

      // Get mint transaction from Scatter API
      const response = await fetch("https://api.scatter.art/v1/mint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          collectionAddress: COLLECTION_ADDRESS,
          chainId: CHAIN_ID,
          minterAddress: address,
          lists: [{ id: selectedInviteList.id, quantity: mintQuantity }],
        }),
      });

      const mintData = await response.json();

      if (!response.ok) {
        throw new Error(mintData.error || "Failed to generate mint transaction");
      }

      // Approve ERC20s if needed
      if (mintData.erc20s && mintData.erc20s.length > 0) {
        await approveErc20s(mintData.erc20s);
      }

      // Prepare mint transaction for gas estimation
      const { to, value, data } = mintData.mintTransaction;
      const mintTxRequest = {
        to,
        value: BigInt(value),
        data,
        from: address,
      };

      // Get proper gas estimation for the mint transaction
      const gasConfig = await getBaseGasFee(mintTxRequest);
      
      // Send the mint transaction with proper gas settings
      await sendTransactionAsync({
        to,
        value: BigInt(value),
        data,
        chainId: CHAIN_ID,
        ...gasConfig
      });

      setShowMintModal(false);
      setShowThankYou(true);
      
    } catch (error) {
      console.error("Mint error:", error);
      // Avoid using alert() for better user experience in modern apps
      // Consider using a toast notification library or an on-screen error message
      // For now, logging the specific error message is better
      console.error(`Failed to mint NFT: ${error.message}`);
    } finally {
      setMintLoading(false);
    }
  };

  return (
    <>
      <div className="p-6 bg-white border-b2 dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">ReVerse Genesis NFTs</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          View, customize, and upgrade your ReVerse Genesis NFTs directly from your wallet.
        </p>
        {loading ? (
          <p className="text-gray-500 dark:text-white">Loading NFTs...</p>
        ) : nfts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-white mb-6">No NFTs found for this wallet.</p>
            {isConnected && (
              <button
                onClick={fetchInviteLists}
                disabled={mintLoading}
                className="px-6 py-2 border-2 border-gray-900 dark:border-white bg-light-100 text-gray-900 dark:bg-dark-300 dark:text-white text-sm [font-family:'Cygnito_Mono',sans-serif] uppercase tracking-wide rounded-none transition-colors duration-200 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mintLoading ? "Loading..." : "Mint ReVerse Genesis NFT"}
              </button>
            )}
          </div>
        ) : (
          <div className="nft-grid gap-4">
            {nfts.map((nft, i) => (
              <div key={i} className="relative bg-gray-100 dark:bg-gray-700 p-4 border-b1 shadow group">
                <div className="absolute left-2 bottom-2 z-10">
                  <div className="relative flex flex-col items-center">
                    <input
                      type="checkbox"
                      checked={selectedNFTs.includes(nft.tokenId)}
                      onChange={() => onSelectNFT(nft.tokenId)}
                      className="peer w-5 h-5 appearance-none rvg-checkbox"
                      id={`select-nft-${nft.tokenId}`}
                    />
                    <div
                      className="opacity-0 peer-hover:opacity-100 transition pointer-events-none absolute bottom-full mb-0 left-1/2 -translate-x-1/2 z-50"
                      style={{ width: 24, height: 24 }}
                    >
                      <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                        width="24" height="24" viewBox="0 0 512 512"
                        className="w-6 h-6 fill-black dark:fill-white"
                        preserveAspectRatio="xMidYMid meet"
                      >
                        <g transform="translate(0,512) scale(0.1,-0.1)" stroke="none">
                          <path d="M2521 3714 c-1125 -535 -2054 -983 -2065 -994 -29 -28 -28 -93 2 -122 16 -17 233 -91 814 -278 l792 -256 254 -789 c194 -606 259 -796 278 -815 31 -32 94 -34 124 -4 11 11 449 922 974 2025 524 1102 962 2023 974 2046 12 23 22 51 22 62 0 53 -50 102 -102 100 -13 -1 -943 -439 -2067 -975z m598 -460 l-1005 -1005 -595 191 c-327 106 -625 202 -664 215 l-70 23 45 20 c25 12 774 368 1665 791 891 424 1622 771 1625 771 3 0 -448 -453 -1001 -1006z m355 -795 c-433 -910 -790 -1657 -793 -1661 -3 -4 -102 290 -219 654 l-214 661 1003 1003 c552 552 1004 1002 1006 1000 1 -1 -351 -747 -783 -1657z"/>
                        </g>
                      </svg>
                    </div>
                  </div>
                </div>
                {nft.image ? (
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="w-full aspect-square object-cover border-b1"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "";
                    }}
                  />
                ) : (
                  <div className="w-full aspect-square bg-gray-300 dark:bg-gray-600 rounded-md flex items-center justify-center text-sm text-gray-600 dark:text-gray-300">
                    No Image
                  </div>
                )}
                <div className="mt-2 text-sm font-medium text-center text-gray-800 dark:text-white">
                  {nft.name}
                </div>
                <div className="flex justify-center mt-3">
                  <button
                    onClick={() => setSelectedNFT(nft)}
                    className="px-4 py-1.5 border-2 border-gray-900 dark:border-white bg-light-100 text-gray-900 dark:bg-dark-300 dark:text-white text-sm [font-family:'Cygnito_Mono',sans-serif] uppercase tracking-wide rounded-none transition-colors duration-200 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black"
                  >
                    UPGRADE NFT
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== MINT MODAL ===== */}
      {showMintModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-60 z-[9999]" />
          <div className="relative z-[10000] flex items-center justify-center min-h-screen w-full px-4 py-10">
            <div className="relative bg-white dark:bg-gray-800 p-6 border-b2 border-2 border-black dark:border-white rounded-none shadow-md max-w-md w-full">
              <button
                className="absolute top-3 right-3 border-2 border-black dark:border-white w-8 h-8 flex items-center justify-center transition bg-transparent text-gray-800 dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black hover:border-black dark:hover:border-white rounded cursor-pointer"
                onClick={() => setShowMintModal(false)}
                aria-label="Close"
              >
                <span className="text-4xl leading-none font-bold dark:font-bold">&#215;</span>
              </button>
              <h3 className="text-base font-normal mb-4 text-center text-gray-800 dark:text-white">MINT REVERSE GENESIS NFT</h3>
              {inviteLists.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    No mint options available for your wallet at this time.
                  </p>
                  <button
                    onClick={() => setShowMintModal(false)}
                    className="px-4 py-1.5 border-2 border-gray-900 dark:border-white bg-light-100 text-gray-900 dark:bg-dark-300 dark:text-white text-sm [font-family:'Cygnito_Mono',sans-serif] uppercase tracking-wide rounded-none transition-colors duration-200 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black"
                  >
                    CLOSE
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
                      Select Mint Option:
                    </label>
                    <div className="space-y-2">
                      {inviteLists.map((list) => (
                        <div
                          key={list.id}
                          className={`p-3 border-2 cursor-pointer transition-colors ${
                            selectedInviteList?.id === list.id
                              ? "border-gray-900 dark:border-white bg-gray-100 dark:bg-gray-700"
                              : "border-gray-300 dark:border-gray-600 hover:border-gray-500 dark:hover:border-gray-400"
                          }`}
                          onClick={() => setSelectedInviteList(list)}
                        >
                          <div className="text-sm font-medium text-gray-800 dark:text-white">
                            {list.name}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Price: {list.token_price} {list.currency_symbol}
                          </div>
                          {list.wallet_limit < 4294967295 && (
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Limit: {list.wallet_limit} per wallet
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  {selectedInviteList && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
                        Quantity:
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={Math.min(selectedInviteList.wallet_limit, 10)}
                        value={mintQuantity}
                        onChange={(e) => setMintQuantity(parseInt(e.target.value) || 1)}
                        className="w-full p-2 border !border-black dark:!border-white bg-white dark:bg-black text-black dark:text-white focus:border-black dark:focus:border-white focus:border-[2px] focus:outline-none focus:ring-0 rounded-none"
                      />
                    </div>
                  )}
                  <div className="flex justify-between mt-6 space-x-4">
                    <button
                      onClick={executeMint}
                      disabled={!selectedInviteList || mintLoading}
                      className="px-4 py-1.5 border-2 border-gray-900 dark:border-white bg-light-100 text-gray-900 dark:bg-dark-300 dark:text-white text-sm [font-family:'Cygnito_Mono',sans-serif] uppercase tracking-wide rounded-none transition-colors duration-200 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {mintLoading ? "MINTING..." : "MINT NFT"}
                    </button>
                    <button
                      onClick={() => setShowMintModal(false)}
                      className="px-4 py-1.5 border-2 border-gray-900 dark:border-white bg-light-100 text-gray-900 dark:bg-dark-300 dark:text-white text-sm [font-family:'Cygnito_Mono',sans-serif] uppercase tracking-wide rounded-none transition-colors duration-200 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== UPGRADE MODAL ===== */}
      {selectedNFT && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-60 z-[9999]" />
          <div className="relative z-[10000] flex items-center justify-center min-h-screen w-full px-4 py-10">
            <div className="relative bg-white dark:bg-gray-800 p-6 border-b2 border-2 border-black dark:border-white rounded-none shadow-md max-w-md w-full">
              <button
                className="absolute top-3 right-3 border-2 border-black dark:border-white w-8 h-8 flex items-center justify-center transition bg-transparent text-gray-800 dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black hover:border-black dark:hover:border-white rounded cursor-pointer"
                onClick={() => setSelectedNFT(null)}
                aria-label="Close"
              >
                <span className="text-4xl leading-none font-bold dark:font-bold">&#215;</span>
              </button>
              <h3 className="text-base font-normal mb-4 text-center text-gray-800 dark:text-white">UPGRADE YOUR NFT</h3>
              <div className="mb-4 border-b1 border-2 border-black dark:border-white">
                <img src={selectedNFT.image} alt={selectedNFT.name} className="w-full aspect-square object-cover" />
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input type="hidden" name="ORIGINAL" value={selectedNFT.name} />
                <div>
                  <label className="block text-base font-medium text-gray-700 dark:text-gray-100 capitalize">name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={e => handleChange("name", e.target.value)}
                    placeholder={selectedNFT.name}
                    className="w-full p-2 border !border-black dark:!border-white bg-white dark:bg-black text-black dark:text-white placeholder-black dark:placeholder-white focus:border-black dark:focus:border-white focus:border-[2px] focus:outline-none focus:ring-0 rounded-none"
                    style={{ boxShadow: 'none' }}
                  />
                  {nameError && (
                    <p className="text-sm text-red-600 mt-1 flex items-center">
                      <svg className="w-4 h-4 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7-4a1 1 0 10-2 0v4a1 1 0 002 0V6zm-1 8a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5z" clipRule="evenodd" />
                      </svg>
                      {nameError}
                    </p>
                  )}
                </div>
                {["manifesto", "friend", "weapon"].map(field => (
                  <div key={field}>
                    <label className="block text-base font-medium text-gray-700 dark:text-gray-100 capitalize">{field}</label>
                    <input
                      type="text"
                      name={field}
                      value={formData[field]}
                      onChange={e => handleChange(field, e.target.value)}
                      placeholder={selectedNFT.traits[field]}
                      className="w-full p-2 border !border-black dark:!border-white bg-white dark:bg-black text-black dark:text-white placeholder-black dark:placeholder-white focus:border-black dark:focus:border-white focus:border-[2px] focus:outline-none focus:ring-0 rounded-none"
                      style={{ boxShadow: 'none' }}
                    />
                  </div>
                ))}
                <div className="flex justify-between mt-6 space-x-4">
                  <button
                    type="submit"
                    className=" px-4 py-1.5 border-2 border-gray-900 dark:border-white bg-light-100 text-gray-900 dark:bg-dark-300 dark:text-white text-sm [font-family:'Cygnito_Mono',sans-serif] uppercase tracking-wide rounded-none transition-colors duration-200 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black"
                  >
                    <span>UPGRADE</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedNFT(null)}
                    className="px-4 py-1.5 border-2 border-gray-900 dark:border-white bg-light-100 text-gray-900 dark:bg-dark-300 dark:text-white text-sm [font-family:'Cygnito_Mono',sans-serif] uppercase tracking-wide rounded-none transition-colors duration-200 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black"
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ===== THANK YOU MODAL ===== */}
      {showThankYou && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center px-4 py-10">
          <div className="relative bg-white dark:bg-gray-800 p-10 rounded shadow-lg max-w-lg w-full text-center">
            <button
              className="absolute top-3 right-3 border-2 border-black dark:border-white w-8 h-8 flex items-center justify-center transition bg-transparent text-gray-800 dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black hover:border-black dark:hover:border-white rounded cursor-pointer"
              onClick={() => setShowThankYou(false)}
            >
              <span className="text-4xl leading-none font-bold dark:font-bold">&#215;</span>
            </button>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              THANK YOU
            </h4>
            <p className="text-base text-gray-700 dark:text-gray-300 mb-8">
              Your transaction was successful! Please allow a few minutes for the changes to reflect.
            </p>
            <button
              onClick={() => setShowThankYou(false)}
              className="px-4 py-1.5 border-2 border-gray-900 dark:border-white bg-light-100 text-gray-900 dark:bg-dark-300 dark:text-white text-sm [font-family:'Cygnito_Mono',sans-serif] uppercase tracking-wide rounded-none transition-colors duration-200 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </>
  );
}
