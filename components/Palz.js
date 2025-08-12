// /components/Palz.js
"use client";
import { useState, useMemo } from 'react';
import { Traits, specialStyles, outfitStyleMap } from './Traits.js';

const catData = {
  Shapes: {
	Headwear: { 'None': '', 'Round': '()', 'Parallel': '||', 'Chevron Up': '/\\', 'Chevron Down': '\\/', 'Curly': '{}', 'Square': '[]' },  
    Head: { 'None': '', 'Round': '()', 'Parallel': '||', 'Chevron Up': '/\\', 'Chevron Down': '\\/', 'Curly': '{}', 'Square': '[]' },
    Snout: { 'None': '', 'Round': '()', 'Parallel': '||', 'Chevron Up': '/\\', 'Chevron Down': '\\/', 'Curly': '{}', 'Square': '[]' },
    Body: { 'None': '', 'Round': '()', 'Parallel': '||', 'Chevron Up': '/\\', 'Chevron Down': '\\/', 'Curly': '{}', 'Square': '[]' },
  },
};

// /components/Palz.js

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

    // Helper function to get the displayable ASCII for each trait
    const getAsciiDisplay = (optionName) => {
        if (optionName === 'Random' || optionName === 'None') {
            return ''; // Don't show ASCII for "Random" or "None"
        }
        const value = options[optionName];

        // If the trait is an array (like Wings, Tail, Whiskers), join it with a space
        if (Array.isArray(value)) {
            return value.join(' ');
        }
        // Otherwise, just return the string value
        return value;
    };

    return (
        <div className="w-full" style={{ fontFamily: "'Cygnito Mono', monospace" }}>
            <button
              onClick={onToggle}
              className={`w-full flex items-center justify-between p-2 text-black dark:text-white rounded-md border-black dark:border-white ${isOpen ? 'border-2' : 'border'}`}
            >
                <span className="font-bold">{label}</span>
                <div className="flex items-center space-x-2">
                    {/* START OF MODIFICATION */}
                    {getAsciiDisplay(selected) && (
                        <span className="text-gray-500 dark:text-gray-400" style={{ whiteSpace: 'pre' }}>
                            {getAsciiDisplay(selected)}
                        </span>
                    )}
                    <span className="font-normal">{selected}</span>
                    {/* END OF MODIFICATION */}
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor" className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}><path d="M0 0H2V2H0V0Z M2 2H4V4H2V2Z M4 4H6V6H4V4Z M6 2H8V4H6V2Z M8 0H10V2H8V0Z" /></svg>
                </div>
            </button>

            {isOpen && (
                <div className="mt-1 border-2 border-black dark:border-white rounded-md max-h-[7.5rem] overflow-y-auto">
                    {displayOptions.map(optionName => (
                        <button
                            key={optionName}
                            onClick={() => handleSelect(optionName)}
                            className="w-full text-left py-1 px-2 flex items-center justify-between border-b border-transparent hover:border-black dark:hover:border-white"
                        >
                            <div className="flex items-center">
                                <span className="mr-2 text-lg">•</span>
                                <span>{optionName}</span>
                            </div>
                            {/* This is the new part that displays the ASCII art */}
                            <span className="text-gray-500 dark:text-gray-400" style={{ whiteSpace: 'pre' }}>
                                {getAsciiDisplay(optionName)}
                            </span>
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


export default function Palz({ ownerNFTImage, palzTrait, nftId }) {
  const [headwearShape, setHeadwearShape] = useState('None');	
  const [headShape, setHeadShape] = useState('Round');
  const [snoutShape, setSnoutShape] = useState('Round');
  const [bodyShape, setBodyShape] = useState('Round');

  const [selectedHeadwear, setSelectedHeadwear] = useState('Curly');
  const [selectedEarsTop, setSelectedEarsTop] = useState('Teddy');
  const [selectedEarsHead, setSelectedEarsHead] = useState('None');
  const [selectedEyes, setSelectedEyes] = useState('Open');
  const [selectedMien, setSelectedMien] = useState('None');
  const [selectedSnoutTrait, setSelectedSnoutTrait] = useState('Teddy');
  const [selectedOutfit, setSelectedOutfit] = useState('Suit');
  const [selectedFeet, setSelectedFeet] = useState('Paws');
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
  
  const handleSetSelectedMien = (mienOption) => {
    // First, set the mien that the user chose.
    setSelectedMien(mienOption);

    // Define the only Mien traits that are allowed to be worn with Glasses.
    const allowedMienForGlasses = ['Bit', 'Neutral', 'Smirk'];

    // If the current eyes are 'Glasses' AND the newly selected mien is NOT in our allowed list...
    if (selectedEyes === 'Glasses' && !allowedMienForGlasses.includes(mienOption)) {
      // ...then disable the glasses by switching the eyes to 'Open'.
      setSelectedEyes('Open');
    }
  };

	const handleSetSelectedEyes = (eyeOption) => {
	  const allowedMienForGlasses = ['Bit', 'Neutral', 'Smirk'];

	  // If you're trying to select 'Glasses' but the current Mien is not allowed...
	  if (eyeOption === 'Glasses' && !allowedMienForGlasses.includes(selectedMien)) {
		// ...reset the Mien to 'None' to allow the Glasses to be equipped.
		setSelectedMien('None');
	  }

	  // Finally, set the eye trait you selected.
	  setSelectedEyes(eyeOption);
	};  

const asciiArtLines = useMemo(() => {
    const headwear = Traits.Headwear[selectedHeadwear] || '';	  
    const earsTop = Traits.EarsTop[selectedEarsTop] || '';
    const earsHead = Traits.EarsHead[selectedEarsHead] || '';
    const hShape = catData.Shapes.Head[headShape] || '';
    const hwShape = catData.Shapes.Headwear[headwearShape] || '';
    const eyes = Traits.Eyes[selectedEyes] || '';
    const mien = Traits.Mien[selectedMien] || '';
    const sShape = catData.Shapes.Snout[snoutShape] || '';
    const snoutTrait = Traits.Snout[selectedSnoutTrait] || '';
    const bShape = catData.Shapes.Body[bodyShape] || '';
    const outfit = Traits.Outfit[selectedOutfit] || '';
    const feet = Traits.Feet[selectedFeet] || '';
    const whiskers = Traits.Whiskers[selectedWhiskers];
    const wings = Traits.Wings[selectedWings];
    const tail = Traits.Tail[selectedTail];
	
    // --- Controls for 'Aqua' Ears Top and Head ---
    const aquaEarsLeftShiftPx = -3;
    const aquaEarsRightShiftPx = -3;
    // ------------------------------------

    // --- Controls for 'Slit' Snout ---
    const slitSnoutShiftPx = -1;    // Controls horizontal position of the '≈' symbol.
    const slitSnoutPaddingLeft = 0;  // Adds empty space to the left of the '≈'
    const slitSnoutPaddingRight = 3; // Adds empty space to the right of the '≈'

    // --- Controls for 'Anger' Eyes ---
    const angerEyeRightShiftPx = -3; // Moves the right '´' character.
    // ---------------------------------	

    // Helper function for applying the alignment style
    const applyShift = (text) => {
        if (typeof text === 'string' && (text.startsWith('<') || text.startsWith('>') || text.startsWith('{'))) {
            const firstChar = text.substring(0, 1);
            const rest = text.substring(1);
            return (
                <>
                    <span style={{ position: 'relative', left: '-5px' }}>{firstChar}</span>
                    {rest}
                </>
            );
        }
        return text;
    };

    // --- BASE LINE CONSTRUCTION ---
    let line1;
    let line2;
    let line3;
    let line4;
    let line5;

    // CORRECTED LINE 1: Style the headwear trait FIRST, then wrap it in the Headwear Shape
    const styledHeadwearTrait = applyShift(headwear);
    const styledHeadwear = hwShape ? <>{applyShift(hwShape.slice(0, 1))}{styledHeadwearTrait}{hwShape.slice(-1)}</> : styledHeadwearTrait;

    // NEW LOGIC FOR LINE 1 with 'Aqua' Ears control
    if (selectedEarsTop === 'Aqua') {
        const earParts = earsTop.split('   '); // Splits "≈   ≈"
        const middlePart = selectedHeadwear !== 'None' ? styledHeadwear : '   ';
        line1 = (
            <>
                <span style={{ position: 'relative', left: `${aquaEarsLeftShiftPx}px` }}>{applyShift(earParts[0])}</span>
                {middlePart}
                <span style={{ position: 'relative', left: `${aquaEarsRightShiftPx}px` }}>{earParts[1]}</span>
            </>
        );
    } else if (earsTop && !earsTop.includes('   ')) {
        line1 = applyShift(earsTop);
    } else {
        const leftPart = earsTop ? earsTop.split('   ')[0] : '';
        const rightPart = earsTop ? earsTop.split('   ')[1] : '';
        const middlePart = selectedHeadwear !== 'None' ? styledHeadwear : (earsTop ? '   ' : '');
        line1 = <>{applyShift(leftPart)}{middlePart}{rightPart}</>;
    }

	// LINE 2: Head & Eyes
	let faceLine;
	if (selectedEyes === 'Glasses') {
		faceLine = (
			<>o<span style={{ display: 'inline-block', position: 'relative', width: '1ch' }}><span style={{ position: 'absolute', left: 0, top: '-0.8em', zIndex: 1 }}>-</span>{selectedMien !== 'None' && (<span style={{ position: 'absolute', left: 0, top: '-0.8em', zIndex: 2 }}>{mien}</span>)}</span>o</>
		);
	} else if (selectedEyes === 'Doubt') {
		// --- Controls for 'Doubt' Eyes ---
		const doubtEyeLeftShiftPx = -6;   // Negative values move the left eye left, positive values move it right.
		const doubtEyeSpacingPx = -9;    // Controls the space between the eyes.
		// ------------------------------------

		const eyeParts = eyes.split(' ');
		const joiningChar = selectedMien === 'None' ? '' : mien;
		faceLine = (
			<>
				<span style={{ position: 'relative', left: `${doubtEyeLeftShiftPx}px` }}>{eyeParts[0]}</span>
				{joiningChar}
				<span style={{ position: 'relative', marginLeft: `${doubtEyeSpacingPx}px` }}>{eyeParts[1]}</span>
			</>
		);
		
		// PASTE YOUR NEW BLOCK HERE
		} else if (selectedEyes === 'Anger') {
			const eyeParts = eyes.split(' '); // Splits "` ´"
			const joiningChar = selectedMien === 'None' ? ' ' : mien;
			faceLine = (
				<>
					{applyShift(eyeParts[0])}
					{joiningChar}
					<span style={{ position: 'relative', left: `${angerEyeRightShiftPx}px` }}>{eyeParts[1]}</span>
				</>
			);
		// END OF YOUR BLOCK		
		
	} else {
		// This is the default logic for all other eye types
		if (eyes.includes(' ')) {
			const eyeParts = eyes.split(' ');
			const leftEye = applyShift(eyeParts[0]);
			const rightEye = eyeParts[1];
			const joiningChar = selectedMien === 'None' ? ' ' : mien; // Reverted to default space
			faceLine = <>{leftEye}{joiningChar}{rightEye}</>;
		} else {
			faceLine = mien;
		}
	}
	line2 = hShape ? <>{applyShift(hShape.slice(0, 1))}{faceLine}{hShape.slice(-1)}</> : faceLine;
    
    // LINE 4: Outfit & Body
    const styleRef = outfitStyleMap[selectedOutfit];
    if (styleRef && specialStyles[styleRef]) {
        const styleToApply = specialStyles[styleRef];
        const styledOutfit = outfit.split('').map((char, i) => (/[^\u0000-\u00ff]/).test(char) ? <span key={i} style={styleToApply}>{char}</span> : char);
        line4 = bShape ? <>{bShape.slice(0, 1)}{styledOutfit}{bShape.slice(-1)}</> : <>{styledOutfit}</>;
	} else {
		line4 = bShape ? <>{applyShift(bShape.slice(0, 1))}{outfit}{bShape.slice(-1)}</> : <>{outfit}</>;
	}

    // LINE 5: Feet
    line5 = applyShift(feet);

    // --- RE-DEFINE ORIGINAL LINES FOR LENGTH CALCULATION ---
    let originalFaceLine;
    if (selectedEyes === 'Glasses') {
        originalFaceLine = 'o-o';
    } else {
        originalFaceLine = eyes.includes(' ') ? eyes.split(' ').join(selectedMien === 'None' ? ' ' : mien) : mien;
    }
    let originalLine2 = hShape ? `${hShape.slice(0, 1)}${originalFaceLine}${hShape.slice(-1)}` : originalFaceLine;
    let originalLine3 = sShape ? `${sShape.slice(0, 1)}${snoutTrait}${sShape.slice(-1)}` : snoutTrait;
    let originalLine4 = bShape ? `${bShape.slice(0, 1)}${outfit}${bShape.slice(-1)}` : outfit;
    let originalLine5 = feet;

    // --- MODIFIERS (Adding traits around the base lines) ---
	if (selectedEarsHead === 'Aqua') {
		const earParts = earsHead.split('   '); // Splits "≈   ≈"
		line2 = (
			<>
				<span style={{ position: 'relative', left: `${aquaEarsLeftShiftPx}px` }}>{applyShift(earParts[0])}</span>
				{line2}
				<span style={{ position: 'relative', left: `${aquaEarsRightShiftPx}px` }}>{earParts[1]}</span>
			</>
		);
	} else if (earsHead) {
		const earParts = earsHead.split('   ');
		line2 = <>{applyShift(earParts[0])}{line2}{earParts[1]}</>;
	}
    
    // Whiskers on Head (Simplified to remove special 'Sharp' styling)
    if (whiskers && selectedWhiskers.includes('Head')) {
        const leftWhisker = applyShift(whiskers[0]);
        line2 = <>{leftWhisker}{line2}{whiskers[1]}</>;
    }
    
	// CORRECTED LOGIC FOR LINE 3 (SNOUT + WHISKERS) with 'Slit' Snout control
    let styledSnoutTrait;
    if (selectedSnoutTrait === 'Slit') {
        const slitParts = snoutTrait.split('≈'); // Splits "\≈/"

        styledSnoutTrait = (
            <>
                {slitParts[0]}
                <span style={{
                    position: 'relative',
                    left: `${slitSnoutShiftPx}px`,
                    paddingLeft: `${slitSnoutPaddingLeft}px`,
                    paddingRight: `${slitSnoutPaddingRight}px`
                }}>≈</span>
                {slitParts[1]}
            </>
        );
    } else {
        styledSnoutTrait = applyShift(snoutTrait); // Default styling for all other snouts
    }

	const styledSnout = sShape ? <>{applyShift(sShape.slice(0, 1))}{styledSnoutTrait}{sShape.slice(-1)}</> : styledSnoutTrait;
	if (whiskers && selectedWhiskers.includes('Snout')) {
		const leftWhisker = applyShift(whiskers[0]);
		line3 = <>{leftWhisker}{styledSnout}{whiskers[1]}</>;
	} else {
		line3 = styledSnout;
	}

    if (wings) {
        line4 = <>{applyShift(wings[0])}{line4}{wings[1]}</>;
    }

    if (tail) {
        const rightTail = tail[1].replace(/ /g, '\u00A0');
        const leftTail = applyShift(tail[0]);
        if (selectedFeet === 'None') {
            line4 = <>{leftTail}{line4}{rightTail}</>;
        } else {
            const currentLine5isJsx = typeof line5 !== 'string';
            line5 = <>{leftTail}{currentLine5isJsx ? line5 : originalLine5}{rightTail}</>;
        }
    }

    // --- CENTERING LOGIC ---
    const lines = [line1, line2, line3, line4, line5];
    const lineLengths = lines.map((line, index) => {
        if (typeof line === 'string') return line.length;

        if (index === 0) {
            let len = 0;
            if (selectedEarsTop !== 'None' && earsTop.includes('   ')) {
                len += earsTop.length;
            }
            if (selectedHeadwear !== 'None') {
                len += headwear.length;
            }
            return len;
        }
        if (index === 1) {
            let len = originalLine2.length;
            if (earsHead) len += earsHead.replace('   ', '').length;
            // Reverted to simple calculation
            if (whiskers && selectedWhiskers.includes('Head')) len += 2;
            return len;
        }
        if (index === 2) {
            let len = originalLine3.length;
            // Reverted to simple calculation
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
        return (typeof line === 'string') ? (padding + line) : <>{padding}{line}</>;
    });

    return paddedLines;
}, [headShape, headwearShape, snoutShape, bodyShape, selectedEarsTop, selectedEarsHead, selectedHeadwear, selectedEyes, selectedMien, selectedSnoutTrait, selectedOutfit, selectedFeet, selectedWhiskers, selectedWings, selectedTail]);


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
	    <AccordionItem label="Headwear" options={catData.Shapes.Headwear} selected={headwearShape} onSelect={setHeadwearShape} isOpen={openItem === 'Shape:Headwear'} onToggle={() => toggleItem('Shape:Headwear')} />
        <AccordionItem label="Head" options={catData.Shapes.Head} selected={headShape} onSelect={setHeadShape} isOpen={openItem === 'Shape:Head'} onToggle={() => toggleItem('Shape:Head')} />
        <AccordionItem label="Snout" options={catData.Shapes.Snout} selected={snoutShape} onSelect={setSnoutShape} isOpen={openItem === 'Shape:Snout'} onToggle={() => toggleItem('Shape:Snout')} />
        <AccordionItem label="Body" options={catData.Shapes.Body} selected={bodyShape} onSelect={setBodyShape} isOpen={openItem === 'Shape:Body'} onToggle={() => toggleItem('Shape:Body')} />
      </SelectionModal>

      <SelectionModal title="Traits" isOpen={openModal === 'traits'} onClose={handleCloseModal}>
        <AccordionItem label="Headwear" options={Traits.Headwear} selected={selectedHeadwear} onSelect={setSelectedHeadwear} isOpen={openItem === 'Trait:Headwear'} onToggle={() => toggleItem('Trait:Headwear')} />
        <AccordionItem label="Ears Top" options={Traits.EarsTop} selected={selectedEarsTop} onSelect={setSelectedEarsTop} isOpen={openItem === 'Trait:EarsTop'} onToggle={() => toggleItem('Trait:EarsTop')} />
        <AccordionItem label="Ears Head" options={Traits.EarsHead} selected={selectedEarsHead} onSelect={handleSetSelectedEarsHead} isOpen={openItem === 'Trait:EarsHead'} onToggle={() => toggleItem('Trait:EarsHead')} />
        <AccordionItem label="Eyes" options={Traits.Eyes} selected={selectedEyes} onSelect={handleSetSelectedEyes} isOpen={openItem === 'Trait:Eyes'} onToggle={() => toggleItem('Trait:Eyes')} />
        <AccordionItem label="Mien" options={Traits.Mien} selected={selectedMien} onSelect={handleSetSelectedMien} isOpen={openItem === 'Trait:Mien'} onToggle={() => toggleItem('Trait:Mien')} />
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
