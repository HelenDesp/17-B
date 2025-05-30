
"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

const MORALIS_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
const FORM_ENDPOINT = "https://reversegenesis.org/quform/process.php";

export default function NFTViewer() {
  const { address } = useAccount();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [formData, setFormData] = useState({ name: "", manifesto: "", friend: "", weapon: "" });
  const [showThankYou, setShowThankYou] = useState(false);

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!address) return;
      setLoading(true);
      try {
        const res = await fetch(\`https://deep-index.moralis.io/api/v2.2/\${address}/nft?chain=base&format=decimal&normalizeMetadata=true\`, {
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
            const name = (metadata.name || nft.name || \`Token #\${nft.token_id}\`).replace(/^#\d+\s*[-–—]*\s*/, "");
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;

    fetch(FORM_ENDPOINT, {
      method: "POST",
      body: new FormData(form),
    })
    .then(() => {
      setSelectedNFT(null);
      setShowThankYou(true);
    })
    .catch(() => {
      alert("Error occurred");
    });
  };

  return (
    <>
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">ReVerse Genesis NFTs</h2>
        {loading ? <p>Loading NFTs...</p> : nfts.length === 0 ? <p>No NFTs found.</p> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {nfts.map((nft, i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow">
                <img src={nft.image} alt={nft.name} className="w-full aspect-square object-cover rounded-md" />
                <div className="mt-2 text-sm font-medium text-center text-gray-800 dark:text-white">
                  #{nft.tokenId} — {nft.name}
                </div>
                <div className="flex justify-center mt-3">
                  <button
                    onClick={() => setSelectedNFT(nft)}
                    className="px-4 py-1.5 border-2 border-gray-900 dark:border-white bg-light-100 text-gray-900 dark:bg-dark-300 dark:text-white text-sm uppercase tracking-wide rounded-none transition hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black"
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
            <div className="bg-white dark:bg-gray-800 p-6 border-2 border-black dark:border-white shadow-md max-w-md w-full">
              <h3 className="text-base font-normal mb-4 text-center text-gray-800 dark:text-white">UPGRADE YOUR NFT</h3>
              <img src={selectedNFT.image} alt={selectedNFT.name} className="w-full aspect-square object-cover mb-4" />
              <form onSubmit={handleSubmit}>
                <input type="hidden" name="ORIGINAL" value={selectedNFT.name} />
                {["name", "manifesto", "friend", "weapon"].map((field) => (
                  <div key={field}>
                    <label className="block text-base font-medium text-gray-700 dark:text-gray-200 capitalize">{field}</label>
                    <input
                      type="text"
                      name={field}
                      value={formData[field]}
                      onChange={(e) => handleChange(field, e.target.value)}
                      placeholder={selectedNFT.traits[field] || ""}
                      className="w-full p-2 border border-black dark:border-white bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-2 rounded-none"
                    />
                  </div>
                ))}
                <div className="flex justify-between mt-6 space-x-4">
                  <button type="submit" className="px-4 py-1.5 border-2 border-gray-900 dark:border-white text-sm uppercase tracking-wide rounded-none hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black">
                    UPGRADE
                  </button>
                  <button type="button" onClick={() => setSelectedNFT(null)} className="px-4 py-1.5 border-2 border-gray-900 dark:border-white text-sm uppercase tracking-wide rounded-none hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black">
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
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">THANK YOU</h4>
            <p className="text-base text-gray-700 dark:text-gray-300 mb-8">
              Your data was sent and will be available on-chain within 24 hours due to premoderation to avoid spam and abuse.
            </p>
            <button
              onClick={() => setShowThankYou(false)}
              className="px-4 py-1.5 border-2 border-gray-900 dark:border-white text-sm uppercase tracking-wide rounded-none hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </>
  );
}
