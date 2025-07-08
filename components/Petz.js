// /components/Petz.js
"use client";
import { useState, useMemo } from 'react';

// Data structure
const catData = {
  Shapes: {
    Head: { 'None': '', 'Round': '()', 'Parallel': '||', 'Chevron Up': '\\/', 'Chevron Down': '/\\', 'Curly': '{}', 'Square': '[]' },
    Snout: { 'None': '', 'Round': '()', 'Parallel': '||', 'Chevron Up': '\\/', 'Chevron Down': '/\\', 'Curly': '{}', 'Square': '[]' },
    Body: { 'None': '', 'Round': '()', 'Parallel': '||', 'Chevron Up': '\\/', 'Chevron Down': '/\\', 'Curly': '{}', 'Square': '[]' },
  },
  Traits: {
    Ears: { 'None': '', 'Type 1': '^   ^', 'Type 2': '<   >', 'Type 3': 'v   v', 'Antennas': 'q   p', 'Type 5': '\\/   \\/', 'Type 6': '/\\   /\\' },
    Headwear: { 'None': '', 'Punk': '///', 'Horns': '/-/', 'Curly hair': '~~~', 'Bald': '___' },
    Face: { 'None': '', 'Meth (Suspicious)': 'o.0', 'Sleeping': '-.-', 'Eyes open': 'o.o', 'Wide-eyed': '0.0' },
    Snout: { 'None': '', 'Normal': '---', 'Monster': 'vvv', 'Cigarette': '--,', 'Wolf': 'o' },
    Outfit: { 'None': '', 'Muscular': '=|=', 'Suit': '\\:/', 'Priest': '\\+/', 'Bombol': "'\"'" },
    Feet: { 'None': '', 'Standard': '==', 'Owl': '=,,=' },
  }
};

// UPDATED: Helper component for a styled dropdown
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
      {/* Field button with transparent background and no blur */}
      <button onClick={onToggle} className="w-full flex items-center justify-between p-2 border-2 border-black dark:border-white text-black dark:text-white rounded-md text-left" style={{ fontFamily: "'Cygnito Mono', monospace" }}>
        <span className="font-bold">{label}</span>
        <div className="flex items-center space-x-2">
            <span className="font-normal">{selected}</span>
            <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor" className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}><path d="M0 0H2V2H0V0Z M2 2H4V4H2V2Z M4 4H6V6H4V4Z M6 2H8V4H6V2Z M8 0H10V2H8V0Z" /></svg>
        </div>
      </button>
      {/* Dropdown menu with transparent background and no blur */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 border-2 border-black dark:border-white rounded-md z-10 max-h-48 overflow-y-auto">
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

// Modal component for selecting shapes or traits
const SelectionModal = ({ title, isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 bg-gray-300/50 dark:bg-gray-800/50 backdrop-blur-sm z-20 flex flex-col p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-xl text-gray-800 dark:text-gray-200">{title}</h3>
                <button onClick={onClose} className="p-2 border-2 border-black dark:border-white rounded-md">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M0 0h2v2H0V0zm2 2h2v2H2V2zm2 2h2v2H4V4zm2 2h2v2H6V6zm2 2h2v2H8V8zm2 2h2v2h-2v-2zm2 2h2v2h-2v-2zm-2-2h2v2h-2v-2zm-2-2h2v2H8V8zM6 8h2v2H6V8zM4 6h2v2H4V6zM2 4h2v2H2V4zm0-2h2v2H2V2zm2-2h2v2H4V0zm2 0h2v2H6V0zm2 0h2v2H8V0zm2 0h2v2h-2V0z"/></svg>
                </button>
            </div>
            <div className="space-y-2 flex-grow overflow-y-auto">
                {children}
            </div>
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
  
  // State for modals and dropdowns
  const [openModal, setOpenModal] = useState(null); // 'shapes' or 'traits'
  const [openDropdown, setOpenDropdown] = useState(null);

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

    let line1;
    if (selectedHeadwear !== 'None' && selectedEars !== 'None' && ears.includes('   ')) {
        const earParts = ears.split('   ');
        line1 = `${earParts[0]}${headwear}${earParts[1]}`;
    } else if (selectedHeadwear !== 'None') {
        line1 = headwear;
    } else {
        line1 = ears;
    }
    
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
  
  const handleCloseModal = () => {
      setOpenModal(null);
      setOpenDropdown(null);
  };

  return (
    <div className="flex flex-col items-center bg-gray-200 dark:bg-gray-900 rounded-md border border-black dark:border-white relative overflow-hidden">
      <style jsx global>{`@import url('https://fonts.googleapis.com/css2?family=Doto:wght@900&display=swap');`}</style>
      
      <div className="w-full h-auto relative bg-blue-200 dark:bg-blue-900/50 rounded-t-md overflow-hidden flex items-center justify-center py-2">
        <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-gray-400 to-gray-300 dark:from-gray-800 dark:to-gray-700"></div>
        <div className="z-10 p-2">
          <div className="font-mono text-5xl text-center text-black dark:text-white" style={{ fontFamily: '"Doto", monospace', fontWeight: 900, textShadow: '1px 0 #000, -1px 0 #000, 0 1px #000, 0 -1px #000, 1px 1px #000, -1px -1px #000, 1px -1px #000, -1px 1px #000' }}>
            {asciiArtLines.map((line, index) => (
              <div key={index} style={{ marginTop: index > 0 ? '-0.5rem' : 0 }} >
                {line.trim() === '' ? '\u00A0' : line}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="w-full p-4 bg-gray-300 dark:bg-gray-800 rounded-b-md border-t border-black dark:border-white">
        <div className="flex items-center space-x-2">
            <button onClick={() => setOpenModal('shapes')} className="w-full flex items-center justify-between p-2 border-2 border-black dark:border-white bg-white dark:bg-gray-700 text-black dark:text-white rounded-md text-left" style={{ fontFamily: "'Cygnito Mono', monospace" }}>
                <span className="font-bold">Shapes</span>
                <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor"><path d="M0 0H2V2H0V0Z M2 2H4V4H2V2Z M4 4H6V6H4V4Z M6 2H8V4H6V2Z M8 0H10V2H8V0Z M10 0v2h2v2h-2v2h2v2h2V0z"/></svg>
            </button>
            
            <button onClick={() => setOpenModal('traits')} className="w-full flex items-center justify-between p-2 border-2 border-black dark:border-white bg-white dark:bg-gray-700 text-black dark:text-white rounded-md text-left" style={{ fontFamily: "'Cygnito Mono', monospace" }}>
                <span className="font-bold">Traits</span>
                <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor"><path d="M0 0H2V2H0V0Z M2 2H4V4H2V2Z M4 4H6V6H4V4Z M6 2H8V4H6V2Z M8 0H10V2H8V0Z M10 0v2h2v2h-2v2h2v2h2V0z"/></svg>
            </button>
        </div>
      </div>

      {/* Shapes Modal */}
      <SelectionModal title="Shapes" isOpen={openModal === 'shapes'} onClose={handleCloseModal}>
        <TraitSelector label="Head" options={catData.Shapes.Head} selected={headShape} onChange={setHeadShape} isOpen={openDropdown === 'Head Shape'} onToggle={() => toggleDropdown('Head Shape')} />
        <TraitSelector label="Snout" options={catData.Shapes.Snout} selected={snoutShape} onChange={setSnoutShape} isOpen={openDropdown === 'Snout Shape'} onToggle={() => toggleDropdown('Snout Shape')} />
        <TraitSelector label="Body" options={catData.Shapes.Body} selected={bodyShape} onChange={setBodyShape} isOpen={openDropdown === 'Body Shape'} onToggle={() => toggleDropdown('Body Shape')} />
      </SelectionModal>

      {/* Traits Modal */}
      <SelectionModal title="Traits" isOpen={openModal === 'traits'} onClose={handleCloseModal}>
        <TraitSelector label="Ears" options={catData.Traits.Ears} selected={selectedEars} onChange={setSelectedEars} isOpen={openDropdown === 'Ears'} onToggle={() => toggleDropdown('Ears')} />
        <TraitSelector label="Headwear" options={catData.Traits.Headwear} selected={selectedHeadwear} onChange={setSelectedHeadwear} isOpen={openDropdown === 'Headwear'} onToggle={() => toggleDropdown('Headwear')} />
        <TraitSelector label="Face" options={catData.Traits.Face} selected={selectedFace} onChange={setSelectedFace} isOpen={openDropdown === 'Face'} onToggle={() => toggleDropdown('Face')} />
        <TraitSelector label="Snout" options={catData.Traits.Snout} selected={selectedSnoutTrait} onChange={setSelectedSnoutTrait} isOpen={openDropdown === 'Snout Trait'} onToggle={() => toggleDropdown('Snout Trait')} />
        <TraitSelector label="Outfit" options={catData.Traits.Outfit} selected={selectedOutfit} onChange={setSelectedOutfit} isOpen={openDropdown === 'Outfit'} onToggle={() => toggleDropdown('Outfit')} />
        <TraitSelector label="Feet" options={catData.Traits.Feet} selected={selectedFeet} onChange={setSelectedFeet} isOpen={openDropdown === 'Feet'} onToggle={() => toggleDropdown('Feet')} />
      </SelectionModal>
    </div>
  );
}