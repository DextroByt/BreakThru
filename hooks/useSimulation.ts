"use client";

import { useSequenceStore, SequenceStep } from '@/store/useSequenceStore';
import { useEngine, Product } from '@/lib/engine-core';
import { useCallback } from 'react';

const WAIT_TIME = 3500; // Slower for better readability

// Helper to simulate "AI" analysis - STRENGTHENED FOR HACKATHON
const generateAiInsight = (context: string, success: boolean = true) => {
    const prefix = success ? "✅ [DEPTH ANALYZED]:" : "❌ [SECURITY ALERT]:";
    return `${prefix} ${context}`;
};

export const useSimulation = () => {
    // Actions now require sequenceId to verify they are still relevant
    const { startSequence, nextStep, completeCurrentlyActiveStep, failCurrentlyActiveStep, isLooping } = useSequenceStore();
    const { login, register, searchProducts, getProduct, addToCart, removeFromCart, logout, clearCart } = useEngine();

    const logToTerminal = async (step: any, status: 'success' | 'error' = 'success') => {
        try {
            await fetch('/api/telemetry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    source: step.source,
                    action: step.action,
                    payload: step.payload,
                    status
                })
            });
        } catch (e) {
            // Silently fail if telemetry is unreachable
        }
    };

    const wait = (ms: number = WAIT_TIME) => new Promise(resolve => setTimeout(resolve, ms));

    const runAuthSequence = useCallback(async (type: 'login' | 'signup', credentials: any) => {
        const steps: SequenceStep[] = [
            {
                id: '1', label: 'Rate Limiter', source: 'Gateway', action: 'CHECK_LIMITS',
                payload: { ip: '192.168.1.45', bucket: 'auth_global', burst: 5 },
                status: 'pending', explanation: generateAiInsight("Verifying request frequency to prevent brute force attacks.")
            },
            {
                id: '2', label: 'Sanitizer', source: 'Server', action: 'STRIP_XSS_SQLI',
                payload: { input: credentials.email, strategy: 'aggressive' },
                status: 'pending', explanation: generateAiInsight("Cleaning input data to ensure no malicious scripts are injected.")
            },
            {
                id: '3', label: 'API Gateway', source: 'Server', action: `POST /api/v1/auth/${type}`,
                payload: { headers: { 'X-Request-ID': 'req_auth_921' }, method: 'POST' },
                status: 'pending', explanation: generateAiInsight("Routing your request to the authentication microservice.")
            },
            {
                id: '4', label: 'Security', source: 'Auth Service', action: 'BCRYPT_VERIFY',
                payload: { cost_factor: 12, salt_detected: true },
                status: 'pending', explanation: generateAiInsight("Securely comparing your credentials using high-entropy hashing.")
            },
            {
                id: '5', label: 'Database', source: 'DB', action: 'FETCH_USER_PROFILE',
                payload: { index: 'idx_email_unq', lock: 'SHARED' },
                status: 'pending', explanation: generateAiInsight("Retrieving your account profile from the secure database.")
            },
            {
                id: '6', label: 'Session Mgmt', source: 'Server', action: 'KEY_ROTATION',
                payload: { alg: 'EdDSA', kid: 'rsa_pub_2024_03' },
                status: 'pending', explanation: generateAiInsight("Generating a new rotated session key for your high-security JWT.")
            },
            {
                id: '7', label: 'Response', source: 'UI', action: 'ACK_SUCCESS',
                payload: { status: 'AUTHORIZED', redirect_to: '/dashboard' },
                status: 'pending', explanation: generateAiInsight("Handshake complete. Welcome back to BreakThru.")
            }
        ];

        const seqId = startSequence(type === 'login' ? 'auth_login' : 'auth_signup', steps);

        // Execute Steps
        for (let i = 0; i < 4; i++) {
            await wait(300);
            await logToTerminal(steps[i]);
            completeCurrentlyActiveStep(seqId);
            nextStep(seqId);
        }

        await wait(300);

        // SYNC POINT: Refresh DB state from disk before checking credentials
        await useEngine.getState().refresh();
        const engine = useEngine.getState(); // Get fresh state

        let result;
        if (type === 'login') {
            const { email, password } = credentials;
            result = engine.login(email, password);
        } else {
            const { email, password, name } = credentials;
            result = engine.register(email, password, name);
        }

        const dbPayload = result.success
            ? { index: 'idx_email_uniq', lock: 'SHARED', status: 'FOUND' }
            : { index: 'idx_email_uniq', lock: 'SHARED', error: result.error || 'User not found' };

        await logToTerminal({ ...steps[4], payload: dbPayload });

        if (result.success) {
            completeCurrentlyActiveStep(seqId, dbPayload); nextStep(seqId); // 5 waiting for next
            await wait(300); completeCurrentlyActiveStep(seqId, { session_id: `sess_${Math.random().toString(36).substring(7)}`, rotation: 'EdDSA' }); nextStep(seqId); // 6

            await wait(300); completeCurrentlyActiveStep(seqId, {
                status: 'AUTHORIZED',
                welcome: `Welcome, ${result.user?.name}!`
            }); // 7 (Response)
            return { success: true, user: result.user };
        } else {
            console.log('Login failed', result.error);
            const errorPayload = { error: result.error || 'Auth Failed' };
            // Mark DB step as error
            await logToTerminal({ ...steps[4], status: 'error', payload: errorPayload });
            failCurrentlyActiveStep(seqId, result.error || 'Authentication Failed');
            return { success: false, error: result.error };
        }
    }, [startSequence, nextStep, completeCurrentlyActiveStep, failCurrentlyActiveStep]); // Removed login/register form dep array as we get fresh from store


    const runSearchSequence = useCallback(async (query: string) => {
        const steps: SequenceStep[] = [
            {
                id: '1', label: 'DNS Lookup', source: 'UI', action: 'RESOLVE api.breakthru.dev',
                payload: { hostname: 'api.breakthru.dev', record: 'A', ttl: 3600 },
                status: 'pending', explanation: generateAiInsight("Resolving the service domain name to an IP address.")
            },
            {
                id: '2', label: 'Load Balancer', source: 'Server', action: 'NGINX_ROUTING',
                payload: { upstream: 'search_cluster_v3', weight: 80, health: 'OK' },
                status: 'pending', explanation: generateAiInsight("Distributing the search request to an available compute node.")
            },
            {
                id: '3', label: 'Query Engine', source: 'Server', action: 'NLP_TOKENIZE',
                payload: { tokens: query.split(' '), lang: 'en_US', stop_words_removed: true },
                status: 'pending', explanation: generateAiInsight("Processing your search query using natural language tokenization.")
            },
            {
                id: '4', label: 'Cache Sync', source: 'Server', action: 'LRU_CACHE_CHECK',
                payload: { key: `q:${query.toLowerCase()}`, namespace: 'products' },
                status: 'pending', explanation: generateAiInsight("Checking the high-speed cache for pre-computed search results.")
            },
            {
                id: '5', label: 'Database', source: 'DB', action: 'FULL_TEXT_INDEX_QUERY',
                payload: { index: 'gin_trgm_name', ts_query: query, limit: 50 },
                status: 'pending', explanation: generateAiInsight("Executing a weighted full-text search against the product catalog.")
            },
            {
                id: '6', label: 'Ranker', source: 'Server', action: 'RELEVANCE_SCORING',
                payload: { model: 'bm25', decay_factor: 0.15, personalized: false },
                status: 'pending', explanation: generateAiInsight("Sorting results based on relevance score and popularity.")
            },
            {
                id: '7', label: 'Analytics', source: 'Server', action: 'SEND_TELEMETRY',
                payload: { event: 'search_performed', term: query, results_count: 50 },
                status: 'pending', explanation: generateAiInsight("Logging search telemetry to improve future recommendations.")
            }
        ];

        const seqId = startSequence('search', steps);

        for (let i = 0; i < 4; i++) {
            await wait(300);
            await logToTerminal(steps[i]);
            completeCurrentlyActiveStep(seqId);
            nextStep(seqId);
        }

        await wait(300);
        const results = searchProducts(query);
        const dbPayload = {
            rows_returned: results.length,
            ids: results.map(r => r.id).slice(0, 5),
            latency: '14ms'
        };
        await logToTerminal({ ...steps[4], payload: dbPayload });
        completeCurrentlyActiveStep(seqId, dbPayload); nextStep(seqId); // 5

        await wait(300);
        const rankPayload = { top_relevance: results[0]?.name || 'N/A' };
        await logToTerminal({ ...steps[5], payload: rankPayload });
        completeCurrentlyActiveStep(seqId, rankPayload); nextStep(seqId); // 6

        await wait(300);
        const telPayload = { telemetry_id: `tel_${Math.random().toString(36).substring(7)}` };
        await logToTerminal({ ...steps[6], payload: telPayload });
        completeCurrentlyActiveStep(seqId, telPayload); // 7

        return results;
    }, [startSequence, nextStep, completeCurrentlyActiveStep, searchProducts]);


    const runPurchaseSequence = useCallback(async (productId: string) => {
        const product = getProduct(productId);
        if (!product) return;

        const steps: SequenceStep[] = [
            {
                id: '1', label: 'Cart Lock', source: 'Client', action: 'ACQUIRE_MUTEX',
                payload: { resource: `item:${productId}`, timeout: '5000ms' },
                status: 'pending', explanation: generateAiInsight("Locking the item in your session to prevent inventory drift.")
            },
            {
                id: '2', label: 'Stock Validator', source: 'Inventory', action: 'CHECK_STOCK_LEVELS',
                payload: { sku: productId, min_threshold: 1 },
                status: 'pending', explanation: generateAiInsight("Verifying that the item is physically available in the warehouse.")
            },
            {
                id: '3', label: 'Tax Engine', source: 'Server', action: 'CALCULATE_VAT',
                payload: { subtotal: product.price, region: 'GLOBAL', tax_rate: '15%' },
                status: 'pending', explanation: generateAiInsight("Calculating applicable taxes and duties for your region.")
            },
            {
                id: '4', label: 'Payment Gateway', source: 'Payment', action: 'STRIPE_CREATE_INTENT',
                payload: { amount: product.price * 100, currency: 'usd', capture: 'manual' },
                status: 'pending', explanation: generateAiInsight("Initializing a secure payment tunnel with Stripe.")
            },
            {
                id: '5', label: 'Fraud Detection', source: 'Server', action: 'ENTITY_RISK_SCORE',
                payload: { score: 0.02, threshold: 0.85, status: 'PASS' },
                status: 'pending', explanation: generateAiInsight("Analyzing transaction patterns to ensure security and prevent fraud.")
            },
            {
                id: '6', label: 'Payment Processor', source: 'Payment', action: 'STRIPE_CHARGE_CONFIRM',
                payload: { tx_id: `ch_${Math.random().toString(36).substring(7)}`, receipt_sent: true },
                status: 'pending', explanation: generateAiInsight("Confirming the final funds transfer and capturing the payment.")
            },
            {
                id: '7', label: 'Order Commit', source: 'DB', action: 'COMMIT_TRANSACTION',
                payload: { isolation: 'SERIALIZABLE', wal_sync: 'IMMEDIATE' },
                status: 'pending', explanation: generateAiInsight("Finalizing the order entry and updating permanent records.")
            },
            {
                id: '8', label: 'Notify', source: 'Gateway', action: 'SMTP_QUEUE_ORDER_CONFIRM',
                payload: { template: 'order_success', priority: 'high' },
                status: 'pending', explanation: generateAiInsight("Queueing your email confirmation and shipping notification.")
            }
        ];

        const seqId = startSequence('purchase', steps);

        await wait(300); await logToTerminal(steps[0]); completeCurrentlyActiveStep(seqId); nextStep(seqId); // 1

        // SYNC POINT: Refresh to get latest stock levels from disk
        await useEngine.getState().refresh();
        const freshProduct = useEngine.getState().getProduct(productId);

        if (!freshProduct) { // Should not happen if ID valid
            failCurrentlyActiveStep(seqId, 'Product Data Corruption');
            return { success: false };
        }

        await wait(300);
        if (freshProduct.stock === 0) {
            const errorPayload = { status: 'OUT_OF_STOCK', remaining: 0, error: 'INSUFFICIENT_QUANTITY' };
            await logToTerminal({ ...steps[1], status: 'error', payload: errorPayload });
            failCurrentlyActiveStep(seqId, 'INSUFFICIENT_STOCK_DETECTION');
            return { success: false, error: 'Out of stock' };
        }

        const dbPayload = { status: 'IN_STOCK', remaining: freshProduct.stock };
        await logToTerminal({ ...steps[1], payload: dbPayload });
        completeCurrentlyActiveStep(seqId, dbPayload); nextStep(seqId); // 2

        await wait(300);
        const taxPayload = { subtotal: product.price, tax: (product.price * 0.15).toFixed(2) };
        await logToTerminal({ ...steps[2], payload: taxPayload });
        completeCurrentlyActiveStep(seqId, taxPayload); nextStep(seqId); // 3

        await wait(300);
        const intentPayload = { intent_id: `pi_${crypto.randomUUID().substring(0, 8)}` };
        await logToTerminal({ ...steps[3], payload: intentPayload });
        completeCurrentlyActiveStep(seqId, intentPayload); nextStep(seqId); // 4

        await wait(300); await logToTerminal(steps[4]); completeCurrentlyActiveStep(seqId); nextStep(seqId); // 5

        await wait(300);
        const procPayload = { response: 'CONFIRMED' };
        await logToTerminal({ ...steps[5], payload: procPayload });
        completeCurrentlyActiveStep(seqId, procPayload); nextStep(seqId); // 6

        await wait(300);
        const commitPayload = { order_uuid: crypto.randomUUID() };
        await logToTerminal({ ...steps[6], payload: commitPayload });
        completeCurrentlyActiveStep(seqId, commitPayload); nextStep(seqId); // 7

        await wait(300); await logToTerminal({ ...steps[7], payload: { email: 'sent' } }); completeCurrentlyActiveStep(seqId); // 8

        return { success: true };
    }, [startSequence, nextStep, completeCurrentlyActiveStep, getProduct]);

    const runCartSequence = useCallback(async (action: 'add' | 'remove', product: Product) => {
        const steps: SequenceStep[] = [
            {
                id: '1', label: 'Cart Engine', source: 'UI', action: `DISPATCH_CART_${action.toUpperCase()}`,
                payload: { item_id: product.id, product: product.name },
                status: 'pending', explanation: generateAiInsight(`Updating your local shopping context: ${action} ${product.name}`)
            },
            {
                id: '2', label: 'State Manager', source: 'Client', action: 'SYNC_REDUX_PERSIST',
                payload: { storage: 'indexedDB', namespace: 'cart_cache' },
                status: 'pending', explanation: generateAiInsight("Syncing the cart update to local persistent storage.")
            },
            {
                id: '3', label: 'Backend Sync', source: 'Server', action: 'PATCH /api/v1/cart/sync',
                payload: { action, diff: 1, session_id: 'sess_81a' },
                status: 'pending', explanation: generateAiInsight("Transmitting cart delta to the cloud for cross-device synchronization.")
            },
            {
                id: '4', label: 'Reco Service', source: 'Server', action: 'FETCH_RECOMMENDATIONS',
                payload: { based_on: product.category, limit: 3 },
                status: 'pending', explanation: generateAiInsight("Updating real-time product recommendations based on your selection.")
            },
            {
                id: '5', label: 'Update UI', source: 'UI', action: 'INVALIDATE_CART_VIEW',
                payload: { re_render: true, animation: 'slide_in' },
                status: 'pending', explanation: generateAiInsight("Refreshing the interface to reflect your updated shopping cart.")
            }
        ];

        const seqId = startSequence('cart', steps);

        await wait(300); completeCurrentlyActiveStep(seqId); nextStep(seqId); // 1
        await wait(300); completeCurrentlyActiveStep(seqId); nextStep(seqId); // 2

        await wait(300);
        if (action === 'add') addToCart(product);
        else removeFromCart(product.id);
        completeCurrentlyActiveStep(seqId, { server_synced: true }); nextStep(seqId); // 3

        await wait(300); completeCurrentlyActiveStep(seqId, { reco_count: 3 }); nextStep(seqId); // 4
        await wait(300); completeCurrentlyActiveStep(seqId, {
            re_render: true,
            new_count: useEngine.getState().cart.reduce((a, b) => a + b.quantity, 0)
        }); // 5
    }, [startSequence, nextStep, completeCurrentlyActiveStep, addToCart, removeFromCart]);

    const runFilterSequence = useCallback(async (category: string) => {
        const steps: SequenceStep[] = [
            { id: '1', label: 'Route Guard', source: 'Gateway', action: 'VALIDATE_QUERY_PARAMS', payload: { category }, status: 'pending', explanation: generateAiInsight(`Validating filter parameters for: ${category}`) },
            { id: '2', label: 'Logic Processor', source: 'Client', action: 'CLIENT_SIDE_SORT', payload: { algorithm: 'quicksort', field: 'price' }, status: 'pending', explanation: generateAiInsight("Applying high-performance sorting logic to the product list.") },
            { id: '3', label: 'Layout Engine', source: 'UI', action: 'VIRTUALIZED_LIST_REFRESH', status: 'pending', explanation: generateAiInsight("Updating the virtualized list view for optimal performance.") }
        ];

        const seqId = startSequence('search', steps); // Re-use search flow type

        await wait(300); completeCurrentlyActiveStep(seqId); nextStep(seqId);
        await wait(300); completeCurrentlyActiveStep(seqId); nextStep(seqId);
        await wait(300); completeCurrentlyActiveStep(seqId);
    }, [startSequence, nextStep, completeCurrentlyActiveStep]);

    const runLogoutSequence = useCallback(async () => {
        const steps: SequenceStep[] = [
            { id: '1', label: 'Sign Out', source: 'UI', action: 'CLEAR_LOCAL_STORAGE', payload: { keys: ['auth_token', 'user_session'] }, status: 'pending', explanation: generateAiInsight("Clearing your secure credentials from the browser storage.") },
            { id: '2', label: 'Auth Bridge', source: 'Server', action: 'REVOKE_SESSION', payload: { reason: 'user_initiated', timestamp: new Date().toISOString() }, status: 'pending', explanation: generateAiInsight("Notifying the server to invalidate your current active session.") },
            { id: '3', label: 'Logic', source: 'Auth Service', action: 'BLACK_LIST_JWT', payload: { fingerprint: 'fp_92k', ttl: '24h' }, status: 'pending', explanation: generateAiInsight("Adding your token to the global blacklist to prevent unauthorized reuse.") },
            { id: '4', label: 'DB Sync', source: 'DB', action: 'LOG_LOGOUT_EVENT', payload: { user_id: 'u1', audit: 'SUCCESS' }, status: 'pending', explanation: generateAiInsight("Recording the sign-out event in the security audit logs.") },
            { id: '5', label: 'Redirect', source: 'UI', action: 'REPLACE_HISTORY_PUSH', payload: { next: '/login' }, status: 'pending', explanation: generateAiInsight("Redirecting you back to the login screen for maximum security.") }
        ];

        const seqId = startSequence('auth_login', steps);

        await wait(300); completeCurrentlyActiveStep(seqId); nextStep(seqId); // 1
        await wait(300); completeCurrentlyActiveStep(seqId); nextStep(seqId); // 2

        logout();

        await wait(300); completeCurrentlyActiveStep(seqId); nextStep(seqId); // 3
        await wait(300); completeCurrentlyActiveStep(seqId); nextStep(seqId); // 4
        await wait(300); completeCurrentlyActiveStep(seqId); // 5
    }, [startSequence, nextStep, completeCurrentlyActiveStep, logout]);

    return {
        runAuthSequence,
        runSearchSequence,
        runPurchaseSequence,
        runCartSequence,
        runFilterSequence,
        runLogoutSequence,
        wait
    };
};
