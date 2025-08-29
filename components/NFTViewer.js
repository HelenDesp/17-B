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
  // --- Icon Style Controls ---
  const iconEyeSpacing = -6;        // Adjusts space between the two '^' characters.
  const iconEyeVerticalShift = -5; // Moves the '^' characters up (negative) or down (positive).
  // -------------------------  
  const iconPositionBottom = 4; // Position from the bottom edge, in pixels.
  const iconPositionRight = 6;  // Position from the right edge, in pixels. 
  
  const [loading] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [formData, setFormData] = useState({ name: "", manifesto: "", talisman: "", weapon: "" });
  const [nameError, setNameError] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // RENAMED state variables
  const [isPalMojiOpen, setIsPalMojiOpen] = useState(false);
  const [activePalMojiNFT, setActivePalMojiNFT] = useState(null);
  const [palMojiNames, setPalMojiNames] = useState({});
  
  const [showAll, setShowAll] = useState(false);

  const handleChange = (field, value) => setFormData({ ...formData, [field]: value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setNameError("Name is required.");
      return;
    } else {
      setNameError("");
    }

    setIsSubmitting(true); // <-- Start loading
    try {
      await axios.post("https://reversegenesis.org/edata/meta.php", {
        original: selectedNFT.name,
        owner: address,
        name: formData.name,
        manifesto: formData.manifesto,
        talisman: formData.talisman,
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
    } finally {
      setIsSubmitting(false); // <-- Stop loading
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
  
	const handleNameChange = (newName) => {
		if (newName && newName.trim() && activePalMojiNFT) {
		  setPalMojiNames(prevNames => ({
			...prevNames,
			[activePalMojiNFT.tokenId]: newName.trim(),
		  }));
		}
	};

  const displayedNfts = showAll ? nfts : nfts.slice(0, 4);	

  return (
    <>
      <div className="p-6 bg-white border-b2 dark:bg-gray-800 rounded-lg shadow-md">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">ReVerse Genesis NFTs</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View, customize, and upgrade your ReVerse Genesis NFTs directly from your wallet.
            </p>
          </div>
          <div className="text-right flex-shrink-0 ml-4">
			<p className="font-semibold text-gray-800 dark:text-white text-lg">
			  {`RVG NFT${nfts.length === 1 ? '' : 's'}: ${nfts.length}`}
			</p>
            {nfts.length > 4 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="flex items-center justify-end w-full text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <span>{showAll ? "Hide" : "Show All"}</span>
                {showAll ? (
                  <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
                ) : (
                  <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                )}
              </button>
            )}
          </div>
        </div>
        {loading ? (
          <p className="text-gray-500 dark:text-white">Loading NFTs...</p>
        ) : nfts.length === 0 ? (
          <p className="text-gray-500 dark:text-white">No NFTs found for this wallet.</p>
        ) : (
          <div className="nft-grid gap-4">
            {displayedNfts.map((nft, i) => (
              <div key={i} className="relative bg-gray-100 dark:bg-gray-700 p-4 border-b1 shadow group">
                
                <button
                  onClick={() => handleOpenPalMoji(nft)}
                  className="absolute z-10 font-mono text-xl text-gray-800 dark:text-white hover:scale-110 transform transition-transform duration-200"
                  aria-label="Create Your PalMoji"
                  style={{
                    fontFamily: '"Doto", monospace',
                    fontWeight: 900,
                    textShadow: '0.1px 0 #000, -0.1px 0 #000, 0 0.1px #000, 0 -0.1px #000, 0.1px 0.1px #000, -0.1px -0.1px #000, 0.1px -0.1px #000, -0.1px 0.1px #000',
                    lineHeight: 0.9,
                    transform: 'scale(1, 1)',
                    fontSize: '22px',
                    whiteSpace: 'nowrap',
                    bottom: `${iconPositionBottom}px`,
                    right: `${iconPositionRight}px`,
                  }}
                >
                  <span style={{ position: 'relative', top: `${iconEyeVerticalShift}px` }}>^</span>
                  <span style={{ marginLeft: `${iconEyeSpacing}px`, marginRight: `${iconEyeSpacing}px` }}>w</span>
                  {/* Corrected variable name below */}
                  <span style={{ position: 'relative', top: `${iconEyeVerticalShift}px` }}>^</span>
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
            <div className="relative bg-white dark:bg-gray-800 p-6 border-b2 border-2 border-black dark:border-white rounded-none shadow-md max-w-md w-full max-h-[95vh] overflow-y-auto">
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
				{/* Manifesto Input (Unchanged Logic) */}
				<div>
				  <label className="block text-base font-medium text-gray-700 dark:text-gray-100 capitalize">manifesto</label>
				  <input
					type="text"
					name="manifesto"
					value={formData.manifesto}
					onChange={e => handleChange("manifesto", e.target.value)}
					placeholder={selectedNFT.traits?.manifesto || ''}
					className="w-full p-2 border !border-black dark:!border-white bg-white dark:bg-black text-black dark:text-white placeholder-black dark:placeholder-white focus:border-black dark:focus:border-white focus:border-[2px] focus:outline-none focus:ring-0 rounded-none"
					style={{ boxShadow: 'none' }}
				  />
				</div>

				{/* Talisman Input (NEW FALLBACK LOGIC) */}
				<div>
				  <label className="block text-base font-medium text-gray-700 dark:text-gray-100 capitalize">talisman</label>
				  <input
					type="text"
					name="talisman"
					value={formData.talisman}
					onChange={e => handleChange("talisman", e.target.value)}
					placeholder={selectedNFT.traits?.talisman || 'Concealed'}
					className="w-full p-2 border !border-black dark:!border-white bg-white dark:bg-black text-black dark:text-white placeholder-black dark:placeholder-white focus:border-black dark:focus:border-white focus:border-[2px] focus:outline-none focus:ring-0 rounded-none"
					style={{ boxShadow: 'none' }}
				  />
				</div>

				{/* Weapon Input (Unchanged Logic) */}
				<div>
				  <label className="block text-base font-medium text-gray-700 dark:text-gray-100 capitalize">weapon</label>
				  <input
					type="text"
					name="weapon"
					value={formData.weapon}
					onChange={e => handleChange("weapon", e.target.value)}
					placeholder={selectedNFT.traits?.weapon || ''}
					className="w-full p-2 border !border-black dark:!border-white bg-white dark:bg-black text-black dark:text-white placeholder-black dark:placeholder-white focus:border-black dark:focus:border-white focus:border-[2px] focus:outline-none focus:ring-0 rounded-none"
					style={{ boxShadow: 'none' }}
				  />
				</div>
                <div className="flex justify-between mt-6 space-x-4">
                  <button
                    type="submit"
					disabled={isSubmitting}
                    className=" px-4 py-1.5 border-2 border-gray-900 dark:border-white bg-light-100 text-gray-900 dark:bg-dark-300 dark:text-white text-sm [font-family:'Cygnito_Mono',sans-serif] uppercase tracking-wide rounded-none transition-colors duration-200 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black"
                  >
                    <span>{isSubmitting ? 'UPGRADING...' : 'UPGRADE'}</span>
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
      {isPalMojiOpen && activePalMojiNFT && (() => {
        // This logic now correctly formats the name for display
        const palMojiName = palMojiNames[activePalMojiNFT.tokenId];
        const displayName = palMojiName ? `${palMojiName} PalMoji` : 'Your PalMoji';

        return (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-70 z-[9999]" onClick={handleClosePalMoji} />
            <div className="relative z-[10000] bg-white dark:bg-gray-800 p-6 border-b2 border-2 border-black dark:border-white rounded-none shadow-md max-w-lg w-full max-h-[95vh] overflow-y-auto">
              
              <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-3">
                      <img 
                          src={activePalMojiNFT.image} 
                          alt={activePalMojiNFT.name}
                          className="h-12 w-12 object-cover border border-black dark:border-white"
                      />
                      <div>
                          <p className="text-base text-gray-500 dark:text-gray-400">{activePalMojiNFT.name}</p>
                          {/* THIS LINE IS NOW FIXED to use the displayName variable */}
                          <p className="text-sm font-normal text-gray-800 dark:text-white">
                            {displayName}
                          </p> 
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
                PalMojiTrait={activePalMojiNFT.traits?.PalMoji || '...'}
                nftId={activePalMojiNFT.tokenId}
                ownerNFTImage={activePalMojiNFT.image}
                onNameChange={handleNameChange}
                currentName={displayName} // This also uses the correct displayName
                originalNFTName={activePalMojiNFT.name}
              />
            </div>
          </div>
        );
      })()}
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
              THANK YOU!
            </h4>
            <p className="text-base text-gray-700 dark:text-gray-300 mb-8">
              Your data was sent and will be available on-chain within 48 hours due to pre-moderation to avoid spam and abuse.
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
