'use client';

import React, { useEffect, useRef, useState } from 'react';

interface FloatingElement {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  type: 'circle' | 'square' | 'diamond';
  direction: { x: number; y: number };
}

interface FloatingElementsAnimationProps {
  className?: string;
}

const FloatingElementsAnimation: React.FC<FloatingElementsAnimationProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768 || 
                    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = isMobile ? 1 : (window.devicePixelRatio || 1);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Colors - elegant green on white background
    const colors = {
      primary: '#20C997',
      secondary: '#1BA085',
      accent: '#17A085',
    };

    // Create floating elements
    const createElements = (): FloatingElement[] => {
      const elementCount = isMobile ? 8 : 12;
      const elements: FloatingElement[] = [];

      for (let i = 0; i < elementCount; i++) {
        elements.push({
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * (isMobile ? 3 : 4) + (isMobile ? 1 : 2),
          speed: Math.random() * 0.5 + 0.2,
          opacity: Math.random() * 0.4 + 0.1, // Very light opacity
          type: ['circle', 'square', 'diamond'][Math.floor(Math.random() * 3)] as 'circle' | 'square' | 'diamond',
          direction: {
            x: (Math.random() - 0.5) * 0.5,
            y: (Math.random() - 0.5) * 0.5
          }
        });
      }

      return elements;
    };

    let elements = createElements();
    let time = 0;

    // Draw functions
    const drawCircle = (x: number, y: number, size: number, opacity: number) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = colors.primary;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawSquare = (x: number, y: number, size: number, opacity: number) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = colors.secondary;
      ctx.fillRect(x - size, y - size, size * 2, size * 2);
      ctx.restore();
    };

    const drawDiamond = (x: number, y: number, size: number, opacity: number) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + size, y);
      ctx.lineTo(x, y + size);
      ctx.lineTo(x - size, y);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      
      // Clear canvas with white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, rect.width, rect.height);
      
      time += 0.01;

      // Update and draw elements
      elements.forEach((element, index) => {
        // Update position
        element.x += element.direction.x * element.speed;
        element.y += element.direction.y * element.speed;

        // Wrap around edges
        if (element.x < -5) element.x = rect.width + 5;
        if (element.x > rect.width + 5) element.x = -5;
        if (element.y < -5) element.y = rect.height + 5;
        if (element.y > rect.height + 5) element.y = -5;

        // Add subtle floating motion
        const floatOffset = Math.sin(time + index) * 2;
        const drawX = element.x;
        const drawY = element.y + floatOffset;

        // Draw element based on type
        switch (element.type) {
          case 'circle':
            drawCircle(drawX, drawY, element.size, element.opacity);
            break;
          case 'square':
            drawSquare(drawX, drawY, element.size, element.opacity);
            break;
          case 'diamond':
            drawDiamond(drawX, drawY, element.size, element.opacity);
            break;
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isMobile]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ opacity: 0.8 }}
    />
  );
};

export default FloatingElementsAnimation;
