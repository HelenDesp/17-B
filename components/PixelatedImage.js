// /components/PixelatedImage.js
"use client";
import { useEffect, useRef } from 'react';

export default function PixelatedImage({ src, alt, className }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !src) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    // This is crucial for loading external images from IPFS gateways
    img.crossOrigin = "anonymous";

    img.onload = () => {
      // Set canvas dimensions to match the element's size in the DOM
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      // THIS IS THE KEY: Disable anti-aliasing to keep pixels sharp
      ctx.imageSmoothingEnabled = false;

      // Draw the loaded image onto the canvas, scaling it up to fit
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };

    img.src = src;

  }, [src]); // Re-run this effect if the image src changes

  return (
    <canvas ref={canvasRef} className={className} aria-label={alt}></canvas>
  );
}