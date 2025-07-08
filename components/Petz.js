// /components/Petz.js
"use client";
import { useState, useMemo, useEffect, useRef } from 'react';

// Data structure from the file you provided
const catData = {
  Shapes: {
    Head: { 'None': '', 'Round': '()', 'Parallel': '||', 'Chevron Up': '\\/', 'Chevron Down': '/\\', 'Curly': '{}', 'Square': '[]' },
    Snout: { 'None': '', 'Round': '()', 'Parallel': '||', 'Chevron Up': '\\/', 'Chevron Down': '/\\', 'Curly': '{}', 'Square': '[]' },
    Body: { 'None': '', 'Round': '()', 'Parallel': '||', 'Chevron Up': '\\/', 'Chevron Down': '/\\', 'Curly': '{}', 'Square': '[]' },
  },
  Traits: {
    Ears: { 'None': '', 'Type 1': '^   ^', 'Type 2': '<   >', 'Type 3': 'v   v', 'Type 4': 'v   v', 'Type 5': '\\/   \\/', 'Type 6': '/\\   /\\' },
    Headwear: { 'None': '', 'Punk': '///', 'Horns': '/-/', 'Curly hair': '~~~', 'Bald': '___' },
    Face: { 'None': '', 'Meth (Suspicious)': 'o.0', 'Sleeping': '-.-', 'Eyes open': 'o.o', 'Wide-eyed': '0.0' },
    Snout: { 'None': '', 'Normal': '---', 'Monster': 'vvv', 'Cigarette': '--,' },
    Outfit: { 'None': '', 'Muscular': '=|=', 'Suit': '\\:/', 'Priest': '\\+/', 'Bombol': "'\"'" },
    Feet: { 'None': '', 'Standard': '==', 'Owl': '=,,=' },
  }
};

// Helper component for a styled dropdown
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
      <button onClick={onToggle} className="w-full flex items-center justify-between p-2 border-2 border-black dark:border-white bg-white dark:bg-gray-700 text-black dark:text-white rounded-md text-left" style={{ fontFamily: "'Cygnito Mono', monospace" }}>
        <div className="flex items-center">
            <span className="font-bold">{label}</span>
            {selected !== 'None' && (
                <>
                    <span className="mx-1 text-gray-400">•</span>
                    <span className="font-normal">{selected}</span>
                </>
            )}
        </div>
        <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor" className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}><path d="M0 0H2V2H0V0Z M2 2H4V4H2V2Z M4 4H6V6H4V4Z M6 2H8V4H6V2Z M8 0H10V2H8V0Z" /></svg>
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border-2 border-black dark:border-white rounded-md z-10 max-h-48 overflow-y-auto">
          {displayOptions.map(optionName => (
            <button key={optionName} onClick={() => handleSelect(optionName)} className="w-full text-left p-2 flex items-center border-b border-transparent hover:border-black dark:hover:border-white" style={{ fontFamily: "'Cygnito Mono', monospace" }}>
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
  // State for Shapes
  const [headShape, setHeadShape] = useState('Round');
  const [snoutShape, setSnoutShape] = useState('Round');
  const [bodyShape, setBodyShape] = useState('Round');

  // State for Traits
  const [selectedEars, setSelectedEars] = useState('Type 1');
  const [selectedHeadwear, setSelectedHeadwear] = useState('None');
  const [selectedFace, setSelectedFace] = useState('Eyes open');
  const [selectedSnoutTrait, setSelectedSnoutTrait] = useState('Normal');
  const [selectedOutfit, setSelectedOutfit] = useState('Suit');
  const [selectedFeet, setSelectedFeet] = useState('Standard');
  
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

  // UPDATED: This logic now returns an array of lines, not a single string.
  const asciiArtLines = useMemo(() => {
    const ears = catData.Traits.Ears[selectedEars] || '';
    const headwear = catData.Traits.Headwear[selectedHeadwear] || '';
    const hShape = catData.Shapes.Head[headShape] || '';
    const face = catData.Traits.Face[selectedFace] || '';
    const sShape = catData.Shapes.Snout[snoutShape] || '';
    const snoutTrait = catData.Traits.Snout[selectedSnoutTrait] || '';
    const bShape = catData.Shapes.Body[bodyShape] || '';
    const outfit = catData.Traits.Outfit[selectedOutfit] || '';
    const feet = catData.Traits.Feet[selectedFeet] || '';

    const line1 = selectedHeadwear !== 'None' ? headwear : ears;
    const line2 = hShape ? `${hShape.slice(0, 1)}${face}${hShape.slice(-1)}` : face;
    const line3 = sShape ? `${sShape.slice(0, 1)}${snoutTrait}${sShape.slice(-1)}` : snoutTrait;
    const line4 = bShape ? `${bShape.slice(0, 1)}${outfit}${bShape.slice(-1)}` : outfit;
    const line5 = feet;

    const lines = [line1, line2, line3, line4, line5].filter(line => line.trim() !== '');
    const maxLength = Math.max(...lines.map(line => line.length), 0);
    const paddedLines = lines.map(line => {
        const padding = Math.floor((maxLength - line.length) / 2);
        return ' '.repeat(padding) + line;
    });
    return paddedLines;
  }, [headShape, snoutShape, bodyShape, selectedEars, selectedHeadwear, selectedFace, selectedSnoutTrait, selectedOutfit, selectedFeet]);

  const toggleDropdown = (label) => setOpenDropdown(prev => (prev === label ? null : label));

  return (
    <div className="flex flex-col items-center bg-gray-200 dark:bg-gray-900 rounded-md border border-black dark:border-white">
      <style jsx global>{`@import url('https://fonts.googleapis.com/css2?family=Doto:wght@900&display=swap');`}</style>
      
      <div className="w-full h-auto relative bg-blue-200 dark:bg-blue-900/50 rounded-t-md overflow-hidden flex items-center justify-center py-2">
        <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-gray-400 to-gray-300 dark:from-gray-800 dark:to-gray-700"></div>
        <div className="z-10 p-2">
          
          {/* UPDATED: Rendering logic changed to apply negative margins */}
          <div className="font-mono text-5xl text-center text-black dark:text-white" style={{ fontFamily: '"Doto", monospace', fontWeight: 900, textShadow: '1px 0 #000, -1px 0 #000, 0 1px #000, 0 -1px #000, 1px 1px #000, -1px -1px #000, 1px -1px #000, -1px 1px #000' }}>
            {asciiArtLines.map((line, index) => (
              <div 
                key={index}
                // Apply a negative top margin to every line except the first to create overlap
                style={{ marginTop: index > 0 ? '-1.5rem' : 0 }} 
              >
                {/* Use a non-breaking space for empty lines to maintain structure */}
                {line.trim() === '' ? '\u00A0' : line}
              </div>
            ))}
          </div>

        </div>
      </div>
      <div ref={controlsRef} className="w-full p-4 bg-gray-300 dark:bg-gray-800 rounded-b-md border-t border-black dark:border-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <div className="flex flex-col">
            <h4 className="font-bold text-lg mb-2 text-left text-gray-800 dark:text-gray-200">Shape</h4>
            <div className="space-y-2 flex-grow overflow-y-auto" style={{maxHeight: '180px'}}>
              <TraitSelector label="Head" options={catData.Shapes.Head} selected={headShape} onChange={setHeadShape} isOpen={openDropdown === 'Head Shape'} onToggle={() => toggleDropdown('Head Shape')} />
              <TraitSelector label="Snout" options={catData.Shapes.Snout} selected={snoutShape} onChange={setSnoutShape} isOpen={openDropdown === 'Snout Shape'} onToggle={() => toggleDropdown('Snout Shape')} />
              <TraitSelector label="Body" options={catData.Shapes.Body} selected={bodyShape} onChange={setBodyShape} isOpen={openDropdown === 'Body Shape'} onToggle={() => toggleDropdown('Body Shape')} />
            </div>
          </div>
          <div className="flex flex-col">
            <h4 className="font-bold text-lg mb-2 text-left text-gray-800 dark:text-gray-200">Traits</h4>
            <div className="space-y-2 flex-grow overflow-y-auto" style={{maxHeight: '180px'}}>
              <TraitSelector label="Ears" options={catData.Traits.Ears} selected={selectedEars} onChange={setSelectedEars} isOpen={openDropdown === 'Ears'} onToggle={() => toggleDropdown('Ears')} />
              <TraitSelector label="Headwear" options={catData.Traits.Headwear} selected={selectedHeadwear} onChange={setSelectedHeadwear} isOpen={openDropdown === 'Headwear'} onToggle={() => toggleDropdown('Headwear')} />
              <TraitSelector label="Face" options={catData.Traits.Face} selected={selectedFace} onChange={setSelectedFace} isOpen={openDropdown === 'Face'} onToggle={() => toggleDropdown('Face')} />
              <TraitSelector label="Snout" options={catData.Traits.Snout} selected={selectedSnoutTrait} onChange={setSelectedSnoutTrait} isOpen={openDropdown === 'Snout Trait'} onToggle={() => toggleDropdown('Snout Trait')} />
              <TraitSelector label="Outfit" options={catData.Traits.Outfit} selected={selectedOutfit} onChange={setSelectedOutfit} isOpen={openDropdown === 'Outfit'} onToggle={() => toggleDropdown('Outfit')} />
              <TraitSelector label="Feet" options={catData.Traits.Feet} selected={selectedFeet} onChange={setSelectedFeet} isOpen={openDropdown === 'Feet'} onToggle={() => toggleDropdown('Feet')} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
