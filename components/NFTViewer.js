"use client";
import { useState } from "react";
import axios from "axios";
import { useAccount } from "wagmi";
import { useQuery, useMutation, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { sendTransaction, writeContract, readContract } from "wagmi/actions";
import { erc20Abi, maxUint256 } from "viem";

// IMPORTANT: You must import your project's wagmi config file.
// The path "@config" is a common convention but might be different in your project.
// Please update the path to point to your actual wagmi config file.
import { config } from "@/config";

// --- Constants ---
const SCATTER_API_URL = "https://api.scatter.art/v1";
const COLLECTION_SLUG = "reverse-genesis";

// Create a client for React Query
const queryClient = new QueryClient();

// --- Main Component Wrapper (Provides React Query Context) ---
// This wrapper is necessary for the TanStack Query hooks to work.
export default function NFTViewerWrapper(props) {
  return (
    <QueryClientProvider client={queryClient}>
      <NFTViewer {...props} />
    </QueryClientProvider>
  );
}


// --- The actual viewer component, merging your original code with the minting logic ---
function NFTViewer({ nfts: initialNfts, selectedNFTs, onSelectNFT }) {
  const { address, isConnected } = useAccount();

  // --- State from your original component ---
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [formData, setFormData] = useState({ name: "", manifesto: "", friend: "", weapon: "" });
  const [nameError, setNameError] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);
  const [loading] = useState(false); // Your original loading state

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


  // --- TanStack Query for fetching collection data from Scatter API ---
  const { data: collection, isPending: isCollectionPending } = useQuery({
    queryKey: ["collection", COLLECTION_SLUG],
    queryFn: async () => {
      const response = await fetch(`${SCATTER_API_URL}/collection/${COLLECTION_SLUG}`);
      if (!response.ok) throw new Error("Failed to fetch collection data");
      const data = await response.json();
      // ABI comes back as a string, parsing it here to use with wagmi
      return { ...data, abi: JSON.parse(data.abi) };
    },
  });

  // --- TanStack Query for fetching eligible invite lists from Scatter API ---
  const { data: inviteLists, isPending: isInviteListsPending } = useQuery({
    queryKey: ["eligibleInviteLists", COLLECTION_SLUG, address],
    queryFn: async () => {
      const response = await fetch(
        `${SCATTER_API_URL}/collection/${COLLECTION_SLUG}/eligible-invite-lists${
          address ? `?minterAddress=${address}` : ""
        }`
      );
      if (!response.ok) throw new Error("Failed to fetch invite lists");
      return response.json();
    },
    // Only run this query if the user is connected
    enabled: !!isConnected,
  });

  const isApiLoading = isCollectionPending || (isConnected && isInviteListsPending);

  return (
    <>
      <div className="p-6 bg-white border-b2 dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">ReVerse Genesis NFTs</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          View, customize, and upgrade your ReVerse Genesis NFTs directly from your wallet.
        </p>
        
        {loading ? (
             <p className="text-gray-500 dark:text-white">Loading NFTs...</p>
        ) : initialNfts.length === 0 ? (
          // --- Minting section when user has no NFTs ---
          <div className="text-center text-gray-500 dark:text-white py-6">
            <p>No NFTs found for this wallet.</p>
            <div className="mt-4">
              <p className="mb-3">
                Don't have RVG NFTs? Mint from{" "}
                <a
                  href={`https://www.scatter.art/collection/${COLLECTION_SLUG}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-500 hover:text-blue-400"
                >
                  scatter.art
                </a>, or you can mint directly below.
              </p>
              
              {isApiLoading && <p>Loading mint options...</p>}

              {!isApiLoading && !isConnected && <p>Please connect your wallet to see mint options.</p>}

              {!isApiLoading && isConnected && (!inviteLists || inviteLists.length === 0) && (
                <p>Sorry, you are not eligible to mint at this time.</p>
              )}

              {!isApiLoading && isConnected && inviteLists && inviteLists.length > 0 && collection && (
                // Render the first available invite list.
                <InviteList key={inviteLists[0].id} list={inviteLists[0]} collection={collection} />
              )}
            </div>
          </div>
        ) : (
          // --- Your Original NFT grid view ---
          <div className="nft-grid gap-4">
            {initialNfts.map((nft, i) => (
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
                          <path d="M2521 3714 c-1125 -535 -2054 -983 -2065 -994 -29 -28 -28 -93 2
                          -122 16 -17 233 -91 814 -278 l792 -256 254 -789 c194 -606 259 -796 278 -815
                          31 -32 94 -34 124 -4 11 11 449 922 974 2025 524 1102 962 2023 974 2046 12
                          23 22 51 22 62 0 53 -50 102 -102 100 -13 -1 -943 -439 -2067 -975z m598 -460
                          l-1005 -1005 -595 191 c-327 106 -625 202 -664 215 l-70 23 45 20 c25 12 774
                          368 1665 791 891 424 1622 771 1625 771 3 0 -448 -453 -1001 -1006z m355 -795
                          c-433 -910 -790 -1657 -793 -1661 -3 -4 -102 290 -219 654 l-214 661 1003
                          1003 c552 552 1004 1002 1006 1000 1 -1 -351 -747 -783 -1657z"/>
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

      {/* --- Your existing modals for UPGRADE and THANK YOU --- */}
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
                 {/* ... form content ... */}
              </form>
            </div>
          </div>
        </div>
      )}
       {showThankYou && (
         <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center px-4 py-10">
            {/* ... thank you modal content ... */}
        </div>
      )}
    </>
  );
}


// --- InviteList Component (handles minting for a specific list) ---
function InviteList({ list, collection }) {
    const { address, isConnected, chainId } = useAccount();

    const isCorrectChain = chainId === collection.chain_id;

    // --- TanStack Mutation for the entire minting process ---
    const { mutate: mint, isPending } = useMutation({
        mutationFn: async (listId) => {
            if (!isCorrectChain) {
                throw new Error(`Please switch to the correct network (Chain ID: ${collection.chain_id})`);
            }

            // 1. Get transaction data from Scatter API
            const response = await fetch(`${SCATTER_API_URL}/mint`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    collectionAddress: collection.address,
                    chainId: collection.chain_id,
                    minterAddress: address,
                    lists: [{ id: listId, quantity: 1 }],
                }),
            }).then((res) => {
                if (!res.ok) throw new Error("Failed to get mint transaction");
                return res.json();
            });

            const { mintTransaction, erc20s } = response;

            // 2. Approve ERC20s if necessary
            if (erc20s && erc20s.length > 0) {
                for (const erc20 of erc20s) {
                    const allowance = await readContract(config, {
                        abi: erc20Abi,
                        address: erc20.address,
                        functionName: "allowance",
                        args: [address, collection.address],
                        chainId: collection.chain_id,
                    });
                    if (allowance < BigInt(erc20.amount)) {
                        await writeContract(config, {
                            abi: erc20Abi,
                            address: erc20.address,
                            functionName: "approve",
                            args: [collection.address, maxUint256],
                            chainId: collection.chain_id,
                        });
                    }
                }
            }
            
            // 3. Send the final transaction
            await sendTransaction(config, {
                account: address,
                to: mintTransaction.to,
                value: BigInt(mintTransaction.value),
                data: mintTransaction.data,
                chainId: collection.chain_id,
            });
        },
        onSuccess: () => {
            alert("Mint successful! Your new NFT will appear shortly.");
            // Optionally, you can trigger a refetch of the user's NFTs here.
        },
        onError: (error) => {
            console.error("Minting failed:", error);
            alert(`Minting failed: ${error.message}`);
        },
    });
    
    const price = list.token_price === "0" ? "FREE" : `${list.token_price} ${list.currency_symbol}`;

    return (
        <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg max-w-md mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-lg">{list.name}</h3>
                    <p>Price: {price}</p>
                </div>
                <button
                    onClick={() => mint(list.id)}
                    disabled={!isConnected || isPending || !isCorrectChain}
                    className="px-6 py-2 border-2 border-gray-900 dark:border-white bg-light-100 text-gray-900 dark:bg-dark-300 dark:text-white text-md [font-family:'Cygnito_Mono',sans-serif] uppercase tracking-wider rounded-none transition-colors duration-200 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPending ? "Minting..." : "Mint Here"}
                </button>
            </div>
            {!isCorrectChain && isConnected && (
                <p className="text-red-500 text-sm mt-2">Please switch to the correct network to mint.</p>
            )}
        </div>
    );
}
