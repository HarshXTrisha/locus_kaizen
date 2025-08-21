'use client';

import React, { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  connections: number[];
  type: 'root' | 'subject' | 'connection';
  icon?: string;
}

interface NeuralGrowthAnimationProps {
  className?: string;
}

const NeuralGrowthAnimation: React.FC<NeuralGrowthAnimationProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation state
    let animationTime = 0;
    let growthPhase = 0; // 0: growing, 1: complete, 2: pulsing
    let pulsePhase = 0;

    // Neural network nodes
    const nodes: Node[] = [
      // Root node (center)
      { x: 0.5, y: 0.5, connections: [], type: 'root' },
      
      // Subject nodes
      { x: 0.2, y: 0.3, connections: [0], type: 'subject', icon: '📚' },
      { x: 0.8, y: 0.3, connections: [0], type: 'subject', icon: '🧪' },
      { x: 0.3, y: 0.7, connections: [0], type: 'subject', icon: '⚙️' },
      { x: 0.7, y: 0.7, connections: [0], type: 'subject', icon: '💡' },
      
      // Connection nodes
      { x: 0.35, y: 0.4, connections: [0, 1], type: 'connection' },
      { x: 0.65, y: 0.4, connections: [0, 2], type: 'connection' },
      { x: 0.4, y: 0.6, connections: [0, 3], type: 'connection' },
      { x: 0.6, y: 0.6, connections: [0, 4], type: 'connection' },
    ];

    // Colors
    const colors = {
      primary: '#20C997',
      secondary: '#1BA085',
      glow: 'rgba(32, 201, 151, 0.3)',
      pulse: 'rgba(32, 201, 151, 0.1)',
    };

    // Animation functions
    const drawNode = (node: Node, progress: number, isActive: boolean) => {
      const x = node.x * canvas.width;
      const y = node.y * canvas.height;
      const size = node.type === 'root' ? 8 : node.type === 'subject' ? 6 : 3;
      
      if (node.type === 'root') {
        // Root node with glow effect
        ctx.save();
        ctx.globalAlpha = progress * (isActive ? 1 : 0.3);
        
        // Glow
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
        gradient.addColorStop(0, colors.glow);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size * 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Core
        ctx.fillStyle = colors.primary;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      } else if (node.type === 'subject') {
        // Subject nodes with icons
        ctx.save();
        ctx.globalAlpha = progress * (isActive ? 1 : 0.5);
        
        // Background circle
        ctx.fillStyle = colors.secondary;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Icon (simplified as colored dot for now)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      } else {
        // Connection nodes
        ctx.save();
        ctx.globalAlpha = progress * (isActive ? 0.8 : 0.3);
        ctx.fillStyle = colors.primary;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };

    const drawConnection = (from: Node, to: Node, progress: number, isActive: boolean) => {
      const x1 = from.x * canvas.width;
      const y1 = from.y * canvas.height;
      const x2 = to.x * canvas.width;
      const y2 = to.y * canvas.height;
      
      ctx.save();
      ctx.globalAlpha = progress * (isActive ? 0.6 : 0.2);
      
      // Glow effect
      ctx.shadowColor = colors.glow;
      ctx.shadowBlur = 10;
      
      // Line
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      
      ctx.restore();
    };

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      animationTime += 0.016; // 60fps
      
      // Growth phase
      if (growthPhase === 0) {
        const growthProgress = Math.min(animationTime / 4, 1); // 4 seconds
        
        // Draw connections first
        nodes.forEach((node, index) => {
          node.connections.forEach(connectionIndex => {
            if (index > connectionIndex) {
              const connectionProgress = Math.max(0, (growthProgress - index * 0.1) * 2);
              drawConnection(nodes[connectionIndex], node, connectionProgress, true);
            }
          });
        });
        
        // Draw nodes
        nodes.forEach((node, index) => {
          const nodeProgress = Math.max(0, (growthProgress - index * 0.1) * 2);
          drawNode(node, nodeProgress, true);
        });
        
        if (growthProgress >= 1) {
          growthPhase = 1;
          animationTime = 0;
        }
      }
      
      // Complete phase with pulsing
      if (growthPhase >= 1) {
        pulsePhase += 0.05;
        
        // Draw all connections
        nodes.forEach((node, index) => {
          node.connections.forEach(connectionIndex => {
            if (index > connectionIndex) {
              drawConnection(nodes[connectionIndex], node, 1, true);
            }
          });
        });
        
        // Draw all nodes with pulse effect
        nodes.forEach((node) => {
          const pulseIntensity = 0.3 + 0.2 * Math.sin(pulsePhase);
          drawNode(node, 1, true);
          
          // Add subtle pulse glow
          if (node.type === 'root') {
            ctx.save();
            ctx.globalAlpha = pulseIntensity * 0.3;
            const gradient = ctx.createRadialGradient(
              node.x * canvas.width, 
              node.y * canvas.height, 
              0, 
              node.x * canvas.width, 
              node.y * canvas.height, 
              20
            );
            gradient.addColorStop(0, colors.pulse);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(node.x * canvas.width, node.y * canvas.height, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        });
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ opacity: 0.4 }}
    />
  );
};

export default NeuralGrowthAnimation;
