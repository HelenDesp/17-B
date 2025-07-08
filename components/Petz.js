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

// NEW: Accordion Item component for individual traits
const AccordionItem = ({ label, options, selected, onSelect, isOpen, onToggle }) => {
    const displayOptions = ['Random', 'None', ...Object.keys(options).filter(op => op !== 'None')];

    const handleSelect = (optionName) => {
        if (optionName === 'Random') {
            const availableOptions = Object.keys(options).filter(op => op !== 'None');
            const randomOption = availableOptions[Math.floor(Math.random() * availableOptions.length)];
            onSelect(randomOption);
        } else {
            onSelect(optionName);
        }
    };

    return (
        <div className="w-full" style={{ fontFamily: "'Cygnito Mono', monospace" }}>
            <button onClick={onToggle} className="w-full flex items-center justify-between p-2 border-2 border-black dark:border-white bg-white/80 dark:bg-gray-700/80 text-black dark:text-white rounded-md">
                <span className="font-bold">{label}</span>
                <div className="flex items-center space-x-2">
                    <span className="font-normal">{selected}</span>
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor" className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}><path d="M0 0H2V2H0V0Z M2 2H4V4H2V2Z M4 4H6V6H4V4Z M6 2H8V4H6V2Z M8 0H10V2H8V0Z" /></svg>
                </div>
            </button>

            {isOpen && (
                <div className="mt-1 p-1 border-2 border-black dark:border-white rounded-md max-h-[7.5rem] overflow-y-auto bg-white/80 dark:bg-gray-700/80">
                    {displayOptions.map(optionName => (
                        <button
                            key={optionName}
                            onClick={() => handleSelect(optionName)}
                            className="w-full text-left p-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-600"
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
  
  // State for accordions
  const [openSection, setOpenSection] = useState(null); // 'shapes' or 'traits'
  const [openItem, setOpenItem] = useState(null); // e.g., 'Head', 'Ears'

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
  
  const toggleSection = (section) => {
    setOpenSection(prev => (prev === section ? null : section));
    setOpenItem(null); // Close any open item when switching sections
  };

  const toggleItem = (item) => {
    setOpenItem(prev => (prev === item ? null : item));
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
      
      <div className="w-full p-4 bg-gray-300 dark:bg-gray-800 rounded-b-md border-t border-black dark:border-white space-y-2">
        {/* Shapes Accordion */}
        <div>
          <button onClick={() => toggleSection('shapes')} className="w-full flex items-center justify-between p-2 border-2 border-black dark:border-white bg-white dark:bg-gray-700 text-black dark:text-white rounded-md text-left" style={{ fontFamily: "'Cygnito Mono', monospace" }}>
              <span className="font-bold">Shapes</span>
              <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor" className={`transform transition-transform ${openSection === 'shapes' ? 'rotate-180' : ''}`}><path d="M0 0H2V2H0V0Z M2 2H4V4H2V2Z M4 4H6V6H4V4Z M6 2H8V4H6V2Z M8 0H10V2H8V0Z M10 0v2h2v2h-2v2h2v2h2V0z"/></svg>
          </button>
          {openSection === 'shapes' && (
            <div className="pt-2 space-y-2">
              <AccordionItem label="Head" options={catData.Shapes.Head} selected={headShape} onSelect={setHeadShape} isOpen={openItem === 'Head'} onToggle={() => toggleItem('Head')} />
              <AccordionItem label="Snout" options={catData.Shapes.Snout} selected={snoutShape} onSelect={setSnoutShape} isOpen={openItem === 'Snout'} onToggle={() => toggleItem('Snout')} />
              <AccordionItem label="Body" options={catData.Shapes.Body} selected={bodyShape} onSelect={setBodyShape} isOpen={openItem === 'Body'} onToggle={() => toggleItem('Body')} />
            </div>
          )}
        </div>

        {/* Traits Accordion */}
        <div>
          <button onClick={() => toggleSection('traits')} className="w-full flex items-center justify-between p-2 border-2 border-black dark:border-white bg-white dark:bg-gray-700 text-black dark:text-white rounded-md text-left" style={{ fontFamily: "'Cygnito Mono', monospace" }}>
              <span className="font-bold">Traits</span>
              <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor" className={`transform transition-transform ${openSection === 'traits' ? 'rotate-180' : ''}`}><path d="M0 0H2V2H0V0Z M2 2H4V4H2V2Z M4 4H6V6H4V4Z M6 2H8V4H6V2Z M8 0H10V2H8V0Z M10 0v2h2v2h-2v2h2v2h2V0z"/></svg>
          </button>
          {openSection === 'traits' && (
            <div className="pt-2 space-y-2">
              <AccordionItem label="Ears" options={catData.Traits.Ears} selected={selectedEars} onSelect={setSelectedEars} isOpen={openItem === 'Ears'} onToggle={() => toggleItem('Ears')} />
              <AccordionItem label="Headwear" options={catData.Traits.Headwear} selected={selectedHeadwear} onSelect={setSelectedHeadwear} isOpen={openItem === 'Headwear'} onToggle={() => toggleItem('Headwear')} />
              <AccordionItem label="Face" options={catData.Traits.Face} selected={selectedFace} onSelect={setSelectedFace} isOpen={openItem === 'Face'} onToggle={() => toggleItem('Face')} />
              <AccordionItem label="Snout Trait" options={catData.Traits.Snout} selected={selectedSnoutTrait} onSelect={setSelectedSnoutTrait} isOpen={openItem === 'Snout Trait'} onToggle={() => toggleItem('Snout Trait')} />
              <AccordionItem label="Outfit" options={catData.Traits.Outfit} selected={selectedOutfit} onSelect={setSelectedOutfit} isOpen={openItem === 'Outfit'} onToggle={() => toggleItem('Outfit')} />
              <AccordionItem label="Feet" options={catData.Traits.Feet} selected={selectedFeet} onSelect={setSelectedFeet} isOpen={openItem === 'Feet'} onToggle={() => toggleItem('Feet')} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}