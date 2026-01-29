"use client";

import React from 'react';
import { ArrowRight, ShoppingBag } from 'lucide-react';

export const LandingView = ({ onNavigate }: { onNavigate: () => void }) => {
    return (
        <div className="flex flex-col h-full bg-white">
            {/* Navbar */}
            <nav className="p-4 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg">
                    <ShoppingBag className="w-5 h-5" />
                    <span>ShopDemo</span>
                </div>
                <button
                    onClick={onNavigate}
                    className="text-xs font-semibold text-gray-600 hover:text-indigo-600"
                >
                    Sign In
                </button>
            </nav>

            {/* Hero */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-6 bg-gradient-to-b from-white to-indigo-50/50">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-2">
                    <ShoppingBag className="w-8 h-8" />
                </div>

                <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
                    Concept Store <br />
                    <span className="text-indigo-600">Future Tech</span>
                </h1>

                <p className="text-sm text-gray-500 max-w-[260px]">
                    Experience the next generation of neural implants and quantum hardware.
                </p>

                <button
                    onClick={onNavigate}
                    className="group flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-400 hover:-translate-y-1 transition-all"
                >
                    Start Shopping
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            <div className="p-4 text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Mock E-Commerce Experience</p>
            </div>
        </div>
    );
};
