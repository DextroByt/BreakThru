"use client";

import React, { useState } from 'react';
import { useSimulation } from '@/hooks/useSimulation';
import { useSequenceStore } from '@/store/useSequenceStore';
import { ArrowLeft, Loader2, Lock, Mail, User as UserIcon } from 'lucide-react';

interface AuthViewProps {
    onLoginSuccess: () => void;
    onBack: () => void;
}

export const AuthView = ({ onLoginSuccess, onBack }: AuthViewProps) => {
    const [mode, setMode] = useState<'login' | 'signup'>('login');

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const [error, setError] = useState('');

    const { runAuthSequence } = useSimulation();
    const isVisualizing = useSequenceStore((state) => state.isVisualizing);
    const activeSequenceType = useSequenceStore((state) => state.activeSequenceType);
    const resetVisualizer = useSequenceStore((state) => state.resetVisualizer);

    // Reset visualizer state on mount to prevent "Processing Sequence" persisting from previous session/logout
    React.useEffect(() => {
        resetVisualizer();
    }, [resetVisualizer]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Basic Validation
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }
        if (mode === 'signup' && !name) {
            setError('Name is required for signup');
            return;
        }

        // Trigger Simulation Sequence
        const run = async () => {
            try {
                const result = await runAuthSequence(mode, { email, password, name });

                if (result.success) {
                    // Wait a moment for the "Success" animation step to finish visually
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    if (useSequenceStore.getState().isLooping) {
                        run(); // Loop on success
                    } else {
                        onLoginSuccess();
                    }
                } else {
                    setError(result.error || 'Authentication Failed');
                    if (useSequenceStore.getState().isLooping) {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        run(); // Loop on fail
                    }
                }
            } catch (e) {
                setError('System Error');
                if (useSequenceStore.getState().isLooping) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    run();
                }
            }
        };

        run();
    };

    return (
        <div className="flex flex-col h-full bg-white p-6 transition-colors duration-500">
            <button onClick={onBack} className="self-start p-2 hover:bg-gray-100 rounded-full mb-4 text-gray-400 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex-1 flex flex-col justify-center">
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-black text-slate-900 mb-2">
                        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-sm text-slate-500">
                        {mode === 'login' ? 'Enter your credentials to access the simulation.' : 'Join the extensive network today.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {mode === 'signup' && (
                        <div className="space-y-1 animate-in fade-in slide-in-from-top-4 duration-300">
                            <label className="text-xs font-bold text-gray-700 ml-1">Full Name</label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all text-gray-900 placeholder:text-gray-300"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all text-gray-900 placeholder:text-gray-300"
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all text-gray-900 placeholder:text-gray-300"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-500 text-xs font-bold rounded-lg text-center animate-in shake">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all mt-4 ${isVisualizing
                            ? 'bg-indigo-500 text-white cursor-progress'
                            : 'bg-indigo-600 text-white shadow-indigo-200 hover:shadow-indigo-400 hover:-translate-y-0.5 active:scale-95'
                            }`}
                    >
                        {isVisualizing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing Sequence...
                            </>
                        ) : (mode === 'login' ? 'Sign In' : 'Create Account')}
                    </button>
                </form>
            </div>

            <div className="text-center mt-6">
                <p className="text-xs text-gray-400">
                    {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                    <button
                        onClick={() => {
                            setMode(mode === 'login' ? 'signup' : 'login');
                            setError('');
                        }}
                        className="ml-1 font-bold text-indigo-600 hover:underline"
                    >
                        {mode === 'login' ? 'Sign Up' : 'Log In'}
                    </button>
                </p>
            </div>
        </div>
    );
};
