// /components/SlidingPuzzle.js
"use client";
import { useState, useEffect, useCallback, useRef } from 'react';

// The main component for the sliding puzzle game
export default function SlidingPuzzle({ imageUrl, difficulty = 3, playerAddress = "0x..." }) {
  const [tiles, setTiles] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [time, setTime] = useState(0);
  const [size] = useState(difficulty);
  const timerRef = useRef(null);
  const canvasRef = useRef(null);

  // Function to format time from seconds to MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Function to start the timer
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTime((prevTime) => prevTime + 1);
    }, 1000);
  };

  // Function to stop the timer
  const stopTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
  };

  // Function to generate the certificate on a canvas
  const generateCertificate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = "anonymous"; // Important for cross-origin images
    img.src = imageUrl;

    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      ctx.fillStyle = '#1F2937'; // dark-gray-800
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw NFT image
      ctx.drawImage(img, 50, 90, 200, 200);
      
      // Draw Border around image
      ctx.strokeStyle = '#F9FAFB'; // gray-50
      ctx.lineWidth = 3;
      ctx.strokeRect(50, 90, 200, 200);

      // Title
      ctx.fillStyle = 'white';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PUZZLE SOLVED!', canvas.width / 2, 60);

      // Stats
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Difficulty: ${size}x${size}`, 280, 140);
      ctx.fillText(`Time: ${formatTime(time)}`, 280, 180);
      ctx.fillText(`Moves: ${moves}`, 280, 220);
      
      // Player Address
      ctx.font = '16px monospace';
      const shortAddress = `${playerAddress.substring(0, 6)}...${playerAddress.substring(playerAddress.length - 4)}`;
      ctx.fillText(`Solved by: ${shortAddress}`, 280, 260);
    };
    img.onerror = () => {
        console.error("Failed to load image for certificate.");
    }
  }, [imageUrl, size, time, moves, playerAddress]);

  // Function to shuffle the tiles and start the game
  const shuffleTiles = useCallback(() => {
    let initialTiles = Array.from({ length: size * size }, (_, i) => i);
    
    const emptyTile = size * size - 1;
    initialTiles[initialTiles.indexOf(emptyTile)] = null;

    for (let i = initialTiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [initialTiles[i], initialTiles[j]] = [initialTiles[j], initialTiles[i]];
    }

    setTiles(initialTiles);
    setMoves(0);
    setIsSolved(false);
    setTime(0);
    startTimer();
  }, [size]);

  // Initialize the game when the component mounts or difficulty changes
  useEffect(() => {
    shuffleTiles();
    return () => stopTimer(); // Cleanup timer on unmount
  }, [shuffleTiles]);

  // Check if the puzzle is solved after every move
  useEffect(() => {
    if (tiles.length === 0 || isSolved) return;
    const isPuzzleSolved = tiles.every((tile, index) => tile === null ? index === tiles.length - 1 : tile === index);
    if (isPuzzleSolved) {
      const finalTiles = [...tiles];
      finalTiles[finalTiles.indexOf(null)] = size * size - 1;
      setTiles(finalTiles);
      setIsSolved(true);
      stopTimer();
    }
  }, [tiles, size, isSolved]);

  // Generate certificate when solved
  useEffect(() => {
    if (isSolved) {
      generateCertificate();
    }
  }, [isSolved, generateCertificate]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `ReVerseGenesis_Puzzle_Certificate.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleTileClick = (index) => {
    if (isSolved) return;
    const emptyIndex = tiles.indexOf(null);
    const { row, col } = getRowCol(index);
    const { row: emptyRow, col: emptyCol } = getRowCol(emptyIndex);

    if (
      (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
      (col === emptyCol && Math.abs(row - emptyRow) === 1)
    ) {
      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
      setTiles(newTiles);
      setMoves(moves + 1);
    }
  };

  const getRowCol = (index) => ({
    row: Math.floor(index / size),
    col: index % size,
  });

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {isSolved ? (
        <div className="w-full flex flex-col items-center">
            <h3 className="text-2xl font-bold text-green-500 mb-4">Congratulations!</h3>
            <canvas ref={canvasRef} width="500" height="350" className="rounded-md border-2 border-gray-500"></canvas>
            <button
                onClick={handleDownload}
                className="mt-4 px-6 py-2 border-2 border-green-500 text-green-500 text-lg uppercase rounded-none transition hover:bg-green-500 hover:text-white"
            >
                Download Certificate
            </button>
        </div>
      ) : (
        <div className="relative w-full max-w-sm aspect-square">
          <div 
            className="grid gap-1 w-full h-full p-1 bg-black/20 rounded-md"
            style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
          >
            {tiles.map((tile, index) => {
              const tileValue = tile ?? size * size - 1;
              const { row, col } = getRowCol(tileValue);
              
              return (
                <div
                  key={index}
                  onClick={() => handleTileClick(index)}
                  className="bg-gray-300 dark:bg-gray-600 rounded-md transition-all duration-300 ease-in-out shadow-lg"
                  style={{
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: `${size * 100}% ${size * 100}%`,
                    backgroundPosition: `${col * (100 / (size - 1))}% ${row * (100 / (size - 1))}%`,
                    opacity: tile === null ? 0 : 1,
                    cursor: 'pointer',
                  }}
                />
              );
            })}
          </div>
        </div>
      )}
      <div className="flex justify-between w-full max-w-sm mt-4">
        <div className="text-lg font-medium text-gray-800 dark:text-gray-200">
            <p>Moves: {moves}</p>
            <p>Time: {formatTime(time)}</p>
        </div>
        <button
          onClick={shuffleTiles}
          className="px-4 py-1.5 self-center border-2 border-gray-900 dark:border-white bg-light-100 text-gray-900 dark:bg-dark-300 dark:text-white text-sm uppercase rounded-none transition hover:bg-gray-900 hover:text-white"
        >
          {isSolved ? 'Play Again' : 'Reset'}
        </button>
      </div>
    </div>
  );
}
