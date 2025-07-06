// /components/Petz.js
"use client";
import { useState, useEffect, useMemo } from 'react';

// --- SVG Parts Library ---
const petParts = {
  body: {
    dragon: <path d="M60 150 C 70 120, 90 120, 100 150 S 130 180, 140 150 C 150 120, 170 120, 180 150 L 160 180 L 80 180 Z" />,
    cat: <path d="M80 140 C 60 180, 180 180, 160 140 C 180 120, 60 120, 80 140 Z" />,
    robot: <rect x="70" y="130" width="100" height="50" rx="10" />,
  },
  eyes: {
    normal: <>
      <circle cx="105" cy="150" r="5" fill="black" />
      <circle cx="135" cy="150" r="5" fill="black" />
    </>,
    happy: <>
      <path d="M100 150 C 105 145, 110 145, 110 150" stroke="black" strokeWidth="2" fill="none" />
      <path d="M130 150 C 135 145, 140 145, 140 150" stroke="black" strokeWidth="2" fill="none" />
    </>,
    angry: <>
      <line x1="100" y1="145" x2="110" y2="155" stroke="black" strokeWidth="2" />
      <line x1="110" y1="145" x2="100" y2="155" stroke="black" strokeWidth="2" />
      <line x1="130" y1="145" x2="140" y2="155" stroke="black" strokeWidth="2" />
      <line x1="140" y1="145" x2="130" y2="155" stroke="black" strokeWidth="2" />
    </>,
  },
  extras: {
     dragon: <path d="M100 120 Q 120 90, 140 120" stroke="black" strokeWidth="3" fill="none" />, // Horns
     cat: <><path d="M80 140 L 70 110 L 90 120 Z" /><path d="M160 140 L 170 110 L 150 120 Z" /></> // Ears
  }
};

export default function Petz({ petzTrait, nftId, ownerNFTImage }) {
  const petData = useMemo(() => {
    const data = {};
    petzTrait.split(',').forEach(part => {
      const [key, value] = part.split(':');
      data[key.trim()] = value.trim();
    });
    return data;
  }, [petzTrait]);

  const [happiness, setHappiness] = useState(75);
  const [lastAction, setLastAction] = useState(null);
  const [isBouncing, setIsBouncing] = useState(false);

  const handleFeed = () => {
    setHappiness(Math.min(100, happiness + 15));
    setLastAction('Yum!');
    setTimeout(() => setLastAction(null), 1500);
  };

  const handlePlay = () => {
    setHappiness(Math.min(100, happiness + 10));
    setLastAction(null); // Clear other actions
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 1000); // Animation duration
  };

  const happinessColor = useMemo(() => {
    if (happiness > 70) return '#22C55E'; // green-500
    if (happiness > 30) return '#F59E0B'; // amber-500
    return '#EF4444'; // red-500
  }, [happiness]);

  return (
    <div className="flex flex-col items-center p-4 bg-gray-200 dark:bg-gray-900 rounded-md">
      {/* The Pet Room Display */}
      <div className="w-full h-64 relative bg-blue-200 dark:bg-blue-900/50 rounded-t-md overflow-hidden">
        {/* Wall */}
        <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-gray-400 to-gray-300 dark:from-gray-800 dark:to-gray-700"></div>
        {/* Floor */}
        <div className="absolute bottom-0 w-full h-1/3 bg-gray-500 dark:bg-gray-900" style={{ transform: 'perspective(100px) rotateX(20deg)', transformOrigin: 'bottom' }}></div>
        
        {/* NFT Poster on the wall */}
        <div className="absolute top-4 left-4 w-20 h-20 bg-white p-1 shadow-lg border-2 border-black">
            <img src={ownerNFTImage} alt="Owner NFT" className="w-full h-full object-cover" />
        </div>

        {/* The Pet SVG */}
        <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 w-48 h-48 ${isBouncing ? 'animate-bounce' : ''}`}>
            <svg viewBox="0 0 240 240" className="w-full h-full drop-shadow-lg">
              <g fill={petData.color || 'skyblue'}>
                {petParts.body[petData.type] || petParts.body.cat}
                {petParts.extras[petData.type]}
              </g>
              {petParts.eyes[petData.eyes] || petParts.eyes.normal}
            </svg>
        </div>

        {lastAction && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/50 text-white px-4 py-2 rounded-lg font-bold text-lg animate-fade-out">
                {lastAction}
            </div>
        )}
      </div>

      {/* Stats and Controls */}
      <div className="w-full p-4 bg-gray-300 dark:bg-gray-800 rounded-b-md">
        <div className="text-center mb-4">
            <p className="font-bold text-xl text-gray-800 dark:text-gray-200 capitalize">{petData.type} Pet</p>
        </div>
        
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Happiness</label>
            <div className="w-full bg-gray-400 dark:bg-gray-700 rounded-full h-4">
                <div 
                    className="h-4 rounded-full transition-all duration-500" 
                    style={{ width: `${happiness}%`, backgroundColor: happinessColor }}
                />
            </div>
        </div>

        <div className="flex justify-center space-x-4">
            <button onClick={handleFeed} className="px-6 py-2 border-2 border-blue-500 text-blue-500 text-lg uppercase rounded-none transition hover:bg-blue-500 hover:text-white">Feed</button>
            <button onClick={handlePlay} className="px-6 py-2 border-2 border-yellow-500 text-yellow-500 text-lg uppercase rounded-none transition hover:bg-yellow-500 hover:text-white">Play</button>
        </div>
      </div>
       {/* Add this style to your global CSS or a style tag for the animations */}
      <style jsx global>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: translateY(-25%);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }
        .animate-bounce {
          animation: bounce 1s infinite;
        }
        @keyframes fade-out {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.5); }
        }
        .animate-fade-out {
          animation: fade-out 1.5s forwards;
        }
      `}</style>
    </div>
  );
}
