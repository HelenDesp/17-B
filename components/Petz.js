// /components/Petz.js
"use client";
import { useState, useMemo } from 'react';

const catData = {
  Shapes: {
    Head: { 'None': '', 'Round': '()', 'Parallel': '||', 'Chevron Up': '\\/', 'Chevron Down': '/\\', 'Curly': '{}', 'Square': '[]' },
    Snout: { 'None': '', 'Round': '()', 'Parallel': '||', 'Chevron Up': '\\/', 'Chevron Down': '/\\', 'Curly': '{}', 'Square': '[]' },
    Body: { 'None': '', 'Round': '()', 'Parallel': '||', 'Chevron Up': '\\/', 'Chevron Down': '/\\', 'Curly': '{}', 'Square': '[]' },
  },
  Traits: {
    // UPDATED: Both Ear traits now have the same full list of string-based options
    EarsTop: { 'None': '', 'Pointy': '^   ^', 'Elven': '<   >', 'Type 3': 'v   v', 'Antennas': 'q   p', 'Type 5': '\\/   \\/', 'Type 6': '/\\   /\\' },
    EarsHead: { 'None': '', 'Pointy': '^   ^', 'Elven': '<   >', 'Type 3': 'v   v', 'Antennas': 'q   p', 'Type 5': '\\/   \\/', 'Type 6': '/\\   /\\' },
    Headwear: { 'None': '', 'Punk': '///', 'Horns': '/-/', 'Curly hair': '~~~', 'Bald': '___' },
    Eyes: { 'None': '', 'Meth (Suspicious)': 'o 0', 'Sleeping': '- -', 'Eyes Open': 'o o', 'Wide-Eyed': '0 0' },
    Nose: { 'None': '', 'Round': 'o', 'Dog': 'Y', 'Crest': '.', 'More': '_' },
    Snout: { 'None': '', 'Normal': '---', 'Monster': 'vvv', 'Cigarette': '--,', 'Wolf': 'o' },
    Outfit: { 'None': '', 'Muscular': '=|=', 'Suit': '\\:/', 'Priest': '\\+/', 'Bombol': "'\"'" },
    Feet: { 'None': '', 'Standard': '==', 'Owl': '=,,=' },
    Whiskers: {
        'None': '',
        'Head Regular': ['>', '<'],
        'Head Parallel': ['=', '='],
        'Snout Regular': ['>', '<'],
        'Snout Parallel': ['=', '='],
    },
    Wings: {
        'None': '',
        'Standard': ['//', '\\\\'],
    },
    Tail: {
        'None': '',
        'Cat': ['\\_', '  '],
        'Dog': ['@', ' '],
        'Hamster': ['o', ' '],
        'Curl': ['c', ' '],
    },
  }
};

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
            <button
              onClick={onToggle}
              className={`w-full flex items-center justify-between p-2 text-black dark:text-white rounded-md border-black dark:border-white ${isOpen ? 'border-2' : 'border'}`}
            >
                <span className="font-bold">{label}</span>
                <div className="flex items-center space-x-2">
                    <span className="font-normal">{selected}</span>
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor" className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}><path d="M0 0H2V2H0V0Z M2 2H4V4H2V2Z M4 4H6V6H4V4Z M6 2H8V4H6V2Z M8 0H10V2H8V0Z" /></svg>
                </div>
            </button>

            {isOpen && (
                <div className="mt-1 border-2 border-black dark:border-white rounded-md max-h-[7.5rem] overflow-y-auto">
                    {displayOptions.map(optionName => (
                        <button
                            key={optionName}
                            onClick={() => handleSelect(optionName)}
                            className="w-full text-left py-1 px-2 flex items-center border-b border-transparent hover:border-black dark:hover:border-white"
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

const SelectionModal = ({ title, isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 bg-gray-300/50 dark:bg-gray-800/50 backdrop-blur-sm z-20 flex flex-col">
            <div className="flex justify-between items-center p-4 pb-0 mb-4">
                <p className="font-bold text-xl text-gray-800 dark:text-gray-200">{title}</p>
                <button
                  className="border-2 border-black dark:border-white w-8 h-8 flex items-center justify-center transition bg-transparent text-gray-800 dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black rounded cursor-pointer"
                  onClick={onClose}
                  aria-label="Close"
                >
                  <span className="text-4xl leading-none font-bold">&#215;</span>
                </button>
            </div>
            <div className="space-y-2 flex-grow overflow-y-auto px-4 pb-4">
                {children}
            </div>
        </div>
    );
};


export default function Petz({ ownerNFTImage }) {
  const [headShape, setHeadShape] = useState('Round');
  const [snoutShape, setSnoutShape] = useState('Round');
  const [bodyShape, setBodyShape] = useState('Round');

  const [selectedEarsTop, setSelectedEarsTop] = useState('Pointy');
  const [selectedEarsHead, setSelectedEarsHead] = useState('None');
  const [selectedHeadwear, setSelectedHeadwear] = useState('None');
  const [selectedEyes, setSelectedEyes] = useState('Eyes Open');
  const [selectedNose, setSelectedNose] = useState('Crest');
  const [selectedSnoutTrait, setSelectedSnoutTrait] = useState('Normal');
  const [selectedOutfit, setSelectedOutfit] = useState('Suit');
  const [selectedFeet, setSelectedFeet] = useState('Standard');
  const [selectedWhiskers, setSelectedWhiskers] = useState('None');
  const [selectedWings, setSelectedWings] = useState('None');
  const [selectedTail, setSelectedTail] = useState('None');

  const [openModal, setOpenModal] = useState(null);
  const [openItem, setOpenItem] = useState(null);

  const asciiArtLines = useMemo(() => {
    const earsTop = catData.Traits.EarsTop[selectedEarsTop] || '';
    const earsHead = catData.Traits.EarsHead[selectedEarsHead] || '';
    const headwear = catData.Traits.Headwear[selectedHeadwear] || '';
    const hShape = catData.Shapes.Head[headShape] || '';
    const eyes = catData.Traits.Eyes[selectedEyes] || '';
    const nose = catData.Traits.Nose[selectedNose] || '';
    const sShape = catData.Shapes.Snout[snoutShape] || '';
    const snoutTrait = catData.Traits.Snout[selectedSnoutTrait] || '';
    const bShape = catData.Shapes.Body[bodyShape] || '';
    const outfit = catData.Traits.Outfit[selectedOutfit] || '';
    const feet = catData.Traits.Feet[selectedFeet] || '';
    const whiskers = catData.Traits.Whiskers[selectedWhiskers];
    const wings = catData.Traits.Wings[selectedWings];
    const tail = catData.Traits.Tail[selectedTail];

    let line1;
    if (selectedHeadwear !== 'None' && selectedEarsTop !== 'None' && earsTop.includes('   ')) {
        const earParts = earsTop.split('   ');
        line1 = `${earParts[0]}${headwear}${earParts[1]}`;
    } else if (selectedHeadwear !== 'None') { line1 = headwear; }
    else { line1 = earsTop; }

    let faceLine = '';
    if (eyes.includes(' ')) {
        const eyeParts = eyes.split(' ');
        const joiningChar = selectedNose === 'None' ? ' ' : nose;
        faceLine = eyeParts.join(joiningChar);
    } else { faceLine = nose; }

    let line2 = hShape ? `${hShape.slice(0, 1)}${faceLine}${hShape.slice(-1)}` : faceLine;
    let line3 = sShape ? `${sShape.slice(0, 1)}${snoutTrait}${sShape.slice(-1)}` : snoutTrait;
    let line4 = bShape ? `${bShape.slice(0, 1)}${outfit}${bShape.slice(-1)}` : outfit;
    let line5 = feet;

    // Logic for line2 accessories
    let line2Final = line2;
    let line2Length = line2.length;

    if (earsHead) {
        const earParts = earsHead.split('   ');
        const leftEar = earParts[0];
        const rightEar = earParts[1];
        line2Length += (leftEar || '').length + (rightEar || '').length;

        if (selectedEarsHead === 'Elven') {
            line2Final = <><span style={{ marginRight: '5px' }}>{leftEar}</span>{line2Final}{rightEar}</>;
        } else {
            line2Final = `${leftEar}${line2Final}${rightEar}`;
        }
    }

    if (whiskers) {
        const leftWhisker = whiskers[0];
        const rightWhisker = whiskers[1];
        line2Length += (leftWhisker || '').length + (rightWhisker || '').length;

        if (selectedWhiskers === 'Head Regular') {
            line2Final = <>{leftWhisker}{line2Final}<span style={{ marginLeft: '-5px' }}>{rightWhisker}</span></>;
        } else {
            line2Final = <>{leftWhisker}{line2Final}{rightWhisker}</>;
        }
    }
    
    if (wings) {
        line4 = `${wings[0]}${line4}${wings[1]}`;
    }

    if (tail) {
        const rightTail = tail[1].replace(/ /g, '\u00A0');
        const leftTail = tail[0];
        if (selectedFeet === 'None') {
            line4 = `${leftTail}${line4}${rightTail}`;
        } else {
            line5 = `${leftTail}${line5}${rightTail}`;
        }
    }

    const lines = [line1, line2Final, line3, line4, line5];

    const lineLengths = lines.map((line, index) => {
        if (index === 1) return line2Length;
        if (typeof line === 'string') return line.length;
        return 0;
    });

    const maxLength = Math.max(...lineLengths.filter(len => len > 0));

    const paddedLines = lines.map((line, index) => {
        const currentLength = lineLengths[index];
        if(currentLength === 0 && (typeof line !== 'object' && !line)) return '';
        const padding = ' '.repeat(Math.floor((maxLength - currentLength) / 2));

        if (typeof line === 'string') {
            return padding + line;
        } else {
            return <>{padding}{line}</>;
        }
    });

    return paddedLines.filter(line => {
        if (typeof line === 'string') return line.trim() !== '';
        return true;
    });
  }, [headShape, snoutShape, bodyShape, selectedEarsTop, selectedEarsHead, selectedHeadwear, selectedEyes, selectedNose, selectedSnoutTrait, selectedOutfit, selectedFeet, selectedWhiskers, selectedWings, selectedTail]);


  const toggleItem = (item) => {
    setOpenItem(prev => (prev === item ? null : item));
  };

  const handleCloseModal = () => {
      setOpenModal(null);
      setOpenItem(null);
  };

  return (
    <div className="flex flex-col items-center bg-gray-200 dark:bg-gray-900 rounded-md border border-black dark:border-white relative overflow-hidden">
      <style jsx global>{`@import url('https://fonts.googleapis.com/css2?family=Doto:wght@900&display=swap');`}</style>

      <div className="w-full h-auto relative bg-blue-200 dark:bg-blue-900/50 rounded-t-md overflow-hidden flex items-center justify-center py-2">
        <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-gray-400 to-gray-300 dark:from-gray-800 dark:to-gray-700"></div>
        <div className="z-10 p-2">
          <div className="font-mono text-5xl text-center text-black dark:text-white" style={{ fontFamily: '"Doto", monospace', fontWeight: 900, textShadow: '1px 0 #000, -1px 0 #000, 0 1px #000, 0 -1px #000, 1px 1px #000, -1px -1px #000, 1px -1px #000, -1px 1px #000' }}>
            {asciiArtLines.map((line, index) => {
              const style = { 
                marginTop: index > 0 ? '-0.5rem' : 0,
                position: 'relative',
              };

              let leftCorrection = 0;
              if (selectedEarsHead === 'Elven') leftCorrection -= 2.5;
              if (selectedWhiskers === 'Head Regular') leftCorrection -= 2.5;
              
              if (leftCorrection !== 0) {
                style.left = `${leftCorrection}px`;
              }

              return (
                <div key={index} style={style} >
                  {typeof line === 'string' && line.trim() === '' ? '\u00A0' : line}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="w-full p-4 bg-gray-300 dark:bg-gray-800 rounded-b-md border-t border-black dark:border-white">
        <div className="flex items-center space-x-2">
            <button onClick={() => setOpenModal('shapes')} className={`w-full flex items-center justify-between p-2 bg-white dark:bg-gray-700 text-black dark:text-white rounded-md text-left border-black dark:border-white ${openModal === 'shapes' ? 'border-2' : 'border'}`} style={{ fontFamily: "'Cygnito Mono', monospace" }}>
                <span className="font-bold">Shapes</span>
                <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor"><path d="M0 0H2V2H0V0Z M2 2H4V4H2V2Z M4 4H6V6H4V4Z M6 2H8V4H6V2Z M8 0H10V2H8V0Z" /></svg>
            </button>
            <button onClick={() => setOpenModal('traits')} className={`w-full flex items-center justify-between p-2 bg-white dark:bg-gray-700 text-black dark:text-white rounded-md text-left border-black dark:border-white ${openModal === 'traits' ? 'border-2' : 'border'}`} style={{ fontFamily: "'Cygnito Mono', monospace" }}>
                <span className="font-bold">Traits</span>
                <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor"><path d="M0 0H2V2H0V0Z M2 2H4V4H2V2Z M4 4H6V6H4V4Z M6 2H8V4H6V2Z M8 0H10V2H8V0Z" /></svg>
            </button>
        </div>
      </div>

      <SelectionModal title="Shapes" isOpen={openModal === 'shapes'} onClose={handleCloseModal}>
        <AccordionItem label="Head" options={catData.Shapes.Head} selected={headShape} onSelect={setHeadShape} isOpen={openItem === 'Shape:Head'} onToggle={() => toggleItem('Shape:Head')} />
        <AccordionItem label="Snout" options={catData.Shapes.Snout} selected={snoutShape} onSelect={setSnoutShape} isOpen={openItem === 'Shape:Snout'} onToggle={() => toggleItem('Shape:Snout')} />
        <AccordionItem label="Body" options={catData.Shapes.Body} selected={bodyShape} onSelect={setBodyShape} isOpen={openItem === 'Shape:Body'} onToggle={() => toggleItem('Shape:Body')} />
      </SelectionModal>

      <SelectionModal title="Traits" isOpen={openModal === 'traits'} onClose={handleCloseModal}>
        <AccordionItem label="Ears Top" options={catData.Traits.EarsTop} selected={selectedEarsTop} onSelect={setSelectedEarsTop} isOpen={openItem === 'Trait:EarsTop'} onToggle={() => toggleItem('Trait:EarsTop')} />
        <AccordionItem label="Ears Head" options={catData.Traits.EarsHead} selected={selectedEarsHead} onSelect={setSelectedEarsHead} isOpen={openItem === 'Trait:EarsHead'} onToggle={() => toggleItem('Trait:EarsHead')} />
        <AccordionItem label="Headwear" options={catData.Traits.Headwear} selected={selectedHeadwear} onSelect={setSelectedHeadwear} isOpen={openItem === 'Trait:Headwear'} onToggle={() => toggleItem('Trait:Headwear')} />
        <AccordionItem label="Eyes" options={catData.Traits.Eyes} selected={selectedEyes} onSelect={setSelectedEyes} isOpen={openItem === 'Trait:Eyes'} onToggle={() => toggleItem('Trait:Eyes')} />
        <AccordionItem label="Nose" options={catData.Traits.Nose} selected={selectedNose} onSelect={setSelectedNose} isOpen={openItem === 'Trait:Nose'} onToggle={() => toggleItem('Trait:Nose')} />
        <AccordionItem label="Snout" options={catData.Traits.Snout} selected={selectedSnoutTrait} onSelect={setSelectedSnoutTrait} isOpen={openItem === 'Trait:Snout'} onToggle={() => toggleItem('Trait:Snout')} />
        <AccordionItem label="Outfit" options={catData.Traits.Outfit} selected={selectedOutfit} onSelect={setSelectedOutfit} isOpen={openItem === 'Trait:Outfit'} onToggle={() => toggleItem('Trait:Outfit')} />
        <AccordionItem label="Feet" options={catData.Traits.Feet} selected={selectedFeet} onSelect={setSelectedFeet} isOpen={openItem === 'Trait:Feet'} onToggle={() => toggleItem('Trait:Feet')} />
        <AccordionItem label="Whiskers" options={catData.Traits.Whiskers} selected={selectedWhiskers} onSelect={setSelectedWhiskers} isOpen={openItem === 'Trait:Whiskers'} onToggle={() => toggleItem('Trait:Whiskers')} />
        <AccordionItem label="Wings" options={catData.Traits.Wings} selected={selectedWings} onSelect={setSelectedWings} isOpen={openItem === 'Trait:Wings'} onToggle={() => toggleItem('Trait:Wings')} />
        <AccordionItem label="Tail" options={catData.Traits.Tail} selected={selectedTail} onSelect={setSelectedTail} isOpen={openItem === 'Trait:Tail'} onToggle={() => toggleItem('Trait:Tail')} />
      </SelectionModal>
    </div>
  );
}