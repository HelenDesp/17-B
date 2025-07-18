// /components/Palz.js
"use client";
import { useState, useMemo } from 'react';
import { Traits, specialStyles, outfitStyleMap } from './Traits.js';

const catData = {
  Shapes: {
    Head: { 'None': '', 'Round': '()', 'Parallel': '||', 'Chevron Up': '\\/', 'Chevron Down': '/\\', 'Curly': '{}', 'Square': '[]' },
    Snout: { 'None': '', 'Round': '()', 'Parallel': '||', 'Chevron Up': '\\/', 'Chevron Down': '/\\', 'Curly': '{}', 'Square': '[]' },
    Body: { 'None': '', 'Round': '()', 'Parallel': '||', 'Chevron Up': '\\/', 'Chevron Down': '/\\', 'Curly': '{}', 'Square': '[]' },
  },
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


export default function Palz({ ownerNFTImage, palzTrait, nftId }) { // RENAMED
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
  const [selectedFeet, setSelectedFeet] = useState('Standing');
  const [selectedWhiskers, setSelectedWhiskers] = useState('None');
  const [selectedWings, setSelectedWings] = useState('None');
  const [selectedTail, setSelectedTail] = useState('None');

  const [openModal, setOpenModal] = useState(null);
  const [openItem, setOpenItem] = useState(null);

  const handleSetSelectedEarsHead = (value) => {
    setSelectedEarsHead(value);
    if (value !== 'None' && selectedWhiskers.includes('Head')) {
      setSelectedWhiskers('None');
    }
  };

  const handleSetSelectedWhiskers = (value) => {
    setSelectedWhiskers(value);
    if (value.includes('Head') && selectedEarsHead !== 'None') {
      setSelectedEarsHead('None');
    }
  };

  const asciiArtLines = useMemo(() => {
    const earsTop = Traits.EarsTop[selectedEarsTop] || '';
    const earsHead = Traits.EarsHead[selectedEarsHead] || '';
    const headwear = Traits.Headwear[selectedHeadwear] || '';
    const hShape = catData.Shapes.Head[headShape] || '';
    const eyes = Traits.Eyes[selectedEyes] || '';
    const nose = Traits.Nose[selectedNose] || '';
    const sShape = catData.Shapes.Snout[snoutShape] || '';
    const snoutTrait = Traits.Snout[selectedSnoutTrait] || '';
    const bShape = catData.Shapes.Body[bodyShape] || '';
    const outfit = Traits.Outfit[selectedOutfit] || '';
    const feet = Traits.Feet[selectedFeet] || '';
    const whiskers = Traits.Whiskers[selectedWhiskers];
    const wings = Traits.Wings[selectedWings];
    const tail = Traits.Tail[selectedTail];

    let line1;
    if (selectedEarsTop === 'Elven') {
        const earParts = earsTop.split('   ');
        const middleContent = selectedHeadwear !== 'None' ? headwear : '   ';
        line1 = (
            <>
                <span style={{ marginRight: '5px' }}>{earParts[0]}</span>
                {middleContent}
                {earParts[1]}
            </>
        );
    } else {
        if (selectedHeadwear !== 'None' && selectedEarsTop !== 'None' && earsTop.includes('   ')) {
            const earParts = earsTop.split('   ');
            line1 = `${earParts[0]}${headwear}${earParts[1]}`;
        } else if (selectedHeadwear !== 'None') { line1 = headwear; }
        else { line1 = earsTop; }
    }

    let faceLine;
    let originalFaceLine;

    if (selectedEyes === 'Glasses') {
        originalFaceLine = 'o-o';
        faceLine = (
            <>
              o
              <span style={{ display: 'inline-block', position: 'relative', width: '1ch' }}>
                <span style={{ position: 'absolute', left: 0, top: 0, zIndex: 1 }}>-</span>
                {selectedNose !== 'None' && (
                  <span style={{ position: 'absolute', left: 0, top: '0.4em', zIndex: 2 }}>{nose}</span>
                )}
              </span>
              o
            </>
        );
    } else {
        if (eyes.includes(' ')) {
            const eyeParts = eyes.split(' ');
            const joiningChar = selectedNose === 'None' ? ' ' : nose;
            faceLine = eyeParts.join(joiningChar);
        } else {
            faceLine = nose;
        }
        originalFaceLine = faceLine;
    }

    let line2 = hShape ? <>{hShape.slice(0, 1)}{faceLine}{hShape.slice(-1)}</> : faceLine;
    let line3 = sShape ? `${sShape.slice(0, 1)}${snoutTrait}${sShape.slice(-1)}` : snoutTrait;
    
    let line4;
    const styleRef = outfitStyleMap[selectedOutfit];

    if (styleRef && specialStyles[styleRef]) {
        const styleToApply = specialStyles[styleRef];
        const outfitParts = outfit.split('');
        const specialCharRegex = /[^\u0000-\u00ff]/;

        const styledOutfit = outfitParts.map((char, i) => {
            if (specialCharRegex.test(char)) {
                return <span key={i} style={styleToApply}>{char}</span>;
            }
            return char;
        });
        line4 = bShape ? <>{bShape.slice(0, 1)}{styledOutfit}{bShape.slice(-1)}</> : <>{styledOutfit}</>;
    } else {
        line4 = bShape ? `${bShape.slice(0, 1)}${outfit}${bShape.slice(-1)}` : outfit;
    }

    let line5 = feet;
	if (selectedFeet === 'Pointy') {
		const leftCharacter = feet.substring(0, 1); // This will isolate the '<'
		const remainingCharacters = feet.substring(1); // This will get the rest of the string '_ _>'
		line5 = <><span style={{ marginRight: '5px' }}>{leftCharacter}</span>{remainingCharacters}</>;
	}
    
    let originalLine2 = hShape ? `${hShape.slice(0, 1)}${originalFaceLine}${hShape.slice(-1)}` : originalFaceLine;
    let originalLine3 = line3;
    let originalLine4 = bShape ? `${bShape.slice(0, 1)}${outfit}${bShape.slice(-1)}` : outfit;
    let originalLine5 = feet;

    if (earsHead) {
        const earParts = earsHead.split('   ');
        if (selectedEarsHead === 'Elven') {
            line2 = <><span style={{ marginRight: '5px' }}>{earParts[0]}</span>{line2}{earParts[1]}</>;
        } else {
            line2 = <>{earParts[0]}{line2}{earParts[1]}</>;
        }
    }
    
    if (whiskers) {
        if (selectedWhiskers.includes('Head')) {
            if (selectedWhiskers === 'Head Sharp') {
                line2 = <>{whiskers[0]}{line2}<span style={{ marginLeft: '-5px' }}>{whiskers[1]}</span></>;
            } else {
                line2 = <>{whiskers[0]}{line2}{whiskers[1]}</>;
            }
        }
        if (selectedWhiskers.includes('Snout')) {
            if (selectedWhiskers === 'Snout Sharp') {
                line3 = <>{whiskers[0]}{line3}<span style={{ marginLeft: '-5px' }}>{whiskers[1]}</span></>;
            } else {
                line3 = `${whiskers[0]}${line3}${whiskers[1]}`;
            }
        }
    }

    if (wings) {
        line4 = <>{wings[0]}{line4}{wings[1]}</>;
    }

    if (tail) {
        const rightTail = tail[1].replace(/ /g, '\u00A0');
        const leftTail = tail[0];
        if (selectedFeet === 'None') {
            line4 = <>{leftTail}{line4}{rightTail}</>;
        } else {
            const currentLine5isJsx = typeof line5 !== 'string';
            line5 = <>{leftTail}{currentLine5isJsx ? line5 : originalLine5}{rightTail}</>;
        }
    }

    const lines = [line1, line2, line3, line4, line5];

    const lineLengths = lines.map((line, index) => {
        if (typeof line === 'string') return line.length;

        if (index === 0) {
            const middleContent = selectedHeadwear !== 'None' ? headwear : '   ';
            return 1 + middleContent.length + 1;
        }
        if (index === 1) {
            let len = originalLine2.length;
            if (earsHead) len += earsHead.replace('   ', '').length;
            if (whiskers && selectedWhiskers.includes('Head')) len += 2;
            return len;
        }
        if (index === 2) {
            let len = originalLine3.length;
            if (whiskers && selectedWhiskers.includes('Snout')) len += 2;
            return len;
        }
        if (index === 3) {
            let len = originalLine4.length;
            if (wings) len += (wings[0] + wings[1]).length;
            if (tail && selectedFeet === 'None') len += (tail[0] + tail[1]).length;
            return len;
        }
        if (index === 4) {
            let len = originalLine5.length;
            if (tail && selectedFeet !== 'None') len += (tail[0] + tail[1]).length;
            return len;
        }
        return 0;
    });

    const maxLength = Math.max(...lineLengths);

    const paddedLines = lines.map((line, index) => {
        const currentLength = lineLengths[index];
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
          <div className="font-mono text-5xl text-center text-black dark:text-white" style={{ fontFamily: '"Doto", monospace', fontWeight: 900, textShadow: '1px 0 #000, -1px 0 #000, 0 1px #000, 0 -1px #000, 1px 1px #000, -1px -1px #000, 1px -1px #000, -1px 1px #000', lineHeight: 0.9 }}>
            {asciiArtLines.map((line, index) => {
              const style = { 
                position: 'relative',
              };

              let leftCorrection = 0;
              if (index === 0 && selectedEarsTop === 'Elven') {
                leftCorrection -= 2.5;
              }
              if (index === 1) {
                  if (selectedEarsHead === 'Elven') leftCorrection -= 2.5;
                  if (selectedWhiskers === 'Head Sharp') leftCorrection -= 2.5;
              }
              if (index === 2 && selectedWhiskers === 'Snout Sharp') {
                leftCorrection -= 2.5; 
              }
              if (index === 4 && selectedFeet === 'Pointy') {
                leftCorrection -= 2.5;
              }
              
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
        <AccordionItem label="Ears Top" options={Traits.EarsTop} selected={selectedEarsTop} onSelect={setSelectedEarsTop} isOpen={openItem === 'Trait:EarsTop'} onToggle={() => toggleItem('Trait:EarsTop')} />
        <AccordionItem label="Ears Head" options={Traits.EarsHead} selected={selectedEarsHead} onSelect={handleSetSelectedEarsHead} isOpen={openItem === 'Trait:EarsHead'} onToggle={() => toggleItem('Trait:EarsHead')} />
        <AccordionItem label="Headwear" options={Traits.Headwear} selected={selectedHeadwear} onSelect={setSelectedHeadwear} isOpen={openItem === 'Trait:Headwear'} onToggle={() => toggleItem('Trait:Headwear')} />
        <AccordionItem label="Eyes" options={Traits.Eyes} selected={selectedEyes} onSelect={setSelectedEyes} isOpen={openItem === 'Trait:Eyes'} onToggle={() => toggleItem('Trait:Eyes')} />
        <AccordionItem label="Nose" options={Traits.Nose} selected={selectedNose} onSelect={setSelectedNose} isOpen={openItem === 'Trait:Nose'} onToggle={() => toggleItem('Trait:Nose')} />
        <AccordionItem label="Snout" options={Traits.Snout} selected={selectedSnoutTrait} onSelect={setSelectedSnoutTrait} isOpen={openItem === 'Trait:Snout'} onToggle={() => toggleItem('Trait:Snout')} />
        <AccordionItem label="Outfit" options={Traits.Outfit} selected={selectedOutfit} onSelect={setSelectedOutfit} isOpen={openItem === 'Trait:Outfit'} onToggle={() => toggleItem('Trait:Outfit')} />
        <AccordionItem label="Feet" options={Traits.Feet} selected={selectedFeet} onSelect={setSelectedFeet} isOpen={openItem === 'Trait:Feet'} onToggle={() => toggleItem('Trait:Feet')} />
        <AccordionItem label="Whiskers" options={Traits.Whiskers} selected={selectedWhiskers} onSelect={handleSetSelectedWhiskers} isOpen={openItem === 'Trait:Whiskers'} onToggle={() => toggleItem('Trait:Whiskers')} />
        <AccordionItem label="Wings" options={Traits.Wings} selected={selectedWings} onSelect={setSelectedWings} isOpen={openItem === 'Trait:Wings'} onToggle={() => toggleItem('Trait:Wings')} />
        <AccordionItem label="Tail" options={Traits.Tail} selected={selectedTail} onSelect={setSelectedTail} isOpen={openItem === 'Trait:Tail'} onToggle={() => toggleItem('Trait:Tail')} />
      </SelectionModal>
    </div>
  );
}
