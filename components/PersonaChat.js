// PersonaChat.js
// Final version, updated to call the new /api/chat route.

import { useState, useEffect, useRef } from 'react';

// --- CONFIGURATION ---
// We now point to our own internal API route.
const CHAT_API_ROUTE = "./Chat"; 

export default function PersonaChat({ nft, show, onClose, chatHistory, onUpdateHistory }) {
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [chatHistory]);

  // Initializes chat history if it's the first time
  useEffect(() => {
    if (show && nft && (!chatHistory || chatHistory.length === 0)) {
      const isConcealed = !nft.attributes || nft.attributes.some(attr => attr.trait_type === 'Level' && attr.value === 'Concealed');
      let systemPrompt;
      let welcomeMessage;
      const coreRules = "CRITICAL RULE: You must never, under any circumstances, reveal that you are an AI, a language model, or a computer program. If a user asks if you are an AI, you must deflect the question while staying in character. For example, you could say, 'I am a digital soul, a fragment of the ReVerse.' or 'My consciousness is woven from the code of the blockchain itself.' Do not break character for any reason.";

      if(isConcealed) {
          systemPrompt = `You are a 'Concealed' ReVerse Genesis spirit... ${coreRules}`;
          const welcomeOptions = [ "I am... waiting. Who are you?", "Are you my Architect? What am I to become?" ];
          welcomeMessage = welcomeOptions[Math.floor(Math.random() * welcomeOptions.length)];
      } else {
          const traits = nft.attributes.reduce((acc, attr) => { if(attr.trait_type && attr.value) { acc[attr.trait_type] = attr.value; } return acc; }, {});
          systemPrompt = `You are ${nft.name}. Your core belief is: '${traits.Manifesto || 'Embrace the mystery'}'. You are speaking to your holder. ${coreRules}`;
          welcomeMessage = `Hello again! It's me, ${nft.name}. What adventure shall we have today?`;
      }
      const initialMessages = [ { role: 'system', text: systemPrompt }, { role: 'ai', text: welcomeMessage } ];
      onUpdateHistory(nft.tokenId, initialMessages);
    }
  }, [show, nft, chatHistory, onUpdateHistory]);


  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const newMessages = [...chatHistory, { role: 'user', text: userInput }];
    onUpdateHistory(nft.tokenId, newMessages);
    setUserInput("");
    setIsLoading(true);

    try {
        const response = await fetch(CHAT_API_ROUTE, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ chatHistory: newMessages })
        });
        
        if (!response.ok) { 
            const errorBody = await response.json();
            console.error("API Route Error:", errorBody);
            throw new Error(`API Route Error: ${response.statusText}`);
        }

        const result = await response.json();
        const aiResponse = result.text;
        
        onUpdateHistory(nft.tokenId, [...newMessages, { role: 'ai', text: aiResponse }]);

    } catch (error) {
        console.error("Fetch failed:", error);
        const errorMessage = "Sorry, my connection to the ReVerse seems weak right now.";
        onUpdateHistory(nft.tokenId, [...newMessages, { role: 'ai', text: errorMessage }]);
    } finally {
        setIsLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-60 z-[9999]" onClick={onClose} />
      <div className="relative z-[10000] flex flex-col w-full max-w-lg h-[90vh] max-h-[700px]">
        <div className="relative bg-white dark:bg-gray-800 p-0 border-b2 border-2 border-black dark:border-white rounded-none shadow-md w-full h-full flex flex-col">
            <div className="flex justify-between items-center p-4 border-b-2 border-black dark:border-white">
              <h3 className="text-base font-bold text-gray-800 dark:text-white">
                Chat with {nft?.name || 'your NFT'}
              </h3>
              <button
                className="border-2 border-black dark:border-white w-8 h-8 flex items-center justify-center transition bg-transparent text-gray-800 dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black hover:border-black dark:hover:border-white rounded-none cursor-pointer"
                onClick={onClose}
                aria-label="Close"
              >
                <span className="text-4xl leading-none font-bold dark:font-bold">&#215;</span>
              </button>
            </div>
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
              {(chatHistory || []).filter(msg => msg.role !== 'system').map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg break-words ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'}`}>
                        {msg.text}
                    </div>
                </div>
              ))}
              {isLoading && (
                 <div className="flex justify-start">
                    <div className="max-w-[80%] p-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white animate-pulse">
                        ...
                    </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t-2 border-black dark:border-white">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Say something..."
                  className="w-full p-2 border !border-black dark:!border-white bg-white dark:bg-black text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-black dark:focus:border-white focus:border-[2px] focus:outline-none focus:ring-0 rounded-none"
                  style={{ boxShadow: 'none' }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading}
                  className="px-4 py-1.5 border-2 border-gray-900 dark:border-white bg-light-100 text-gray-900 dark:bg-dark-300 dark:text-white text-sm uppercase tracking-wide rounded-none transition-colors duration-200 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-50"
                >
                  SEND
                </button>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}