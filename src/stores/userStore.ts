import { create } from "zustand";
import type { User, Collection, MediaItem, SavedItem, TextureType } from "@/types";

interface UserState {
    // Current user (null if not logged in)
    user: User | null;

    // Saved items from swiping
    savedItems: SavedItem[];

    // Actions
    setUser: (user: User | null) => void;
    updateAccentColor: (color: string) => void;
    updateTexture: (texture: TextureType) => void;

    // Collection actions
    addCollection: (collection: Collection) => void;
    removeCollection: (collectionId: string) => void;

    // Saved items actions
    saveItem: (item: MediaItem) => void;
    unsaveItem: (itemId: string) => void;
    isSaved: (externalId: string, type: string) => boolean;
}

export const useUserStore = create<UserState>((set, get) => ({
    user: null,
    savedItems: [],

    setUser: (user) => set({ user }),

    updateAccentColor: (color) =>
        set((state) => ({
            user: state.user ? { ...state.user, accentColor: color } : null,
        })),

    updateTexture: (texture) =>
        set((state) => ({
            user: state.user ? { ...state.user, bgTexture: texture } : null,
        })),

    addCollection: (collection) =>
        set((state) => ({
            user: state.user
                ? { ...state.user, collections: [...state.user.collections, collection] }
                : null,
        })),

    removeCollection: (collectionId) =>
        set((state) => ({
            user: state.user
                ? {
                    ...state.user,
                    collections: state.user.collections.filter((c) => c.id !== collectionId),
                }
                : null,
        })),

    saveItem: (item) =>
        set((state) => {
            // Check if already saved
            const exists = state.savedItems.some(
                (s) => s.externalId === item.externalId && s.type === item.type
            );
            if (exists) return state;

            const savedItem: SavedItem = {
                id: `saved-${Date.now()}`,
                externalId: item.externalId,
                type: item.type,
                title: item.title,
                image: item.image,
                savedAt: new Date(),
            };

            return { savedItems: [...state.savedItems, savedItem] };
        }),

    unsaveItem: (itemId) =>
        set((state) => ({
            savedItems: state.savedItems.filter((s) => s.id !== itemId),
        })),

    isSaved: (externalId, type) => {
        return get().savedItems.some(
            (s) => s.externalId === externalId && s.type === type
        );
    },
}));
