"use client";

import Image from "next/image";
import type { Collection, MediaItem } from "@/types";

// Helper to get unique types from collection items
function getUniqueTypes(items: MediaItem[]): string[] {
    if (!items || items.length === 0) return [];
    const types = new Set(items.map((item) => item.type));
    return Array.from(types);
}

interface CollectionCardProps {
    collection: Collection;
    accentColor: string;
    onClick: () => void;
}

export function CollectionCard({
    collection,
    accentColor,
    onClick,
}: CollectionCardProps) {
    const itemCount = collection.items.length;
    const coverImage = collection.coverImage || collection.items[0]?.image;

    return (
        <button
            onClick={onClick}
            className="group relative aspect-square rounded-2xl overflow-hidden 
                 bg-[hsl(var(--surface-raised))] card-hover
                 border border-[hsl(var(--border-subtle))]
                 focus:outline-none focus-visible:ring-2"
            style={{ "--tw-ring-color": accentColor } as React.CSSProperties}
        >
            {/* Cover Image */}
            {coverImage ? (
                <Image
                    src={coverImage}
                    alt={collection.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-300 
                     group-hover:scale-105"
                />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                    <CollectionIcon type={collection.type} className="w-12 h-12 opacity-30" />
                </div>
            )}

            {/* Gradient Overlay */}
            <div
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent
                   opacity-80 group-hover:opacity-90 transition-opacity"
            />

            {/* Content */}
            <div className="absolute inset-0 p-4 flex flex-col justify-end">
                <h3 className="font-semibold text-white text-lg leading-tight">
                    {collection.name}
                </h3>
                <p className="text-white/70 text-sm mt-1">
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                </p>
            </div>

            {/* Type Badges - Show unique types from items */}
            <div className="absolute top-3 right-3 flex gap-1.5">
                {getUniqueTypes(collection.items).map((type) => (
                    <span
                        key={type}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase
                            ${type === "anime" ? "bg-pink-500/80 text-white" :
                                type === "game" ? "bg-green-500/80 text-white" :
                                    type === "movie" ? "bg-blue-500/80 text-white" :
                                        type === "music" ? "bg-purple-500/80 text-white" :
                                            "bg-gray-500/80 text-white"}`}
                    >
                        {type}
                    </span>
                ))}
            </div>
        </button>
    );
}

// Empty slot for adding new collections
export function EmptyCollectionSlot({
    position,
    accentColor,
    onClick,
}: {
    position: number;
    accentColor: string;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="aspect-square rounded-2xl border-2 border-dashed
                 border-[hsl(var(--border))] hover:border-[hsl(var(--text-muted))]
                 flex flex-col items-center justify-center gap-2
                 text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-secondary))]
                 transition-colors group"
        >
            <svg
                className="w-8 h-8 opacity-50 group-hover:opacity-70 transition-opacity"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                />
            </svg>
            <span className="text-sm font-medium">Add Collection</span>
        </button>
    );
}

// Collection type icons
function CollectionIcon({
    type,
    className,
}: {
    type: string;
    className?: string;
}) {
    const icons: Record<string, JSX.Element> = {
        movie: (
            <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
        ),
        music: (
            <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
        ),
        game: (
            <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
            </svg>
        ),
        anime: (
            <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
            </svg>
        ),
        book: (
            <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
        ),
    };

    return icons[type] || icons.movie;
}
