import React, { useState, useEffect, useMemo } from "react";
import { Traits, specialStyles, outfitStyleMap } from "./Traits.js";
// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore';

// --- PalMoji Renderer and Page Components ---
const catData = {
  Shapes: {
	Headwear: { 'None': '', 'Round': '()', 'Parallel': '||', 'Chevron Up': '/\\', 'Chevron Down': '\\/', 'Curly': '{}', 'Square': '[]' },
    Head: { 'None': '', 'Round': '()', 'Parallel': '||', 'Chevron Up': '/\\', 'Chevron Down': '\\/', 'Curly': '{}', 'Square': '[]' },
    Snout: { 'None': '', 'Round': '()', 'Parallel': '||', 'Chevron Up': '/\\', 'Chevron Down': '\\/', 'Curly': '{}', 'Square': '[]' },
    Body: { 'None': '', 'Round': '()', 'Parallel': '||', 'Chevron Up': '/\\', 'Chevron Down': '\\/', 'Curly': '{}', 'Square': '[]' },
  },
};

const PalMojiRenderer = ({ config, onDelete }) => {
    const { id, name, createdAt, ...traitConfig } = config;

    const asciiArtLines = useMemo(() => {
        const {
            headwearShape, headShape, snoutShape, bodyShape,
            selectedHeadwear, selectedEarsTop, selectedEarsHead, selectedEyes, selectedMien,
            selectedSnoutTrait, selectedOutfit, selectedFeet, selectedWhiskers, selectedWings, selectedTail,
        } = traitConfig;

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
                return <><span style={{ position: 'relative', left: '-5px' }}>{firstChar}</span>{rest}</>;
            }
            return text;
        };

        let line1, line2, line3, line4, line5;
        const styledHeadwearTrait = applyShift(headwear);
        const styledHeadwear = hwShape ? <>{applyShift(hwShape.slice(0, 1))}{styledHeadwearTrait}{hwShape.slice(-1)}</> : styledHeadwearTrait;

        if (selectedEarsTop === 'Aqua') {
            const earParts = earsTop.split('   ');
            const middlePart = selectedHeadwear !== 'None' ? styledHeadwear : '   ';
            line1 = <><span style={{ position: 'relative', left: `${aquaEarsLeftShiftPx}px` }}>{applyShift(earParts[0])}</span>{middlePart}<span style={{ position: 'relative', left: `${aquaEarsRightShiftPx}px` }}>{earParts[1]}</span></>;
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
            faceLine = <>o<span style={{ display: 'inline-block', position: 'relative', width: '1ch' }}><span style={{ position: 'absolute', left: 0, top: '-0.8em', zIndex: 1 }}>-</span>{selectedMien !== 'None' && (<span style={{ position: 'absolute', left: 0, top: '-0.8em', zIndex: 2 }}>{mien}</span>)}</span>o</>;
        } else if (selectedEyes === 'Doubt') {
            const doubtEyeLeftShiftPx = -6;
            const doubtEyeSpacingPx = -9;
            const eyeParts = eyes.split(' ');
            const joiningChar = selectedMien === 'None' ? '' : mien;
            faceLine = <><span style={{ position: 'relative', left: `${doubtEyeLeftShiftPx}px` }}>{eyeParts[0]}</span>{joiningChar}<span style={{ position: 'relative', marginLeft: `${doubtEyeSpacingPx}px` }}>{eyeParts[1]}</span></>;
        } else if (selectedEyes === 'Anger') {
            const eyeParts = eyes.split(' ');
            const joiningChar = selectedMien === 'None' ? ' ' : mien;
            faceLine = <>{applyShift(eyeParts[0])}{joiningChar}<span style={{ position: 'relative', left: `${angerEyeRightShiftPx}px` }}>{eyeParts[1]}</span></>;
        } else if (selectedEyes === 'Cyclope') {
            const character = selectedMien === 'None' ? '0' : mien;
            faceLine = `\u00A0${character}\u00A0`;
        } else {
            if (eyes && eyes.includes(' ')) {
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

        const styleRef = outfitStyleMap[selectedOutfit];
        if (styleRef && specialStyles[styleRef]) {
            const styleToApply = specialStyles[styleRef];
            const styledOutfit = outfit.split('').map((char, i) => (/[^\u0000-\u00ff]/).test(char) ? <span key={i} style={styleToApply}>{char}</span> : char);
            line4 = bShape ? <>{bShape.slice(0, 1)}{styledOutfit}{bShape.slice(-1)}</> : <>{styledOutfit}</>;
        } else {
            line4 = bShape ? <>{applyShift(bShape.slice(0, 1))}{outfit}{bShape.slice(-1)}</> : <>{outfit}</>;
        }

        line5 = applyShift(feet);

        let originalFaceLine = selectedEyes === 'Glasses' ? 'o-o' : (eyes && eyes.includes(' ') ? eyes.split(' ').join(selectedMien === 'None' ? ' ' : mien) : mien);
        let originalLine2 = hShape ? `${hShape.slice(0, 1)}${originalFaceLine}${hShape.slice(-1)}` : originalFaceLine;
        let originalLine3 = sShape ? `${sShape.slice(0, 1)}${snoutTrait}${sShape.slice(-1)}` : snoutTrait;
        let originalLine4 = bShape ? `${bShape.slice(0, 1)}${outfit}${bShape.slice(-1)}` : outfit;
        let originalLine5 = feet;

        if (selectedEarsHead === 'Aqua') {
            const earParts = earsHead.split('   ');
            line2 = <><span style={{ position: 'relative', left: `${aquaEarsLeftShiftPx}px` }}>{applyShift(earParts[0])}</span>{line2}<span style={{ position: 'relative', left: `${aquaEarsRightShiftPx}px` }}>{earParts[1]}</span></>;
        } else if (earsHead) {
            const earParts = earsHead.split('   ');
            line2 = <>{applyShift(earParts[0])}{line2}{earParts[1]}</>;
        }

        if (whiskers && selectedWhiskers.includes('Head')) {
            line2 = <>{applyShift(whiskers[0])}{line2}{whiskers[1]}</>;
        }

        let styledSnoutTrait;
        if (selectedSnoutTrait === 'Slit') {
            const slitParts = snoutTrait.split('≈');
            styledSnoutTrait = <>{slitParts[0]}<span style={{ position: 'relative', left: `${slitSnoutShiftPx}px`, paddingLeft: `${slitSnoutPaddingLeft}px`, paddingRight: `${slitSnoutPaddingRight}px` }}>≈</span>{slitParts[1]}</>;
        } else {
            styledSnoutTrait = applyShift(snoutTrait);
        }
        const styledSnout = sShape ? <>{applyShift(sShape.slice(0, 1))}{styledSnoutTrait}{sShape.slice(-1)}</> : styledSnoutTrait;
        line3 = whiskers && selectedWhiskers.includes('Snout') ? <>{applyShift(whiskers[0])}{styledSnout}{whiskers[1]}</> : styledSnout;

        if (wings) {
            line4 = <>{applyShift(wings[0])}{line4}{wings[1]}</>;
        }

        if (tail) {
            const rightTail = tail[1].replace(/ /g, '\u00A0');
            const leftTail = applyShift(tail[0]);
            if (selectedFeet === 'None') {
                line4 = <>{leftTail}{line4}{rightTail}</>;
            } else {
                line5 = <>{leftTail}{typeof line5 !== 'string' ? line5 : originalLine5}{rightTail}</>;
            }
        }

        const lines = [line1, line2, line3, line4, line5];
        const lineLengths = lines.map((line, index) => {
            if (typeof line === 'string') return line.length;
            if (index === 0) return (selectedEarsTop !== 'None' && earsTop && earsTop.includes('   ') ? earsTop.length : 0) + (selectedHeadwear !== 'None' ? headwear.length : 0);
            if (index === 1) return originalLine2.length + (earsHead ? earsHead.replace('   ', '').length : 0) + (whiskers && selectedWhiskers.includes('Head') ? 2 : 0);
            if (index === 2) return originalLine3.length + (whiskers && selectedWhiskers.includes('Snout') ? 2 : 0);
            if (index === 3) return originalLine4.length + (wings ? (wings[0] + wings[1]).length : 0) + (tail && selectedFeet === 'None' ? (tail[0] + tail[1]).length : 0);
            if (index === 4) return originalLine5.length + (tail && selectedFeet !== 'None' ? (tail[0] + tail[1]).length : 0);
            return 0;
        });

        const maxLength = Math.max(...lineLengths);
        return lines.map((line, index) => {
            const padding = ' '.repeat(Math.floor((maxLength - lineLengths[index]) / 2));
            return typeof line === 'string' ? (padding + line) : <>{padding}{line}</>;
        });
    }, [traitConfig]);

    return (
        <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm p-4 border border-black dark:border-white relative group">
            <button 
                onClick={() => onDelete(id)} 
                className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete PalMoji"
            >
                &#x2715;
            </button>
            <h2 className="font-bold text-lg mb-2 truncate" title={name}>{name || `PalMoji`}</h2>
            <div 
              className="font-mono text-center text-black dark:text-white p-2 bg-gray-200 dark:bg-gray-900 rounded-md overflow-x-auto"
              style={{ whiteSpace: 'pre', lineHeight: 1.1, fontSize: '1rem' }}
            >
              {asciiArtLines.map((line, index) => (
                <div key={index}>
                  {typeof line === 'string' && line.trim() === '' ? '\u00A0' : line}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Saved on: {new Date(createdAt).toLocaleDateString()}</p>
        </div>
    );
};

const PalMojiDashboard = () => {
    const [savedPalMojis, setSavedPalMojis] = useState([]);
    const [userId, setUserId] = useState(null);
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    useEffect(() => {
        const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
        const app = initializeApp(firebaseConfig);
        const authInstance = getAuth(app);
        const dbInstance = getFirestore(app);
        setDb(dbInstance);
        setAuth(authInstance);

        const unsubscribe = onAuthStateChanged(authInstance, (user) => {
            setUserId(user ? user.uid : null);
            setIsAuthReady(true);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!isAuthReady || !db || !userId) {
            setSavedPalMojis([]); // Clear data if user logs out
            return;
        }
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const palmojisCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/palmojis`);
        const q = query(palmojisCollectionRef);
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const palmojis = [];
            querySnapshot.forEach((doc) => {
                palmojis.push({ id: doc.id, ...doc.data() });
            });
            palmojis.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setSavedPalMojis(palmojis);
        }, (error) => {
            console.error("Error fetching PalMojis:", error);
        });
        return () => unsubscribe();
    }, [isAuthReady, db, userId]);

    const handleDelete = async (id) => {
        if (!db || !userId || !id) return;
        // Use a custom modal instead of window.confirm
        const confirmed = true; // Replace with a proper modal later
        if (confirmed) {
            try {
                const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
                await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/palmojis`, id));
            } catch (error) {
                console.error("Error deleting PalMoji:", error);
            }
        }
    };
    
    if (!isAuthReady) return <div className="p-6">Loading...</div>;
    if (!userId) return <div className="p-6">Please connect your wallet and sign in to see your PalMojis.</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">My PalMojis</h1>
            {savedPalMojis.length === 0 ? (
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    You haven't saved any PalMojis yet. Go to the dashboard, customize one, and save it!
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {savedPalMojis.map((palmoji) => (
                        <PalMojiRenderer key={palmoji.id} config={palmoji} onDelete={handleDelete} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default PalMojiDashboard;
