"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

const MORALIS_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImE2YWU4Y2E2LWNiNWUtNDJmNi1hYjQ5LWUzZWEwZTM5NTI2MSIsIm9yZ0lkIjoiNDQ1NTcxIiwidXNlcklkIjoiNDU4NDM4IiwidHlwZUlkIjoiMDhiYmI4YTgtMzQxYy00YTJhLTk2NGUtN2FlMGZmMzI2ODUxIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NDY1NDA1MzgsImV4cCI6NDkwMjMwMDUzOH0._O5uiNnyo2sXnJDbre0_9mDklKTmrj90Yn2HXJJnZRk";

export default function NFTViewer() {
  const { address, isConnected } = useAccount();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [formData, setFormData] = useState({ name: "", manifesto: "", friend: "", weapon: "" });
  
  const [showThankYou, setShowThankYou] = useState(false);
 
useEffect(() => {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    if (params.get("submitted") === "true") {
      setTimeout(() => {
        setShowThankYou(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 300);
    }
  }
}, []);
  
  const [pageclipReady, setPageclipReady] = useState(false);
  
  useEffect(() => {
    if (!window.Pageclip) {
      const script = document.createElement("script");
      script.src = "https://s.pageclip.co/v1/pageclip.js";
      script.async = true;
      script.onload = () => setPageclipReady(true);
      document.body.appendChild(script);
    } else {
      setPageclipReady(true);
    }
  }, []);


  useEffect(() => {
    const fetchNFTs = async () => {
      if (!address) return;
      setLoading(true);
      try {
        const res = await fetch(`https://deep-index.moralis.io/api/v2.2/${address}/nft?chain=base&format=decimal&normalizeMetadata=true`, {
          headers: { "X-API-Key": MORALIS_API_KEY, accept: "application/json" },
        });
        const data = await res.json();
        const parsed = (data.result || [])
          .filter(nft => nft.token_address?.toLowerCase() === "0x28d744dab5804ef913df1bf361e06ef87ee7fa47")
          .map(nft => {
            let metadata = {};
            try { metadata = nft.metadata ? JSON.parse(nft.metadata) : {}; } catch { metadata = {}; }
            const image = metadata.image?.startsWith("ipfs://")
              ? metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")
              : metadata.image;
            const name = (metadata.name || nft.name || `Token #${nft.token_id}`).replace(/^#\d+\s*[-–—]*\s*/, "");
            const getTrait = type => metadata.attributes?.find(attr => attr.trait_type === type)?.value || "";
            return { tokenId: nft.token_id, name, image, traits: { manifesto: getTrait("Manifesto"), friend: getTrait("Friend"), weapon: getTrait("Weapon") } };
          });
        setNfts(parsed);
      } catch (err) {
        console.error("Failed to fetch NFTs from Moralis:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNFTs();
  }, [address]);

  const handleChange = (field, value) => setFormData({ ...formData, [field]: value });

  return (
    <>
      <link rel="stylesheet" href="https://s.pageclip.co/v1/pageclip.css" media="screen" />
      <script src="https://s.pageclip.co/v1/pageclip.js" charSet="utf-8"></script>
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">ReVerse Genesis NFTs</h2>
		<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">View, customize, and upgrade your ReVerse Genesis NFTs directly from your wallet.</p>
        {loading ? <p className="text-gray-500">Loading NFTs...</p> : nfts.length === 0 ? <p className="text-gray-500">No NFTs found for this wallet.</p> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {nfts.map((nft, i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow">
                {nft.image ? (
                  <img src={nft.image} alt={nft.name} className="w-full aspect-square object-cover rounded-md" />
                ) : (
                  <div className="w-full aspect-square bg-gray-300 dark:bg-gray-600 rounded-md flex items-center justify-center text-sm text-gray-600 dark:text-gray-300">No Image</div>
                )}
				<div className="mt-2 text-sm font-medium text-center text-gray-800 dark:text-white">
				  #{nft.tokenId} — {nft.name}
				</div>
				<div className="flex justify-center mt-3">
				  <button
					onClick={() => setSelectedNFT(nft)}
					className="px-4 py-1.5 border-2 border-gray-900 dark:border-white bg-light-100 text-gray-900 dark:bg-dark-300 dark:text-white px-4 py-1.5 text-sm [font-family:'Cygnito_Mono',sans-serif] uppercase tracking-wide rounded-none transition-colors duration-200 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black"
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
		  <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-md max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-center text-gray-800 dark:text-white">UPGRADE YOUR NFT</h3>
            <img src={selectedNFT.image} alt={selectedNFT.name} className="w-full aspect-square object-cover rounded-md mb-4" />
<form
  action="https://send.pageclip.co/IgFbgtxm7tEQArpitPE1ovBq2C1Va3nK"
  method="POST"
  className="pageclip-form space-y-3"
>
			  <input type="hidden" name="ORIGINAL" value={selectedNFT.name} />
			  <input type="hidden" name="_redirect" value="https://17-b.vercel.app/?submitted=true" />
              <div>
                <label className="block text-base font-medium text-gray-700 dark:text-gray-200 capitalize">name</label>
                <input type="text" name="name"
                  value={formData.name}
                  onChange={e => handleChange("name", e.target.value)}
                  placeholder={selectedNFT.name}
                  className="w-full p-2 !border !border-black dark:!border-white !bg-gray-50 dark:!bg-gray-700 !text-gray-900 dark:!text-white placeholder-gray-400 focus:placeholder-transparent focus:!border-2 !rounded-none focus:outline-none focus:ring-0"
                />
              </div>
              {["manifesto", "friend", "weapon"].map(field => (
                <div key={field}>
                  <label className="block text-base font-medium text-gray-700 dark:text-gray-200 capitalize">{field}</label>
                  <input type="text" name={field}
                    value={formData[field]}
                    onChange={e => handleChange(field, e.target.value)}
                    placeholder={selectedNFT.traits[field]}
                    className="w-full p-2 !border !border-black dark:!border-white !bg-gray-50 dark:!bg-gray-700 !text-gray-900 dark:!text-white placeholder-gray-400 focus:placeholder-transparent focus:!border-2 !rounded-none focus:outline-none focus:ring-0"
                  />
                </div>
              ))}
				<div className="flex justify-between mt-6 space-x-4">
				  <button
					type="submit"
					className="pageclip-form__submit px-4 py-1.5 border-2 border-gray-900 dark:border-white bg-light-100 text-gray-900 dark:bg-dark-300 dark:text-white text-sm [font-family:'Cygnito_Mono',sans-serif] uppercase tracking-wide rounded-none transition-colors duration-200 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black"
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
			  
			  {/* Close Icon */}
			  <button
				className="absolute top-3 right-3 text-lg text-gray-800 dark:text-white border-2 border-black dark:border-white w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition"
				onClick={() => setShowThankYou(false)}
			  >
				&times;
			  </button>

			  {/* Message */}
			  <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
				THANK YOU
			  </h4>
			  <p className="text-base text-gray-700 dark:text-gray-300 mb-8">
				Your data was sent and will be available on-chain within 24 hours due to premoderation to avoid spam and abuse.
			  </p>

			  {/* Close Button */}
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
