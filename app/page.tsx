"use client";

import React from 'react';
import { SequenceVisualizer } from '@/components/visualizer/SequenceVisualizer';
import { MockApp } from '@/components/app-simulation/MockApp';

export default function Home() {
  return (
    <div className="relative h-full w-full grid grid-cols-[auto_1fr] overflow-hidden bg-black">
      {/* Left Sidebar: Mock App Simulation */}
      <div className="h-full border-r border-white/5 p-8 flex items-center justify-center relative overflow-hidden bg-dot-pattern">
        {/* Background Gradient Mesh for Sandbox */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />

        <div className="relative z-10 w-[340px] h-[85vh] max-h-[620px] transition-all hover:scale-[1.01] duration-500">
          <MockApp />
        </div>
      </div>

      {/* Main Area: Visualizer */}
      <div className="h-full relative overflow-hidden bg-grid-pattern">
        <div className="absolute top-8 right-8 z-10 flex flex-col items-end gap-1 pointer-events-none">
          <h2 className="text-xs font-mono text-white/40 uppercase tracking-[4px]">Logic Map</h2>
          <p className="text-[9px] text-white/20 uppercase tracking-widest">Sequence Timeline & Execution</p>
        </div>

        <SequenceVisualizer />
      </div>

      {/* Background Ambience / PostFX */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[800px] bg-blue-600/[0.03] blur-[150px] rounded-full" />
        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-purple-600/[0.03] blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
