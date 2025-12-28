// IGDB API Client
// IGDB requires Twitch OAuth for authentication
// For demo purposes, we'll use a proxy approach or show a placeholder

const IGDB_API = "https://api.igdb.com/v4";

export interface IGDBGame {
    id: number;
    name: string;
    cover?: {
        id: number;
        image_id: string;
    };
    first_release_date?: number;
    rating?: number;
    involved_companies?: {
        company: {
            name: string;
        };
        developer: boolean;
        publisher: boolean;
    }[];
    genres?: { name: string }[];
    platforms?: { name: string }[];
}

// Get cover image URL from IGDB
export function getIgdbCoverUrl(imageId: string, size: "cover_small" | "cover_big" | "720p" = "cover_big"): string {
    return `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg`;
}

// Since IGDB requires Twitch OAuth, we'll use a server-side approach
// For now, provide a simulated search that uses local data
// In production, you'd set up a proper OAuth flow with Twitch

export async function searchGames(
    query: string
): Promise<{ games: IGDBGame[] }> {
    // Check if we have IGDB credentials
    const clientId = process.env.IGDB_CLIENT_ID;
    const accessToken = process.env.IGDB_ACCESS_TOKEN;

    if (!clientId || !accessToken) {
        console.warn("IGDB credentials not configured. Using fallback.");
        return { games: [] };
    }

    try {
        const response = await fetch(`${IGDB_API}/games`, {
            method: "POST",
            headers: {
                "Client-ID": clientId,
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "text/plain",
            },
            body: `
                search "${query}";
                fields name, cover.image_id, first_release_date, rating, 
                       involved_companies.company.name, involved_companies.developer, involved_companies.publisher,
                       genres.name, platforms.name;
                where cover != null;
                limit 12;
            `,
        });

        if (!response.ok) {
            throw new Error(`IGDB API error: ${response.status}`);
        }

        const games: IGDBGame[] = await response.json();
        return { games };
    } catch (error) {
        console.error("IGDB search failed:", error);
        return { games: [] };
    }
}

// Convert IGDB game to our unified format
export function igdbToMediaItem(game: IGDBGame) {
    const developer = game.involved_companies?.find(ic => ic.developer)?.company.name || null;
    const publisher = game.involved_companies?.find(ic => ic.publisher)?.company.name || null;
    const year = game.first_release_date
        ? new Date(game.first_release_date * 1000).getFullYear().toString()
        : null;

    return {
        externalId: String(game.id),
        type: "game" as const,
        title: game.name,
        image: game.cover?.image_id ? getIgdbCoverUrl(game.cover.image_id) : null,
        year,
        rating: game.rating ? game.rating / 10 : null,
        metadata: JSON.stringify({
            developer,
            publisher,
            genres: game.genres?.slice(0, 3).map(g => g.name) || [],
            platforms: game.platforms?.slice(0, 3).map(p => p.name) || [],
        }),
    };
}

// Fallback: Popular games for demo when IGDB isn't configured
export const DEMO_GAMES: IGDBGame[] = [
    { id: 1942, name: "The Witcher 3: Wild Hunt", cover: { id: 1, image_id: "co1wyy" }, rating: 93 },
    { id: 1020, name: "Grand Theft Auto V", cover: { id: 2, image_id: "co2lbd" }, rating: 92 },
    { id: 732, name: "Cyberpunk 2077", cover: { id: 3, image_id: "co4hkw" }, rating: 78 },
    { id: 119133, name: "Elden Ring", cover: { id: 4, image_id: "co4jni" }, rating: 95 },
    { id: 26950, name: "Hollow Knight", cover: { id: 5, image_id: "co1rgi" }, rating: 90 },
    { id: 11198, name: "Hades", cover: { id: 6, image_id: "co2qw5" }, rating: 93 },
];
