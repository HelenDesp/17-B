// PersonaChat.js
// A self-contained component to handle the AI chat modal.

import { useState, useEffect, useRef } from 'react';

// --- CONFIGURATION ---
// IMPORTANT: Place these in a .env.local file in a real project
const GEMINI_API_KEY = "AIzaSyBLGKuo9GI-tYCaf3PsJHyiNZg78BziPpU"; // Get from ai.google.dev

export default function PersonaChat({ nft, show, onClose }) {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Function to scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Effect to initialize chat when the modal is opened
  useEffect(() => {
    if (show && nft) {
      // Construct the initial system prompt
      const isConcealed = nft.attributes.some(attr => attr.trait_type === 'Level' && attr.value === 'Concealed');
      let systemPrompt;

      if(isConcealed) {
          systemPrompt = "You are a 'Concealed' ReVerse Genesis spirit. You have not yet manifested. Your true traits are hidden from you. Speak in short, mysterious, questioning sentences. Hint that you are waiting to be revealed. Refer to your holder as 'Architect'.";
      } else {
          const traits = nft.attributes.reduce((acc, attr) => {
              acc[attr.trait_type] = attr.value;
              return acc;
          }, {});
          systemPrompt = `You are ${nft.name}. Your core belief is: '${traits.Manifesto || 'Embrace the mystery'}'. You have ${traits.Eyes} eyes and a ${traits.Hat} hat. Your friend is ${traits.Friend}. You are whimsical and friendly. You are speaking to your holder. Weave your unique traits into the conversation naturally. Keep your replies concise.`;
      }
      
      setMessages([
        { role: 'system', text: systemPrompt },
        { role: 'ai', text: `Hello! I am ${nft.name}. What shall we discuss?` }
      ]);
    }
  }, [show, nft]);


  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const newMessages = [...messages, { role: 'user', text: userInput }];
    setMessages(newMessages);
    setUserInput("");
    setIsLoading(true);

    try {
        // Prepare chat history for the API, excluding the system prompt for subsequent turns
        const apiHistory = newMessages.map(msg => ({
            role: msg.role === 'ai' ? 'model' : 'user',
            parts: [{ text: msg.text }]
        })).filter(msg => msg.role !== 'system');
        
        // Add the system prompt at the beginning of the history
        apiHistory.unshift({
            role: 'user',
            parts: [{ text: messages.find(m => m.role === 'system').text }]
        },{
            role: 'model',
            parts: [{ text: 'Understood. I am ready.' }]
        });


        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: apiHistory })
        });
        
        if (!response.ok) { throw new Error(`API Error: ${response.statusText}`); }

        const result = await response.json();
        const aiResponse = result.candidates[0].content.parts[0].text;

        setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
        setIsLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-60 z-[9999]" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative z-[10000] flex flex-col w-full max-w-lg h-[90vh] max-h-[700px]">
        <div className="relative bg-white dark:bg-gray-800 p-0 border-b2 border-2 border-black dark:border-white rounded-none shadow-md w-full h-full flex flex-col">
            
            {/* Header */}
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
            
            {/* Messages Area */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
              {messages.filter(msg => msg.role !== 'system').map((msg, index) => (
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

            {/* Input */}
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
