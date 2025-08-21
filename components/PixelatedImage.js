// /components/PixelatedImage.js
"use client";
import { useEffect, useRef } from 'react';

export default function PixelatedImage({ src, alt, className, id }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !src) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.crossOrigin = "anonymous";

    img.onload = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      ctx.imageSmoothingEnabled = false;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };

    img.src = src;

  }, [src]);

  return (
    <canvas ref={canvasRef} id={id} className={className} aria-label={alt}></canvas>
  );
}