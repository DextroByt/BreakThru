"use client";

import { useSequenceStore } from '@/store/useSequenceStore';
import { Repeat, GitGraph, Layers } from 'lucide-react';

export const Header = () => {
    const isLooping = useSequenceStore((state) => state.isLooping);
    const toggleLooping = useSequenceStore((state) => state.toggleLooping);
    const viewMode = useSequenceStore((state) => state.viewMode);
    const setViewMode = useSequenceStore((state) => state.setViewMode);

    return (
        <header className="fixed top-0 left-0 right-0 h-16 border-b border-white/10 bg-black/40 backdrop-blur-md z-50 px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <h1 className="text-2xl font-mono font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 animate-pulse">
                    BreakThru
                </h1>
                <span className="text-xs font-mono text-white/40 uppercase tracking-widest mt-1">
                    Visualizing Backend OPS
                </span>
            </div>

            {/* Visualization Mode Toggle */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-1 flex gap-1 backdrop-blur-md">
                <button
                    onClick={toggleLooping}
                    className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${isLooping ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    title="Auto-Loop on Success/Error"
                >
                    <Repeat className={`w-3 h-3 ${isLooping ? 'animate-spin-slow' : ''}`} />
                    {isLooping ? 'Looping' : 'Loop'}
                </button>
                <div className="w-[1px] bg-white/10 mx-1" />
                <button
                    onClick={() => setViewMode('flow')}
                    className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${viewMode === 'flow' ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                    <GitGraph className="w-3 h-3" />
                    System Map
                </button>
                <button
                    onClick={() => setViewMode('step')}
                    className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${viewMode === 'step' ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                    <Layers className="w-3 h-3" />
                    Step Detail
                </button>
            </div>
        </header>
    );
};
