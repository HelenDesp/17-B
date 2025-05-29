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
        {loading ? <p className="text-gray-500">Loading NFTs...</p> : nfts.length === 0 ? <p className="text-gray-500">No NFTs found for this wallet.</p> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {nfts.map((nft, i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow">
                {nft.image ? (
                  <img src={nft.image} alt={nft.name} className="w-full aspect-square object-cover rounded-md" />
                ) : (
                  <div className="w-full aspect-square bg-gray-300 dark:bg-gray-600 rounded-md flex items-center justify-center text-sm text-gray-600 dark:text-gray-300">No Image</div>
                )}
                <div className="mt-2 text-sm font-medium text-gray-800 dark:text-white">#{nft.tokenId} — {nft.name}</div>
				<div className="flex justify-center mt-3">
				  <button
					onClick={() => setSelectedNFT(nft)}
					className="text-sm font-medium px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-md max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Update Metadata</h3>
            <img src={selectedNFT.image} alt={selectedNFT.name} className="w-full aspect-square object-cover rounded-md mb-4" />
            <form action="https://send.pageclip.co/IgFbgtxm7tEQArpitPE1ovBq2C1Va3nK" method="POST" className="pageclip-form space-y-3">
			  <input type="hidden" name="ORIGINAL" value={selectedNFT.name} />
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 capitalize">name</label>
                <input type="text" name="name"
                  value={formData.name}
                  onChange={e => handleChange("name", e.target.value)}
                  placeholder={selectedNFT.name}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 placeholder-gray-400 focus:placeholder-transparent text-gray-900 dark:text-white"
                />
              </div>
              {["manifesto", "friend", "weapon"].map(field => (
                <div key={field}>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 capitalize">{field}</label>
                  <input type="text" name={field}
                    value={formData[field]}
                    onChange={e => handleChange(field, e.target.value)}
                    placeholder={selectedNFT.traits[field]}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 placeholder-gray-400 focus:placeholder-transparent text-gray-900 dark:text-white"
                  />
                </div>
              ))}
              <div className="flex justify-between mt-4">
                <button type="submit" className="pageclip-form__submit bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"><span>Send</span></button>
                <button type="button" onClick={() => setSelectedNFT(null)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
