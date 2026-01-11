import React, { useRef, useEffect } from 'react';

const ParticleBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];

        const symbols = ['∑', '∫', 'π', '∞', '∇', '∂', '√', '≈', '≠', '±', '÷', '×', '∆', 'Ω', 'µ', 'β'];

        const colors = [
            '59, 130, 246', // blue-500
            '6, 182, 212',  // cyan-500
            '168, 85, 247'  // purple-500
        ];

        // High DPI setup
        const dpr = window.devicePixelRatio || 1;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            ctx.scale(dpr, dpr);
            initParticles();
        };

        class Particle {
            constructor() {
                this.reset(true);
            }

            reset(initial = false) {
                // Spread out initially, otherwise start at bottom
                this.x = Math.random() * window.innerWidth;
                this.y = initial ? Math.random() * window.innerHeight : window.innerHeight + 20;

                // Upward movement with slight chaos
                this.speedY = Math.random() * 0.5 + 0.2;
                this.speedX = (Math.random() - 0.5) * 0.5;

                this.size = Math.floor(Math.random() * 14 + 10); // 10px to 24px
                this.symbol = symbols[Math.floor(Math.random() * symbols.length)];

                // Color selection
                this.color = colors[Math.floor(Math.random() * colors.length)];

                // Varying opacity for depth effect
                this.opacity = Math.random() * 0.3 + 0.1;
                this.fadeSpeed = Math.random() * 0.002 + 0.001;
                this.fadingOut = Math.random() > 0.5;
            }

            update() {
                this.y -= this.speedY; // Move up
                this.x += this.speedX; // Drift horizontally

                // Pulse opacity
                if (this.fadingOut) {
                    this.opacity -= this.fadeSpeed;
                    if (this.opacity <= 0.1) this.fadingOut = false;
                } else {
                    this.opacity += this.fadeSpeed;
                    if (this.opacity >= 0.4) this.fadingOut = true;
                }

                // Reset if off screen (top) or too transparent
                if (this.y < -50 || (this.opacity <= 0 && this.fadingOut)) {
                    this.reset(false);
                }
            }

            draw() {
                ctx.font = `${this.size}px "Times New Roman", serif`; // Math look
                ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;

                // Glowing effect
                ctx.shadowBlur = 15;
                ctx.shadowColor = `rgba(${this.color}, ${this.opacity})`;

                ctx.fillText(this.symbol, this.x, this.y);

                // Reset shadow for performance if needed, but we want everything to glow
                ctx.shadowBlur = 0;
            }
        }

        const initParticles = () => {
            particles = [];
            // Calculate number of particles based on screen area
            const particleCount = Math.min(Math.floor(window.innerWidth * window.innerHeight / 10000), 50);

            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            // Clear with transparent bg (or slight trail effect if desired, but clear is cleaner)
            ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

            particles.forEach(particle => {
                particle.update();
                // Re-apply shadow for each particle individually to ensure it works
                ctx.shadowBlur = 10;
                ctx.shadowColor = `rgba(${particle.color}, 0.5)`;
                particle.draw();
                ctx.shadowBlur = 0;
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-10"
        />
    );
};

export default ParticleBackground;
