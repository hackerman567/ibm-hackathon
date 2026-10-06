import React, { useEffect, useRef } from 'react';

export default function HeroMeshBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      if (!canvas || !canvas.parentElement) return;
      const width = canvas.parentElement.offsetWidth || window.innerWidth;
      const height = canvas.parentElement.offsetHeight || 800;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const width = () => canvas.width / dpr;
    const height = () => canvas.height / dpr;

    // Glowing vertical stream particles (rain effect inspired by luxury dark SaaS keynotes)
    const particleCount = 65;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * (width() || 1200),
      y: Math.random() * (height() || 800),
      length: Math.random() * 24 + 10,
      vy: Math.random() * 1.2 + 0.4,
      opacity: Math.random() * 0.45 + 0.1,
      width: Math.random() * 1.2 + 0.6,
    }));

    let step = 0;

    const render = () => {
      step += 0.005;
      const w = width();
      const h = height();
      ctx.clearRect(0, 0, w, h);

      // Deep central glow radial gradient
      const grad = ctx.createRadialGradient(
        w * 0.5,
        h * 0.35,
        20,
        w * 0.5,
        h * 0.35,
        w * 0.7
      );
      grad.addColorStop(0, 'rgba(255, 77, 77, 0.08)');
      grad.addColorStop(0.4, 'rgba(120, 80, 255, 0.04)');
      grad.addColorStop(1, 'rgba(10, 10, 11, 0)');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Render vertical streaming light vectors
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.vy;
        if (p.y > h) {
          p.y = -p.length;
          p.x = Math.random() * w;
        }

        const lineGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.length);
        lineGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        lineGrad.addColorStop(0.5, `rgba(255, 255, 255, ${p.opacity})`);
        lineGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x, p.y + p.length);
        ctx.strokeStyle = lineGrad;
        ctx.lineWidth = p.width;
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {/* Background Ambient Video Layer */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-35 pointer-events-none"
        src="/bg-video.mp4"
      />

      {/* Dark Vignette Overlay for Text Legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0B]/60 via-[#0A0A0B]/40 to-[#0A0A0B]" />

      {/* Interactive Stream Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}
