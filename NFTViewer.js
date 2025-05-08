
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
        const res = await fetch(
          `https://deep-index.moralis.io/api/v2.2/${address}/nft?chain=base&format=decimal`,
          {
            headers: {
              "X-API-Key": MORALIS_API_KEY,
              accept: "application/json",
            },
          }
        );
        const data = await res.json();

        const parsed = (data.result || [])
          .filter(nft => nft.token_address?.toLowerCase() === "0x28d744dab5804ef913df1bf361e06ef87ee7fa47")
          .map((nft) => {
            let metadata = {};
            try {
              metadata = nft.metadata ? JSON.parse(nft.metadata) : {};
            } catch (e) {
              metadata = {};
            }

            const image = metadata.image?.startsWith("ipfs://")
              ? metadata.image.replace("ipfs://", "https://salmon-left-clam-542.mypinata.cloud/ipfs/")
              : metadata.image;

            const name = (metadata.name || nft.name || `Token #${nft.token_id}`).replace(/^#\d+\s*—\s*/, "");

            const getTrait = (trait_type) =>
              metadata.attributes?.find((attr) => attr.trait_type === trait_type)?.value || "";

            return {
              tokenId: nft.token_id,
              name,
              image,
              traits: {
                manifesto: getTrait("Manifesto"),
                friend: getTrait("Friend"),
                weapon: getTrait("Weapon")
              }
            };
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const mailtoLink = \`mailto:wl@reversegenesis.org?subject=Metadata Update for \${selectedNFT.name}&body=Name: \${formData.name || selectedNFT.name}%0D%0AManifesto: \${formData.manifesto || selectedNFT.traits.manifesto}%0D%0AFriend: \${formData.friend || selectedNFT.traits.friend}%0D%0AWeapon: \${formData.weapon || selectedNFT.traits.weapon}\`;
    window.location.href = mailtoLink;
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <>
      <style jsx global>{\`
        @media (max-width: 500px) {
          .grid-cols-2, .sm\:grid-cols-3, .lg\:grid-cols-4 {
            grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
          }
        }
      \`}</style>
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          ReVerse Genesis NFTs
        </h2>
        {loading ? (
          <p className="text-gray-500">Loading NFTs...</p>
        ) : nfts.length === 0 ? (
          <p className="text-gray-500">No NFTs found for this wallet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {nfts.map((nft, i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow">
                {nft.image ? (
                  <img src={nft.image} alt={nft.name} className="w-full aspect-square object-cover rounded-md" />
                ) : (
                  <div className="w-full aspect-square bg-gray-300 dark:bg-gray-600 rounded-md flex items-center justify-center text-sm text-gray-600 dark:text-gray-300">No Image</div>
                )}
                <div className="mt-2 text-sm font-medium text-gray-800 dark:text-white">
                  #{nft.tokenId} — {nft.name}
                </div>
                <button onClick={() => { setSelectedNFT(nft); setFormData({ name: "", manifesto: "", friend: "", weapon: "" }); }} className="mt-2 text-sm text-white bg-blue-600 px-3 py-1 rounded hover:bg-blue-700">
                  Update metadata
                </button>
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
            <form onSubmit={handleSubmit} className="space-y-3">
              {["name", "manifesto", "friend", "weapon"].map((field) => (
                <div key={field}>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 capitalize">{field}</label>
                  <input
                    type="text"
                    value={formData[field]}
                    onChange={(e) => handleChange(field, e.target.value)}
                    placeholder={selectedNFT.traits?.[field] || selectedNFT[field]}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              ))}
              <div className="flex justify-between mt-4">
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                  Send
                </button>
                <button type="button" onClick={() => setSelectedNFT(null)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
