"use client";
import { useState } from "react";
import axios from "axios";
import { useAccount } from "wagmi";
import PalMoji from "./PalMoji";

export default function NFTViewer({
  nfts,
  selectedNFTs = [],
  onSelectNFT = () => {},
}) {
  const { address } = useAccount();
  const [loading] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [formData, setFormData] = useState({ name: "", manifesto: "", friend: "", weapon: "" });
  const [nameError, setNameError] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);

  // RENAMED state variables
  const [isPalMojiOpen, setIsPalMojiOpen] = useState(false);
  const [activePalMojiNFT, setActivePalMojiNFT] = useState(null);

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

  // RENAMED function
  const handleOpenPalMoji = (nft) => {
    setActivePalMojiNFT(nft);
    setIsPalMojiOpen(true);
  };

  // RENAMED function
  const handleClosePalMoji = () => {
    setIsPalMojiOpen(false);
    setActivePalMojiNFT(null);
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
          <p className="text-gray-500 dark:text-white">No NFTs found for this wallet.</p>
        ) : (
          <div className="nft-grid gap-4">
            {nfts.map((nft, i) => (
              <div key={i} className="relative bg-gray-100 dark:bg-gray-700 p-4 border-b1 shadow group">
                
                <button 
                  onClick={() => handleOpenPalMoji(nft)} // RENAMED
                  className="absolute top-2 left-2 z-10 p-1.5 bg-pink-200/80 dark:bg-pink-800/80 rounded-full hover:bg-pink-300 dark:hover:bg-pink-700 transition-colors"
                  aria-label="View Your PalMoji" // RENAMED
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-600 dark:text-pink-300"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                </button>

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
                    onError={(e) => { e.currentTarget.src = ""; }}
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

      {/* ===== FULL UPGRADE MODAL ===== */}
      {selectedNFT && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-60 z-[9999]" onClick={() => setSelectedNFT(null)} />
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
                      placeholder={selectedNFT.traits ? selectedNFT.traits[field] : ''}
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

      {/* ===== PalMoji MODAL with updated header ===== */}
      {isPalMojiOpen && activePalMojiNFT && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-70 z-[9999]" onClick={handleClosePalMoji} />
          <div className="relative z-[10000] bg-white dark:bg-gray-800 p-6 border-b2 border-2 border-black dark:border-white rounded-none shadow-md max-w-lg w-full">
            
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-3">
                    <img 
                        src={activePalMojiNFT.image} 
                        alt={activePalMojiNFT.name}
                        className="h-12 w-12 object-cover border border-black dark:border-white"
                    />
                    <div>
                        <p className="text-base text-gray-500 dark:text-gray-400">{activePalMojiNFT.name}</p>
                        <p className="text-sm font-normal text-gray-800 dark:text-white">Your PalMoji</p> 
                    </div>
                </div>
                <button
                    className="border-2 border-black dark:border-white w-8 h-8 flex items-center justify-center transition bg-transparent text-gray-800 dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black rounded cursor-pointer"
                    onClick={handleClosePalMoji}
                    aria-label="Close"
                >
                    <span className="text-4xl leading-none font-bold">&#215;</span>
                </button>
            </div>

            <PalMoji 
                PalMojiTrait={activePalMojiNFT.traits?.PalMoji || 'type:cat, color:grey, eyes:normal'} // RENAMED
                nftId={activePalMojiNFT.tokenId}
                ownerNFTImage={activePalMojiNFT.image}
            />
          </div>
        </div>
      )}

      {/* ===== FULL THANK YOU MODAL ===== */}
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
