"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import Image from "next/image";
import type { Collection, MediaItem, SwipeDirection } from "@/types";

interface SwiperOverlayProps {
    collection: Collection;
    accentColor: string;
    onClose: () => void;
    onSwipe?: (item: MediaItem, direction: SwipeDirection) => void;
}

export function SwiperOverlay({
    collection,
    accentColor,
    onClose,
    onSwipe,
}: SwiperOverlayProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [exitDirection, setExitDirection] = useState<SwipeDirection | null>(null);

    const items = collection.items;
    const currentItem = items[currentIndex];
    const hasMore = currentIndex < items.length - 1;

    // Extract dominant color from poster (simplified - uses accent as fallback)
    const auraColor = useMemo(() => {
        const colors = [
            "rgba(99, 102, 241, 0.12)",
            "rgba(236, 72, 153, 0.12)",
            "rgba(168, 85, 247, 0.12)",
            "rgba(59, 130, 246, 0.12)",
            "rgba(20, 184, 166, 0.12)",
        ];
        return colors[currentIndex % colors.length];
    }, [currentIndex]);

    const handleSwipe = useCallback(
        (direction: SwipeDirection) => {
            setExitDirection(direction);
            onSwipe?.(currentItem, direction);

            setTimeout(() => {
                if (hasMore) {
                    setCurrentIndex((prev) => prev + 1);
                    setExitDirection(null);
                } else {
                    onClose();
                }
            }, 300);
        },
        [currentItem, hasMore, onClose, onSwipe]
    );

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case "ArrowLeft":
                    handleSwipe("left");
                    break;
                case "ArrowRight":
                    handleSwipe("right");
                    break;
                case "ArrowDown":
                    handleSwipe("down");
                    break;
                case "Escape":
                    onClose();
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleSwipe, onClose]);

    // Prevent body scroll
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

    if (!currentItem) {
        return null;
    }

    // Parse metadata for display
    const metadata = currentItem.metadata ? JSON.parse(currentItem.metadata) : null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
        >
            {/* Backdrop with Aura Effect */}
            <div className="absolute inset-0 bg-black/95">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                    style={{
                        background: `
                            radial-gradient(ellipse 80% 60% at 50% 40%, ${auraColor} 0%, transparent 70%),
                            radial-gradient(ellipse 60% 80% at 30% 60%, ${auraColor} 0%, transparent 60%),
                            radial-gradient(ellipse 60% 80% at 70% 60%, ${auraColor} 0%, transparent 60%)
                        `,
                    }}
                />
                {currentItem.image && (
                    <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage: `url(${currentItem.image})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            filter: "blur(100px) saturate(1.5)",
                        }}
                    />
                )}
            </div>

            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* Progress indicator */}
            <div className="absolute top-6 left-6 z-10 flex gap-1.5">
                {items.map((_, idx) => (
                    <div
                        key={idx}
                        className={`h-1 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-8 bg-white" : idx < currentIndex ? "w-4 bg-white/50" : "w-4 bg-white/20"
                            }`}
                    />
                ))}
            </div>

            {/* Collection name */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
                <h2 className="text-white/70 text-sm font-medium backdrop-blur-sm px-4 py-1.5 rounded-full bg-white/5">
                    {collection.name}
                </h2>
            </div>

            {/* Counter */}
            <div className="absolute top-6 right-20 z-10 text-white/50 text-sm">
                {currentIndex + 1} / {items.length}
            </div>

            {/* Main Content - Card + Review Panel */}
            <div className="relative flex gap-6 max-w-5xl mx-4 items-center">
                {/* Swipe Card */}
                <div className="relative w-full max-w-sm aspect-[2/3]">
                    <AnimatePresence mode="wait">
                        {currentItem && !exitDirection && (
                            <SwipeCard
                                key={currentItem.id}
                                item={currentItem}
                                accentColor={accentColor}
                                onSwipe={handleSwipe}
                                metadata={metadata}
                            />
                        )}
                    </AnimatePresence>
                </div>

                {/* Review Panel (Desktop only) */}
                <motion.div
                    key={`review-${currentIndex}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="hidden lg:flex flex-col w-80 text-white"
                >
                    {/* Title & Year - Serif font for elegance */}
                    <h3 className="text-3xl font-bold tracking-tight mb-1" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                        {currentItem.title}
                    </h3>
                    <div className="flex items-center gap-3 text-white/60 text-sm mb-6">
                        {currentItem.year && <span>{currentItem.year}</span>}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase
                            ${currentItem.type === "anime" ? "bg-pink-500/20 text-pink-300" :
                                currentItem.type === "manga" ? "bg-orange-500/20 text-orange-300" :
                                    currentItem.type === "game" ? "bg-green-500/20 text-green-300" :
                                        currentItem.type === "book" ? "bg-amber-600/20 text-amber-300" :
                                            currentItem.type === "art" ? "bg-purple-500/20 text-purple-300" :
                                                "bg-blue-500/20 text-blue-300"}`}>
                            {currentItem.type}
                        </span>
                    </div>

                    {/* Metadata (Creator by type) */}
                    {metadata && (
                        <div className="mb-6">
                            {/* Anime: Studio */}
                            {metadata.studio && (
                                <p className="text-white/50 text-sm">
                                    <span className="text-white/30">Studio </span>{metadata.studio}
                                </p>
                            )}
                            {/* Game: Developer */}
                            {metadata.developer && (
                                <p className="text-white/50 text-sm">
                                    <span className="text-white/30">Developer </span>{metadata.developer}
                                </p>
                            )}
                            {/* Manga: Mangaka */}
                            {metadata.mangaka && (
                                <p className="text-white/50 text-sm">
                                    <span className="text-white/30">Mangaka </span>{metadata.mangaka}
                                </p>
                            )}
                            {/* Book: Author */}
                            {metadata.author && (
                                <p className="text-white/50 text-sm">
                                    <span className="text-white/30">Author </span>{metadata.author}
                                </p>
                            )}
                            {/* Art: Artist */}
                            {metadata.artist && (
                                <p className="text-white/50 text-sm">
                                    <span className="text-white/30">Artist </span>{metadata.artist}
                                </p>
                            )}
                            {/* Volumes for Manga */}
                            {metadata.volumes && (
                                <p className="text-white/40 text-xs mt-1">
                                    {metadata.volumes} volumes{metadata.chapters ? `, ${metadata.chapters} chapters` : ''}
                                </p>
                            )}
                            {/* Genres */}
                            {metadata.genres && metadata.genres.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {metadata.genres.slice(0, 3).map((genre: string) => (
                                        <span
                                            key={genre}
                                            className="px-2 py-0.5 rounded-full text-xs bg-white/5 text-white/50"
                                        >
                                            {genre}
                                        </span>
                                    ))}
                                </div>
                            )}
                            {/* Categories for Books */}
                            {metadata.categories && metadata.categories.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {metadata.categories.slice(0, 2).map((cat: string) => (
                                        <span
                                            key={cat}
                                            className="px-2 py-0.5 rounded-full text-xs bg-white/5 text-white/50"
                                        >
                                            {cat}
                                        </span>
                                    ))}
                                </div>
                            )}
                            {/* Medium for Art */}
                            {metadata.medium && (
                                <p className="text-white/40 text-xs mt-2 italic">
                                    {metadata.medium}
                                </p>
                            )}
                        </div>
                    )}

                    {/* User Rating */}
                    {currentItem.rating && (
                        <div className="mb-6">
                            <p className="text-white/30 text-xs uppercase tracking-wider mb-2">Rating</p>
                            <div className="flex items-baseline gap-2">
                                <span
                                    className="text-4xl font-light tracking-tight"
                                    style={{ color: accentColor }}
                                >
                                    {currentItem.rating.toFixed(1)}
                                </span>
                                <span className="text-white/30 text-sm">/ 10</span>
                            </div>
                            {/* Rating bar */}
                            <div className="h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(currentItem.rating / 10) * 100}%` }}
                                    transition={{ duration: 0.5, delay: 0.3 }}
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: accentColor }}
                                />
                            </div>
                        </div>
                    )}

                    {/* User Review - Quote style with serif italic */}
                    {currentItem.review && (
                        <div className="mb-6">
                            <p className="text-white/30 text-xs uppercase tracking-wider mb-2">Opinion</p>
                            <blockquote
                                className="text-white/80 text-lg leading-relaxed border-l-2 pl-4"
                                style={{
                                    fontFamily: "'Georgia', 'Times New Roman', serif",
                                    fontStyle: "italic",
                                    borderColor: accentColor
                                }}
                            >
                                &ldquo;{currentItem.review}&rdquo;
                            </blockquote>
                        </div>
                    )}

                    {/* Placeholder if no review */}
                    {!currentItem.review && !currentItem.rating && (
                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-white/20 text-sm italic">No review yet</p>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Action buttons */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-6">
                <ActionButton icon="ignore" label="Ignore" onClick={() => handleSwipe("left")} color="#ef4444" />
                <ActionButton icon="skip" label="Skip" onClick={() => handleSwipe("down")} color="#a1a1aa" />
                <ActionButton icon="save" label="Like" onClick={() => handleSwipe("right")} color={accentColor} />
            </div>

            {/* Keyboard hints */}
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-4 text-white/30 text-xs font-medium">
                <span className="px-2 py-1 rounded bg-white/5">← Ignore</span>
                <span className="px-2 py-1 rounded bg-white/5">↓ Skip</span>
                <span className="px-2 py-1 rounded bg-white/5">→ Like</span>
                <span className="px-2 py-1 rounded bg-white/5">Esc Close</span>
            </div>
        </motion.div>
    );
}

// Swipeable card component
function SwipeCard({
    item,
    accentColor,
    onSwipe,
    metadata,
}: {
    item: MediaItem;
    accentColor: string;
    onSwipe: (direction: SwipeDirection) => void;
    metadata?: { studio?: string; developer?: string; genres?: string[] } | null;
}) {
    const [dragDirection, setDragDirection] = useState<SwipeDirection | null>(null);

    const handleDragEnd = (_: unknown, info: PanInfo) => {
        const threshold = 100;
        const { offset } = info;

        if (Math.abs(offset.x) > threshold) {
            onSwipe(offset.x > 0 ? "right" : "left");
        } else if (offset.y > threshold) {
            onSwipe("down");
        }
        setDragDirection(null);
    };

    const handleDrag = (_: unknown, info: PanInfo) => {
        const { offset } = info;
        if (Math.abs(offset.x) > 50) {
            setDragDirection(offset.x > 0 ? "right" : "left");
        } else if (offset.y > 50) {
            setDragDirection("down");
        } else {
            setDragDirection(null);
        }
    };

    return (
        <motion.div
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.7}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{
                x: dragDirection === "right" ? 500 : dragDirection === "left" ? -500 : 0,
                y: dragDirection === "down" ? 500 : 0,
                opacity: 0,
                transition: { duration: 0.3 },
            }}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
        >
            <div
                className="relative w-full h-full rounded-3xl overflow-hidden"
                style={{
                    boxShadow: dragDirection === "right"
                        ? `0 0 60px ${accentColor}50, 0 25px 50px -12px rgba(0, 0, 0, 0.5)`
                        : dragDirection === "left"
                            ? "0 0 60px rgba(239, 68, 68, 0.5), 0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                            : "0 25px 60px -12px rgba(0, 0, 0, 0.6)",
                }}
            >
                {item.image ? (
                    <Image src={item.image} alt={item.title} fill sizes="(max-width: 768px) 90vw, 384px" className="object-cover" priority unoptimized={item.image.includes("artic.edu") || item.image.includes("steamcdn") || item.image.includes("akamaihd")} />
                ) : (
                    <div className="w-full h-full bg-[hsl(var(--surface-raised))] flex items-center justify-center">
                        <span className="text-6xl opacity-30">
                            {item.type === "anime" ? "🎌" :
                                item.type === "manga" ? "🥭" :
                                    item.type === "game" ? "🎮" :
                                        item.type === "book" ? "📚" :
                                            item.type === "art" ? "🎨" : "🎬"}
                        </span>
                    </div>
                )}

                {/* Type badge - Item's own type */}
                <div className={`absolute top-4 right-4 px-2 py-1 rounded-lg text-xs font-medium uppercase
                    ${item.type === "anime" ? "bg-pink-500/80" :
                        item.type === "manga" ? "bg-orange-500/80" :
                            item.type === "game" ? "bg-green-500/80" :
                                item.type === "book" ? "bg-amber-600/80" :
                                    item.type === "art" ? "bg-purple-500/80" :
                                        "bg-blue-500/80"} text-white`}>
                    {item.type}
                </div>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                {/* Content (Mobile only - on desktop we show it in the side panel) */}
                <div className="absolute bottom-0 left-0 right-0 p-6 lg:hidden">
                    <h3
                        className="text-2xl font-bold text-white mb-2"
                        style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
                    >
                        {item.title}
                    </h3>
                    <div className="flex items-center gap-3 text-white/70 text-sm">
                        {item.year && <span className="px-2 py-0.5 rounded bg-white/10">{item.year}</span>}
                        {item.rating && (
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                {item.rating.toFixed(1)}
                            </span>
                        )}
                    </div>
                    {item.review && (
                        <p
                            className="text-white/60 text-sm mt-3 line-clamp-2"
                            style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontStyle: "italic" }}
                        >
                            &ldquo;{item.review}&rdquo;
                        </p>
                    )}
                </div>

                {/* Swipe indicators */}
                <AnimatePresence>
                    {dragDirection && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                            <div
                                className={`px-10 py-5 rounded-2xl text-3xl font-bold uppercase tracking-widest
                                    ${dragDirection === "right" ? "bg-emerald-500/90 text-white rotate-12" : ""}
                                    ${dragDirection === "left" ? "bg-red-500/90 text-white -rotate-12" : ""}
                                    ${dragDirection === "down" ? "bg-zinc-600/90 text-white" : ""}
                                `}
                                style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}
                            >
                                {dragDirection === "right" && "Like"}
                                {dragDirection === "left" && "Nope"}
                                {dragDirection === "down" && "Skip"}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div >
        </motion.div >
    );
}

// Action button component
function ActionButton({
    icon,
    label,
    onClick,
    color,
}: {
    icon: "save" | "ignore" | "skip";
    label: string;
    onClick: () => void;
    color: string;
}) {
    const icons = {
        save: (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        ),
        ignore: (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
        skip: (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
        ),
    };

    return (
        <button onClick={onClick} className="group flex flex-col items-center gap-2" aria-label={label}>
            <div
                className="w-16 h-16 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all duration-200 group-hover:scale-110 group-active:scale-95"
                style={{ color }}
            >
                {icons[icon]}
            </div>
            <span className="text-xs text-white/40 font-medium">{label}</span>
        </button>
    );
}
