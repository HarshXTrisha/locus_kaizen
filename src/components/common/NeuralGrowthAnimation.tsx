'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Node {
  x: number;
  y: number;
  connections: number[];
  type: 'root' | 'subject' | 'connection';
  icon?: string;
  phase: number;
}

interface NeuralGrowthAnimationProps {
  className?: string;
}

const NeuralGrowthAnimation: React.FC<NeuralGrowthAnimationProps> = ({ className = '' }) => {
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

    // Set canvas size with mobile optimization
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = isMobile ? 1 : (window.devicePixelRatio || 1); // Reduce DPR on mobile for performance
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation state
    let animationTime = 0;
    let pulsePhase = 0;

    // Neural network nodes with mobile optimization
    const nodes: Node[] = isMobile ? [
      // Simplified nodes for mobile performance
      { x: 0.5, y: 0.5, connections: [], type: 'root', phase: 0 },
      { x: 0.2, y: 0.3, connections: [0], type: 'subject', icon: '📚', phase: 2 },
      { x: 0.8, y: 0.3, connections: [0], type: 'subject', icon: '🧪', phase: 2 },
      { x: 0.3, y: 0.7, connections: [0], type: 'subject', icon: '⚙️', phase: 2 },
      { x: 0.7, y: 0.7, connections: [0], type: 'subject', icon: '💡', phase: 2 },
      { x: 0.35, y: 0.45, connections: [0, 1], type: 'connection', phase: 1 },
      { x: 0.65, y: 0.45, connections: [0, 2], type: 'connection', phase: 1 },
      { x: 0.45, y: 0.55, connections: [0, 3], type: 'connection', phase: 1 },
      { x: 0.55, y: 0.55, connections: [0, 4], type: 'connection', phase: 1 },
    ] : [
      // Full nodes for desktop
      { x: 0.5, y: 0.5, connections: [], type: 'root', phase: 0 },
      { x: 0.2, y: 0.25, connections: [0], type: 'subject', icon: '📚', phase: 2 },
      { x: 0.8, y: 0.25, connections: [0], type: 'subject', icon: '🧪', phase: 2 },
      { x: 0.25, y: 0.75, connections: [0], type: 'subject', icon: '⚙️', phase: 2 },
      { x: 0.75, y: 0.75, connections: [0], type: 'subject', icon: '💡', phase: 2 },
      { x: 0.35, y: 0.35, connections: [0, 1], type: 'connection', phase: 1 },
      { x: 0.65, y: 0.35, connections: [0, 2], type: 'connection', phase: 1 },
      { x: 0.35, y: 0.65, connections: [0, 3], type: 'connection', phase: 1 },
      { x: 0.65, y: 0.65, connections: [0, 4], type: 'connection', phase: 1 },
      { x: 0.45, y: 0.45, connections: [0, 5], type: 'connection', phase: 1 },
      { x: 0.55, y: 0.45, connections: [0, 6], type: 'connection', phase: 1 },
      { x: 0.45, y: 0.55, connections: [0, 7], type: 'connection', phase: 1 },
      { x: 0.55, y: 0.55, connections: [0, 8], type: 'connection', phase: 1 },
    ];

    // Colors - vibrant green on black
    const colors = {
      primary: '#20C997',
      secondary: '#1BA085',
      glow: 'rgba(32, 201, 151, 0.8)',
      pulse: 'rgba(32, 201, 151, 0.3)',
      background: '#000000',
    };

    // Easing functions for smooth animation
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    // Draw functions with mobile optimization
    const drawNode = (node: Node, progress: number, isActive: boolean) => {
      const rect = canvas.getBoundingClientRect();
      const x = node.x * rect.width;
      const y = node.y * rect.height;
      const size = isMobile ? 
        (node.type === 'root' ? 4 : node.type === 'subject' ? 6 : 1.5) :
        (node.type === 'root' ? 6 : node.type === 'subject' ? 8 : 2);
      
      if (node.type === 'root') {
        // Root node with pulsing glow
        ctx.save();
        const pulseIntensity = 0.5 + 0.5 * Math.sin(pulsePhase * 2);
        ctx.globalAlpha = progress * pulseIntensity;
        
        // Outer glow (reduced on mobile)
        const glowSize = isMobile ? size * 4 : size * 6;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
        gradient.addColorStop(0, colors.glow);
        gradient.addColorStop(0.5, colors.pulse);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, glowSize, 0, Math.PI * 2);
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
        ctx.globalAlpha = progress * (isActive ? 1 : 0.3);
        
        // Background glow (reduced on mobile)
        const glowSize = isMobile ? size * 2 : size * 3;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
        gradient.addColorStop(0, colors.glow);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, glowSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Icon background
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
        ctx.globalAlpha = progress * (isActive ? 0.9 : 0.2);
        ctx.fillStyle = colors.primary;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };

    const drawConnection = (from: Node, to: Node, progress: number, isActive: boolean) => {
      const rect = canvas.getBoundingClientRect();
      const x1 = from.x * rect.width;
      const y1 = from.y * rect.height;
      const x2 = to.x * rect.width;
      const y2 = to.y * rect.height;
      
      ctx.save();
      ctx.globalAlpha = progress * (isActive ? 0.8 : 0.1);
      
      // Glow effect (reduced on mobile for performance)
      ctx.shadowColor = colors.glow;
      ctx.shadowBlur = isMobile ? 8 : 15;
      
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = isMobile ? 1.5 : 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      
      ctx.restore();
    };

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      
      // Clear canvas with black background
      ctx.fillStyle = colors.background;
      ctx.fillRect(0, 0, rect.width, rect.height);
      
      // Adjust animation speed for mobile
      const frameRate = isMobile ? 0.02 : 0.016;
      animationTime += frameRate;
      pulsePhase += isMobile ? 0.02 : 0.03;
      
      // Phase 0: Origin (0-0.5 seconds)
      if (animationTime < 0.5) {
        const progress = easeOutCubic(animationTime / 0.5);
        drawNode(nodes[0], progress, true);
      }
      // Phase 1: Growth (0.5-2.5 seconds)
      else if (animationTime < 2.5) {
        const growthProgress = easeInOutCubic((animationTime - 0.5) / 2);
        
        // Draw root node
        drawNode(nodes[0], 1, true);
        
        // Draw connections and nodes in growth phase
        nodes.forEach((node, index) => {
          if (node.phase <= 1) {
            const nodeProgress = Math.max(0, (growthProgress - index * 0.05) * 2);
            drawNode(node, nodeProgress, true);
            
            node.connections.forEach(connectionIndex => {
              if (index > connectionIndex) {
                const connectionProgress = Math.max(0, (growthProgress - index * 0.05) * 2);
                drawConnection(nodes[connectionIndex], node, connectionProgress, true);
              }
            });
          }
        });
      }
      // Phase 2: Connection (2.5-4.0 seconds)
      else if (animationTime < 4.0) {
        const connectionProgress = easeInOutCubic((animationTime - 2.5) / 1.5);
        
        // Draw all growth phase elements
        nodes.forEach((node, index) => {
          if (node.phase <= 1) {
            drawNode(node, 1, true);
            node.connections.forEach(connectionIndex => {
              if (index > connectionIndex) {
                drawConnection(nodes[connectionIndex], node, 1, true);
              }
            });
          }
        });
        
        // Draw subject nodes with icons
        nodes.forEach((node, index) => {
          if (node.phase === 2) {
            const iconProgress = Math.max(0, (connectionProgress - (index - 1) * 0.2) * 2);
            drawNode(node, iconProgress, true);
            
            node.connections.forEach(connectionIndex => {
              const connectionProgress = Math.max(0, (connectionProgress - (index - 1) * 0.2) * 2);
              drawConnection(nodes[connectionIndex], node, connectionProgress, true);
            });
          }
        });
      }
      // Phase 3: Network (4.0-5.0 seconds)
      else if (animationTime < 5.0) {
        const networkProgress = easeInOutCubic((animationTime - 4.0) / 1.0);
        
        // Draw all connections
        nodes.forEach((node, index) => {
          node.connections.forEach(connectionIndex => {
            if (index > connectionIndex) {
              drawConnection(nodes[connectionIndex], node, 1, true);
            }
          });
        });
        
        // Draw all nodes with network pulse
        nodes.forEach((node) => {
          const pulseIntensity = 0.7 + 0.3 * Math.sin(pulsePhase + networkProgress * Math.PI);
          drawNode(node, 1, true);
          
          // Add network-wide pulse effect (reduced on mobile)
          if (node.type === 'root') {
            ctx.save();
            ctx.globalAlpha = pulseIntensity * 0.2;
            const pulseSize = isMobile ? 60 : 100;
            const gradient = ctx.createRadialGradient(
              node.x * rect.width, 
              node.y * rect.height, 
              0, 
              node.x * rect.width, 
              node.y * rect.height, 
              pulseSize
            );
            gradient.addColorStop(0, colors.pulse);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(node.x * rect.width, node.y * rect.height, pulseSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        });
      }
      // Phase 4: Loop (5.0+ seconds)
      else {
        // Fade out and restart
        const fadeProgress = Math.min((animationTime - 5.0) / 0.5, 1);
        
        if (fadeProgress < 1) {
          ctx.save();
          ctx.globalAlpha = 1 - fadeProgress;
          
          // Draw all elements
          nodes.forEach((node, index) => {
            node.connections.forEach(connectionIndex => {
              if (index > connectionIndex) {
                drawConnection(nodes[connectionIndex], node, 1, true);
              }
            });
            drawNode(node, 1, true);
          });
          
          ctx.restore();
        } else {
          // Reset animation
          animationTime = 0;
          pulsePhase = 0;
        }
      }
      
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
      style={{ opacity: isMobile ? 0.9 : 0.8 }}
    />
  );
};

export default NeuralGrowthAnimation;
