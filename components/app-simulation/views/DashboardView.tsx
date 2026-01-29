"use client";

import React, { useState, useEffect } from 'react';
import { useEngine, Product } from '@/lib/engine-core';
import { useSimulation } from '@/hooks/useSimulation';
import { useSequenceStore } from '@/store/useSequenceStore';
import { Search, Bell, LogOut, ShoppingCart, Loader2, Play, ShoppingBag } from 'lucide-react';

interface DashboardViewProps {
    onCartClick?: () => void;
}

export const DashboardView = ({ onCartClick }: DashboardViewProps) => {
    const { users, session, logout, products, cart, addToCart } = useEngine();
    const { runSearchSequence, runPurchaseSequence, runFilterSequence, runCartSequence, runLogoutSequence, wait } = useSimulation();
    const isVisualizing = useSequenceStore((state) => state.isVisualizing);
    const activeSequenceType = useSequenceStore((state) => state.activeSequenceType);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);

    // Initial products
    useEffect(() => {
        setDisplayedProducts(products);
    }, [products]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            setDisplayedProducts(products);
            return;
        }

        const run = async () => {
            try {
                const results = await runSearchSequence(searchQuery);
                setDisplayedProducts(results);

                // Smart Looping Logic
                if (useSequenceStore.getState().isLooping) {
                    await wait(2000);
                    run(); // Recursive loop
                }
            } catch (e) {
                console.error(e);
                // Loop on Error too
                if (useSequenceStore.getState().isLooping) {
                    await wait(2000);
                    run();
                }
            }
        };

        run();
    };

    const handleBuy = async (product: Product) => {
        // "Buy Now" -> Triggers explicit purchase flow for single item
        const run = async () => {
            const res = await runPurchaseSequence(product.id);

            if (useSequenceStore.getState().isLooping) {
                await wait(2000);
                run();
            }
        };
        run();
    };

    const handleAddToCart = async (product: Product) => {
        // "Add to Cart" -> Triggers cart flow
        const run = async () => {
            await runCartSequence('add', product);
            if (useSequenceStore.getState().isLooping) {
                await wait(2000);
                run();
            }
        };
        run();
    };

    const filterByCategory = async (category: string) => {
        setSelectedCategory(category);
        await runFilterSequence(category); // Trigger visual sequence for filter

        if (category === 'All') {
            setDisplayedProducts(products);
        } else {
            setDisplayedProducts(products.filter(p => p.category === category));
        }
    };

    const handleLogout = async () => {
        useSequenceStore.getState().resetVisualizer(); // Stop any background operations
        await runLogoutSequence();
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 font-sans">
            {/* Header */}
            <header className="px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-200 ring-2 ring-indigo-50">
                            <img src={session?.avatar} alt={session?.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 leading-none">{session?.name}</h3>
                            <p className="text-[10px] text-slate-500 font-medium">Verified User</p>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={onCartClick}
                            className="relative p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-full transition-colors"
                            title="View Cart"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            {cart.length > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
                            )}
                        </button>
                        <button onClick={handleLogout} title="Logout" className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Global Search Form */}
                <form onSubmit={handleSearch} className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-12 py-2.5 bg-slate-100 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
                    />
                    <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white rounded-lg shadow-sm border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all active:scale-95"
                    >
                        {isVisualizing && activeSequenceType === 'search' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    </button>
                    <div className="absolute top-1/2 right-9 -translate-y-1/2 w-[1px] h-4 bg-slate-200" />
                </form>
            </header>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth">

                {/* Banner */}
                <div className="mx-4 mt-4 p-5 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl text-white shadow-xl shadow-slate-200/50 relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-lg font-black mb-1">Flash Sale</h2>
                        <p className="text-xs text-slate-300 mb-3 font-medium">Up to 50% off on Neural Implants.</p>
                        <button className="px-3 py-1 bg-white text-slate-900 text-[10px] font-bold rounded-full hover:bg-indigo-50 transition-colors">
                            View Offers
                        </button>
                    </div>
                    {/* Decor */}
                    <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full translate-x-10 -translate-y-10" />
                </div>

                {/* Categories */}
                <div className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm pt-6 pb-2 px-4 mb-2">
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
                        {['All', 'Laptops', 'Mobiles', 'Accessories', 'Wearables'].map((cat, i) => (
                            <button
                                key={cat}
                                onClick={() => filterByCategory(cat)}
                                className={`snap-start px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === cat
                                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-200 scale-105'
                                    : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 gap-3 p-4 pb-24">
                    {displayedProducts.length === 0 ? (
                        <div className="col-span-2 py-10 text-center text-slate-400 flex flex-col items-center">
                            <Search className="w-8 h-8 opacity-20 mb-2" />
                            <p className="text-xs">No products found.</p>
                        </div>
                    ) : (
                        displayedProducts.map(product => (
                            <div key={product.id} className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3 group hover:shadow-md transition-all">
                                <div className="aspect-square bg-slate-50 rounded-xl flex items-center justify-center text-4xl group-hover:scale-105 transition-transform duration-300 relative overflow-hidden">
                                    <span className="relative z-10">{product.image}</span>
                                    <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 transition-colors duration-300" />
                                </div>

                                <div className="flex-1">
                                    <p className="text-[9px] font-bold text-indigo-500/80 uppercase tracking-wide mb-0.5">{product.category}</p>
                                    <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug mb-1">{product.name}</h4>
                                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed mb-3">{product.description}</p>

                                    <div className="flex items-center justify-between mt-auto gap-2">
                                        <span className="text-sm font-black text-slate-900">${product.price}</span>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:scale-105 active:scale-95 transition-all"
                                                title="Add to Cart"
                                            >
                                                <ShoppingBag className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={() => handleBuy(product)}
                                                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[10px] font-bold shadow-lg hover:bg-indigo-600 hover:shadow-indigo-200 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-1"
                                            >
                                                Buy Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
