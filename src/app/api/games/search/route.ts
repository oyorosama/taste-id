// Game Search API Route - Proxies requests to Steam API to avoid CORS
import { NextRequest, NextResponse } from "next/server";

const STEAM_API = "https://rawg2steam.phalco.de/api";

interface SteamGame {
    id: number;
    slug: string;
    name: string;
    background_image: string | null;
    box_art: string | null;
    platforms: { platform: { id: number; name: string } }[];
}

interface SteamSearchResponse {
    count: number;
    results: SteamGame[];
}

export async function GET(request: NextRequest) {
    const query = request.nextUrl.searchParams.get("query");

    if (!query || query.trim().length < 2) {
        return NextResponse.json({ games: [] });
    }

    try {
        const response = await fetch(
            `${STEAM_API}/games?search=${encodeURIComponent(query)}`,
            {
                headers: {
                    Accept: "application/json",
                },
                next: { revalidate: 3600 }, // Cache for 1 hour
            }
        );

        if (!response.ok) {
            console.error(`Steam API error: ${response.status}`);
            return NextResponse.json({ games: [] });
        }

        const data: SteamSearchResponse = await response.json();

        // Default placeholder for games without images
        const GAME_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 900' fill='%23374151'%3E%3Crect width='600' height='900' fill='%231f2937'/%3E%3Ctext x='300' y='450' text-anchor='middle' fill='%236b7280' font-size='64' font-family='system-ui'%3E🎮%3C/text%3E%3C/svg%3E";

        // Convert to our format, filter games without images (DLC, soundtracks, etc)
        const games = data.results
            .filter((game) => game.box_art || game.background_image) // Only include games with images
            .map((game) => ({
                id: game.id,
                slug: game.slug,
                name: game.name,
                released: null,
                background_image: game.box_art || game.background_image || GAME_PLACEHOLDER,
                box_art: game.box_art || game.background_image || GAME_PLACEHOLDER,
                rating: 0,
                metacritic: null,
                genres: [],
                platforms: game.platforms || [{ platform: { id: 1, name: "Steam" } }],
            }));

        return NextResponse.json({ games });
    } catch (error) {
        console.error("Steam search failed:", error);
        return NextResponse.json({ games: [] });
    }
}
