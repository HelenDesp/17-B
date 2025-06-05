"use client";
import { useState } from "react";
import axios from "axios";
import { useAccount } from "wagmi";

const MORALIS_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImE2YWU4Y2E2LWNiNWUtNDJmNi1hYjQ5LWUzZWEwZTM5NTI2MSIsIm9yZ0lkIjoiNDQ1NTcxIiwidXNlcklkIjoiNDU4NDM4IiwidHlwZUlkIjoiMDhiYmI4YTgtMzQxYy00YTJhLTk2NGUtN2FlMGZmMzI2ODUxIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NDY1NDA1MzgsImV4cCI6NDkwMjMwMDUzOH0._O5uiNnyo2sXnJDbre0_9mDklKTmrj90Yn2HXJJnZRk";

export default function NFTViewer({
  nfts,
  selectedNFTs = [],
  onSelectNFT = () => {},
}) {
  const { address, isConnected } = useAccount();
  const [loading] = useState(false); // For future use if needed
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [formData, setFormData] = useState({ name: "", manifesto: "", friend: "", weapon: "" });
  const [nameError, setNameError] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);

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

  return (
    <>
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">ReVerse Genesis NFTs</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          View, customize, and upgrade your ReVerse Genesis NFTs directly from your wallet.
        </p>
        {loading ? (
          <p className="text-gray-500">Loading NFTs...</p>
        ) : nfts.length === 0 ? (
          <p className="text-gray-500">No NFTs found for this wallet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {nfts.map((nft, i) => (
              <div key={i} className="relative bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow group">
                {/* Checkbox always at bottom left with tooltip */}
<div className="absolute left-2 bottom-2 z-10 flex items-center group">
  <input
    type="checkbox"
    checked={selectedNFTs.includes(nft.tokenId)}
    onChange={() => onSelectNFT(nft.tokenId)}
    className="w-5 h-5 border-2 border-gray-400 rounded-sm bg-white text-primary-600 accent-primary-600"
    id={`select-nft-${nft.tokenId}`}
  />
  <div className="ml-2 relative flex flex-col items-center">
    <div className="opacity-0 group-hover:opacity-100 transition pointer-events-none absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50 bg-black text-white p-2 rounded shadow">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"
        strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M2.5 17.5l15-6a1 1 0 000-1.9l-15-6A1 1 0 001 5.1v9.8a1 1 0 001.5.6z" />
      </svg>
    </div>
  </div>
</div>
                {nft.image ? (
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="w-full aspect-square object-cover rounded-md"
                  />
                ) : (
                  <div className="w-full aspect-square bg-gray-300 dark:bg-gray-600 rounded-md flex items-center justify-center text-sm text-gray-600 dark:text-gray-300">
                    No Image
                  </div>
                )}
                <div className="mt-2 text-sm font-medium text-center text-gray-800 dark:text-white">
                  #{nft.tokenId} — {nft.name}
                </div>
                <div className="flex justify-center mt-3">
                  <button
                    onClick={() => setSelectedNFT(nft)}
                    className="px-4 py-1.5 border-2 border-gray-900 dark:border-white bg-light-100 text-gray-900 dark:bg-dark-300 dark:text-white text-sm [font-family:'Cygnito_Mono',sans-serif] uppercase tracking-wide rounded-none transition-colors duration-200 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black"
                  >
                    UPGRADE YOUR NFT
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedNFT && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center px-4 py-10">
            <div className="bg-white dark:bg-gray-800 p-6 border-2 border-black dark:border-white rounded-none shadow-md max-w-md w-full">
              <h3 className="text-base font-normal mb-4 text-center text-gray-800 dark:text-white">UPGRADE YOUR NFT</h3>
              <img src={selectedNFT.image} alt={selectedNFT.name} className="w-full aspect-square object-cover rounded-md mb-4" />
              <form onSubmit={handleSubmit} className="space-y-3">
                <input type="hidden" name="ORIGINAL" value={selectedNFT.name} />
                <div>
                  <label className="block text-base font-medium text-gray-700 dark:text-gray-200 capitalize">name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={e => handleChange("name", e.target.value)}
                    placeholder={selectedNFT.name}
                    className="w-full p-2 !border !border-black dark:!border-white !bg-white dark:! bg-gray-700 !text-gray-900 dark:!text-white placeholder-gray-400 focus:placeholder-transparent focus:!border-2 !rounded-none focus:outline-none focus:ring-0"
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
                    <label className="block text-base font-medium text-gray-700 dark:text-gray-200 capitalize">{field}</label>
                    <input
                      type="text"
                      name={field}
                      value={formData[field]}
                      onChange={e => handleChange(field, e.target.value)}
                      placeholder={selectedNFT.traits[field]}
                      className="w-full p-2 !border !border-black dark:!border-white !bg-white dark:! bg-gray-700 !text-gray-900 dark:!text-white placeholder-gray-400 focus:placeholder-transparent focus:!border-2 !rounded-none focus:outline-none focus:ring-0"
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
      {showThankYou && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4 py-10">
          <div className="relative bg-white dark:bg-gray-800 p-10 rounded shadow-lg max-w-lg w-full text-center">
            <button
              className="absolute top-3 right-3 text-lg text-gray-800 dark:text-white border-2 border-black dark:border-white w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              onClick={() => setShowThankYou(false)}
            >
              &times;
            </button>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              THANK YOU
            </h4>
            <p className="text-base text-gray-700 dark:text-gray-300 mb-8">
              Your data was sent and will be available on-chain within 24 hours due to premoderation to avoid spam and abuse.
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