// TasteID Type Definitions

export type MediaType = "movie" | "tv" | "music" | "game" | "anime" | "manga" | "book" | "art";

export type TextureType = "none" | "grain" | "paper" | "glass";

export interface User {
    id: string;
    username: string;
    name: string | null;
    image: string | null;
    accentColor: string;
    bgTexture: TextureType;
    collections: Collection[];
}

export interface Collection {
    id: string;
    name: string;
    type: MediaType;
    position: number; // 0-8 for 3x3 grid
    coverImage: string | null;
    items: MediaItem[];
}

export interface MediaItem {
    id: string;
    externalId: string;
    type: MediaType;
    title: string;
    image: string | null;
    year: string | null;
    rating: number | null;
    review?: string | null;
    metadata?: string | null; // JSON string with type-specific data
    position: number;
}

export interface SavedItem {
    id: string;
    externalId: string;
    type: MediaType;
    title: string;
    image: string | null;
    savedAt: Date;
}

// TMDB API Types
export interface TMDBMovie {
    id: number;
    title: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
    vote_average: number;
    overview: string;
    genre_ids: number[];
}

export interface TMDBSearchResponse {
    page: number;
    results: TMDBMovie[];
    total_pages: number;
    total_results: number;
}

// Swiper Types
export type SwipeDirection = "left" | "right" | "down";

export interface SwipeAction {
    direction: SwipeDirection;
    item: MediaItem;
    timestamp: Date;
}
