// TMDB API Client
// Uses Bearer token authentication with Read Access Token
// Includes fallback data for demo mode (no API key required)

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

// Get the auth token
function getAuthHeaders(): HeadersInit {
    const token = process.env.NEXT_PUBLIC_TMDB_READ_ACCESS_TOKEN;
    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };
}

// Fallback movies for demo mode (when no API key)
const FALLBACK_MOVIES: TMDBMovie[] = [
    { id: 603, title: "The Matrix", poster_path: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", backdrop_path: null, release_date: "1999-03-30", vote_average: 8.7, overview: "", genre_ids: [28, 878] },
    { id: 604, title: "The Matrix Reloaded", poster_path: "/9TGHDvWrqKBzwDxDodHYXEmOE6J.jpg", backdrop_path: null, release_date: "2003-05-15", vote_average: 7.0, overview: "", genre_ids: [28, 878] },
    { id: 605, title: "The Matrix Revolutions", poster_path: "/t1wm4PgOQ8e4z1C6tk1yDNrps4T.jpg", backdrop_path: null, release_date: "2003-11-05", vote_average: 6.7, overview: "", genre_ids: [28, 878] },
    { id: 624860, title: "The Matrix Resurrections", poster_path: "/8c4a8kE7PizaGQQnditMmI1xbRp.jpg", backdrop_path: null, release_date: "2021-12-16", vote_average: 6.5, overview: "", genre_ids: [28, 878] },
    { id: 155, title: "The Dark Knight", poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg", backdrop_path: null, release_date: "2008-07-16", vote_average: 9.0, overview: "", genre_ids: [18, 28, 80] },
    { id: 27205, title: "Inception", poster_path: "/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg", backdrop_path: null, release_date: "2010-07-15", vote_average: 8.8, overview: "", genre_ids: [28, 878, 12] },
    { id: 157336, title: "Interstellar", poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", backdrop_path: null, release_date: "2014-11-05", vote_average: 8.7, overview: "", genre_ids: [12, 18, 878] },
    { id: 238, title: "The Godfather", poster_path: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg", backdrop_path: null, release_date: "1972-03-14", vote_average: 9.2, overview: "", genre_ids: [18, 80] },
    { id: 278, title: "The Shawshank Redemption", poster_path: "/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg", backdrop_path: null, release_date: "1994-09-23", vote_average: 9.3, overview: "", genre_ids: [18, 80] },
    { id: 680, title: "Pulp Fiction", poster_path: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg", backdrop_path: null, release_date: "1994-09-10", vote_average: 8.9, overview: "", genre_ids: [53, 80] },
    { id: 13, title: "Forrest Gump", poster_path: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg", backdrop_path: null, release_date: "1994-06-23", vote_average: 8.8, overview: "", genre_ids: [35, 18, 10749] },
    { id: 550, title: "Fight Club", poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", backdrop_path: null, release_date: "1999-10-15", vote_average: 8.8, overview: "", genre_ids: [18] },
    { id: 121, title: "The Lord of the Rings: The Two Towers", poster_path: "/5VTN0pR8gcqV3EPUHHfMGnJYN9L.jpg", backdrop_path: null, release_date: "2002-12-18", vote_average: 8.7, overview: "", genre_ids: [12, 14, 28] },
    { id: 122, title: "The Lord of the Rings: The Return of the King", poster_path: "/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg", backdrop_path: null, release_date: "2003-12-01", vote_average: 8.9, overview: "", genre_ids: [12, 14, 28] },
    { id: 120, title: "The Lord of the Rings: The Fellowship of the Ring", poster_path: "/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg", backdrop_path: null, release_date: "2001-12-18", vote_average: 8.8, overview: "", genre_ids: [12, 14, 28] },
    { id: 299536, title: "Avengers: Infinity War", poster_path: "/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg", backdrop_path: null, release_date: "2018-04-25", vote_average: 8.3, overview: "", genre_ids: [12, 28, 878] },
    { id: 299534, title: "Avengers: Endgame", poster_path: "/or06FN3Dka5tukK1e9sl16pB3iy.jpg", backdrop_path: null, release_date: "2019-04-24", vote_average: 8.3, overview: "", genre_ids: [12, 28, 878] },
    { id: 244786, title: "Whiplash", poster_path: "/7fn624j5lj3xTme2SgiLCeuedmO.jpg", backdrop_path: null, release_date: "2014-10-10", vote_average: 8.4, overview: "", genre_ids: [18, 10402] },
    { id: 466420, title: "Killers of the Flower Moon", poster_path: "/dB6Krk806zeqd0YNp2ngQ9zXteH.jpg", backdrop_path: null, release_date: "2023-10-18", vote_average: 7.5, overview: "", genre_ids: [80, 18, 36] },
    { id: 872585, title: "Oppenheimer", poster_path: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg", backdrop_path: null, release_date: "2023-07-19", vote_average: 8.1, overview: "", genre_ids: [18, 36] },
    { id: 346698, title: "Barbie", poster_path: "/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg", backdrop_path: null, release_date: "2023-07-19", vote_average: 7.0, overview: "", genre_ids: [35, 12] },
    { id: 569094, title: "Spider-Man: Across the Spider-Verse", poster_path: "/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg", backdrop_path: null, release_date: "2023-05-31", vote_average: 8.4, overview: "", genre_ids: [16, 28, 12] },
    { id: 324857, title: "Spider-Man: Into the Spider-Verse", poster_path: "/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg", backdrop_path: null, release_date: "2018-12-14", vote_average: 8.4, overview: "", genre_ids: [16, 28, 12] },
    { id: 19995, title: "Avatar", poster_path: "/kyeqWdyUXW608qlYkRqosgbbJyK.jpg", backdrop_path: null, release_date: "2009-12-15", vote_average: 7.6, overview: "", genre_ids: [28, 12, 14, 878] },
    { id: 76600, title: "Avatar: The Way of Water", poster_path: "/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg", backdrop_path: null, release_date: "2022-12-14", vote_average: 7.6, overview: "", genre_ids: [28, 12, 878] },
];

// Filter fallback movies by query
function filterFallbackMovies(query: string): TMDBMovie[] {
    const lowerQuery = query.toLowerCase();
    return FALLBACK_MOVIES.filter(movie =>
        movie.title.toLowerCase().includes(lowerQuery)
    );
}

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

// Image URL helpers
export function getPosterUrl(path: string | null, size: "w92" | "w154" | "w185" | "w342" | "w500" | "w780" | "original" = "w500"): string | null {
    if (!path) return null;
    return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function getBackdropUrl(path: string | null, size: "w300" | "w780" | "w1280" | "original" = "w1280"): string | null {
    if (!path) return null;
    return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

// Search movies
export async function searchMovies(query: string, page = 1): Promise<TMDBSearchResponse> {
    const token = process.env.NEXT_PUBLIC_TMDB_READ_ACCESS_TOKEN;

    if (!token) {
        // Use fallback data when no API key configured
        console.warn("TMDB API token not configured. Using fallback data.");
        const results = filterFallbackMovies(query);
        return { page: 1, results, total_pages: 1, total_results: results.length };
    }

    const url = new URL(`${TMDB_BASE_URL}/search/movie`);
    url.searchParams.set("query", query);
    url.searchParams.set("page", String(page));
    url.searchParams.set("include_adult", "false");

    const response = await fetch(url.toString(), {
        headers: getAuthHeaders(),
        next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
    }

    return response.json();
}

// Search TV shows
export async function searchTV(query: string, page = 1): Promise<TMDBSearchResponse> {
    const token = process.env.NEXT_PUBLIC_TMDB_READ_ACCESS_TOKEN;

    if (!token) {
        console.warn("TMDB API token not configured");
        return { page: 1, results: [], total_pages: 0, total_results: 0 };
    }

    const url = new URL(`${TMDB_BASE_URL}/search/tv`);
    url.searchParams.set("query", query);
    url.searchParams.set("page", String(page));

    const response = await fetch(url.toString(), {
        headers: getAuthHeaders(),
        next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
    }

    return response.json();
}

// Get trending movies
export async function getTrendingMovies(timeWindow: "day" | "week" = "week"): Promise<TMDBSearchResponse> {
    const token = process.env.NEXT_PUBLIC_TMDB_READ_ACCESS_TOKEN;

    if (!token) {
        return { page: 1, results: [], total_pages: 0, total_results: 0 };
    }

    const url = new URL(`${TMDB_BASE_URL}/trending/movie/${timeWindow}`);

    const response = await fetch(url.toString(), {
        headers: getAuthHeaders(),
        next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
    }

    return response.json();
}

// Get movie details
export async function getMovieDetails(movieId: number) {
    const token = process.env.NEXT_PUBLIC_TMDB_READ_ACCESS_TOKEN;

    if (!token) return null;

    const url = new URL(`${TMDB_BASE_URL}/movie/${movieId}`);

    const response = await fetch(url.toString(), {
        headers: getAuthHeaders(),
        next: { revalidate: 86400 }, // Cache for 24 hours (movie details rarely change)
    });

    if (!response.ok) return null;

    return response.json();
}

// Convert TMDB movie to our MediaItem format
export function tmdbToMediaItem(movie: TMDBMovie): {
    externalId: string;
    type: "movie";
    title: string;
    image: string | null;
    year: string | null;
    rating: number | null;
} {
    return {
        externalId: String(movie.id),
        type: "movie",
        title: movie.title,
        image: getPosterUrl(movie.poster_path),
        year: movie.release_date?.split("-")[0] || null,
        rating: movie.vote_average || null,
    };
}
