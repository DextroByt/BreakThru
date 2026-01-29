"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useSequenceStore } from '@/store/useSequenceStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Laptop, Server, Globe, CheckCircle, XCircle, ArrowRight, Activity, Code, Layers, GitGraph, Clock, ShieldCheck, Box, CreditCard, Sparkles, AlertTriangle, Repeat } from 'lucide-react';

const icons: Record<string, React.ReactNode> = {
    'UI': <Laptop className="w-5 h-5" />,
    'Client': <Laptop className="w-5 h-5" />,
    'Server': <Server className="w-5 h-5" />,
    'DB': <Database className="w-5 h-5" />,
    'Gateway': <Globe className="w-5 h-5" />,
    'Auth Service': <ShieldCheck className="w-5 h-5" />,
    'Inventory': <Box className="w-5 h-5" />,
    'Payment': <CreditCard className="w-5 h-5" />
};

export const SequenceVisualizer = () => {
    const isVisualizing = useSequenceStore((state) => state.isVisualizing);
    const viewMode = useSequenceStore((state) => state.viewMode);
    const setViewMode = useSequenceStore((state) => state.setViewMode);
    const steps = useSequenceStore((state) => state.steps);
    const currentStepIndex = useSequenceStore((state) => state.currentStepIndex);
    const history = useSequenceStore((state) => state.history);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [viewStepIndex, setViewStepIndex] = useState<number | null>(null);

    // Calculate visible steps (truncate future steps if error occurred)
    const errorIndex = steps.findIndex(s => s.status === 'error');
    const visibleSteps = errorIndex !== -1 ? steps.slice(0, errorIndex + 1) : steps;

    // Auto-scroll timeline
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
        setViewStepIndex(currentStepIndex);
    }, [steps, currentStepIndex]);

    const activeStep = viewStepIndex !== null ? steps[viewStepIndex] : steps[currentStepIndex];

    const handleStepClick = (index: number) => {
        setViewStepIndex(index);
        setViewMode('step'); // Auto-switch to step detail view on click
    };

    if (!isVisualizing && history.length === 0 && steps.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-white/20 select-none bg-[#050505] relative font-mono">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-black to-black pointer-events-none" />
                <Activity className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-xs uppercase tracking-[0.2em] font-bold text-white/40">Awaiting Input</p>
                <p className="text-[10px] mt-2 opacity-30">BreakThru Logic Engine Ready</p>
            </div>
        );
    }

    return (
        <div className="h-full max-h-full flex flex-col bg-[#050505] text-white/90 relative overflow-hidden font-mono selection:bg-indigo-500/30">


            {/* Main Stage */}
            <div className="flex-1 flex flex-col items-center justify-center relative p-8">

                {viewMode === 'flow' ? (
                    /* FLOW MODE: Enhanced System Map */
                    <div className="relative w-full max-w-5xl flex-1 flex items-center justify-center min-h-[300px]">
                        {/* Define Nodes Grid */}
                        {/* Center Hub: API Server */}
                        <SystemNode id="Server" label="API Server" icon={icons['Server']} x="50%" y="50%" active={activeStep?.source === 'Server' || activeStep?.target === 'Server'} status={activeStep?.status} />

                        {/* Peripherals */}
                        <SystemNode id="UI" label="Client UI" icon={icons['UI']} x="15%" y="50%" active={activeStep?.source === 'UI'} status={activeStep?.status} />
                        <SystemNode id="DB" label="Database" icon={icons['DB']} x="85%" y="50%" active={activeStep?.source === 'DB'} status={activeStep?.status} />

                        <SystemNode id="Auth" label="Auth Svc" icon={icons['Auth Service']} x="50%" y="15%" active={activeStep?.source === 'Auth Service'} status={activeStep?.status} />
                        <SystemNode id="Inv" label="Inventory" icon={icons['Inventory']} x="35%" y="85%" active={activeStep?.source === 'Inventory'} status={activeStep?.status} />
                        <SystemNode id="Pay" label="Payment" icon={icons['Payment']} x="65%" y="85%" active={activeStep?.source === 'Payment'} status={activeStep?.status} />

                        {/* Define Connections (SVG Overlay) */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                            {/* Server <-> UI */}
                            <Connection startX="15%" startY="50%" endX="50%" endY="50%" active={pathActive(activeStep, 'UI', 'Server')} status={activeStep?.status} />
                            {/* Server <-> DB */}
                            <Connection startX="50%" startY="50%" endX="85%" endY="50%" active={pathActive(activeStep, 'Server', 'DB')} status={activeStep?.status} />
                            {/* Server <-> Auth */}
                            <Connection startX="50%" startY="50%" endX="50%" endY="15%" active={pathActive(activeStep, 'Server', 'Auth Service')} status={activeStep?.status} />
                            {/* Server <-> Inventory */}
                            <Connection startX="50%" startY="50%" endX="35%" endY="85%" active={pathActive(activeStep, 'Server', 'Inventory')} status={activeStep?.status} />
                            {/* Server <-> Payment */}
                            <Connection startX="50%" startY="50%" endX="65%" endY="85%" active={pathActive(activeStep, 'Server', 'Payment')} status={activeStep?.status} />
                        </svg>

                        {/* Active Step Label Overlay on Map */}
                        <AnimatePresence>
                            {activeStep && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className={`absolute top-0 right-0 bg-black/80 backdrop-blur border px-6 py-3 rounded-xl shadow-2xl flex items-center gap-4 z-20 pointer-events-none transition-colors duration-500
                                        ${activeStep.status === 'error' ? 'border-red-500/50' : 'border-indigo-500/50'}`}
                                >
                                    <div className="flex flex-col text-right">
                                        <span className={`text-[9px] font-bold uppercase tracking-widest mb-0.5 ${activeStep.status === 'error' ? 'text-red-400' : 'text-indigo-400'}`}>Current Operation</span>
                                        <span className="text-lg font-bold text-white uppercase tracking-tighter">{activeStep.action}</span>
                                    </div>
                                    <div className="h-8 w-[1px] bg-white/10" />
                                    {activeStep.status === 'error' ? (
                                        <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                                    ) : (
                                        <Clock className="w-4 h-4 text-white/40 animate-pulse" />
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    /* STEP MODE: Detailed Card */
                    <AnimatePresence mode="wait">
                        {activeStep && (
                            <motion.div
                                key={activeStep.id}
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 1.05, y: -10 }}
                                transition={{ type: 'spring', bounce: 0.3, duration: 0.4 }}
                                className="relative z-10 w-full max-w-2xl"
                            >
                                <div className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/5">
                                    {/* Action Header */}
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
                                                {icons[activeStep.source] || <Activity className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Source</div>
                                                <div className="text-sm font-bold text-white">{activeStep.source}</div>
                                            </div>
                                        </div>
                                        <ArrowRight className="text-white/10" />
                                        <div className="text-right">
                                            <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Action</div>
                                            <div className="text-sm font-bold text-white max-w-[200px] truncate">{activeStep.label}</div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 space-y-6">

                                        {/* AI Insight Section */}
                                        {activeStep.explanation && (
                                            <div className={`p-4 rounded-xl border ${activeStep.explanation.includes('ALERT') ? 'bg-red-500/10 border-red-500/20' : 'bg-indigo-500/10 border-indigo-500/20'} relative overflow-hidden`}>
                                                <div className="absolute top-2 right-2 opacity-20">
                                                    <Sparkles className="w-12 h-12" />
                                                </div>
                                                <h3 className={`text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2 ${activeStep.explanation.includes('ALERT') ? 'text-red-400' : 'text-indigo-400'}`}>
                                                    <Sparkles className="w-3 h-3" /> Analysis
                                                </h3>
                                                <p className="text-sm text-white/90 leading-relaxed font-medium relative z-10">
                                                    {activeStep.explanation.replace('✅ [DEPTH ANALYZED]:', '').replace('❌ [SECURITY ALERT]:', '')}
                                                </p>
                                            </div>
                                        )}

                                        <div>
                                            <h3 className="text-[10px] text-white/40 uppercase tracking-wider mb-2 font-bold">Execution Command</h3>
                                            <div className="text-xl font-mono text-white/90 bg-black/50 p-3 rounded-lg border border-white/5 shadow-inner break-all">
                                                {activeStep.action}
                                            </div>
                                        </div>

                                        <div className="bg-black/30 rounded-lg border border-white/5 overflow-hidden">
                                            <div className="px-3 py-2 bg-white/5 border-b border-white/5 flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-white/40 uppercase flex items-center gap-2">
                                                    <Code className="w-3 h-3" /> Payload Data
                                                </span>
                                                {activeStep.status === 'active' && <span className="text-[9px] text-indigo-400 animate-pulse">Streaming...</span>}
                                            </div>
                                            <div className="p-4 overflow-x-auto max-h-48 scrollbar-thin scrollbar-thumb-white/10">
                                                <pre className="text-[10px] text-emerald-500/90 font-mono leading-relaxed">
                                                    {activeStep.payload ? JSON.stringify(activeStep.payload, null, 2) : '// No payload'}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Footer */}
                                    <div className={`px-6 py-2 border-t border-white/5 flex items-center justify-between ${activeStep.status === 'error' ? 'bg-red-900/20' : 'bg-green-900/10'}`}>
                                        <span className={`text-[10px] font-mono uppercase font-bold flex items-center gap-2 ${activeStep.status === 'error' ? 'text-red-400' : 'text-emerald-500/60'}`}>
                                            {activeStep.status === 'error' && <AlertTriangle className="w-3 h-3" />}
                                            Status: {activeStep.status}
                                        </span>
                                        <span className="text-[10px] font-mono text-white/20">ID: {activeStep.id}</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>

            {/* Timeline Sidebar (Interactive) */}
            <div className="h-40 border-t border-white/10 bg-[#080808] z-20 flex flex-col">
                <div className="px-6 py-2 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Sequence Timeline</span>
                    <div className="flex gap-1">
                        {visibleSteps.map((_, i) => (
                            <div key={i} className={`w-1 h-1 rounded-full transitions-all ${i === currentStepIndex ? 'bg-indigo-500 scale-150' : 'bg-white/10'}`} />
                        ))}
                    </div>
                </div>

                <div
                    ref={scrollRef}
                    className="flex-1 overflow-x-auto overflow-y-hidden flex items-center gap-4 px-6 py-3 scrollbar-thin scrollbar-thumb-white/10"
                >
                    {visibleSteps.map((step, index) => (
                        <button
                            key={step.id}
                            onClick={() => handleStepClick(index)}
                            className={`
                                relative shrink-0 w-32 p-3 rounded-lg border text-left transition-all duration-300 group
                                ${index === viewStepIndex
                                    ? 'bg-indigo-500/10 border-indigo-500/50 ring-1 ring-indigo-500/30'
                                    : step.status === 'completed'
                                        ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                        : step.status === 'error'
                                            ? 'bg-red-900/20 border-red-500/30 hover:bg-red-900/30'
                                            : 'bg-transparent border-transparent opacity-30'}
                            `}
                        >
                            {index < steps.length - 1 && (
                                <div className={`absolute top-1/2 left-full w-4 h-[1px] -translate-y-1/2 ${step.status === 'completed' ? 'bg-indigo-500/50' : 'bg-white/10'}`} />
                            )}

                            <div className="flex items-center justify-between mb-1">
                                <span className={`text-[9px] font-bold group-hover:text-indigo-400 transition-colors ${step.status === 'error' ? 'text-red-400' : 'text-white/30'}`}>STEP {index + 1}</span>
                                {step.status === 'completed' && <CheckCircle className="w-2.5 h-2.5 text-emerald-500" />}
                                {step.status === 'error' && <XCircle className="w-2.5 h-2.5 text-red-500" />}
                            </div>
                            <div className="text-[10px] font-bold text-white/80 truncate mb-0.5">{step.label}</div>
                            <div className="text-[9px] text-white/40 truncate font-mono">{step.action}</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Helpers ---

// Helper to check if a path should be active based on source/target
const pathActive = (step: any, nodeA: string, nodeB: string) => {
    if (!step) return false;
    const s = step.source;
    const t = step.target || 'Server'; // Default target often implied as Server or UI
    return (s === nodeA && t === nodeB) || (s === nodeB && t === nodeA) ||
        (s === nodeA && (step.action.includes(nodeB) || step.label.includes(nodeB))) ||
        (s === nodeB && (step.action.includes(nodeA) || step.label.includes(nodeA)));
};

const SystemNode = ({ id, label, icon, x, y, active, status }: { id: string, label: string, icon: any, x: string, y: string, active?: boolean, status?: string }) => (
    <div
        className={`absolute w-24 h-24 -translate-x-1/2 -translate-y-1/2 rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all duration-500 z-10
            ${active
                ? status === 'error'
                    ? 'bg-red-900 border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.5)] scale-110'
                    : 'bg-indigo-600 border-indigo-400 shadow-[0_0_40px_rgba(79,70,229,0.5)] scale-110'
                : 'bg-[#0f0f0f] border-white/10 text-white/20'}`}
        style={{ left: x, top: y }}
    >
        <div className={active ? 'text-white' : 'text-white/20'}>{icon}</div>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${active ? 'text-white' : 'text-white/20'}`}>{label}</span>
        {active && status !== 'error' && <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />}
        {active && status === 'error' && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />}
    </div>
);

const Connection = ({ startX, startY, endX, endY, active, status }: { startX: string, startY: string, endX: string, endY: string, active?: boolean, status?: string }) => (
    <g>
        {/* Base Line */}
        <line
            x1={startX} y1={startY} x2={endX} y2={endY}
            stroke={active ? (status === 'error' ? '#ef4444' : '#4338ca') : '#1a1a1a'}
            strokeWidth={2}
        />
        {/* Animated Data Particle */}
        {active && (
            <circle r="3" fill={status === 'error' ? '#ef4444' : '#6366f1'}>
                <animateMotion dur="1s" repeatCount="indefinite" path={`M${startX.replace('%', '') * 10},${startY.replace('%', '') * 10} L${endX.replace('%', '') * 10},${endY.replace('%', '') * 10}`} />
            </circle>
        )}
        {/* CSS Animation Fallback */}
        <line
            x1={startX} y1={startY} x2={endX} y2={endY}
            stroke={status === 'error' ? '#ef4444' : '#6366f1'}
            strokeWidth={2}
            strokeDasharray="5,5"
            className={`transition-opacity duration-300 ${active ? 'opacity-100 animate-pulse' : 'opacity-0'}`}
        />
    </g>
);
