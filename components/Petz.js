// /components/Petz.js
"use client";
import { useState, useMemo } from 'react';

// 1. Updated data structure from the new Cat-Traits.txt file
const catTraits = {
  Ears: {
    'Type 1': '^   ^',
    'Type 2': '<   >',
    'Type 3': 'v   v',
    'Type 4': '\\/   \\/',
    'Type 5': '/\\   /\\',
  },
  Head: {
    'Punk': '///',
    'Horns': '/-/',
    'Curly Hair': '```',
    'Bald': '___'
  },
  Face: {
    'Suspicious': '(o.0)',
    'Sleeping': '(-.-)',
    'Eyes Open': '(o.o)',
    'Wide-eyed': '(0.0)'
  },
  Mouth: {
    'Normal': '---',
    'Monster': 'vvv',
    'Cigarette': '--,'
  },
  Body: {
    'Muscular': '{=|=}',
    'Suit': '{\\:/}',
    'Priest': '(\\+/)',
    'Bombol': '{\'"\'}'
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
  // 2. State for all the new selectable parts
  const [selectedEars, setSelectedEars] = useState('Type 1');
  const [selectedHead, setSelectedHead] = useState('Punk');
  const [selectedFace, setSelectedFace] = useState('Eyes Open');
  const [selectedMouth, setSelectedMouth] = useState('Normal');
  const [selectedBody, setSelectedBody] = useState('Suit');

  // 3. Combine the selected parts to create the final ASCII art
  const asciiArt = useMemo(() => {
    const ears = catTraits.Ears[selectedEars] || '';
    const head = catTraits.Head[selectedHead] || '';
    const face = catTraits.Face[selectedFace] || '';
    const mouth = catTraits.Mouth[selectedMouth] || '';
    const body = catTraits.Body[selectedBody] || '';
    
    // Combine ears and head for the first line
    const firstLine = `${ears.slice(0, 1)}${head}${ears.slice(-1)}`;
    
    // Construct the final art with proper alignment
    const lines = [firstLine, face, mouth, body];
    const maxLength = Math.max(...lines.map(line => line.length));
    const paddedLines = lines.map(line => {
        const padding = Math.floor((maxLength - line.length) / 2);
        return ' '.repeat(padding) + line;
    });

    return paddedLines.join('\n');
  }, [selectedEars, selectedHead, selectedFace, selectedMouth, selectedBody]);

  return (
    <div className="flex flex-col items-center p-4 bg-gray-200 dark:bg-gray-900 rounded-md border border-black dark:border-white">
      <style jsx global>{`
        @import url('[https://fonts.googleapis.com/css2?family=Doto:wght@900&display=swap](https://fonts.googleapis.com/css2?family=Doto:wght@900&display=swap)');
      `}</style>

      {/* The Pet Room Display */}
      <div className="w-full h-64 relative bg-blue-200 dark:bg-blue-900/50 rounded-t-md overflow-hidden flex items-center justify-center border-b border-black dark:border-white">
        <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-gray-400 to-gray-300 dark:from-gray-800 dark:to-gray-700"></div>
        
        {/* The ASCII Art Display */}
        <div className="z-10 p-4 rounded-lg">
          <pre 
              className="font-mono text-2xl leading-tight text-center text-black dark:text-white"
              style={{
                fontFamily: '"Doto", monospace',
                fontWeight: 900,
                textShadow: '1px 0 #000, -1px 0 #000, 0 1px #000, 0 -1px #000, 1px 1px #000, -1px -1px #000, 1px -1px #000, -1px 1px #000'
              }}
          >
              {asciiArt}
          </pre>
        </div>
      </div>

      {/* Trait Customization Controls */}
      <div className="w-full p-4 bg-gray-300 dark:bg-gray-800 rounded-b-md border-t border-black dark:border-white">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <TraitSelector 
            label="Ears"
            options={catTraits.Ears}
            selected={selectedEars}
            onChange={setSelectedEars}
          />
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
            label="Mouth"
            options={catTraits.Mouth}
            selected={selectedMouth}
            onChange={setSelectedMouth}
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
