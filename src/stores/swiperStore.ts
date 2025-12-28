import { create } from "zustand";
import type { Collection, MediaItem, SwipeDirection, SwipeAction } from "@/types";

interface SwiperState {
    // Currently open collection
    activeCollection: Collection | null;

    // Current item index in the collection
    currentIndex: number;

    // History of swipe actions (for undo)
    swipeHistory: SwipeAction[];

    // Actions
    openCollection: (collection: Collection) => void;
    closeSwiper: () => void;
    swipe: (direction: SwipeDirection) => void;
    undo: () => void;
    reset: () => void;

    // Getters
    getCurrentItem: () => MediaItem | null;
    getProgress: () => { current: number; total: number };
}

export const useSwiperStore = create<SwiperState>((set, get) => ({
    activeCollection: null,
    currentIndex: 0,
    swipeHistory: [],

    openCollection: (collection) =>
        set({
            activeCollection: collection,
            currentIndex: 0,
            swipeHistory: [],
        }),

    closeSwiper: () =>
        set({
            activeCollection: null,
            currentIndex: 0,
        }),

    swipe: (direction) =>
        set((state) => {
            if (!state.activeCollection) return state;

            const currentItem = state.activeCollection.items[state.currentIndex];
            if (!currentItem) return state;

            const action: SwipeAction = {
                direction,
                item: currentItem,
                timestamp: new Date(),
            };

            const nextIndex = state.currentIndex + 1;
            const hasMore = nextIndex < state.activeCollection.items.length;

            return {
                currentIndex: hasMore ? nextIndex : state.currentIndex,
                swipeHistory: [...state.swipeHistory, action],
                // Close if no more items
                activeCollection: hasMore ? state.activeCollection : null,
            };
        }),

    undo: () =>
        set((state) => {
            if (state.swipeHistory.length === 0) return state;

            const newHistory = [...state.swipeHistory];
            newHistory.pop();

            return {
                currentIndex: Math.max(0, state.currentIndex - 1),
                swipeHistory: newHistory,
            };
        }),

    reset: () =>
        set({
            activeCollection: null,
            currentIndex: 0,
            swipeHistory: [],
        }),

    getCurrentItem: () => {
        const state = get();
        if (!state.activeCollection) return null;
        return state.activeCollection.items[state.currentIndex] || null;
    },

    getProgress: () => {
        const state = get();
        if (!state.activeCollection) return { current: 0, total: 0 };
        return {
            current: state.currentIndex + 1,
            total: state.activeCollection.items.length,
        };
    },
}));
