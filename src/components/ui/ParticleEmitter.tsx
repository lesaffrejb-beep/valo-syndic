"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ParticleEmitterProps {
    /** Trigger particles when true */
    active: boolean;
    /** Particle color in hex or rgba */
    color?: string;
    /** Number of particles */
    count?: number;
}

interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
    angle: number;
}

/**
 * CSS-based particle emitter for performance (no Canvas/WebGL)
 * Emits golden particles when urgency is high
 */
export function ParticleEmitter({
    active,
    color = "#D4B679",
    count = 12,
}: ParticleEmitterProps) {
    const [particles, setParticles] = useState<Particle[]>([]);

    // Check for reduced motion preference
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setPrefersReducedMotion(mediaQuery.matches);

        const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
        mediaQuery.addEventListener("change", handler);
        return () => mediaQuery.removeEventListener("change", handler);
    }, []);

    useEffect(() => {
        if (!active || prefersReducedMotion) {
            setParticles([]);
            return;
        }

        // Generate particles radiating from center
        const newParticles: Particle[] = Array.from({ length: count }, (_, i) => {
            // Calculate angle for radial distribution
            const angle = (i / count) * 2 * Math.PI + Math.random() * 0.5;
            // Starting point near center with slight randomness
            const startRadius = 5 + Math.random() * 10; // 5-15% from center
            const startX = 50 + Math.cos(angle) * startRadius;
            const startY = 50 + Math.sin(angle) * startRadius;

            return {
                id: i,
                x: startX,
                y: startY,
                size: 3 + Math.random() * 6, // 3-9px (slightly smaller)
                duration: 3 + Math.random() * 2, // 3-5s
                delay: (i / count) * 2, // Staggered around the circle
                angle, // Store angle for radial movement
            };
        });

        setParticles(newParticles);
    }, [active, count, prefersReducedMotion]);

    if (!active || prefersReducedMotion || particles.length === 0) {
        return null;
    }

    return (
        <div
            className="absolute inset-0 overflow-visible pointer-events-none z-0"
            aria-hidden="true"
        >
            {particles.map((particle) => (
                <motion.div
                    key={`${particle.id}-${particle.x}`}
                    className="absolute rounded-full"
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        width: particle.size,
                        height: particle.size,
                        backgroundColor: color,
                        boxShadow: `0 0 ${particle.size * 2}px ${color}`,
                    }}
                    initial={{
                        opacity: 0,
                        scale: 0,
                        x: 0,
                        y: 0,
                    }}
                    animate={{
                        opacity: [0, 0.8, 0.6, 0],
                        scale: [0, 1, 0.8, 0],
                        // Radial outward movement based on particle angle
                        x: [0, Math.cos(particle.angle) * 30, Math.cos(particle.angle) * 50],
                        y: [0, Math.sin(particle.angle) * 30, Math.sin(particle.angle) * 50],
                    }}
                    transition={{
                        duration: particle.duration,
                        delay: particle.delay,
                        repeat: Infinity,
                        repeatType: "loop",
                        ease: "easeOut",
                    }}
                />
            ))}
        </div>
    );
}
