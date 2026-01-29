"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface PacketProps {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    payload: any;
    color?: string;
    onComplete?: () => void;
    duration?: number;
}

export const Packet = ({
    startX,
    startY,
    endX,
    endY,
    payload,
    color = '#3b82f6',
    onComplete,
    duration = 0.8
}: PacketProps) => {
    return (
        <motion.div
            initial={{ x: startX, y: startY, scale: 0, opacity: 0 }}
            animate={{
                x: endX,
                y: endY,
                scale: [0, 1, 1, 0],
                opacity: [0, 1, 1, 0],
            }}
            transition={{
                duration: duration,
                ease: "easeInOut"
            }}
            onAnimationComplete={onComplete}
            className="absolute w-4 h-4 z-50 pointer-events-none"
        >
            <div
                className="w-full h-full rounded-full blur-[2px] shadow-[0_0_15px_currentColor]"
                style={{ backgroundColor: color, color: color }}
            />

            {/* Visual Payload Snippet */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-mono text-white/60 bg-black/80 px-1 rounded border border-white/10">
                {JSON.stringify(payload).substring(0, 15)}...
            </div>
        </motion.div>
    );
};
