"use client"
import { useState } from "react"
import axios from "axios"
import { useAccount } from "wagmi"

export default function NFTViewer({ nfts, selectedNFTs = [], onSelectNFT = () => {} }) {
  const { address, isConnected } = useAccount()
  const [loading] = useState(false)
  const [selectedNFT, setSelectedNFT] = useState(null)
  const [formData, setFormData] = useState({ name: "", manifesto: "", friend: "", weapon: "" })
  const [nameError, setNameError] = useState("")
  const [showThankYou, setShowThankYou] = useState(false)
  const [selectedChatNFT, setSelectedChatNFT] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState("")
  const [isLoadingChat, setIsLoadingChat] = useState(false)

  const handleChange = (field, value) => setFormData({ ...formData, [field]: value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setNameError("Name is required.")
      return
    } else {
      setNameError("")
    }
    try {
      await axios.post("https://reversegenesis.org/edata/meta.php", {
        original: selectedNFT.name,
        owner: address,
        name: formData.name,
        manifesto: formData.manifesto,
        friend: formData.friend,
        weapon: formData.weapon,
      })
      setSelectedNFT(null)
      setShowThankYou(true)
    } catch (error) {
      if (error.response?.status === 400 && error.response.data?.error === "Name is required.") {
        setNameError("Name is required.")
      } else {
        console.error("Submission error:", error)
        alert("Failed to submit form. Please try again.")
      }
    }
  }

  const handleChatWithNFT = async (message) => {
    if (!message.trim() || !selectedChatNFT) return

    setIsLoadingChat(true)
    const userMessage = { role: "user", content: message }
    const updatedMessages = [...chatMessages, userMessage]
    setChatMessages(updatedMessages)
    setChatInput("")

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          nftData: {
            name: selectedChatNFT.name,
            tokenId: selectedChatNFT.tokenId,
            manifesto: selectedChatNFT.traits.manifesto || "Not specified",
            friend: selectedChatNFT.traits.friend || "Not specified",
            weapon: selectedChatNFT.traits.weapon || "Not specified",
          },
          chatHistory: chatMessages,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response from AI")
      }

      const data = await response.json()
      const aiMessage = { role: "assistant", content: data.response }

      setChatMessages([...updatedMessages, aiMessage])
    } catch (error) {
      console.error("Error with Vertex AI:", error)
      const errorMessage = {
        role: "assistant",
        content: "Sorry, I'm having trouble connecting right now. Please try again later.",
      }
      setChatMessages([...updatedMessages, errorMessage])
    } finally {
      setIsLoadingChat(false)
    }
  }

  const openChatModal = (nft) => {
    setSelectedChatNFT(nft)
    setChatMessages([
      {
        role: "assistant",
        content: `Hello! I'm ${nft.name}. What would you like to know about me or discuss?`,
      },
    ])
  }

  const closeChatModal = () => {
    setSelectedChatNFT(null)
    setChatMessages([])
    setChatInput("")
  }

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
                {/* Checkbox always at bottom left with tooltip */}
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
                      {/* Auto-dark/light plane icon */}
                      <svg
                        version="1.0"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 512 512"
                        className="w-6 h-6 fill-black dark:fill-white"
                        preserveAspectRatio="xMidYMid meet"
                      >
                        <g transform="translate(0,512) scale(0.1,-0.1)" stroke="none">
                          <path
                            d="M2521 3714 c-1125 -535 -2054 -983 -2065 -994 -29 -28 -28 -93 2
                          -122 16 -17 233 -91 814 -278 l792 -256 254 -789 c194 -606 259 -796 278 -815
                          31 -32 94 -34 124 -4 11 -11 449 922 974 2025 524 1102 962 2023 974 2046 12
                          23 22 51 22 62 0 53 -50 102 -102 100 -13 -1 -943 -439 -2067 -975z m598 -460
                          l-1005 -1005 -595 191 c-327 106 -625 202 -664 215 l-70 23 45 20 c25 12 774
                          368 1665 791 891 424 1622 771 1625 771 3 0 -448 -453 -1001 -1006z m355 -795
                          c-433 -910 -790 -1657 -793 -1661 -3 -4 -102 290 -219 654 l-214 661 1003
                          1003 c552 552 1004 1002 1006 1000 1 -1 -351 -747 -783 -1657z"
                          />
                        </g>
                      </svg>
                    </div>
                  </div>
                </div>
                {nft.image ? (
                  <div className="relative">
                    <img
                      src={nft.image || "/placeholder.svg"}
                      alt={nft.name}
                      className="w-full aspect-square object-cover border-b1"
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src = ""
                      }}
                    />
                    {/* Chat Icon */}
                    <button
                      onClick={() => openChatModal(nft)}
                      className="absolute top-2 left-2 w-8 h-8 bg-black/70 hover:bg-black/90 dark:bg-white/70 dark:hover:bg-white/90 rounded-full flex items-center justify-center transition-all duration-200 group"
                      title="Chat with this NFT"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 text-white dark:text-black group-hover:scale-110 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="w-full aspect-square bg-gray-300 dark:bg-gray-600 rounded-md flex items-center justify-center text-sm text-gray-600 dark:text-gray-300">
                    No Image
                  </div>
                )}
                <div className="mt-2 text-sm font-medium text-center text-gray-800 dark:text-white">{nft.name}</div>
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

      {/* ===== UPGRADE MODAL ===== */}
      {selectedNFT && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-60 z-[9999]" />

          {/* Modal */}
          <div className="relative z-[10000] flex items-center justify-center min-h-screen w-full px-4 py-10">
            <div className="relative bg-white dark:bg-gray-800 p-6 border-b2 border-2 border-black dark:border-white rounded-none shadow-md max-w-md w-full">
              {/* Close Button */}
              <button
                className="absolute top-3 right-3 border-2 border-black dark:border-white w-8 h-8 flex items-center justify-center transition bg-transparent text-gray-800 dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black hover:border-black dark:hover:border-white rounded cursor-pointer"
                onClick={() => setSelectedNFT(null)}
                aria-label="Close"
              >
                <span className="text-4xl leading-none font-bold dark:font-bold">&#215;</span>
              </button>

              <h3 className="text-base font-normal mb-4 text-center text-gray-800 dark:text-white">UPGRADE YOUR NFT</h3>

              {/* Border around image */}
              <div className="mb-4 border-b1 border-2 border-black dark:border-white">
                <img
                  src={selectedNFT.image || "/placeholder.svg"}
                  alt={selectedNFT.name}
                  className="w-full aspect-square object-cover"
                />
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <input type="hidden" name="ORIGINAL" value={selectedNFT.name} />
                <div>
                  <label className="block text-base font-medium text-gray-700 dark:text-gray-100 capitalize">
                    name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder={selectedNFT.name}
                    className="w-full p-2 border !border-black dark:!border-white bg-white dark:bg-black text-black dark:text-white placeholder-black dark:placeholder-white focus:border-black dark:focus:border-white focus:border-[2px] focus:outline-none focus:ring-0 rounded-none"
                    style={{ boxShadow: "none" }}
                  />
                  {nameError && (
                    <p className="text-sm text-red-600 mt-1 flex items-center">
                      <svg className="w-4 h-4 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7-4a1 1 0 10-2 0v4a1 1 0 002 0V6zm-1 8a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {nameError}
                    </p>
                  )}
                </div>
                {["manifesto", "friend", "weapon"].map((field) => (
                  <div key={field}>
                    <label className="block text-base font-medium text-gray-700 dark:text-gray-100 capitalize">
                      {field}
                    </label>
                    <input
                      type="text"
                      name={field}
                      value={formData[field]}
                      onChange={(e) => handleChange(field, e.target.value)}
                      placeholder={selectedNFT.traits[field]}
                      className="w-full p-2 border !border-black dark:!border-white bg-white dark:bg-black text-black dark:text-white placeholder-black dark:placeholder-white focus:border-black dark:focus:border-white focus:border-[2px] focus:outline-none focus:ring-0 rounded-none"
                      style={{ boxShadow: "none" }}
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
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">THANK YOU</h4>
            <p className="text-base text-gray-700 dark:text-gray-300 mb-8">
              Your data was sent and will be available on-chain within 24 hours due to premoderation to avoid spam and
              abuse.
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

      {/* ===== CHAT MODAL ===== */}
      {selectedChatNFT && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-60 z-[9999]" />

          {/* Modal */}
          <div className="relative z-[10000] flex items-center justify-center min-h-screen w-full px-4 py-10">
            <div className="relative bg-white dark:bg-gray-800 border-2 border-black dark:border-white rounded-none shadow-md max-w-2xl w-full max-h-[80vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b-2 border-black dark:border-white">
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedChatNFT.image || "/placeholder.svg"}
                    alt={selectedChatNFT.name}
                    className="w-10 h-10 rounded-full object-cover border border-black dark:border-white"
                  />
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                      Chat with {selectedChatNFT.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Token #{selectedChatNFT.tokenId}</p>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  className="border-2 border-black dark:border-white w-8 h-8 flex items-center justify-center transition bg-transparent text-gray-800 dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black rounded cursor-pointer"
                  onClick={closeChatModal}
                  aria-label="Close"
                >
                  <span className="text-xl leading-none font-bold">×</span>
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px]">
                {chatMessages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === "user"
                          ? "bg-black text-white dark:bg-white dark:text-black"
                          : "bg-gray-100 text-black dark:bg-gray-700 dark:text-white border border-black dark:border-white"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}

                {isLoadingChat && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-700 border border-black dark:border-white p-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t-2 border-black dark:border-white">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleChatWithNFT(chatInput)
                      }
                    }}
                    placeholder="Type your message..."
                    className="flex-1 p-2 border border-black dark:border-white bg-white dark:bg-black text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0 rounded-none"
                    disabled={isLoadingChat}
                  />
                  <button
                    onClick={() => handleChatWithNFT(chatInput)}
                    disabled={isLoadingChat || !chatInput.trim()}
                    className="px-4 py-2 border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-none"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
