"use client";

import React, { useState, useEffect } from 'react';
import { useEngine } from '@/lib/engine-core';
import { LandingView } from './views/LandingView';
import { AuthView } from './views/AuthView';
import { DashboardView } from './views/DashboardView';
import { CartView } from './views/CartView';
import { ShoppingBag } from 'lucide-react';

export type AppView = 'landing' | 'auth' | 'dashboard' | 'cart';

export const MockApp = () => {
    const [currentView, setCurrentView] = useState<AppView>('landing');
    const session = useEngine((state) => state.session);

    // Auto-redirect if logged in
    useEffect(() => {
        if (session) {
            // Only redirect to dashboard if we are on landing or auth pages
            if (currentView === 'landing' || currentView === 'auth') {
                setCurrentView('dashboard');
            }
        } else if (currentView === 'dashboard' || currentView === 'cart') {
            setCurrentView('landing');
        }
    }, [session, currentView]);

    const renderView = () => {
        switch (currentView) {
            case 'landing': return <LandingView onNavigate={() => setCurrentView('auth')} />;
            case 'auth': return <AuthView onLoginSuccess={() => setCurrentView('dashboard')} onBack={() => setCurrentView('landing')} />;
            case 'dashboard': return <DashboardView onCartClick={() => setCurrentView('cart')} />;
            case 'cart': return <CartView onBack={() => setCurrentView('dashboard')} onCheckoutSuccess={() => setCurrentView('dashboard')} />;
            default: return <LandingView onNavigate={() => setCurrentView('auth')} />;
        }
    };

    return (
        <div className="w-full h-full bg-[#0a0a0a] rounded-[2.5rem] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 relative flex flex-col font-sans ring-1 ring-white/5 overflow-hidden">
            {/* Inner Screen Container */}
            <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative flex flex-col border border-black/5">

                {/* Minimal Status Bar Area (Just for spacing/context) */}
                <div className="h-6 bg-white shrink-0 flex items-center justify-between px-6">
                    <div className="flex gap-1">
                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                    </div>
                </div>

                {/* Viewport Content */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden relative bg-white scrollbar-hide text-[13px]">
                    {renderView()}
                </div>

                {/* Simple Bottom Indicator */}
                <div className="h-4 bg-white shrink-0 flex items-center justify-center pb-1">
                    <div className="w-12 h-1 bg-black/5 rounded-full" />
                </div>
            </div>
        </div>
    );
};
