"use client";

import React from 'react';
import { useEngine } from '@/lib/engine-core';
import { useSimulation } from '@/hooks/useSimulation';
import { useSequenceStore } from '@/store/useSequenceStore';
import { ArrowLeft, Trash2, ShoppingBag, CreditCard, Loader2 } from 'lucide-react';

interface CartViewProps {
    onBack: () => void;
    onCheckoutSuccess?: () => void;
}

export const CartView = ({ onBack, onCheckoutSuccess }: CartViewProps) => {
    const { cart, removeFromCart, clearCart } = useEngine();
    const { runCartSequence, runPurchaseSequence } = useSimulation();
    const isVisualizing = useSequenceStore((state) => state.isVisualizing);

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleRemove = async (itemId: string) => {
        const product = cart.find(p => p.id === itemId);
        if (product) {
            await runCartSequence('remove', product);
        }
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        // Trigger a purchase sequence for the first item as a visual proxy for the whole cart for now,
        // or we could implement a specific 'batch_purchase' sequence. 
        // For simplicity/clarity in visualization, we'll use the first item to trigger the flow and then clear.

        const mainItem = cart[0];
        const result = await runPurchaseSequence(mainItem.id);

        if (result?.success) {
            clearCart(); // Ensure cart is cleared after successful visual flow
            if (onCheckoutSuccess) onCheckoutSuccess();
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 font-sans animate-in slide-in-from-right duration-300">

            {/* Header */}
            <div className="px-4 py-4 bg-white border-b border-slate-200 flex items-center gap-3 shadow-sm sticky top-0 z-20">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-black text-slate-900 flex-1">My Cart</h2>
                <div className="bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-bold">
                    {cart.reduce((a, b) => a + b.quantity, 0)} Items
                </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                        <ShoppingBag className="w-16 h-16 mb-4 stroke-1" />
                        <p className="text-sm font-medium">Your cart is empty.</p>
                    </div>
                ) : (
                    cart.map(item => (
                        <div key={item.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                            <div className="w-16 h-16 bg-slate-50 rounded-lg flex items-center justify-center text-2xl shrink-0">
                                {item.image}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-slate-900 truncate">{item.name}</h4>
                                <p className="text-xs text-slate-500 mb-1">{item.category}</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-indigo-600 font-bold text-sm">${item.price}</span>
                                    <span className="text-xs text-slate-400">x {item.quantity}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleRemove(item.id)}
                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Checkout Footer */}
            {cart.length > 0 && (
                <div className="p-4 bg-white border-t border-slate-200 shadow-xl z-20">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-slate-500">Total Amount</span>
                        <span className="text-xl font-black text-slate-900">${total.toLocaleString()}</span>
                    </div>

                    <button
                        onClick={handleCheckout}
                        className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:bg-indigo-600 active:scale-95 disabled:opacity-50 disabled:cursor-wait transition-all"
                    >
                        {isVisualizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                        <span>Check Out</span>
                    </button>
                    <p className="text-[10px] text-center text-slate-400 mt-2">
                        Triggers "Purchase Sequence" in Visualizer
                    </p>
                </div>
            )}
        </div>
    );
};
