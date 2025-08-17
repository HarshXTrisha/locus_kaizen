'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { LoadingIndicator } from './LoadingIndicator';

interface PageTransitionProps {
  children: React.ReactNode;
  animationType?: 'fade' | 'slide' | 'scale' | 'slide-up';
}

export function PageTransition({ 
  children, 
  animationType = 'fade' 
}: PageTransitionProps) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'exit' | 'enter'>('idle');
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      // Start exit animation
      setAnimationPhase('exit');
      setIsTransitioning(true);

      const exitTimer = setTimeout(() => {
        // Update content
        setDisplayChildren(children);
        setAnimationPhase('enter');
        
        const enterTimer = setTimeout(() => {
          setIsTransitioning(false);
          setAnimationPhase('idle');
        }, 250);

        return () => clearTimeout(enterTimer);
      }, 250);

      previousPathname.current = pathname;
      return () => clearTimeout(exitTimer);
    }
  }, [pathname, children]);

  const getAnimationClasses = () => {
    const baseClasses = 'transition-all duration-300 ease-out transform';
    
    switch (animationType) {
      case 'fade':
        return `${baseClasses} ${
          animationPhase === 'exit' 
            ? 'opacity-0' 
            : 'opacity-100'
        }`;
      
      case 'slide':
        return `${baseClasses} ${
          animationPhase === 'exit' 
            ? 'opacity-0 translate-x-4' 
            : 'opacity-100 translate-x-0'
        }`;
      
      case 'slide-up':
        return `${baseClasses} ${
          animationPhase === 'exit' 
            ? 'opacity-0 translate-y-6' 
            : 'opacity-100 translate-y-0'
        }`;
      
      case 'scale':
        return `${baseClasses} ${
          animationPhase === 'exit' 
            ? 'opacity-0 scale-95' 
            : 'opacity-100 scale-100'
        }`;
      
      default:
        return `${baseClasses} ${
          animationPhase === 'exit' 
            ? 'opacity-0 scale-95 translate-y-2' 
            : 'opacity-100 scale-100 translate-y-0'
        }`;
    }
  };

  return (
    <>
      <LoadingIndicator isVisible={isTransitioning} />
      <div
        className={getAnimationClasses()}
        style={{
          transformOrigin: 'center top',
          willChange: isTransitioning ? 'transform, opacity' : 'auto',
        }}
      >
        {displayChildren}
      </div>
    </>
  );
}
