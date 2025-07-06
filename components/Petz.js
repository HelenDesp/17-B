// /components/Petz.js
"use client";
import { useState, useMemo } from 'react';

// 1. Data from Cat-Traits.txt is now a structured object
const catTraits = {
  Head: {
    'Punk': '^///^',
    'Horns': '^/-/^',
    'Curly Hair': '^```^',
    'Bald': '^___^'
  },
  Face: {
    'Happy': '(^.^)',
    'Sleeping': '(-.-)',
    'Angry': '(ò.ó)',
    'Normal': '(o.o)'
  },
  Body: {
    'Priest': '(\\+/)',
    'Tuxedo': '(|:|)',
    'Sweater': '({#})',
    'Normal': '(   )'
  }
};

// Helper component for a styled dropdown
const TraitSelector = ({ label, options, selected, onChange }) => (
  <div className="flex flex-col items-center">
    <label className="mb-1 text-sm font-bold text-gray-700 dark:text-gray-300">{label}</label>
    <select 
      value={selected} 
      onChange={(e) => onChange(e.target.value)}
      className="p-2 border-2 border-black dark:border-white bg-white dark:bg-gray-700 text-black dark:text-white rounded-md appearance-none text-center font-mono"
    >
      {Object.keys(options).map(optionName => (
        <option key={optionName} value={optionName}>{optionName}</option>
      ))}
    </select>
  </div>
);

export default function Petz({ ownerNFTImage }) {
  // 2. State to hold the currently selected trait for each part
  const [selectedHead, setSelectedHead] = useState('Punk');
  const [selectedFace, setSelectedFace] = useState('Normal');
  const [selectedBody, setSelectedBody] = useState('Tuxedo');

  // 3. Combine the selected parts to create the final ASCII art
  const asciiArt = useMemo(() => {
    const head = catTraits.Head[selectedHead] || catTraits.Head['Bald'];
    const face = catTraits.Face[selectedFace] || catTraits.Face['Normal'];
    const body = catTraits.Body[selectedBody] || catTraits.Body['Normal'];
    
    // Center each line for better alignment
    const lines = [head, face, body];
    const maxLength = Math.max(...lines.map(line => line.length));
    const paddedLines = lines.map(line => {
        const padding = Math.floor((maxLength - line.length) / 2);
        return ' '.repeat(padding) + line;
    });

    return paddedLines.join('\n');
  }, [selectedHead, selectedFace, selectedBody]);

  return (
    <div className="flex flex-col items-center p-4 bg-gray-200 dark:bg-gray-900 rounded-md">
       {/* Import the new 'Doto' font */}
      <style jsx global>{`
        @import url('[https://fonts.googleapis.com/css2?family=Doto:wght@900&display=swap](https://fonts.googleapis.com/css2?family=Doto:wght@900&display=swap)');
      `}</style>

      {/* The Pet Room Display */}
      <div className="w-full h-64 relative bg-blue-200 dark:bg-blue-900/50 rounded-t-md overflow-hidden flex items-center justify-center">
        <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-gray-400 to-gray-300 dark:from-gray-800 dark:to-gray-700"></div>
        <div className="absolute bottom-0 w-full h-1/3 bg-gray-500 dark:bg-gray-900" style={{ transform: 'perspective(100px) rotateX(20deg)', transformOrigin: 'bottom' }}></div>
        
        <div className="absolute top-4 left-4 w-20 h-20 bg-white p-1 shadow-lg border-2 border-black">
            <img src={ownerNFTImage} alt="Owner NFT" className="w-full h-full object-cover" />
        </div>

        {/* The ASCII Art Display */}
        {/* REMOVED background, UPDATED text color and font */}
        <div className="z-10 p-4 rounded-lg">
          <pre 
              className="font-mono text-2xl leading-tight text-center text-black dark:text-white"
              style={{ fontFamily: '"Doto", monospace' }}
          >
              {asciiArt}
          </pre>
        </div>
      </div>

      {/* Trait Customization Controls */}
      <div className="w-full p-4 bg-gray-300 dark:bg-gray-800 rounded-b-md">
        <div className="flex justify-around">
          <TraitSelector 
            label="Head"
            options={catTraits.Head}
            selected={selectedHead}
            onChange={setSelectedHead}
          />
          <TraitSelector 
            label="Face"
            options={catTraits.Face}
            selected={selectedFace}
            onChange={setSelectedFace}
          />
          <TraitSelector 
            label="Body"
            options={catTraits.Body}
            selected={selectedBody}
            onChange={setSelectedBody}
          />
        </div>
      </div>
    </div>
  );
}
