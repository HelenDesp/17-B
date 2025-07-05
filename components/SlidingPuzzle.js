// /components/SlidingPuzzle.js
"use client";
import { useState, useEffect, useCallback } from 'react';

// The main component for the sliding puzzle game
export default function SlidingPuzzle({ imageUrl }) {
  const [tiles, setTiles] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [size] = useState(3); // 3x3 grid

  // Function to shuffle the tiles and start the game
  const shuffleTiles = useCallback(() => {
    let initialTiles = [];
    for (let i = 0; i < size * size; i++) {
      initialTiles.push(i);
    }
    
    // The last tile is the empty space
    const emptyTile = size * size - 1;
    initialTiles[initialTiles.indexOf(emptyTile)] = null;

    // Fisher-Yates shuffle algorithm
    for (let i = initialTiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [initialTiles[i], initialTiles[j]] = [initialTiles[j], initialTiles[i]];
    }

    setTiles(initialTiles);
    setMoves(0);
    setIsSolved(false);
  }, [size]);

  // Initialize the game when the component mounts
  useEffect(() => {
    shuffleTiles();
  }, [shuffleTiles]);

  // Check if the puzzle is solved after every move
  useEffect(() => {
    if (tiles.length === 0) return;
    const isPuzzleSolved = tiles.every((tile, index) => tile === null ? index === tiles.length - 1 : tile === index);
    if (isPuzzleSolved) {
      // Restore the last tile to its correct number to complete the image
      const finalTiles = [...tiles];
      finalTiles[finalTiles.indexOf(null)] = size * size - 1;
      setTiles(finalTiles);
      setIsSolved(true);
    }
  }, [tiles, size]);

  // Handle clicking on a tile
  const handleTileClick = (index) => {
    if (isSolved) return;

    const emptyIndex = tiles.indexOf(null);
    const { row, col } = getRowCol(index);
    const { row: emptyRow, col: emptyCol } = getRowCol(emptyIndex);

    // Check if the clicked tile is adjacent to the empty space
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

  // Helper function to get row and column from an index
  const getRowCol = (index) => ({
    row: Math.floor(index / size),
    col: index % size,
  });

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-sm aspect-square">
        <div 
          className="grid gap-1 w-full h-full"
          style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
        >
          {tiles.map((tile, index) => {
            const tileValue = tile ?? size * size - 1;
            const { row, col } = getRowCol(tileValue);
            
            return (
              <div
                key={index}
                onClick={() => handleTileClick(index)}
                className="bg-gray-300 dark:bg-gray-600 rounded-md transition-all duration-300 ease-in-out"
                style={{
                  gridRow: getRowCol(index).row + 1,
                  gridColumn: getRowCol(index).col + 1,
                  backgroundImage: `url(${imageUrl})`,
                  backgroundSize: `${size * 100}% ${size * 100}%`,
                  backgroundPosition: `${col * (100 / (size - 1))}% ${row * (100 / (size - 1))}%`,
                  opacity: tile === null ? 0 : 1,
                  cursor: isSolved ? 'default' : 'pointer',
                }}
              />
            );
          })}
        </div>
        {isSolved && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white rounded-md">
            <h3 className="text-3xl font-bold">Solved!</h3>
            <p className="text-lg">You did it in {moves} moves.</p>
          </div>
        )}
      </div>
      <div className="flex justify-between w-full max-w-sm mt-4">
        <p className="text-lg font-medium text-gray-800 dark:text-gray-200">Moves: {moves}</p>
        <button
          onClick={shuffleTiles}
          className="px-4 py-1.5 border-2 border-gray-900 dark:border-white bg-light-100 text-gray-900 dark:bg-dark-300 dark:text-white text-sm uppercase rounded-none transition hover:bg-gray-900 hover:text-white"
        >
          {isSolved ? 'Play Again' : 'Reset'}
        </button>
      </div>
    </div>
  );
}
