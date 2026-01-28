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

        // Generate particles
        const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
            id: i,
            x: Math.random() * 100, // % from left
            y: Math.random() * 100, // % from top
            size: 4 + Math.random() * 8, // 4-12px
            duration: 2 + Math.random() * 2, // 2-4s
            delay: Math.random() * 1, // 0-1s stagger
        }));

        setParticles(newParticles);

        // Regenerate particles periodically
        const interval = setInterval(() => {
            setParticles(prev => prev.map(p => ({
                ...p,
                x: Math.random() * 100,
                y: Math.random() * 100,
                delay: Math.random() * 0.5,
            })));
        }, 3000);

        return () => clearInterval(interval);
    }, [active, count, prefersReducedMotion]);

    if (!active || prefersReducedMotion || particles.length === 0) {
        return null;
    }

    return (
        <div
            className="absolute inset-0 overflow-hidden pointer-events-none z-0"
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
                        y: 0
                    }}
                    animate={{
                        opacity: [0, 1, 1, 0],
                        scale: [0, 1, 1.2, 0],
                        y: [-20, -40, -60, -80],
                    }}
                    transition={{
                        duration: particle.duration + 1, // Slower: 3-5s instead of 2-4s
                        delay: particle.delay,
                        repeat: Infinity,
                        repeatType: "mirror", // Smooth fade in/out instead of abrupt reset
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
}
