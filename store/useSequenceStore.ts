import { create } from 'zustand';

export interface SequenceStep {
    id: string;
    label: string;
    source: string; // e.g., "UI", "Server", "DB"
    target?: string;
    action: string; // e.g., "POST /api/login", "SELECT *"
    payload?: any; // e.g., JSON body or SQL query
    explanation?: string; // AI Model Explanation
    status: 'pending' | 'active' | 'completed' | 'error';
    timestamp?: number;
    duration?: number;
}

interface SequenceState {
    isVisualizing: boolean;
    isLooping: boolean;
    activeSequenceType: string | null;
    sequenceId: string | null; // NEW: Unique ID for the current running sequence
    steps: SequenceStep[];
    currentStepIndex: number;
    history: { type: string; steps: SequenceStep[], timestamp: number }[];

    viewMode: 'flow' | 'step';

    // Actions
    startSequence: (type: string, steps: SequenceStep[]) => string; // Returns the new sequenceId
    nextStep: (seqId: string) => void;
    completeCurrentlyActiveStep: (seqId: string, payload?: any) => void;
    failCurrentlyActiveStep: (seqId: string, error?: string) => void;
    resetVisualizer: () => void;
    clearHistory: () => void;
    toggleLooping: () => void;
    setViewMode: (mode: 'flow' | 'step') => void;
}

export const useSequenceStore = create<SequenceState>((set, get) => ({
    isVisualizing: false,
    isLooping: false,
    activeSequenceType: null,
    sequenceId: null,
    steps: [],
    currentStepIndex: -1,
    history: [],
    viewMode: 'flow',

    startSequence: (type, steps) => {
        // Archive current if exists
        const currentHist = get().history;
        const currentSteps = get().steps;
        if (currentSteps.length > 0 && get().currentStepIndex >= 0) {
            // Ideally we could archive the interrupted sequence here if we wanted
        }

        const newId = Math.random().toString(36).substring(7);

        set({
            isVisualizing: true,
            activeSequenceType: type,
            sequenceId: newId,
            steps: steps.map(s => ({ ...s, status: 'pending' })),
            currentStepIndex: 0,
        });

        // Set first step to active
        set(state => {
            const newSteps = [...state.steps];
            if (newSteps.length > 0) newSteps[0].status = 'active';
            return { steps: newSteps };
        });

        return newId;
    },

    nextStep: (seqId) => {
        if (get().sequenceId !== seqId) return; // Abort if sequence changed

        set((state) => {
            const nextIndex = state.currentStepIndex + 1;
            if (nextIndex >= state.steps.length) {
                // Sequence Complete
                return {
                    isVisualizing: false,
                    history: [{ type: state.activeSequenceType!, steps: state.steps, timestamp: Date.now() }, ...state.history]
                };
            }

            const newSteps = [...state.steps];
            newSteps[nextIndex].status = 'active';
            return {
                currentStepIndex: nextIndex,
                steps: newSteps
            };
        });
    },

    completeCurrentlyActiveStep: (seqId, payload) => {
        if (get().sequenceId !== seqId) return;

        set((state) => {
            if (state.currentStepIndex < 0 || state.currentStepIndex >= state.steps.length) return {};

            const newSteps = [...state.steps];
            const step = newSteps[state.currentStepIndex];
            step.status = 'completed';
            if (payload) step.payload = { ...step.payload, ...payload };

            return { steps: newSteps };
        });
    },

    failCurrentlyActiveStep: (seqId, error) => {
        if (get().sequenceId !== seqId) return;

        set((state) => {
            if (state.currentStepIndex < 0) return {};
            const newSteps = [...state.steps];
            newSteps[state.currentStepIndex].status = 'error';
            newSteps[state.currentStepIndex].payload = { ...newSteps[state.currentStepIndex].payload, error };
            return {
                steps: newSteps,
                isVisualizing: false // Stop on error
            };
        });
    },

    resetVisualizer: () => set({
        isVisualizing: false,
        isLooping: false,
        activeSequenceType: null,
        sequenceId: null,
        steps: [],
        currentStepIndex: -1
    }),

    clearHistory: () => set({ history: [] }),

    toggleLooping: () => set(state => ({ isLooping: !state.isLooping })),

    setViewMode: (mode: 'flow' | 'step') => set({ viewMode: mode })
}));
