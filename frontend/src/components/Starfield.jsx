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
    let shootingStars = [];
    let time = 0;

    const colors = [
      '#FFFFFF', // Pure White
      '#C7D2FE', // Soft Lavender / Indigo
      '#7DD3FC', // Celestial Cyan
      '#F472B6'  // Aurora Pink
    ];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      stars = [];
      const numStars = Math.floor((canvas.width * canvas.height) / 3200);

      for (let i = 0; i < numStars; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const randSize = Math.random();
        
        let size = 0.6;
        let isBright = false;
        if (randSize > 0.96) {
          size = 2.2;
          isBright = true;
        } else if (randSize > 0.82) {
          size = 1.4;
        }

        const color = colors[Math.floor(Math.random() * colors.length)];

        stars.push({
          x,
          y,
          size,
          color,
          isBright,
          alpha: Math.random() * 0.7 + 0.3,
          baseAlpha: Math.random() * 0.5 + 0.3,
          twinkleSpeed: 0.005 + Math.random() * 0.015,
          twinkleDir: Math.random() > 0.5 ? 1 : -1,
          speedY: (size * 0.03) + 0.02,
          speedX: (Math.random() - 0.5) * 0.01
        });
      }
    };

    const createShootingStar = () => {
      if (shootingStars.length < 2 && Math.random() < 0.015) {
        shootingStars.push({
          x: Math.random() * canvas.width * 0.8,
          y: Math.random() * canvas.height * 0.4,
          length: Math.random() * 80 + 60,
          speed: Math.random() * 8 + 6,
          angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2, // ~45 deg angle
          alpha: 1,
          decay: Math.random() * 0.015 + 0.01
        });
      }
    };

    const drawNebulaGlows = () => {
      time += 0.002;
      const w = canvas.width;
      const h = canvas.height;

      // Deep Space Base Gradient
      const spaceGrad = ctx.createLinearGradient(0, 0, 0, h);
      spaceGrad.addColorStop(0, '#030308');
      spaceGrad.addColorStop(0.5, '#050714');
      spaceGrad.addColorStop(1, '#020205');
      ctx.fillStyle = spaceGrad;
      ctx.fillRect(0, 0, w, h);

      // Organic Moving Nebula 1 (Purple / Violet)
      const n1x = w * 0.3 + Math.sin(time * 0.8) * 120;
      const n1y = h * 0.3 + Math.cos(time * 0.6) * 90;
      const g1 = ctx.createRadialGradient(n1x, n1y, 20, n1x, n1y, w * 0.45);
      g1.addColorStop(0, 'rgba(147, 51, 234, 0.14)');
      g1.addColorStop(0.5, 'rgba(99, 102, 241, 0.06)');
      g1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, w, h);

      // Organic Moving Nebula 2 (Cosmic Cyan / Aurora Blue)
      const n2x = w * 0.75 + Math.cos(time * 0.7) * 140;
      const n2y = h * 0.65 + Math.sin(time * 0.9) * 100;
      const g2 = ctx.createRadialGradient(n2x, n2y, 30, n2x, n2y, w * 0.5);
      g2.addColorStop(0, 'rgba(14, 165, 233, 0.12)');
      g2.addColorStop(0.5, 'rgba(16, 185, 129, 0.04)');
      g2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, w, h);

      // Central Ambient Glow (Warm Violet Core)
      const n3x = w * 0.5 + Math.sin(time * 0.4) * 60;
      const n3y = h * 0.2 + Math.cos(time * 0.5) * 40;
      const g3 = ctx.createRadialGradient(n3x, n3y, 10, n3x, n3y, w * 0.3);
      g3.addColorStop(0, 'rgba(219, 39, 119, 0.08)');
      g3.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g3;
      ctx.fillRect(0, 0, w, h);
    };

    const drawStars = () => {
      stars.forEach(star => {
        // Twinkle update
        star.alpha += star.twinkleSpeed * star.twinkleDir;
        if (star.alpha >= 1) {
          star.alpha = 1;
          star.twinkleDir = -1;
        } else if (star.alpha <= star.baseAlpha * 0.3) {
          star.alpha = star.baseAlpha * 0.3;
          star.twinkleDir = 1;
        }

        // Drifting motion
        star.y += star.speedY;
        star.x += star.speedX;

        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
        if (star.x > canvas.width) star.x = 0;
        if (star.x < 0) star.x = canvas.width;

        // Draw star body
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);

        // Convert color to rgba
        const r = parseInt(star.color.slice(1, 3), 16);
        const g = parseInt(star.color.slice(3, 5), 16);
        const b = parseInt(star.color.slice(5, 7), 16);

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${star.alpha})`;
        ctx.fill();

        // Extra lens flare cross for bright focal stars
        if (star.isBright && star.alpha > 0.6) {
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${(star.alpha - 0.6) * 0.6})`;
          ctx.lineWidth = 0.5;

          // Cross arms
          ctx.beginPath();
          ctx.moveTo(star.x - star.size * 3, star.y);
          ctx.lineTo(star.x + star.size * 3, star.y);
          ctx.moveTo(star.x, star.y - star.size * 3);
          ctx.lineTo(star.x, star.y + star.size * 3);
          ctx.stroke();
        }
      });
    };

    const drawShootingStars = () => {
      createShootingStar();

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];

        const tailX = s.x - Math.cos(s.angle) * s.length;
        const tailY = s.y - Math.sin(s.angle) * s.length;

        const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255, 255, 255, ${s.alpha})`);
        grad.addColorStop(0.3, `rgba(186, 230, 253, ${s.alpha * 0.7})`);
        grad.addColorStop(1, `rgba(147, 51, 234, 0)`);

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Advance head
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.alpha -= s.decay;

        if (s.alpha <= 0 || s.x > canvas.width || s.y > canvas.height) {
          shootingStars.splice(i, 1);
        }
      }
    };

    const render = () => {
      drawNebulaGlows();
      drawStars();
      drawShootingStars();
      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none block"
      style={{ background: '#030308' }}
    />
  );
}
