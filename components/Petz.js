// /components/Petz.js
"use client";
import { useState, useMemo } from 'react';

// 1. Updated data structure with padding to ensure proper alignment
const catTraits = {
  Ears: {
    'Type 1': ' ^   ^ ',
    'Type 2': ' <   > ',
    'Type 3': ' v   v ',
    'Type 4': '\\/   \\/',
    'Type 5': '/\\   /\\',
  },
  Head: {
    'Punk': ' /// ',
    'Horns': ' /-/ ',
    'Curly Hair': ' ``` ',
    'Bald': ' ___ '
  },
  Face: {
    'Suspicious': '(o.0)',
    'Sleeping': '(-.-)',
    'Eyes Open': ' (o.o) ',
    'Wide-eyed': '(0.0)'
  },
  Mouth: {
    'Normal': ' --- ',
    'Monster': ' vvv ',
    'Cigarette': ' --, '
  },
  Body: {
    'Muscular': '{=|=}',
    'Suit': '{\\:/}',
    'Priest': '(\\+/)',
    'Bombol': '{\'"\'}'
  }
};

// NEW: Custom Dropdown Component for better styling
const TraitSelector = ({ label, options, selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (optionName) => {
    onChange(optionName);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 border-2 border-black dark:border-white bg-white dark:bg-gray-700 text-black dark:text-white rounded-md text-left font-mono"
      >
        <div className="flex items-center">
            {/* Big Arrow Icon */}
            <svg className={`w-8 h-8 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            <span className="ml-2">{label}:</span>
        </div>
        <span>{selected}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border-2 border-black dark:border-white rounded-md z-10 max-h-48 overflow-y-auto">
          {Object.keys(options).map(optionName => (
            <button
              key={optionName}
              onClick={() => handleSelect(optionName)}
              className="w-full text-left p-2 font-mono hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {optionName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};


export default function Petz({ ownerNFTImage }) {
  // 2. State for all the new selectable parts
  const [selectedEars, setSelectedEars] = useState('Type 1');
  const [selectedHead, setSelectedHead] = useState('Punk');
  const [selectedFace, setSelectedFace] = useState('Eyes Open');
  const [selectedMouth, setSelectedMouth] = useState('Normal');
  const [selectedBody, setSelectedBody] = useState('Suit');

  // 3. Combine the selected parts to create the final ASCII art
  const asciiArt = useMemo(() => {
    const ears = catTraits.Ears[selectedEars] || '       ';
    const head = catTraits.Head[selectedHead] || '       ';
    const face = catTraits.Face[selectedFace] || '       ';
    const mouth = catTraits.Mouth[selectedMouth] || '       ';
    const body = catTraits.Body[selectedBody] || '       ';
    
    // Combine ears and head for the first line
    const firstLine = `${ears.slice(0, 2)}${head.trim()}${ears.slice(-2)}`;
    
    // Join the lines. Padding is now handled by the data itself.
    const lines = [firstLine, face, mouth, body];
    return lines.join('\n');
  }, [selectedEars, selectedHead, selectedFace, selectedMouth, selectedBody]);

  return (
    // UPDATED: Removed p-4 from this container
    <div className="flex flex-col items-center bg-gray-200 dark:bg-gray-900 rounded-md border border-black dark:border-white">
      <style jsx global>{`
        @import url('[https://fonts.googleapis.com/css2?family=Doto:wght@900&display=swap](https://fonts.googleapis.com/css2?family=Doto:wght@900&display=swap)');
      `}</style>

      {/* The Pet Room Display */}
      <div className="w-full h-64 relative bg-blue-200 dark:bg-blue-900/50 rounded-t-md overflow-hidden flex items-center justify-center">
        <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-gray-400 to-gray-300 dark:from-gray-800 dark:to-gray-700"></div>
        
        {/* The ASCII Art Display */}
        <div className="z-10 p-4 rounded-lg">
          <pre 
              className="font-mono text-5xl leading-none text-center text-black dark:text-white"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
