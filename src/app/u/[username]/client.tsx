"use client";

import { useState, useCallback } from "react";
import { ProfileHeader, CollectionGrid } from "@/components/profile";
import { SwiperOverlay } from "@/components/swiper/SwiperOverlay";
import { SearchModal } from "@/components/search/SearchModal";
import { SettingsMenu, SettingsButton } from "@/components/ui";
import type { Collection, TextureType, MediaItem, SwipeDirection } from "@/types";


interface ProfileData {
    id: string;
    username: string;
    name: string | null;
    image: string | null;
    bio: string | null;
    accentColor: string;
    bgTexture: string;
    collections: Collection[];
}

interface UserProfileClientProps {
    profile: ProfileData;
    isOwner: boolean;
}

export function UserProfileClient({ profile, isOwner }: UserProfileClientProps) {
    const [user, setUser] = useState(profile);
    const [activeCollection, setActiveCollection] = useState<Collection | null>(null);
    const [searchOpen, setSearchOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Update accent color
    const handleColorChange = async (color: string) => {
        if (!isOwner) return;
        setUser({ ...user, accentColor: color });
        setIsSaving(true);
        try {
            await fetch(`/api/users/${user.username}`, {
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
        if (!isOwner) return;
        setUser({ ...user, bgTexture: texture });
        setIsSaving(true);
        try {
            await fetch(`/api/users/${user.username}`, {
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

    // Add to collection
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
                body: JSON.stringify(item),
            });

            if (res.ok) {
                const newItem = await res.json();
                // Update local state
                setUser({
                    ...user,
                    collections: user.collections.map((c) => {
                        if (c.id === collectionId) {
                            return {
                                ...c,
                                items: [...(c.items || []), newItem],
                                coverImage: c.coverImage || item.image,
                            };
                        }
                        return c;
                    }),
                });
            }
        } catch (error) {
            console.error("Failed to add item:", error);
            throw error;
        }
    };

    // Handle swipe action (visitors can save items)
    const handleSwipe = async (item: MediaItem, direction: SwipeDirection) => {
        if (direction === "right") {
            // Save to user's saved items
            try {
                await fetch("/api/saved-items", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        externalId: item.externalId,
                        type: item.type,
                        title: item.title,
                        image: item.image,
                    }),
                });
            } catch (error) {
                console.error("Failed to save item:", error);
            }
        }
    };

    const textureClass = `texture-${user.bgTexture}`;

    return (
        <div
            className={`min-h-screen ${textureClass}`}
            style={{ "--accent": hexToHsl(user.accentColor) } as React.CSSProperties}
        >
            <main className="max-w-5xl mx-auto px-4 py-12 md:py-16 relative z-10">
                {/* Top Bar */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex-1">
                        {!isOwner && (
                            <span className="text-sm text-[hsl(var(--text-muted))] px-3 py-1.5 rounded-full bg-[hsl(var(--surface-raised))]">
                                Viewing {user.name || user.username}&apos;s profile
                            </span>
                        )}
                    </div>
                    {isOwner && (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSearchOpen(true)}
                                className="p-2.5 rounded-xl glass hover:bg-[hsl(var(--surface-overlay))] transition-colors group"
                                aria-label="Search"
                            >
                                <svg
                                    className="w-5 h-5 text-[hsl(var(--text-secondary))] group-hover:text-[hsl(var(--text-primary))]"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.5}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                            </button>
                            <SettingsButton onClick={() => setSettingsOpen(true)} />
                        </div>
                    )}
                </div>

                {/* Profile Header */}
                <ProfileHeader
                    username={user.username}
                    name={user.name}
                    image={user.image}
                    accentColor={user.accentColor}
                    isOwner={isOwner}
                />

                {/* Bio */}
                {user.bio && (
                    <p className="text-center text-[hsl(var(--text-muted))] max-w-xl mx-auto mt-4 mb-8">
                        {user.bio}
                    </p>
                )}

                {/* Collections Grid */}
                {user.collections.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[hsl(var(--surface-raised))] flex items-center justify-center text-4xl opacity-50">
                            📚
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No collections yet</h3>
                        <p className="text-[hsl(var(--text-muted))] mb-6">
                            {isOwner ? "Start building your taste profile" : "This user hasn't added any collections yet"}
                        </p>
                        {isOwner && (
                            <button
                                onClick={() => setSearchOpen(true)}
                                className="px-6 py-3 rounded-xl font-medium transition-colors"
                                style={{ backgroundColor: user.accentColor, color: "white" }}
                            >
                                Add your first item
                            </button>
                        )}
                    </div>
                ) : (
                    <CollectionGrid
                        collections={user.collections}
                        accentColor={user.accentColor}
                        isOwner={isOwner}
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
            </main>

            {/* Owner-only modals */}
            {isOwner && (
                <>
                    <SearchModal
                        isOpen={searchOpen}
                        onClose={() => setSearchOpen(false)}
                        collections={user.collections}
                        accentColor={user.accentColor}
                        onAddToCollection={handleAddToCollection}
                    />

                    <SettingsMenu
                        isOpen={settingsOpen}
                        onClose={() => setSettingsOpen(false)}
                        currentColor={user.accentColor}
                        currentTexture={user.bgTexture as TextureType}
                        onColorChange={handleColorChange}
                        onTextureChange={handleTextureChange}
                        isSaving={isSaving}
                    />
                </>
            )}

            {/* Swiper for everyone */}
            {activeCollection && activeCollection.items && activeCollection.items.length > 0 && (
                <SwiperOverlay
                    collection={activeCollection}
                    accentColor={user.accentColor}
                    onClose={() => setActiveCollection(null)}
                    onSwipe={handleSwipe}
                />
            )}
        </div>
    );
}

// Helper to convert hex color to HSL values
function hexToHsl(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return "239 84% 67%";

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
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
