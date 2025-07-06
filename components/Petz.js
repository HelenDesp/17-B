// /components/Petz.js
"use client";
import { useState, useEffect, useMemo } from 'react';
import AsciiMazeGame from './AsciiMazeGame'; // Import the new maze game

// --- Pixel Art Data (used to generate ASCII) ---
const pixelPetzData = {
  cat: [
    "................",
    "................",
    "....xxxx........",
    "...xeeee..x.....",
    "..xeeee..xx.....",
    "..xeeee..x......",
    "..xffffffx......",
    "..xssssssx......",
    "..xffffffx......",
    "..xffffffx......",
    ".xssssssfx......",
    ".xssssssfx......",
    "..xxxxxx........",
    "................",
    "................",
    "................",
  ],
  dragon: [
    "................",
    "....xx....xx....",
    "...xssx..xssx...",
    "..xssssxxssssx..",
    "..xseesssseesx..",
    "..xssssssssssx..",
    "..xffsffsffsfx..",
    "..xffffffffffx..",
    "..xssssssssssx..",
    "...xfffffffx....",
    "....xsssssx.....",
    ".....xxxxx......",
    "................",
    "................",
    "................",
    "................",
  ],
   robot: [
    "................",
    "................",
    "....xxxxxx......",
    "...xeeeeee..x...",
    "..xssseesss.xx..",
    "..xssssssss.x...",
    "..xfffffffx.....",
    "..xfffffffx.....",
    "..xfffffffx.....",
    "..xsssssssx.....",
    "..xsssssssx.....",
    "...xxxxxxx......",
    "................",
    "................",
    "................",
    "................",
  ],
};


export default function Petz({ petzTrait, nftId, ownerNFTImage }) {
  const petData = useMemo(() => {
    const data = {};
    // FIX: Add a check to ensure petzTrait is a string before splitting.
    // This prevents the "Cannot read properties of undefined (reading 'split')" error.
    if (typeof petzTrait === 'string') {
      petzTrait.split(',').forEach(part => {
        const [key, value] = part.split(':');
        if (key && value) { // Ensure both key and value exist after split
          data[key.trim()] = value.trim();
        }
      });
    }
    return data;
  }, [petzTrait]);

  const [happiness, setHappiness] = useState(75);
  const [lastAction, setLastAction] = useState(null);
  const [isMiniGameOpen, setIsMiniGameOpen] = useState(false);

  const asciiArt = useMemo(() => {
    const petArt = pixelPetzData[petData.type] || pixelPetzData.cat;
    const asciiMap = {
        'x': '#', // Outline
        'f': ':', // Fill
        'e': 'O', // Eye
        's': '.', // Shade
        '.': ' '  // Empty space
    };
    return petArt.map(row => 
        row.split('').map(char => asciiMap[char] || ' ').join('')
    ).join('\n');
  }, [petData.type]);

  const handleFeed = () => {
    setHappiness(Math.min(100, happiness + 15));
    setLastAction('Yum! +15 Happiness');
    setTimeout(() => setLastAction(null), 2000);
  };

  const handlePlay = () => {
    setIsMiniGameOpen(true);
  };
  
  const handleGameEnd = (didWin) => {
    setIsMiniGameOpen(false);
    if (didWin) {
        setHappiness(h => Math.min(100, h + 30));
        setLastAction('You solved the maze! +30 Happiness');
    }
    setTimeout(() => setLastAction(null), 2500);
  };

  const happinessColor = useMemo(() => {
    if (happiness > 70) return '#22C55E';
    if (happiness > 30) return '#F59E0B';
    return '#EF4444';
  }, [happiness]);

  return (
    <>
      <div className="flex flex-col items-center p-4 bg-gray-200 dark:bg-gray-900 rounded-md">
        <div className="w-full h-64 relative bg-blue-200 dark:bg-blue-900/50 rounded-t-md overflow-hidden flex items-center justify-center">
          <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-gray-400 to-gray-300 dark:from-gray-800 dark:to-gray-700"></div>
          <div className="absolute bottom-0 w-full h-1/3 bg-gray-500 dark:bg-gray-900" style={{ transform: 'perspective(100px) rotateX(20deg)', transformOrigin: 'bottom' }}></div>
          
          <div className="absolute top-4 left-4 w-20 h-20 bg-white p-1 shadow-lg border-2 border-black">
              <img src={ownerNFTImage} alt="Owner NFT" className="w-full h-full object-cover" />
          </div>

          <div className="z-10">
            <pre 
                className="font-mono text-xs leading-none text-center"
                style={{ color: petData.color || 'grey' }}
            >
                {asciiArt}
            </pre>
          </div>

          {lastAction && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/70 text-white px-4 py-2 rounded-lg font-bold text-lg animate-fade-out z-20">
                  {lastAction}
              </div>
          )}
        </div>

        <div className="w-full p-4 bg-gray-300 dark:bg-gray-800 rounded-b-md">
          <div className="text-center mb-4">
              <p className="font-bold text-xl text-gray-800 dark:text-gray-200 capitalize">{petData.type || 'Pet'} Pet</p>
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
        <style jsx global>{`
          @keyframes fade-out {
            0% { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(1.5); }
          }
          .animate-fade-out {
            animation: fade-out 2.5s forwards;
          }
        `}</style>
      </div>

      {isMiniGameOpen && <AsciiMazeGame onGameEnd={handleGameEnd} />}
    </>
  );
}
