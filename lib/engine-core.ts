import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
    id: string;
    email: string;
    name: string;
    avatar: string;
    password?: string;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    category: 'Laptops' | 'Mobiles' | 'Accessories' | 'Wearables';
    description: string;
    stock: number;
}

export interface CartItem extends Product {
    quantity: number;
}

interface DbState {
    users: User[];
    session: User | null;
    products: Product[];
    cart: CartItem[]; // New Cart State

    // Actions
    login: (email: string, password: string) => { success: boolean; error?: string; user?: User };
    logout: () => void;
    register: (email: string, password: string, name: string) => { success: boolean; error?: string; user?: User };
    getProduct: (id: string) => Product | undefined;
    searchProducts: (query: string) => Product[];

    // Cart Actions
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;

    // Sync Action
    refresh: () => Promise<void>;
}

const generateProducts = (): Product[] => {
    const products: Product[] = [];
    // Laptops (1-10)
    for (let i = 1; i <= 10; i++) products.push({
        id: `lap-${i}`, name: `QuantumBook Pro v${i}`, price: 1200 + (i * 100), image: '💻', category: 'Laptops', description: 'High-performance quantum laptop.', stock: 0
    });
    // Mobiles (11-25)
    for (let i = 1; i <= 15; i++) products.push({
        id: `mob-${i}`, name: `NeuralPhone X${i}`, price: 800 + (i * 50), image: '📱', category: 'Mobiles', description: 'Direct neural interface smartphone.', stock: 100
    });
    // Accessories (26-40)
    for (let i = 1; i <= 15; i++) products.push({
        id: `acc-${i}`, name: `Holo-Projector Mini ${i}`, price: 150 + (i * 20), image: '🔌', category: 'Accessories', description: 'Portable holographic emitter.', stock: 200
    });
    // Wearables (41-55)
    for (let i = 1; i <= 15; i++) products.push({
        id: `wear-${i}`, name: `SmartLens AR ${i}`, price: 300 + (i * 40), image: '👓', category: 'Wearables', description: 'Augmented reality contact lenses.', stock: 75
    });

    return products;
};

// Custom storage adapter for physical disk persistence via API
const AsyncDiskStorage = {
    getItem: async (name: string): Promise<string | null> => {
        try {
            const res = await fetch('/api/db');
            const data = await res.json();
            return JSON.stringify(data[name] || null);
        } catch (e) {
            return null;
        }
    },
    setItem: async (name: string, value: string): Promise<void> => {
        try {
            // Get current DB content first
            const res = await fetch('/api/db');
            let currentDb: any = {};
            if (res.ok) {
                try { currentDb = await res.json(); } catch (e) { currentDb = {}; }
            }

            // Update specific key
            let parsedValue;
            if (typeof value === 'string') {
                try {
                    if (value === "[object Object]") {
                        console.error('Storage received invalid object reference');
                        return;
                    }
                    parsedValue = JSON.parse(value);
                } catch (e) {
                    parsedValue = value;
                }
            } else {
                parsedValue = value;
            }

            currentDb[name] = parsedValue;

            // Write back to disk
            await fetch('/api/db', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentDb)
            });
        } catch (e) {
            console.error('Disk Persistence Sync Failed', e);
        }
    },
    removeItem: async (name: string): Promise<void> => {
        // Option to implement if needed
    }
};

export const useEngine = create<DbState>()(
    persist(
        (set, get) => ({
            users: [
                {
                    id: 'u1',
                    email: 'demo@breakthru.dev',
                    name: 'Demo User',
                    password: 'password',
                    avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=3b82f6&color=fff'
                }
            ],
            session: null,
            products: generateProducts(),
            cart: [],

            login: (email, password) => {
                const user = get().users.find(u => u.email === email);
                if (!user) return { success: false, error: 'User not found' };
                if (user.password !== password) return { success: false, error: 'Invalid password' };

                set({ session: user });
                return { success: true, user };
            },

            logout: () => set({ session: null, cart: [] }),

            register: (email, password, name) => {
                const existing = get().users.find(u => u.email === email);
                if (existing) return { success: false, error: 'Email already exists' };

                const newUser: User = {
                    id: Math.random().toString(36).substring(7),
                    email,
                    name,
                    password,
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
                };
                set(state => ({ users: [...state.users, newUser], session: newUser }));
                return { success: true, user: newUser };
            },

            getProduct: (id) => get().products.find(p => p.id === id),

            searchProducts: (query) => {
                const q = query.toLowerCase();
                return get().products.filter(p =>
                    p.name.toLowerCase().includes(q) ||
                    p.category.toLowerCase().includes(q) ||
                    p.description.toLowerCase().includes(q)
                );
            },

            addToCart: (product) => set(state => {
                const existing = state.cart.find(item => item.id === product.id);
                if (existing) {
                    return {
                        cart: state.cart.map(item =>
                            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                        )
                    };
                }
                return { cart: [...state.cart, { ...product, quantity: 1 }] };
            }),

            removeFromCart: (productId) => set(state => ({
                cart: state.cart.filter(item => item.id !== productId)
            })),

            clearCart: () => set({ cart: [] }),

            refresh: async () => {
                try {
                    const res = await fetch('/api/db');
                    if (res.ok) {
                        const data = await res.json();
                        // Merge strategies or overwrite
                        set((state) => ({
                            users: data.users || state.users,
                            products: data.products || state.products,
                            cart: data.cart || state.cart,
                        }));
                    }
                } catch (e) {
                    console.error("Failed to refresh DB:", e);
                }
            }
        }),
        {
            name: 'breakthru-shopmart-db',
            storage: AsyncDiskStorage as any, // Use our physical disk adapter
        }
    )
);
