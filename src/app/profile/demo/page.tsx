"use client";

import { useState, useEffect, useCallback } from "react";
import { ProfileHeader, CollectionGrid } from "@/components/profile";
import { SwiperOverlay } from "@/components/swiper/SwiperOverlay";
import { SearchModal } from "@/components/search/SearchModal";
import { SettingsMenu, SettingsButton } from "@/components/ui";
import type { Collection, TextureType } from "@/types";


interface User {
    id: string;
    username: string;
    name: string | null;
    image: string | null;
    accentColor: string;
    bgTexture: TextureType;
    collections: Collection[];
}

export default function DemoProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeCollection, setActiveCollection] = useState<Collection | null>(null);
    const [searchOpen, setSearchOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch user data from API
    const fetchUser = useCallback(async () => {
        try {
            const res = await fetch("/api/user");
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            }
        } catch (error) {
            console.error("Failed to fetch user:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    // Update accent color
    const handleColorChange = async (color: string) => {
        if (!user) return;

        // Optimistic update
        setUser({ ...user, accentColor: color });
        setIsSaving(true);

        try {
            await fetch("/api/user", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accentColor: color }),
            });
        } catch (error) {
            console.error("Failed to update color:", error);
        } finally {
            setIsSaving(false);
        }
    };

    // Update texture
    const handleTextureChange = async (texture: TextureType) => {
        if (!user) return;

        // Optimistic update
        setUser({ ...user, bgTexture: texture });
        setIsSaving(true);

        try {
            await fetch("/api/user", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bgTexture: texture }),
            });
        } catch (error) {
            console.error("Failed to update texture:", error);
        } finally {
            setIsSaving(false);
        }
    };

    // Add item to collection
    const handleAddToCollection = async (item: {
        externalId: string;
        type: string;
        title: string;
        image: string | null;
        year: string | null;
        rating: number | null;
        metadata?: string;
    }, collectionId: string) => {
        try {
            const res = await fetch(`/api/collections/${collectionId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    externalId: item.externalId,
                    type: item.type,
                    title: item.title,
                    image: item.image,
                    year: item.year,
                    rating: item.rating,
                    metadata: item.metadata,
                }),
            });

            if (res.ok) {
                // Refresh user data to get updated collections
                await fetchUser();
            }
        } catch (error) {
            console.error("Failed to add item:", error);
            throw error;
        }
    };


    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin border-indigo-500" />
            </div>
        );
    }

    // No user found
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-[hsl(var(--text-muted))]">Failed to load profile</p>
            </div>
        );
    }

    const textureClass = `texture-${user.bgTexture}`;

    return (
        <div
            className={`min-h-screen ${textureClass}`}
            style={
                {
                    "--accent": hexToHsl(user.accentColor),
                } as React.CSSProperties
            }
        >
            <main className="max-w-5xl mx-auto px-4 py-12 md:py-16 relative z-10">
                {/* Top Bar */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex-1" />
                    <div className="flex items-center gap-3">
                        {/* Search Button */}
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="p-2.5 rounded-xl glass hover:bg-[hsl(var(--surface-overlay))] 
                                       transition-colors group"
                            aria-label="Search"
                        >
                            <svg
                                className="w-5 h-5 text-[hsl(var(--text-secondary))] group-hover:text-[hsl(var(--text-primary))]"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                                />
                            </svg>
                        </button>
                        {/* Settings Button */}
                        <SettingsButton onClick={() => setSettingsOpen(true)} />
                    </div>
                </div>

                {/* Profile Header */}
                <ProfileHeader
                    username={user.username}
                    name={user.name}
                    image={user.image}
                    accentColor={user.accentColor}
                    isOwner={true}
                />

                {/* Collections Grid */}
                {user.collections.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[hsl(var(--surface-raised))]
                                        flex items-center justify-center text-4xl opacity-50">
                            📚
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No collections yet</h3>
                        <p className="text-[hsl(var(--text-muted))] mb-6">
                            Search for movies and start building your profile
                        </p>
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="px-6 py-3 rounded-xl font-medium transition-colors"
                            style={{ backgroundColor: user.accentColor, color: "white" }}
                        >
                            Add your first movie
                        </button>
                    </div>
                ) : (
                    <CollectionGrid
                        collections={user.collections}
                        accentColor={user.accentColor}
                        isOwner={true}
                        onCollectionClick={(collection) => setActiveCollection(collection)}
                        onAddCollection={() => setSearchOpen(true)}
                    />
                )}

                {/* Stats */}
                {user.collections.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-[hsl(var(--border-subtle))]">
                        <div className="flex gap-8 justify-center text-center">
                            <div>
                                <p className="text-2xl font-bold">{user.collections.length}</p>
                                <p className="text-sm text-[hsl(var(--text-muted))]">Collections</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {user.collections.reduce((sum, c) => sum + (c.items?.length || 0), 0)}
                                </p>
                                <p className="text-sm text-[hsl(var(--text-muted))]">Items</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Keyboard shortcut hint */}
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 text-xs text-[hsl(var(--text-muted))]">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-[hsl(var(--surface-raised))] mx-1">⌘</kbd>+
                    <kbd className="px-1.5 py-0.5 rounded bg-[hsl(var(--surface-raised))] mx-1">K</kbd> to search
                </div>
            </main>

            {/* Search Modal */}
            <SearchModal
                isOpen={searchOpen}
                onClose={() => setSearchOpen(false)}
                collections={user.collections}
                accentColor={user.accentColor}
                onAddToCollection={handleAddToCollection}
            />

            {/* Settings Menu */}
            <SettingsMenu
                isOpen={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                currentColor={user.accentColor}
                currentTexture={user.bgTexture}
                onColorChange={handleColorChange}
                onTextureChange={handleTextureChange}
                isSaving={isSaving}
            />

            {/* Swiper Overlay */}
            {activeCollection && activeCollection.items && activeCollection.items.length > 0 && (
                <SwiperOverlay
                    collection={activeCollection}
                    accentColor={user.accentColor}
                    onClose={() => setActiveCollection(null)}
                />
            )}
        </div>
    );
}

// Helper to convert hex color to HSL values for CSS variable
function hexToHsl(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return "239 84% 67%"; // Default indigo

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                break;
            case g:
                h = ((b - r) / d + 2) / 6;
                break;
            case b:
                h = ((r - g) / d + 4) / 6;
                break;
        }
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
