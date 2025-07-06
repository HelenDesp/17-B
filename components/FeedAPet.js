// /components/FeedAPet.js
"use client";
import { useState, useEffect, useCallback } from 'react';

const GAME_DURATION = 20; // 20 seconds
const HOLE_COUNT = 9;

// --- Items that can appear ---
const goodItem = '🍖'; // Steak
const badItem = '💣'; // Bomb

export default function FeedAPet({ onGameEnd }) {
  const [holes, setHoles] = useState(new Array(HOLE_COUNT).fill(null));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameStatus, setGameStatus] = useState('ready'); // 'ready', 'playing', 'ended'

  // Main game loop timer
  useEffect(() => {
    if (gameStatus !== 'playing') return;

    if (timeLeft === 0) {
      setGameStatus('ended');
      setTimeout(() => onGameEnd(score), 2000); // Send final score back
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStatus, timeLeft, onGameEnd, score]);

  // Item appearance loop
  useEffect(() => {
    if (gameStatus !== 'playing') return;

    const showItem = () => {
      const randomIndex = Math.floor(Math.random() * HOLE_COUNT);
      const randomItem = Math.random() > 0.25 ? goodItem : badItem; // 75% chance of good item
      
      setHoles(prevHoles => {
        const newHoles = [...prevHoles];
        if (newHoles[randomIndex] === null) { // Only place if hole is empty
          newHoles[randomIndex] = randomItem;
        }
        return newHoles;
      });

      // Item disappears after a short time
      setTimeout(() => {
        setHoles(prevHoles => {
          const newHoles = [...prevHoles];
          if (newHoles[randomIndex] === randomItem) {
            newHoles[randomIndex] = null;
          }
          return newHoles;
        });
      }, 900); // Item visible for 0.9 seconds
    };

    const gameInterval = setInterval(showItem, 500); // New item appears every 0.5 seconds

    return () => clearInterval(gameInterval);
  }, [gameStatus]);

  const handleHoleClick = (index) => {
    if (holes[index] === null || gameStatus !== 'playing') return;

    if (holes[index] === goodItem) {
      setScore((s) => s + 10);
    } else if (holes[index] === badItem) {
      setScore((s) => Math.max(0, s - 15)); // Penalty for hitting a bomb
    }

    // Immediately remove the item when clicked
    setHoles(prevHoles => {
      const newHoles = [...prevHoles];
      newHoles[index] = null;
      return newHoles;
    });
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setHoles(new Array(HOLE_COUNT).fill(null));
    setGameStatus('playing');
  };

  const renderGameContent = () => {
    if (gameStatus === 'ended') {
      return (
        <div className="text-center">
            <h3 className="text-3xl font-bold text-green-500">Game Over!</h3>
            <p className="text-xl mt-2 dark:text-gray-200">Final Score: {score}</p>
        </div>
      );
    }

    if (gameStatus === 'ready') {
      return (
        <div className="text-center">
            <h3 className="text-2xl font-bold mb-4 dark:text-gray-200">Feed-a-Pet!</h3>
            <p className="mb-6 dark:text-gray-300">Click the food (🍖) and avoid the bombs (💣)!</p>
            <button onClick={startGame} className="px-8 py-3 bg-green-500 text-white text-xl font-bold uppercase rounded-md transition hover:bg-green-600">
                Start Game
            </button>
        </div>
      );
    }

    return (
        <div className="grid grid-cols-3 gap-4 w-full max-w-xs mx-auto">
            {holes.map((item, index) => (
                <div 
                    key={index}
                    onClick={() => handleHoleClick(index)}
                    className="w-24 h-24 bg-yellow-800/70 rounded-full border-4 border-yellow-900 flex items-center justify-center cursor-pointer select-none"
                >
                    <span className="text-5xl transition-transform duration-100 ease-out" style={{transform: item ? 'scale(1)' : 'scale(0)'}}>
                        {item}
                    </span>
                </div>
            ))}
        </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60">
      <div className="bg-yellow-600/80 dark:bg-yellow-900/80 p-6 rounded-lg shadow-xl border-4 border-yellow-700 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4 text-2xl font-bold text-white">
            <h3>Score: {score}</h3>
            <h3>Time: {timeLeft}</h3>
        </div>
        <div className="bg-green-800/50 p-6 rounded-md min-h-[300px] flex items-center justify-center">
            {renderGameContent()}
        </div>
      </div>
    </div>
  );
}
