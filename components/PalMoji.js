// /components/PalMoji.js
"use client";
import { useState, useMemo, useRef } from 'react';
import { Traits, outfitStyleMap } from './Traits.js'; // specialStyles removed from import
import axios from "axios";
import { useAccount } from "wagmi";

const catData = {
  Shapes: {
	Headwear: { 'None': '', 'Round': '()', 'Parallel': '||', 'Chevron Up': '/\\', 'Chevron Down': '\\/', 'Curly': '{}', 'Square': '[]' },
    Head: { 'None': '', 'Round': '()', 'Parallel': '||', 'Chevron Up': '/\\', 'Chevron Down': '\\/', 'Curly': '{}', 'Square': '[]' },
    Snout: { 'None': '', 'Round': '()', 'Parallel': '||', 'Chevron Up': '/\\', 'Chevron Down': '\\/', 'Curly': '{}', 'Square': '[]' },
    Body: { 'None': '', 'Round': '()', 'Parallel': '||', 'Chevron Up': '/\\', 'Chevron Down': '\\/', 'Curly': '{}', 'Square': '[]' },
  },
};

// --- NEW: specialStyles object moved here and updated ---
const emojiFontStack = `'apple color emoji', 'segoe ui emoji', 'noto color emoji', sans-serif`;

const specialStyles = {
    Ssmall: { textShadow: 'none', fontSize: '0.5em', position: 'relative', top: '-7px', left: '-2px', color: 'currentColor', filter: 'grayscale(100%)', fontFamily: emojiFontStack },
    Lsmall: { textShadow: 'none', fontSize: '0.55em', position: 'relative', top: '-7px', left: '-2px', color: 'currentColor', filter: 'grayscale(100%)', fontFamily: emojiFontStack },
    default: { textShadow: 'none', fontSize: '0.6em', position: 'relative', top: '-7px', left: '-2px', color: 'currentColor', filter: 'grayscale(100%)', fontFamily: emojiFontStack },
    Smedium: { textShadow: 'none', fontSize: '0.65em', position: 'relative', top: '-7px', left: '-2px', color: 'currentColor', filter: 'grayscale(100%)', fontFamily: emojiFontStack },
    Mmedium: { textShadow: 'none', fontSize: '0.7em', position: 'relative', top: '-7px', left: '-2px', color: 'currentColor', filter: 'grayscale(100%)', fontFamily: emojiFontStack },
    Lmedium: { textShadow: 'none', fontSize: '0.75em', position: 'relative', top: '-7px', left: '-2px', color: 'currentColor', filter: 'grayscale(100%)', fontFamily: emojiFontStack },
    XLmedium: { textShadow: 'none', fontSize: '0.8em', position: 'relative', top: '-7px', left: '-2px', color: 'currentColor', filter: 'grayscale(100%)', fontFamily: emojiFontStack },
    Slarge: { textShadow: 'none', fontSize: '0.85em', position: 'relative', top: '-7px', left: '-2px', color: 'currentColor', filter: 'grayscale(100%)', fontFamily: emojiFontStack },
    Mlarge: { textShadow: 'none', fontSize: '0.9em', position: 'relative', top: '-7px', left: '-2px', color: 'currentColor', filter: 'grayscale(100%)', fontFamily: emojiFontStack },
    Llarge: { textShadow: 'none', fontSize: '0.95em', position: 'relative', top: '-7px', left: '-2px', color: 'currentColor', filter: 'grayscale(100%)', fontFamily: emojiFontStack },
    XLlarge: { textShadow: 'none', fontSize: '1em', position: 'relative', top: '-7px', left: '-2px', color: 'currentColor', filter: 'grayscale(100%)', fontFamily: emojiFontStack },
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

    const getAsciiDisplay = (optionName) => {
        if (optionName === 'Random' || optionName === 'None') {
            return '';
        }
        const value = options[optionName];
        if (Array.isArray(value)) {
            return value.join(' ');
        }
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
                    {getAsciiDisplay(selected) && (
                        // --- MODIFIED: Added grayscale filter to preview ---
                        <span className="text-gray-500 dark:text-gray-400" style={{ whiteSpace: 'pre', filter: 'grayscale(100%)' }}>
                            {getAsciiDisplay(selected)}
                        </span>
                    )}
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
                            className="w-full text-left py-1 px-2 flex items-center justify-between border-b border-transparent hover:border-black dark:hover:border-white"
                        >
                            <div className="flex items-center">
                                <span className="mr-2 text-lg">•</span>
                                <span>{optionName}</span>
                            </div>
                             {/* --- MODIFIED: Added grayscale filter to preview list --- */}
                            <span className="text-gray-500 dark:text-gray-400" style={{ whiteSpace: 'pre', filter: 'grayscale(100%)' }}>
                                {getAsciiDisplay(optionName)}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const SelectionModal = ({ title, isOpen, onClose, centerContent = false, children, headerClassName = "relative flex-shrink-0 p-4 pb-2 mb-4" }) => {
    if (!isOpen) return null;

    const bodyClasses = `flex-grow space-y-2 overflow-y-auto px-4 pb-4 ${
        centerContent ? 'flex flex-col justify-center' : ''
    }`;

    return (
        <div className="absolute inset-0 z-20 flex flex-col bg-gray-300/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <div className={headerClassName}>
                <p className="font-bold text-xl text-center text-gray-800 dark:text-white">{title}</p>
                <button
                    className="absolute top-4 right-4 border-2 border-black dark:border-white w-8 h-8 flex items-center justify-center transition bg-transparent text-gray-800 dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black rounded cursor-pointer"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <span className="text-4xl leading-none font-bold">&#215;</span>
                </button>
            </div>
            <div className={bodyClasses}>
                {children}
            </div>
        </div>
    );
};

export default function PalMoji({ ownerNFTImage, PalMojiTrait, nftId, onNameChange, currentName, originalNFTName }) {
  const palMojiRef = useRef(null);
  const asciiArtRef = useRef(null);
  const { address } = useAccount();
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
  const [tempName, setTempName] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const customNameOnly = (currentName && currentName !== "Your PalMoji") ? currentName.replace(/ PalMoji$/, '') : null;
  const palMojiFullName = customNameOnly ? `${customNameOnly} PalMoji` : 'Your PalMoji';

  const handleReset = () => {
    setHeadwearShape('None');
    setHeadShape('Round');
    setSnoutShape('Round');
    setBodyShape('Round');
    setSelectedHeadwear('Curly');
    setSelectedEarsTop('Teddy');
    setSelectedEarsHead('None');
    setSelectedEyes('Open');
    setSelectedMien('None');
    setSelectedSnoutTrait('Teddy');
    setSelectedOutfit('Suit');
    setSelectedFeet('Paws');
    setSelectedWhiskers('None');
    setSelectedWings('None');
    setSelectedTail('None');
	onNameChange("Your PalMoji");
  };

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
    setSelectedMien(mienOption);
    if (selectedEyes === 'Doubt' && mienOption !== 'None') {
        setSelectedEyes('Open');
    }
    const allowedMienForGlasses = ['Bit', 'Neutral', 'Smirk'];
    if (selectedEyes === 'Glasses' && !allowedMienForGlasses.includes(mienOption)) {
      setSelectedEyes('Open');
    }
  };

	const handleSetSelectedEyes = (eyeOption) => {
	  if (eyeOption === 'Doubt' && selectedMien !== 'None') {
		  return;
	  }
	  const allowedMienForGlasses = ['Bit', 'Neutral', 'Smirk'];
	  if (eyeOption === 'Glasses' && !allowedMienForGlasses.includes(selectedMien)) {
		setSelectedMien('None');
	  }
	  setSelectedEyes(eyeOption);
	};

  const generateScreenshotDataURL = async () => {
    const originalElement = palMojiRef.current;
    if (!originalElement) return null;

    const onclone = (doc) => {
      const header = doc.getElementById('palmoji-header-for-save');
      if (header) {
        header.classList.remove('hidden');
      }
      const buttonContainer = doc.getElementById('palmoji-action-buttons');
      if (buttonContainer) {
        buttonContainer.style.visibility = 'hidden';
      }
    };

    try {
      const largeCanvas = await html2canvas(originalElement, {
        backgroundColor: null,
        scale: window.devicePixelRatio * 5,
        useCORS: true,
        onclone: onclone,
      });

      let currentCanvas = largeCanvas;
      const tempTargetWidthForScaling = 916;

      while (currentCanvas.width > tempTargetWidthForScaling * 2) {
          const newWidth = Math.floor(currentCanvas.width / 2);
          const newHeight = Math.floor(currentCanvas.height / 2);
          const nextCanvas = document.createElement('canvas');
          nextCanvas.width = newWidth;
          nextCanvas.height = newHeight;
          const ctx = nextCanvas.getContext('2d');
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(currentCanvas, 0, 0, newWidth, newHeight);
          currentCanvas = nextCanvas;
      }

      const targetHeight = 660;
      const aspectRatio = currentCanvas.width / currentCanvas.height;
      const dynamicWidth = Math.round(targetHeight * aspectRatio);
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = dynamicWidth;
      finalCanvas.height = targetHeight;
      const finalCtx = finalCanvas.getContext('2d');
      finalCtx.fillStyle = '#f0f0f0';
      finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
      finalCtx.imageSmoothingQuality = 'high';
      finalCtx.drawImage(currentCanvas, 0, 0, dynamicWidth, targetHeight);

      return finalCanvas.toDataURL('image/png');
    } catch (error) {
      console.error("Error generating screenshot:", error);
      return null;
    }
  };

	const handleUpgrade = async (fileName) => {
	  setIsUpgrading(true);
	  const asciiArtText = asciiArtRef.current ? asciiArtRef.current.innerText : '';
	  const screenshotDataURL = await generateScreenshotDataURL();

	  if (!screenshotDataURL) {
		  alert("Could not generate screenshot for upgrade. Please try again.");
		  setIsUpgrading(false);
		  return;
	  }

	  try {
		  await axios.post("https://reversegenesis.org/edata/palmoji_upgrade.php", {
			  original: originalNFTName,
			  owner: address,
			  name: palMojiFullName,
			  palmoji: asciiArtText,
			  screenshot: screenshotDataURL,
			  nftId: nftId,
			  fileName: fileName,
		  });
		  setIsUpgradeModalOpen(false);
		  setShowThankYouModal(true);
	  } catch (error) {
		  console.error("PalMoji upgrade submission error:", error);
		  alert("Failed to submit PalMoji upgrade. Please try again.");
	  } finally {
		  setIsUpgrading(false);
	  }
	};

  const shareText = `Meet my ${palMojiFullName}!`;
  const callToAction = `Want one? Head to the link to start creating.`;
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const fullText = `${shareText}\n${callToAction}\n\n${shareUrl}`;

  const handlePlatformShare = (platform) => {
      const encodedText = encodeURIComponent(fullText);
      let platformUrl = '';
      switch (platform) {
          case 'x':
              platformUrl = `https://x.com/intent/post?text=${encodedText}`;
              break;
          case 'farcaster':
              platformUrl = `https://warpcast.com/~/compose?text=${encodedText}`;
              break;
          case 'telegram':
              platformUrl = `https://t.me/share/url?text=${encodedText}`;
              break;
          default:
              return;
      }
      window.open(platformUrl, '_blank', 'noopener,noreferrer');
  };

	const handleGenericShare = async () => {
		if (!navigator.share) {
            setShareMessage(
                <>Your browser doesn't support this share feature.<br />Please use a different share option.</>
            );
            setTimeout(() => setShareMessage(""), 5000);
			return;
		}
		try {
			const imageDataURL = await generateScreenshotDataURL();
			if (!imageDataURL) throw new Error("Could not generate screenshot.");
            const response = await fetch(imageDataURL);
            const blob = await response.blob();
            const file = new File([blob], 'palmoji.png', { type: 'image/png' });
			if (navigator.canShare && navigator.canShare({ files: [file] })) {
				await navigator.share({
					title: 'My PalMoji',
					text: fullText,
                    files: [file],
				});
			} else {
				await navigator.share({
					title: 'My PalMoji',
					text: fullText,
				});
			}
		} catch (error) {
			console.error('Error using Web Share API:', error);
            setShareMessage('Sharing failed. Please try another option.');
            setTimeout(() => setShareMessage(""), 5000);
		}
	};

	const handleCopyToClipboard = () => {
		navigator.clipboard.writeText(fullText).then(() => {
			setShareMessage('Copied to clipboard!');
			setTimeout(() => setShareMessage(''), 5000);
		}).catch(err => {
			console.error('Failed to copy text: ', err);
			setShareMessage('Failed to copy text.');
			setTimeout(() => setShareMessage(''), 5000);
		});
	};

    const handleSaveImage = async () => {
        const imageDataURL = await generateScreenshotDataURL();
        if (imageDataURL) {
            const link = document.createElement('a');
            const hasCustomName = currentName && currentName !== "Your PalMoji";
            let fileName;
            if (hasCustomName) {
                const safeName = currentName.toLowerCase().replace(/\s+/g, '-');
                fileName = `palmoji-${safeName}-${nftId}.png`;
            } else {
                fileName = `palmoji-${nftId}.png`;
            }
            link.download = fileName;
            const response = await fetch(imageDataURL);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            link.href = blobUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
            const nameForMessage = hasCustomName ? currentName : "PalMoji";
            setShareMessage(`Your ${nameForMessage} has been saved!`);
            setTimeout(() => setShareMessage(''), 5000);
        }
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
        const aquaEarsLeftShiftPx = -3;
        const aquaEarsRightShiftPx = -3;
        const slitSnoutShiftPx = -1;
        const slitSnoutPaddingLeft = 0;
        const slitSnoutPaddingRight = 3;
        const angerEyeRightShiftPx = -4;

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

        let line1;
        let line2;
        let line3;
        let line4;
        let line5;

        const styledHeadwearTrait = applyShift(headwear);
        const styledHeadwear = hwShape ? <>{applyShift(hwShape.slice(0, 1))}{styledHeadwearTrait}{hwShape.slice(-1)}</> : styledHeadwearTrait;

        if (selectedEarsTop === 'Aqua') {
            const earParts = earsTop.split('   ');
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

        let faceLine;
        if (selectedEyes === 'Glasses') {
            faceLine = (
                <>o<span style={{ display: 'inline-block', position: 'relative', width: '1ch' }}><span style={{ position: 'absolute', left: 0, top: '-0.8em', zIndex: 1 }}>-</span>{selectedMien !== 'None' && (<span style={{ position: 'absolute', left: 0, top: '-0.8em', zIndex: 2 }}>{mien}</span>)}</span>o</>
            );
        } else if (selectedEyes === 'Doubt') {
            const doubtEyeLeftShiftPx = -6;
            const doubtEyeSpacingPx = -9;
            const eyeParts = eyes.split(' ');
            const joiningChar = selectedMien === 'None' ? '' : mien;
            faceLine = (
                <>
                    <span style={{ position: 'relative', left: `${doubtEyeLeftShiftPx}px` }}>{eyeParts[0]}</span>
                    {joiningChar}
                    <span style={{ position: 'relative', marginLeft: `${doubtEyeSpacingPx}px` }}>{eyeParts[1]}</span>
                </>
            );
        } else if (selectedEyes === 'Anger') {
            const eyeParts = eyes.split(' ');
            const joiningChar = selectedMien === 'None' ? ' ' : mien;
            faceLine = (
                <>
                    {applyShift(eyeParts[0])}
                    {joiningChar}
                    <span style={{ position: 'relative', left: `${angerEyeRightShiftPx}px` }}>{eyeParts[1]}</span>
                </>
            );
        } else if (selectedEyes === 'Cyclope') {
            const character = selectedMien === 'None' ? '0' : mien;
            faceLine = `\u00A0${character}\u00A0`;
        } else {
            if (eyes.includes(' ')) {
                const eyeParts = eyes.split(' ');
                const leftEye = applyShift(eyeParts[0]);
                const rightEye = eyeParts[1];
                const joiningChar = selectedMien === 'None' ? ' ' : mien;
                faceLine = <>{leftEye}{joiningChar}{rightEye}</>;
            } else {
                faceLine = mien;
            }
        }
        line2 = hShape ? <>{applyShift(hShape.slice(0, 1))}{faceLine}{hShape.slice(-1)}</> : faceLine;

        const styleRef = outfitStyleMap[selectedOutfit.toLowerCase().replace(/\s+/g, ' ')];
        if (styleRef && specialStyles[styleRef]) {
            const styleToApply = specialStyles[styleRef];
            const styledOutfit = outfit.split('').map((char, i) => (/[^\u0000-\u00ff]/).test(char) ? <span key={i} style={styleToApply}>{char}</span> : char);
            line4 = bShape ? <>{bShape.slice(0, 1)}{styledOutfit}{bShape.slice(-1)}</> : <>{styledOutfit}</>;
        } else {
            line4 = bShape ? <>{applyShift(bShape.slice(0, 1))}{outfit}{bShape.slice(-1)}</> : <>{outfit}</>;
        }

        line5 = applyShift(feet);

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

        if (selectedEarsHead === 'Aqua') {
            const earParts = earsHead.split('   ');
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

        if (whiskers && selectedWhiskers.includes('Head')) {
            const leftWhisker = applyShift(whiskers[0]);
            line2 = <>{leftWhisker}{line2}{whiskers[1]}</>;
        }

        let styledSnoutTrait;
        if (selectedSnoutTrait === 'Slit') {
            const slitParts = snoutTrait.split('≈');
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
            styledSnoutTrait = applyShift(snoutTrait);
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
		<div ref={palMojiRef} className="w-full h-auto relative bg-blue-200 dark:bg-blue-900/50 rounded-t-md overflow-hidden flex flex-col items-center justify-center p-4 border border-black">
			<div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-gray-400 to-gray-300 dark:from-gray-800 dark:to-gray-700"></div>
			<div className="relative z-10 w-full">
				<div id="palmoji-header-for-save" className="hidden flex items-start space-x-3 mb-4">
					<img
						src={ownerNFTImage}
						alt={originalNFTName}
						className="h-12 w-12 object-cover border border-black dark:border-white"
					/>
					<div style={{ transform: 'translateY(-7px)' }}>
						<p className="text-base text-gray-800 dark:text-gray-300">{originalNFTName}</p>
						<p className="text-sm font-bold text-black dark:text-white">
							{palMojiFullName}
						</p>
					</div>
				</div>
				<div className="p-2">
				  <div ref={asciiArtRef} className="font-mono text-5xl text-center text-black dark:text-white" style={{ fontFamily: '"Doto", monospace', fontWeight: 900, textShadow: '1px 0 #000, -1px 0 #000, 0 1px #000, 0 -1px #000, 1px 1px #000, -1px -1px #000, 1px -1px #000, -1px 1px #000', lineHeight: 0.9 }}>
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
		</div>
      <div className="w-full p-4 bg-gray-300 dark:bg-gray-800 rounded-b-md border-t border-black dark:border-white">
        <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setOpenModal('shapes')} className={`w-full flex items-center justify-between p-2 bg-white dark:bg-gray-700 text-black dark:text-white rounded-md text-left border-black dark:border-white ${openModal === 'shapes' ? 'border-2' : 'border'}`} style={{ fontFamily: "'Cygnito Mono', monospace" }}>
                    <span className="font-bold">Shapes</span>
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor"><path d="M0 0H2V2H0V0Z M2 2H4V4H2V2Z M4 4H6V6H4V4Z M6 2H8V4H6V2Z M8 0H10V2H8V0Z" /></svg>
                </button>
                <button onClick={() => setOpenModal('traits')} className={`w-full flex items-center justify-between p-2 bg-white dark:bg-gray-700 text-black dark:text-white rounded-md text-left border-black dark:border-white ${openModal === 'traits' ? 'border-2' : 'border'}`} style={{ fontFamily: "'Cygnito Mono', monospace" }}>
                    <span className="font-bold">Traits</span>
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor"><path d="M0 0H2V2H0V0Z M2 2H4V4H2V2Z M4 4H6V6H4V4Z M6 2H8V4H6V2Z M8 0H10V2H8V0Z" /></svg>
                </button>
            </div>
            <div id="palmoji-action-buttons" className="grid grid-cols-2 gap-2 [@media(min-width:540px)]:flex [@media(min-width:540px)]:justify-between">
                <button onClick={() => setOpenModal('name')} className="px-4 py-1.5 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white text-sm [font-family:'Cygnito_Mono',sans-serif] uppercase tracking-wide rounded-none transition-colors duration-200 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black">
                    Name
                </button>
                <button onClick={() => setOpenModal('share')} className="px-4 py-1.5 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white text-sm [font-family:'Cygnito_Mono',sans-serif] uppercase tracking-wide rounded-none transition-colors duration-200 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black">
                    Share
                </button>
				<button onClick={() => setIsUpgradeModalOpen(true)} className="px-4 py-1.5 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white text-sm [font-family:'Cygnito_Mono',sans-serif] uppercase tracking-wide rounded-none transition-colors duration-200 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black">
					UPGRADE NFT
				</button>
                <button onClick={handleReset} className="px-4 py-1.5 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white text-sm [font-family:'Cygnito_Mono',sans-serif] uppercase tracking-wide rounded-none transition-colors duration-200 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black">
                    Reset
                </button>
            </div>
        </div>
      </div>
      <SelectionModal title="SHAPES" isOpen={openModal === 'shapes'} onClose={handleCloseModal}>
	    <AccordionItem label="Headwear" options={catData.Shapes.Headwear} selected={headwearShape} onSelect={setHeadwearShape} isOpen={openItem === 'Shape:Headwear'} onToggle={() => toggleItem('Shape:Headwear')} />
        <AccordionItem label="Head" options={catData.Shapes.Head} selected={headShape} onSelect={setHeadShape} isOpen={openItem === 'Shape:Head'} onToggle={() => toggleItem('Shape:Head')} />
        <AccordionItem label="Snout" options={catData.Shapes.Snout} selected={snoutShape} onSelect={setSnoutShape} isOpen={openItem === 'Shape:Snout'} onToggle={() => toggleItem('Shape:Snout')} />
        <AccordionItem label="Body" options={catData.Shapes.Body} selected={bodyShape} onSelect={setBodyShape} isOpen={openItem === 'Shape:Body'} onToggle={() => toggleItem('Shape:Body')} />
      </SelectionModal>
      <SelectionModal title="TRAITS" isOpen={openModal === 'traits'} onClose={handleCloseModal}>
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
      <SelectionModal
        title="NAME YOUR PALMOJI"
        isOpen={openModal === 'name'}
        onClose={handleCloseModal}
        centerContent={true}
        headerClassName="relative flex-shrink-0 p-4 pb-0 -mb-8"
      >
        <div className="space-y-4">
            <div>
                <input
                    id="palmoji-name"
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="Enter a name..."
                    className="mt-1 w-full p-2 border !border-black dark:!border-white bg-transparent text-black dark:text-white placeholder-black dark:placeholder-white focus:border-black dark:focus:border-white focus:border-[2px] focus:outline-none focus:ring-0 rounded-none"
                    style={{ boxShadow: 'none', backgroundColor: 'transparent' }}
                />
            </div>
            <div className="flex justify-between items-center pt-2">
                <button
                    onClick={() => {
                        onNameChange(tempName);
                        handleCloseModal();
                    }}
                    className="px-4 py-1.5 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white text-sm [font-family:'Cygnito_Mono',sans-serif] uppercase tracking-wide rounded-none transition-colors duration-200 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black"
                >
                    Save Name
                </button>
                <button
                    onClick={handleCloseModal}
                    className="px-4 py-1.5 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white text-sm [font-family:'Cygnito_Mono',sans-serif] uppercase tracking-wide rounded-none transition-colors duration-200 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black"
                >
                    Close
                </button>
            </div>
        </div>
      </SelectionModal>
      <SelectionModal
        title={`SHARE ${palMojiFullName.toUpperCase()}`}
        isOpen={openModal === 'share'}
        onClose={handleCloseModal}
		centerContent={true}
		headerClassName="relative flex-shrink-0 p-4 pb-0 -mb-8"
      >
		{shareMessage && (
		  <div className="text-center text-black dark:text-white mb-4 p-2">
			{shareMessage}
		  </div>
		)}
        <div className="flex flex-col items-center justify-center w-full">
            <div className="flex flex-row flex-wrap justify-center items-center w-full gap-4">
                <a href="#" onClick={(e) => { e.preventDefault(); handleGenericShare(); }} title="Share" className="flex justify-center text-black dark:text-white hover:opacity-75">
                    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49M21 5C21 6.65685 19.6569 8 18 8C16.3431 8 15 6.65685 15 5C15 3.34315 16.3431 2 18 2C19.6569 2 21 3.34315 21 5ZM9 12C9 13.6569 7.65685 15 6 15C4.34315 15 3 13.6569 3 12C3 10.3431 4.34315 9 6 9C7.65685 9 9 10.3431 9 12ZM21 19C21 20.6569 19.6569 22 18 22C16.3431 22 15 20.6569 15 19C15 17.3431 16.3431 16 18 16C19.6569 16 21 17.3431 21 19Z"/></svg>
                </a>
                <a href="#" onClick={(e) => { e.preventDefault(); handlePlatformShare('x'); }} title="Share on X" className="flex justify-center text-black dark:text-white hover:opacity-75">
                    <svg role="img" viewBox="0 0 24 24" className="w-10 h-10 fill-current"><title>X</title><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>
                </a>
                <a href="#" onClick={(e) => { e.preventDefault(); handlePlatformShare('farcaster'); }} title="Share on Farcaster" className="flex justify-center text-black dark:text-white hover:opacity-75">
                    <svg role="img" viewBox="0 0 24 24" className="w-10 h-10 fill-current"><title>Farcaster</title><path d="M18.24.24H5.76C2.5789.24 0 2.8188 0 6v12c0 3.1811 2.5789 5.76 5.76 5.76h12.48c3.1812 0 5.76-2.5789 5.76-5.76V6C24 2.8188 21.4212.24 18.24.24m.8155 17.1662v.504c.2868-.0256.5458.1905.5439.479v.5688h-5.1437v-.5688c-.0019-.2885.2576-.5047.5443-.479v-.504c0-.22.1525-.402.358-.458l-.0095-4.3645c-.1589-1.7366-1.6402-3.0979-3.4435-3.0979-1.8038 0-3.2846 1.3613-3.4435 3.0979l-.0096 4.3578c.2276.0424.5318.2083.5395.4648v.504c.2863-.0256.5457.1905.5438.479v.5688H4.3915v-.5688c-.0019-.2885.2575-.5047.5438-.479v-.504c0-.2529.2011-.4548.4536-.4724v-7.895h-.4905L4.2898 7.008l2.6405-.0005V5.0419h9.9495v1.9656h2.8219l-.6091 2.0314h-.4901v7.8949c.2519.0177.453.2195.453.4724"/></svg>
                </a>
                <a href="#" onClick={(e) => { e.preventDefault(); handlePlatformShare('telegram'); }} title="Share on Telegram" className="flex justify-center text-black dark:text-white hover:opacity-75">
                    <svg role="img" viewBox="0 0 24 24" className="w-10 h-10 fill-current"><title>Telegram</title><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                </a>
                <a href="#" onClick={(e) => { e.preventDefault(); handleCopyToClipboard(); }} title="Copy to clipboard" className="flex justify-center text-black dark:text-white hover:opacity-75">
                    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 16V18.8C8 19.9201 8 20.4802 8.21799 20.908C8.40973 21.2843 8.71569 21.5903 9.09202 21.782C9.51984 22 10.0799 22 11.2 22H18.8C19.9201 22 20.4802 22 20.908 21.782C21.2843 21.5903 21.5903 21.2843 21.782 20.908C22 20.4802 22 19.9201 22 18.8V11.2C22 10.0799 22 9.51984 21.782 9.09202C21.5903 8.71569 21.2843 8.40973 20.908 8.21799C20.4802 8 19.9201 8 18.8 8H16M5.2 16H12.8C13.9201 16 14.4802 16 14.908 15.782C15.2843 15.5903 15.5903 15.2843 15.782 14.908C16 14.4802 16 13.9201 16 12.8V5.2C16 4.0799 16 3.51984 15.782 3.09202C15.5903 2.71569 15.2843 2.40973 14.908 2.21799C14.4802 2 13.9201 2 12.8 2H5.2C4.0799 2 3.51984 2 3.09202 2.21799C2.71569 2.40973 2.40973 2.71569 2.21799 3.09202C2 3.51984 2 4.07989 2 5.2V12.8C2 13.9201 2 14.4802 2.21799 14.908C2.40973 15.2843 2.71569 15.5903 3.09202 15.782C3.51984 16 4.07989 16 5.2 16Z"/></svg>
                </a>
                <a href="#" onClick={(e) => { e.preventDefault(); handleSaveImage(); }} title="Save Score" className="flex justify-center text-black dark:text-white hover:opacity-75">
                    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 3V6.4C7 6.96005 7 7.24008 7.10899 7.45399C7.20487 7.64215 7.35785 7.79513 7.54601 7.89101C7.75992 8 8.03995 8 8.6 8H15.4C15.9601 8 16.2401 8 16.454 7.89101C16.6422 7.79513 16.7951 7.64215 16.891 7.45399C17 7.24008 17 6.96005 17 6.4V4M17 21V14.6C17 14.0399 17 13.7599 16.891 13.546C16.7951 13.3578 16.6422 13.2049 16.454 13.109C16.2401 13 15.9601 13 15.4 13H8.6C8.03995 13 7.75992 13 7.54601 13.109C7.35785 13.2049 7.20487 13.3578 7.10899 13.546C7 13.7599 7 14.0399 7 14.6V21M21 9.32548V16.2C21 17.8802 21 18.7202 20.673 19.362C20.3854 19.9265 19.9265 20.3854 19.362 20.673C18.7202 21 17.8802 21 16.2 21H7.8C6.11984 21 5.27976 21 4.63803 20.673C4.07354 20.3854 3.6146 19.9265 3.32698 19.362C3 18.7202 3 17.8802 3 16.2V7.8C3 6.11984 3 5.27976 3.32698 4.63803C3.6146 4.07354 4.07354 3.6146 4.63803 3.32698C5.27976 3 6.11984 3 7.8 3H14.6745C15.1637 3 15.4083 3 15.6385 3.05526C15.8425 3.10425 16.0376 3.18506 16.2166 3.29472C16.4184 3.4184 16.5914 3.59135 16.9373 3.93726L20.0627 7.06274C20.4086 7.40865 20.5816 7.5816 20.7053 7.78343C20.8149 7.96237 20.8957 8.15746 20.9447 8.36154C21 8.59171 21 8.8363 21 9.32548Z"/></svg>
                </a>
            </div>
        </div>
      </SelectionModal>
		<SelectionModal
			isOpen={isUpgradeModalOpen}
			onClose={() => setIsUpgradeModalOpen(false)}
			title={`${palMojiFullName.toUpperCase()}`}
			centerContent={true}
		>
        <div className="text-center">
            <div className="font-mono text-5xl text-center text-black dark:text-white" style={{ fontFamily: '"Doto", monospace', fontWeight: 900, textShadow: '1px 0 #000, -1px 0 #000, 0 1px #000, 0 -1px #000, 1px 1px #000, -1px -1px #000, 1px -1px #000, -1px 1px #000', lineHeight: 0.9, whiteSpace: 'pre' }}>
              {asciiArtRef.current?.innerText}
            </div>
            <div className="flex justify-between mt-6 space-x-4">
				<button
				onClick={() => {
					let fileName;
					if (customNameOnly) {
						const safeName = customNameOnly.toLowerCase().replace(/\s+/g, '-');
						fileName = `palmoji-${safeName}-${nftId}.png`;
					} else {
						fileName = `palmoji-${nftId}.png`;
					}
					handleUpgrade(fileName);
				}}
				disabled={isUpgrading}
                className="px-4 py-1.5 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white text-sm [font-family:'Cygnito_Mono',sans-serif] uppercase tracking-wide rounded-none transition-colors duration-200 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black"
              >
                {isUpgrading ? 'UPGRADING...' : 'UPGRADE'}
              </button>
              <button
                onClick={() => setIsUpgradeModalOpen(false)}
                className="px-4 py-1.5 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white text-sm [font-family:'Cygnito_Mono',sans-serif] uppercase tracking-wide rounded-none transition-colors duration-200 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black"
              >
                CLOSE
              </button>
            </div>
        </div>
      </SelectionModal>
      {showThankYouModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center px-4 py-10">
          <div className="relative bg-white dark:bg-gray-800 p-10 rounded shadow-lg max-w-lg w-full text-center">
            <button
              className="absolute top-3 right-3 border-2 border-black dark:border-white w-8 h-8 flex items-center justify-center transition bg-transparent text-gray-800 dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black hover:border-black dark:hover:border-white rounded cursor-pointer"
              onClick={() => setShowThankYouModal(false)}
            >
              <span className="text-4xl leading-none font-bold dark:font-bold">&#215;</span>
            </button>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              THANK YOU!
            </h4>
			<p className="text-base text-gray-700 dark:text-gray-300 mb-8">
			  {currentName && currentName !== "Your PalMoji"
				? `${currentName} PalMoji`
				: 'Your PalMoji'
			  } was sent and will be available on-chain within 48 hours due to pre-moderation to avoid spam and abuse.
			</p>
            <button
              onClick={() => setShowThankYouModal(false)}
              className="px-4 py-1.5 border-2 border-gray-900 dark:border-white bg-light-100 text-gray-900 dark:bg-dark-300 dark:text-white text-sm [font-family:'Cygnito_Mono',sans-serif] uppercase tracking-wide rounded-none transition-colors duration-200 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}