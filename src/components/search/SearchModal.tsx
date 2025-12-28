"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { searchMovies, getPosterUrl, type TMDBMovie } from "@/lib/tmdb";
import { searchAnime, searchManga, anilistToMediaItem, type AniListMedia } from "@/lib/anilist";
import { searchGamesRAWG, rawgToMediaItem, type RAWGGame } from "@/lib/rawg";
import { searchBooks, bookToMediaItem, type GoogleBook } from "@/lib/books";
import { searchArt, artToMediaItem, getArtImageUrl, type ArtWork } from "@/lib/art";
import type { Collection } from "@/types";

type MediaSource = "movie" | "game" | "anime" | "manga" | "book" | "art";

// Component for images with fallback on error
function SafeImage({ src, alt, fallbackEmoji, className }: {
    src: string | null;
    alt: string;
    fallbackEmoji: string;
    className?: string;
}) {
    const [error, setError] = useState(false);

    if (!src || error) {
        return (
            <div className={`w-full h-full flex items-center justify-center text-3xl opacity-30 bg-[hsl(var(--surface-overlay))] ${className || ''}`}>
                {fallbackEmoji}
            </div>
        );
    }

    // Skip Next.js image optimization for domains that block it (403 errors)
    const shouldUnoptimize = src.includes("steamcdn") ||
        src.includes("akamaihd") ||
        src.includes("artic.edu");

    return (
        <Image
            src={src}
            alt={alt}
            fill
            className={className || "object-cover"}
            onError={() => setError(true)}
            unoptimized={shouldUnoptimize}
        />
    );
}

const SOURCE_TABS: { id: MediaSource; label: string; icon: string }[] = [
    { id: "movie", label: "Movies", icon: "🎬" },
    { id: "game", label: "Games", icon: "🎮" },
    { id: "anime", label: "Anime", icon: "🎌" },
    { id: "manga", label: "Manga", icon: "🥭" },
    { id: "book", label: "Books", icon: "📚" },
    { id: "art", label: "Art", icon: "🎨" },
];

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    collections: Collection[];
    accentColor: string;
    onAddToCollection: (item: {
        externalId: string;
        type: string;
        title: string;
        image: string | null;
        year: string | null;
        rating: number | null;
        metadata?: string;
    }, collectionId: string) => Promise<void>;
}

export function SearchModal({
    isOpen,
    onClose,
    collections,
    accentColor,
    onAddToCollection,
}: SearchModalProps) {
    const [activeSource, setActiveSource] = useState<MediaSource>("movie");
    const [query, setQuery] = useState("");
    const [movieResults, setMovieResults] = useState<TMDBMovie[]>([]);
    const [animeResults, setAnimeResults] = useState<AniListMedia[]>([]);
    const [gameResults, setGameResults] = useState<RAWGGame[]>([]);
    const [mangaResults, setMangaResults] = useState<AniListMedia[]>([]);
    const [bookResults, setBookResults] = useState<GoogleBook[]>([]);
    const [artResults, setArtResults] = useState<ArtWork[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<{
        externalId: string;
        type: string;
        title: string;
        image: string | null;
        year: string | null;
        rating: number | null;
        metadata?: string;
    } | null>(null);
    const [addingTo, setAddingTo] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedItem(null);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Clear results when switching tabs
    useEffect(() => {
        if (query) {
            handleSearch(query);
        }
    }, [activeSource]);

    // Clear all results
    const clearAllResults = () => {
        setMovieResults([]);
        setAnimeResults([]);
        setGameResults([]);
        setMangaResults([]);
        setBookResults([]);
        setArtResults([]);
    };

    // Debounced search
    const handleSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            clearAllResults();
            return;
        }

        setLoading(true);
        setError(null);

        try {
            switch (activeSource) {
                case "movie": {
                    const response = await searchMovies(searchQuery);
                    setMovieResults(response.results.slice(0, 12));
                    break;
                }
                case "game": {
                    const response = await searchGamesRAWG(searchQuery);
                    setGameResults(response.games);
                    break;
                }
                case "anime": {
                    const response = await searchAnime(searchQuery);
                    setAnimeResults(response.media);
                    break;
                }
                case "manga": {
                    const response = await searchManga(searchQuery);
                    setMangaResults(response.media);
                    break;
                }
                case "book": {
                    const response = await searchBooks(searchQuery);
                    setBookResults(response.books);
                    break;
                }
                case "art": {
                    const response = await searchArt(searchQuery);
                    setArtResults(response.artworks);
                    break;
                }
            }
        } catch (err) {
            setError("Search failed. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [activeSource]);

    // Debounce input
    const handleQueryChange = (value: string) => {
        setQuery(value);
        setSelectedItem(null);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            handleSearch(value);
        }, 300);
    };

    // Handle item selection
    const handleSelectMovie = (movie: TMDBMovie) => {
        setSelectedItem({
            externalId: String(movie.id),
            type: "movie",
            title: movie.title,
            image: getPosterUrl(movie.poster_path),
            year: movie.release_date?.split("-")[0] || null,
            rating: movie.vote_average || null,
        });
    };

    const handleSelectAnime = (anime: AniListMedia) => {
        setSelectedItem(anilistToMediaItem(anime));
    };

    const handleSelectGame = (game: RAWGGame) => {
        setSelectedItem(rawgToMediaItem(game));
    };

    const handleSelectManga = (manga: AniListMedia) => {
        setSelectedItem(anilistToMediaItem(manga));
    };

    const handleSelectBook = (book: GoogleBook) => {
        setSelectedItem(bookToMediaItem(book));
    };

    const handleSelectArt = (art: ArtWork) => {
        setSelectedItem(artToMediaItem(art));
    };

    // Handle add to collection
    const handleAdd = async (collectionId: string) => {
        if (!selectedItem) return;

        setAddingTo(collectionId);
        try {
            await onAddToCollection(selectedItem, collectionId);
            setSelectedItem(null);
            setQuery("");
            clearAllResults();
            onClose();
        } catch (err) {
            console.error("Failed to add:", err);
        } finally {
            setAddingTo(null);
        }
    };

    // Keyboard handling
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (selectedItem) {
                    setSelectedItem(null);
                } else {
                    onClose();
                }
            }
        };

        if (isOpen) {
            window.addEventListener("keydown", handleKeyDown);
        }

        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose, selectedItem]);

    // Prevent body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    // Get current results based on active source
    const hasResults = (() => {
        switch (activeSource) {
            case "movie": return movieResults.length > 0;
            case "game": return gameResults.length > 0;
            case "anime": return animeResults.length > 0;
            case "manga": return mangaResults.length > 0;
            case "book": return bookResults.length > 0;
            case "art": return artResults.length > 0;
            default: return false;
        }
    })();

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24"
                >
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="relative w-full max-w-2xl mx-4 bg-[hsl(var(--surface-raised))] 
                                   rounded-2xl shadow-2xl border border-[hsl(var(--border))]
                                   overflow-hidden"
                    >
                        {/* Source Tabs */}
                        <div className="flex border-b border-[hsl(var(--border-subtle))]">
                            {SOURCE_TABS.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveSource(tab.id)}
                                    className={`flex-1 py-3 px-4 text-sm font-medium transition-colors
                                        flex items-center justify-center gap-2
                                        ${activeSource === tab.id
                                            ? "text-[hsl(var(--text-primary))] bg-[hsl(var(--surface-overlay))]"
                                            : "text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-secondary))]"
                                        }`}
                                    style={{
                                        borderBottom: activeSource === tab.id ? `2px solid ${accentColor}` : "none",
                                    }}
                                >
                                    <span>{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Search Input */}
                        <div className="relative bg-[hsl(var(--surface-overlay))]">
                            <svg
                                className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--text-muted))]"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => handleQueryChange(e.target.value)}
                                placeholder={`Search for ${activeSource === "movie" ? "movies" : activeSource === "game" ? "games" : activeSource === "anime" ? "anime" : activeSource === "manga" ? "manga" : activeSource === "book" ? "books" : "art"}...`}
                                className="w-full py-4 pl-14 pr-12 text-lg bg-transparent
                                           text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-muted))]
                                           focus:outline-none"
                            />
                            {query && (
                                <button
                                    onClick={() => {
                                        setQuery("");
                                        setMovieResults([]);
                                        setAnimeResults([]);
                                        setGameResults([]);
                                        setSelectedItem(null);
                                    }}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 p-1.5 rounded-full
                                               bg-[hsl(var(--surface-raised))] hover:bg-[hsl(var(--border))]
                                               transition-colors"
                                >
                                    <svg className="w-4 h-4 text-[hsl(var(--text-muted))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Results */}
                        <div className="max-h-[55vh] overflow-y-auto">
                            {loading && (
                                <div className="flex items-center justify-center py-16">
                                    <div
                                        className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                                        style={{ borderColor: `${accentColor}40`, borderTopColor: "transparent" }}
                                    />
                                </div>
                            )}

                            {error && (
                                <div className="p-8 text-center text-red-400">{error}</div>
                            )}

                            {!loading && !error && !hasResults && query && (
                                <div className="p-8 text-center text-[hsl(var(--text-muted))]">
                                    No {activeSource === "movie" ? "movies" : activeSource === "game" ? "games" : activeSource === "anime" ? "anime" : activeSource === "manga" ? "manga" : activeSource === "book" ? "books" : "art"} found
                                </div>
                            )}

                            {/* Movie Results */}
                            {!loading && activeSource === "movie" && movieResults.length > 0 && !selectedItem && (
                                <div className="p-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
                                    {movieResults.map((movie) => (
                                        <button
                                            key={movie.id}
                                            onClick={() => handleSelectMovie(movie)}
                                            className="group relative aspect-[2/3] rounded-xl overflow-hidden
                                                       bg-[hsl(var(--surface-overlay))] card-hover"
                                        >
                                            {movie.poster_path ? (
                                                <Image
                                                    src={getPosterUrl(movie.poster_path, "w342")!}
                                                    alt={movie.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-3xl opacity-30">
                                                    🎬
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent
                                                            opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                                <p className="text-white text-sm font-medium line-clamp-2">
                                                    {movie.title}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Anime Results */}
                            {!loading && activeSource === "anime" && animeResults.length > 0 && !selectedItem && (
                                <div className="p-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
                                    {animeResults.map((anime) => (
                                        <button
                                            key={anime.id}
                                            onClick={() => handleSelectAnime(anime)}
                                            className="group relative aspect-[2/3] rounded-xl overflow-hidden
                                                       bg-[hsl(var(--surface-overlay))] card-hover"
                                        >
                                            <Image
                                                src={anime.coverImage.large}
                                                alt={anime.title.english || anime.title.romaji}
                                                fill
                                                className="object-cover"
                                            />
                                            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-medium
                                                            bg-pink-500/80 text-white uppercase">
                                                {anime.type}
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent
                                                            opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                                <div>
                                                    <p className="text-white text-sm font-medium line-clamp-2">
                                                        {anime.title.english || anime.title.romaji}
                                                    </p>
                                                    {anime.studios.nodes[0] && (
                                                        <p className="text-white/60 text-xs mt-0.5">
                                                            {anime.studios.nodes[0].name}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Game Results */}
                            {!loading && activeSource === "game" && gameResults.length > 0 && !selectedItem && (
                                <div className="p-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
                                    {gameResults.map((game) => (
                                        <button
                                            key={game.id}
                                            onClick={() => handleSelectGame(game)}
                                            className="group relative aspect-[2/3] rounded-xl overflow-hidden
                                                       bg-[hsl(var(--surface-overlay))] card-hover"
                                        >
                                            <SafeImage
                                                src={game.background_image}
                                                alt={game.name}
                                                fallbackEmoji="🎮"
                                                className="object-cover"
                                            />
                                            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-medium
                                                            bg-green-500/80 text-white uppercase">
                                                Game
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent
                                                            opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                                <p className="text-white text-sm font-medium line-clamp-2">
                                                    {game.name}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Manga Results */}
                            {!loading && activeSource === "manga" && mangaResults.length > 0 && !selectedItem && (
                                <div className="p-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
                                    {mangaResults.map((manga) => (
                                        <button
                                            key={manga.id}
                                            onClick={() => handleSelectManga(manga)}
                                            className="group relative aspect-[2/3] rounded-xl overflow-hidden
                                                       bg-[hsl(var(--surface-overlay))] card-hover"
                                        >
                                            <SafeImage
                                                src={manga.coverImage.large}
                                                alt={manga.title.english || manga.title.romaji}
                                                fallbackEmoji="🥭"
                                                className="object-cover"
                                            />
                                            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-medium
                                                            bg-orange-500/80 text-white uppercase">
                                                Manga
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent
                                                            opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                                <div>
                                                    <p className="text-white text-sm font-medium line-clamp-2">
                                                        {manga.title.english || manga.title.romaji}
                                                    </p>
                                                    {manga.staff?.nodes[0] && (
                                                        <p className="text-white/60 text-xs mt-0.5">
                                                            {manga.staff.nodes[0].name.full}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Book Results */}
                            {!loading && activeSource === "book" && bookResults.length > 0 && !selectedItem && (
                                <div className="p-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
                                    {bookResults.map((book) => (
                                        <button
                                            key={book.id}
                                            onClick={() => handleSelectBook(book)}
                                            className="group relative aspect-[2/3] rounded-xl overflow-hidden
                                                       bg-[hsl(var(--surface-overlay))] card-hover"
                                        >
                                            <SafeImage
                                                src={book.volumeInfo.imageLinks?.thumbnail?.replace("http://", "https://") || null}
                                                alt={book.volumeInfo.title}
                                                fallbackEmoji="📚"
                                                className="object-cover"
                                            />
                                            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-medium
                                                            bg-amber-600/80 text-white uppercase">
                                                Book
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent
                                                            opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                                <div>
                                                    <p className="text-white text-sm font-medium line-clamp-2">
                                                        {book.volumeInfo.title}
                                                    </p>
                                                    {book.volumeInfo.authors?.[0] && (
                                                        <p className="text-white/60 text-xs mt-0.5">
                                                            {book.volumeInfo.authors[0]}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Art Results - special aspect ratio handling for paintings */}
                            {!loading && activeSource === "art" && artResults.length > 0 && !selectedItem && (
                                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {artResults.map((art) => (
                                        <button
                                            key={art.id}
                                            onClick={() => handleSelectArt(art)}
                                            className="group relative aspect-[4/5] rounded-xl overflow-hidden
                                                       bg-[hsl(var(--surface-overlay))] card-hover"
                                        >
                                            <SafeImage
                                                src={getArtImageUrl(art.image_id, "medium")}
                                                alt={art.title}
                                                fallbackEmoji="🎨"
                                                className="object-cover object-center"
                                            />
                                            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-medium
                                                            bg-purple-500/80 text-white uppercase">
                                                Art
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent
                                                            opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                                <div>
                                                    <p className="text-white text-sm font-medium line-clamp-2">
                                                        {art.title}
                                                    </p>
                                                    {art.artist_title && (
                                                        <p className="text-white/60 text-xs mt-0.5">
                                                            {art.artist_title}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Collection Picker */}
                            {selectedItem && (
                                <div className="p-6">
                                    <button
                                        onClick={() => setSelectedItem(null)}
                                        className="flex items-center gap-2 text-sm text-[hsl(var(--text-muted))] 
                                                   hover:text-[hsl(var(--text-primary))] mb-4"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Back to results
                                    </button>

                                    {/* Selected Item Preview */}
                                    <div className="flex gap-4 mb-6 p-4 rounded-xl bg-[hsl(var(--surface-overlay))]">
                                        <div className="relative w-20 h-28 rounded-lg overflow-hidden flex-shrink-0">
                                            {selectedItem.image ? (
                                                <Image
                                                    src={selectedItem.image}
                                                    alt={selectedItem.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-[hsl(var(--surface-raised))] flex items-center justify-center">
                                                    {selectedItem.type === "anime" ? "🎌" : selectedItem.type === "game" ? "🎮" : "🎬"}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-lg">{selectedItem.title}</h3>
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase
                                                    ${selectedItem.type === "anime" ? "bg-pink-500/20 text-pink-400" :
                                                        selectedItem.type === "game" ? "bg-green-500/20 text-green-400" :
                                                            "bg-blue-500/20 text-blue-400"}`}>
                                                    {selectedItem.type}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-[hsl(var(--text-muted))] mt-1">
                                                {selectedItem.year && <span>{selectedItem.year}</span>}
                                                {selectedItem.rating && (
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                        {selectedItem.rating.toFixed(1)}
                                                    </span>
                                                )}
                                            </div>
                                            {selectedItem.metadata && (
                                                <div className="mt-2 text-xs text-[hsl(var(--text-muted))]">
                                                    {(() => {
                                                        try {
                                                            const meta = JSON.parse(selectedItem.metadata);
                                                            if (meta.studio) return `Studio: ${meta.studio}`;
                                                            if (meta.developer) return `Developer: ${meta.developer}`;
                                                            return null;
                                                        } catch { return null; }
                                                    })()}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Collection List */}
                                    <h4 className="text-sm font-medium text-[hsl(var(--text-muted))] mb-3">
                                        Add to collection
                                    </h4>
                                    <div className="space-y-2">
                                        {collections.length === 0 ? (
                                            <p className="text-sm text-[hsl(var(--text-muted))] text-center py-4">
                                                No collections yet. Create one first!
                                            </p>
                                        ) : (
                                            collections.map((collection) => (
                                                <button
                                                    key={collection.id}
                                                    onClick={() => handleAdd(collection.id)}
                                                    disabled={addingTo !== null}
                                                    className="w-full flex items-center justify-between p-4 rounded-xl
                                                               border border-[hsl(var(--border-subtle))]
                                                               hover:border-[hsl(var(--border))] hover:bg-[hsl(var(--surface-overlay))]
                                                               transition-colors disabled:opacity-50"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {collection.coverImage ? (
                                                            <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                                                                <Image
                                                                    src={collection.coverImage}
                                                                    alt={collection.name}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-lg bg-[hsl(var(--surface-overlay))]
                                                                            flex items-center justify-center text-lg opacity-50">
                                                                📁
                                                            </div>
                                                        )}
                                                        <div className="text-left">
                                                            <p className="font-medium">{collection.name}</p>
                                                            <p className="text-xs text-[hsl(var(--text-muted))]">
                                                                {collection.items?.length || 0} items
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {addingTo === collection.id ? (
                                                        <div
                                                            className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                                                            style={{ borderColor: accentColor, borderTopColor: "transparent" }}
                                                        />
                                                    ) : (
                                                        <svg className="w-5 h-5 text-[hsl(var(--text-muted))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                                        </svg>
                                                    )}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Empty state */}
                            {!loading && !query && (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[hsl(var(--surface-overlay))]
                                                    flex items-center justify-center text-3xl opacity-50">
                                        {activeSource === "movie" ? "🎬" : activeSource === "game" ? "🎮" : activeSource === "anime" ? "🎌" : activeSource === "manga" ? "🥭" : activeSource === "book" ? "📚" : "🎨"}
                                    </div>
                                    <p className="text-[hsl(var(--text-muted))]">
                                        Search for {activeSource === "movie" ? "movies" : activeSource === "game" ? "games" : activeSource === "anime" ? "anime" : activeSource === "manga" ? "manga" : activeSource === "book" ? "books" : "art"} to add
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
