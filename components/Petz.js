// /components/Petz.js
"use client";
import { useState, useMemo, useEffect, useRef } from 'react';

// 1. Data structure from your working backup, with 'None' added.
// The pre-padding in the strings is the key to correct alignment.
const catTraits = {
  Ears: {
    'None': '       ',
    'Type 1': ' ^   ^ ',
    'Type 2': ' <   > ',
    'Type 3': ' v   v ',
    'Type 4': '\\/   \\/',
    'Type 5': '/\\   /\\',
  },
  Head: {
    'None': '     ',
    'Punk': ' /// ',
    'Horns': ' /-/ ',
    'Curly Hair': ' ``` ',
    'Bald': ' ___ '
  },
  Face: {
    'None': '       ',
    'Suspicious': '(o.0)',
    'Sleeping': '(-.-)',
    'Eyes Open': ' (o.o) ',
    'Wide-eyed': '(0.0)'
  },
  Mouth: {
    'None': '     ',
    'Normal': ' --- ',
    'Monster': ' vvv ',
    'Cigarette': ' --, '
  },
  Body: {
    'None': '       ',
    'Muscular': '{=|=}',
    'Suit': '{\\:/}',
    'Priest': '(\\+/)',
    'Bombol': '{\'"\'}'
  }
};

// Helper component for a styled dropdown (from your preferred version)
const TraitSelector = ({ label, options, selected, onChange, isOpen, onToggle }) => {
  const handleSelect = (optionName) => {
    if (optionName === 'Random') {
      const availableOptions = Object.keys(options).filter(op => op !== 'None');
      const randomOption = availableOptions[Math.floor(Math.random() * availableOptions.length)];
      onChange(randomOption);
    } else {
      onChange(optionName);
    }
    onToggle();
  };

  const displayOptions = ['Random', 'None', ...Object.keys(options).filter(op => op !== 'None')];

  return (
    <div className="relative w-full">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-2 border-2 border-black dark:border-white bg-white dark:bg-gray-700 text-black dark:text-white rounded-md text-left"
        style={{ fontFamily: "'Cygnito Mono', monospace" }}
      >
        <div className="flex items-center">
            <span className="font-bold">{label}</span>
            {selected !== 'None' && (
                <>
                    <span className="mx-2 text-gray-400">•</span>
                    <span className="font-normal">{selected}</span>
                </>
            )}
        </div>
        <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor" className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
           <path d="M0 0H2V2H0V0Z M2 2H4V4H2V2Z M4 4H6V6H4V4Z M6 2H8V4H6V2Z M8 0H10V2H8V0Z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border-2 border-black dark:border-white rounded-md z-10 max-h-48 overflow-y-auto">
          {displayOptions.map(optionName => (
            <button
              key={optionName}
              onClick={() => handleSelect(optionName)}
              className="w-full text-left p-2 flex items-center border-b border-transparent hover:border-black dark:hover:border-white"
              style={{ fontFamily: "'Cygnito Mono', monospace" }}
            >
              <span className="mr-2 text-lg">•</span>
              <span>{optionName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};


export default function Petz({ ownerNFTImage }) {
  // State for all the new selectable parts, defaulting to 'None'
  const [selectedEars, setSelectedEars] = useState('Type 4');
  const [selectedHead, setSelectedHead] = useState('Punk');
  const [selectedFace, setSelectedFace] = useState('Eyes Open');
  const [selectedMouth, setSelectedMouth] = useState('Normal');
  const [selectedBody, setSelectedBody] = useState('Suit');

  const [openDropdown, setOpenDropdown] = useState(null);
  const controlsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (controlsRef.current && !controlsRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. This is the corrected logic from your backup file.
  const asciiArt = useMemo(() => {
    const ears = catTraits.Ears[selectedEars] || catTraits.Ears['None'];
    const head = catTraits.Head[selectedHead] || catTraits.Head['None'];
    const face = catTraits.Face[selectedFace] || catTraits.Face['None'];
    const mouth = catTraits.Mouth[selectedMouth] || catTraits.Mouth['None'];
    const body = catTraits.Body[selectedBody] || catTraits.Body['None'];
    
    // This logic correctly combines the pre-padded parts.
    const firstLine = `${ears.slice(0, 2)}${head.trim()}${ears.slice(-2)}`;
    
    const lines = [firstLine, face, mouth, body].filter(line => line.trim() !== '');
    return lines.join('\n');
  }, [selectedEars, selectedHead, selectedFace, selectedMouth, selectedBody]);

  const toggleDropdown = (label) => {
    setOpenDropdown(prev => (prev === label ? null : label));
  };

  return (
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
      <div ref={controlsRef} className="w-full p-4 bg-gray-300 dark:bg-gray-800 rounded-b-md border-t border-black dark:border-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <TraitSelector 
            label="Ears"
            options={catTraits.Ears}
            selected={selectedEars}
            onChange={setSelectedEars}
            isOpen={openDropdown === 'Ears'}
            onToggle={() => toggleDropdown('Ears')}
          />
          <TraitSelector 
            label="Head"
            options={catTraits.Head}
            selected={selectedHead}
            onChange={setSelectedHead}
            isOpen={openDropdown === 'Head'}
            onToggle={() => toggleDropdown('Head')}
          />
          <TraitSelector 
            label="Face"
            options={catTraits.Face}
            selected={selectedFace}
            onChange={setSelectedFace}
            isOpen={openDropdown === 'Face'}
            onToggle={() => toggleDropdown('Face')}
          />
           <TraitSelector 
            label="Mouth"
            options={catTraits.Mouth}
            selected={selectedMouth}
            onChange={setSelectedMouth}
            isOpen={openDropdown === 'Mouth'}
            onToggle={() => toggleDropdown('Mouth')}
          />
          <TraitSelector 
            label="Body"
            options={catTraits.Body}
            selected={selectedBody}
            onChange={setSelectedBody}
            isOpen={openDropdown === 'Body'}
            onToggle={() => toggleDropdown('Body')}
          />
        </div>
      </div>
    </div>
  );
}
