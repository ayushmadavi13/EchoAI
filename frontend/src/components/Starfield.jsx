import React, { useEffect, useRef } from 'react';

export default function Starfield() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let stars = [];

    const colors = [
      '#FFFFFF', // White
      '#DDE7FF', // Blue-white 1
      '#AFC8FF', // Blue-white 2
      '#FFD6B0'  // Warm Orange (subtle, very few)
    ];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      stars = [];
      const numStars = Math.floor((canvas.width * canvas.height) / 4000); // Natural distribution density

      for (let i = 0; i < numStars; i++) {
        // Random distribution with large empty areas
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        
        // Star size distribution: mostly tiny
        const randSize = Math.random();
        let size = 0.5;
        if (randSize > 0.95) {
          size = 1.8;
        } else if (randSize > 0.8) {
          size = 1.2;
        }

        // Star color distribution: mostly white, some blue-white, very few orange
        const randColor = Math.random();
        let color = colors[0]; // White
        if (randColor > 0.98) {
          color = colors[3]; // Orange
        } else if (randColor > 0.85) {
          color = colors[2]; // Blue-white 2
        } else if (randColor > 0.65) {
          color = colors[1]; // Blue-white 1
        }

        stars.push({
          x,
          y,
          size,
          color,
          alpha: Math.random() * 0.8 + 0.2,
          twinkleSpeed: 0.003 + Math.random() * 0.007,
          twinkleDir: Math.random() > 0.5 ? 1 : -1,
          speedY: (size * 0.04) + 0.01 // Parallax speed based on size
        });
      }
    };

    const draw = () => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach(star => {
        // Star Twinkle animation
        star.alpha += star.twinkleSpeed * star.twinkleDir;
        if (star.alpha >= 1) {
          star.alpha = 1;
          star.twinkleDir = -1;
        } else if (star.alpha <= 0.1) {
          star.alpha = 0.1;
          star.twinkleDir = 1;
        }

        // Extremely slow drifting space movement (downward)
        star.y += star.speedY;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        
        // Convert hex color to rgba for opacity support
        const r = parseInt(star.color.slice(1, 3), 16);
        const g = parseInt(star.color.slice(3, 5), 16);
        const b = parseInt(star.color.slice(5, 7), 16);
        
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${star.alpha})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-20 pointer-events-none"
      style={{ background: '#000000' }}
    />
  );
}
