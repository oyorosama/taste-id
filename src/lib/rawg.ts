// Steam Game Search via rawg2steam proxy
// Uses Phalcode's rawg-to-steam-redirect: https://github.com/Phalcode/rawg-to-steam-redirect
// This provides RAWG-compatible API with Steam CDN images (no API key required!)

const STEAM_API = "https://rawg2steam.phalco.de/api";

export interface SteamGame {
    id: number;
    slug: string;
    name: string;
    background_image: string | null;
    box_art: string | null;
    platforms: { platform: { id: number; name: string } }[];
}

// Extended interface for our app (compatible with previous RAWGGame)
export interface RAWGGame {
    id: number;
    slug: string;
    name: string;
    released: string | null;
    background_image: string | null;
    box_art?: string | null;
    rating: number;
    metacritic: number | null;
    genres: { id: number; name: string; slug: string }[];
    platforms: { platform: { id: number; name: string; slug?: string } }[];
    developers?: { id: number; name: string; slug: string }[];
    publishers?: { id: number; name: string; slug: string }[];
}

interface SteamSearchResponse {
    count: number;
    results: SteamGame[];
}

// Search games using Steam API (via server-side proxy to avoid CORS)
// NO API KEY REQUIRED! Uses public Steam data
export async function searchGamesRAWG(query: string): Promise<{ games: RAWGGame[] }> {
    if (!query.trim()) {
        return { games: [] };
    }

    try {
        // Use our server-side API route to avoid CORS issues
        const response = await fetch(
            `/api/games/search?query=${encodeURIComponent(query)}`,
            {
                headers: {
                    'Accept': 'application/json',
                }
            }
        );

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        // If no results from API, use fallback
        if (!data.games || data.games.length === 0) {
            return { games: filterFallbackGames(query) };
        }

        return { games: data.games };
    } catch (error) {
        console.error("Game search failed:", error);
        return { games: filterFallbackGames(query) };
    }
}

// Convert game to our unified format
export function rawgToMediaItem(game: RAWGGame) {
    const developer = game.developers?.[0]?.name || null;
    const year = game.released?.split("-")[0] || null;

    return {
        externalId: String(game.id),
        type: "game" as const,
        title: game.name,
        // Prefer box_art for vertical poster, fallback to background_image
        image: game.box_art || game.background_image,
        year,
        rating: game.metacritic ? game.metacritic / 10 : game.rating || null,
        metadata: JSON.stringify({
            developer,
            genres: game.genres?.slice(0, 3).map((g) => g.name) || [],
            platforms: game.platforms?.slice(0, 3).map((p) => p.platform.name) || [],
            steamId: game.id,
        }),
    };
}

// Helper to filter fallback games
function filterFallbackGames(query: string): RAWGGame[] {
    const queryLower = query.toLowerCase();
    const filtered = FALLBACK_GAMES.filter((g) =>
        g.name.toLowerCase().includes(queryLower)
    );
    return filtered.length > 0 ? filtered : FALLBACK_GAMES.slice(0, 12);
}

// Fallback: Popular games with Steam CDN images
export const FALLBACK_GAMES: RAWGGame[] = [
    {
        id: 292030,
        slug: "the-witcher-3-wild-hunt",
        name: "The Witcher 3: Wild Hunt",
        released: "2015-05-18",
        background_image: "https://steamcdn-a.akamaihd.net/steam/apps/292030/library_600x900_2x.jpg",
        box_art: "https://steamcdn-a.akamaihd.net/steam/apps/292030/library_600x900_2x.jpg",
        rating: 4.66,
        metacritic: 92,
        genres: [{ id: 4, name: "Action", slug: "action" }, { id: 5, name: "RPG", slug: "rpg" }],
        platforms: [{ platform: { id: 1, name: "Steam" } }],
    },
    {
        id: 271590,
        slug: "grand-theft-auto-v",
        name: "Grand Theft Auto V",
        released: "2015-04-14",
        background_image: "https://steamcdn-a.akamaihd.net/steam/apps/271590/library_600x900_2x.jpg",
        box_art: "https://steamcdn-a.akamaihd.net/steam/apps/271590/library_600x900_2x.jpg",
        rating: 4.47,
        metacritic: 96,
        genres: [{ id: 4, name: "Action", slug: "action" }, { id: 3, name: "Adventure", slug: "adventure" }],
        platforms: [{ platform: { id: 1, name: "Steam" } }],
    },
    {
        id: 620,
        slug: "portal-2",
        name: "Portal 2",
        released: "2011-04-18",
        background_image: "https://steamcdn-a.akamaihd.net/steam/apps/620/library_600x900_2x.jpg",
        box_art: "https://steamcdn-a.akamaihd.net/steam/apps/620/library_600x900_2x.jpg",
        rating: 4.61,
        metacritic: 95,
        genres: [{ id: 7, name: "Puzzle", slug: "puzzle" }],
        platforms: [{ platform: { id: 1, name: "Steam" } }],
    },
    {
        id: 1174180,
        slug: "red-dead-redemption-2",
        name: "Red Dead Redemption 2",
        released: "2019-12-05",
        background_image: "https://steamcdn-a.akamaihd.net/steam/apps/1174180/library_600x900_2x.jpg",
        box_art: "https://steamcdn-a.akamaihd.net/steam/apps/1174180/library_600x900_2x.jpg",
        rating: 4.59,
        metacritic: 93,
        genres: [{ id: 4, name: "Action", slug: "action" }, { id: 3, name: "Adventure", slug: "adventure" }],
        platforms: [{ platform: { id: 1, name: "Steam" } }],
    },
    {
        id: 1245620,
        slug: "elden-ring",
        name: "Elden Ring",
        released: "2022-02-25",
        background_image: "https://steamcdn-a.akamaihd.net/steam/apps/1245620/library_600x900_2x.jpg",
        box_art: "https://steamcdn-a.akamaihd.net/steam/apps/1245620/library_600x900_2x.jpg",
        rating: 4.49,
        metacritic: 96,
        genres: [{ id: 4, name: "Action", slug: "action" }, { id: 5, name: "RPG", slug: "rpg" }],
        platforms: [{ platform: { id: 1, name: "Steam" } }],
    },
    {
        id: 1091500,
        slug: "cyberpunk-2077",
        name: "Cyberpunk 2077",
        released: "2020-12-10",
        background_image: "https://steamcdn-a.akamaihd.net/steam/apps/1091500/library_600x900_2x.jpg",
        box_art: "https://steamcdn-a.akamaihd.net/steam/apps/1091500/library_600x900_2x.jpg",
        rating: 4.15,
        metacritic: 86,
        genres: [{ id: 4, name: "Action", slug: "action" }, { id: 5, name: "RPG", slug: "rpg" }],
        platforms: [{ platform: { id: 1, name: "Steam" } }],
    },
    {
        id: 1145360,
        slug: "hades",
        name: "Hades",
        released: "2020-09-17",
        background_image: "https://steamcdn-a.akamaihd.net/steam/apps/1145360/library_600x900_2x.jpg",
        box_art: "https://steamcdn-a.akamaihd.net/steam/apps/1145360/library_600x900_2x.jpg",
        rating: 4.33,
        metacritic: 93,
        genres: [{ id: 4, name: "Action", slug: "action" }, { id: 51, name: "Indie", slug: "indie" }],
        platforms: [{ platform: { id: 1, name: "Steam" } }],
    },
    {
        id: 367520,
        slug: "hollow-knight",
        name: "Hollow Knight",
        released: "2017-02-24",
        background_image: "https://steamcdn-a.akamaihd.net/steam/apps/367520/library_600x900_2x.jpg",
        box_art: "https://steamcdn-a.akamaihd.net/steam/apps/367520/library_600x900_2x.jpg",
        rating: 4.42,
        metacritic: 87,
        genres: [{ id: 4, name: "Action", slug: "action" }, { id: 51, name: "Indie", slug: "indie" }],
        platforms: [{ platform: { id: 1, name: "Steam" } }],
    },
    {
        id: 72850,
        slug: "the-elder-scrolls-v-skyrim",
        name: "The Elder Scrolls V: Skyrim",
        released: "2011-11-11",
        background_image: "https://steamcdn-a.akamaihd.net/steam/apps/72850/library_600x900_2x.jpg",
        box_art: "https://steamcdn-a.akamaihd.net/steam/apps/72850/library_600x900_2x.jpg",
        rating: 4.42,
        metacritic: 94,
        genres: [{ id: 4, name: "Action", slug: "action" }, { id: 5, name: "RPG", slug: "rpg" }],
        platforms: [{ platform: { id: 1, name: "Steam" } }],
    },
    {
        id: 377160,
        slug: "fallout-4",
        name: "Fallout 4",
        released: "2015-11-10",
        background_image: "https://steamcdn-a.akamaihd.net/steam/apps/377160/library_600x900_2x.jpg",
        box_art: "https://steamcdn-a.akamaihd.net/steam/apps/377160/library_600x900_2x.jpg",
        rating: 3.80,
        metacritic: 84,
        genres: [{ id: 4, name: "Action", slug: "action" }, { id: 5, name: "RPG", slug: "rpg" }],
        platforms: [{ platform: { id: 1, name: "Steam" } }],
    },
    {
        id: 400,
        slug: "portal",
        name: "Portal",
        released: "2007-10-10",
        background_image: "https://steamcdn-a.akamaihd.net/steam/apps/400/library_600x900_2x.jpg",
        box_art: "https://steamcdn-a.akamaihd.net/steam/apps/400/library_600x900_2x.jpg",
        rating: 4.51,
        metacritic: 90,
        genres: [{ id: 7, name: "Puzzle", slug: "puzzle" }],
        platforms: [{ platform: { id: 1, name: "Steam" } }],
    },
    {
        id: 550,
        slug: "left-4-dead-2",
        name: "Left 4 Dead 2",
        released: "2009-11-17",
        background_image: "https://steamcdn-a.akamaihd.net/steam/apps/550/library_600x900_2x.jpg",
        box_art: "https://steamcdn-a.akamaihd.net/steam/apps/550/library_600x900_2x.jpg",
        rating: 4.09,
        metacritic: 89,
        genres: [{ id: 4, name: "Action", slug: "action" }, { id: 2, name: "Shooter", slug: "shooter" }],
        platforms: [{ platform: { id: 1, name: "Steam" } }],
    },
    {
        id: 49520,
        slug: "borderlands-2",
        name: "Borderlands 2",
        released: "2012-09-18",
        background_image: "https://steamcdn-a.akamaihd.net/steam/apps/49520/library_600x900_2x.jpg",
        box_art: "https://steamcdn-a.akamaihd.net/steam/apps/49520/library_600x900_2x.jpg",
        rating: 4.02,
        metacritic: 89,
        genres: [{ id: 4, name: "Action", slug: "action" }, { id: 2, name: "Shooter", slug: "shooter" }, { id: 5, name: "RPG", slug: "rpg" }],
        platforms: [{ platform: { id: 1, name: "Steam" } }],
    },
    {
        id: 8930,
        slug: "civilization-v",
        name: "Sid Meier's Civilization V",
        released: "2010-09-21",
        background_image: "https://steamcdn-a.akamaihd.net/steam/apps/8930/library_600x900_2x.jpg",
        box_art: "https://steamcdn-a.akamaihd.net/steam/apps/8930/library_600x900_2x.jpg",
        rating: 4.35,
        metacritic: 90,
        genres: [{ id: 10, name: "Strategy", slug: "strategy" }],
        platforms: [{ platform: { id: 1, name: "Steam" } }],
    },
    {
        id: 289070,
        slug: "civilization-vi",
        name: "Sid Meier's Civilization VI",
        released: "2016-10-21",
        background_image: "https://steamcdn-a.akamaihd.net/steam/apps/289070/library_600x900_2x.jpg",
        box_art: "https://steamcdn-a.akamaihd.net/steam/apps/289070/library_600x900_2x.jpg",
        rating: 4.20,
        metacritic: 88,
        genres: [{ id: 10, name: "Strategy", slug: "strategy" }],
        platforms: [{ platform: { id: 1, name: "Steam" } }],
    },
    {
        id: 570,
        slug: "dota-2",
        name: "Dota 2",
        released: "2013-07-09",
        background_image: "https://steamcdn-a.akamaihd.net/steam/apps/570/library_600x900_2x.jpg",
        box_art: "https://steamcdn-a.akamaihd.net/steam/apps/570/library_600x900_2x.jpg",
        rating: 3.10,
        metacritic: 90,
        genres: [{ id: 4, name: "Action", slug: "action" }],
        platforms: [{ platform: { id: 1, name: "Steam" } }],
    },
    {
        id: 730,
        slug: "counter-strike-2",
        name: "Counter-Strike 2",
        released: "2023-09-27",
        background_image: "https://steamcdn-a.akamaihd.net/steam/apps/730/library_600x900_2x.jpg",
        box_art: "https://steamcdn-a.akamaihd.net/steam/apps/730/library_600x900_2x.jpg",
        rating: 3.57,
        metacritic: 83,
        genres: [{ id: 4, name: "Action", slug: "action" }, { id: 2, name: "Shooter", slug: "shooter" }],
        platforms: [{ platform: { id: 1, name: "Steam" } }],
    },
    {
        id: 252490,
        slug: "rust",
        name: "Rust",
        released: "2018-02-08",
        background_image: "https://steamcdn-a.akamaihd.net/steam/apps/252490/library_600x900_2x.jpg",
        box_art: "https://steamcdn-a.akamaihd.net/steam/apps/252490/library_600x900_2x.jpg",
        rating: 3.85,
        metacritic: 69,
        genres: [{ id: 4, name: "Action", slug: "action" }, { id: 14, name: "Survival", slug: "survival" }],
        platforms: [{ platform: { id: 1, name: "Steam" } }],
    },
    {
        id: 892970,
        slug: "valheim",
        name: "Valheim",
        released: "2021-02-02",
        background_image: "https://steamcdn-a.akamaihd.net/steam/apps/892970/library_600x900_2x.jpg",
        box_art: "https://steamcdn-a.akamaihd.net/steam/apps/892970/library_600x900_2x.jpg",
        rating: 4.25,
        metacritic: 80,
        genres: [{ id: 4, name: "Action", slug: "action" }, { id: 14, name: "Survival", slug: "survival" }],
        platforms: [{ platform: { id: 1, name: "Steam" } }],
    },
    {
        id: 1086940,
        slug: "baldurs-gate-3",
        name: "Baldur's Gate 3",
        released: "2023-08-03",
        background_image: "https://steamcdn-a.akamaihd.net/steam/apps/1086940/library_600x900_2x.jpg",
        box_art: "https://steamcdn-a.akamaihd.net/steam/apps/1086940/library_600x900_2x.jpg",
        rating: 4.75,
        metacritic: 96,
        genres: [{ id: 5, name: "RPG", slug: "rpg" }, { id: 10, name: "Strategy", slug: "strategy" }],
        platforms: [{ platform: { id: 1, name: "Steam" } }],
    },
    {
        id: 814380,
        slug: "sekiro",
        name: "Sekiro: Shadows Die Twice",
        released: "2019-03-22",
        background_image: "https://steamcdn-a.akamaihd.net/steam/apps/814380/library_600x900_2x.jpg",
        box_art: "https://steamcdn-a.akamaihd.net/steam/apps/814380/library_600x900_2x.jpg",
        rating: 4.45,
        metacritic: 90,
        genres: [{ id: 4, name: "Action", slug: "action" }, { id: 3, name: "Adventure", slug: "adventure" }],
        platforms: [{ platform: { id: 1, name: "Steam" } }],
    },
    {
        id: 374320,
        slug: "dark-souls-3",
        name: "DARK SOULS III",
        released: "2016-04-12",
        background_image: "https://steamcdn-a.akamaihd.net/steam/apps/374320/library_600x900_2x.jpg",
        box_art: "https://steamcdn-a.akamaihd.net/steam/apps/374320/library_600x900_2x.jpg",
        rating: 4.52,
        metacritic: 89,
        genres: [{ id: 4, name: "Action", slug: "action" }, { id: 5, name: "RPG", slug: "rpg" }],
        platforms: [{ platform: { id: 1, name: "Steam" } }],
    },
    {
        id: 1238810,
        slug: "battlefield-2042",
        name: "Battlefield 2042",
        released: "2021-11-19",
        background_image: "https://steamcdn-a.akamaihd.net/steam/apps/1238810/library_600x900_2x.jpg",
        box_art: "https://steamcdn-a.akamaihd.net/steam/apps/1238810/library_600x900_2x.jpg",
        rating: 2.45,
        metacritic: 68,
        genres: [{ id: 4, name: "Action", slug: "action" }, { id: 2, name: "Shooter", slug: "shooter" }],
        platforms: [{ platform: { id: 1, name: "Steam" } }],
    },
    {
        id: 1172470,
        slug: "apex-legends",
        name: "Apex Legends",
        released: "2020-11-04",
        background_image: "https://steamcdn-a.akamaihd.net/steam/apps/1172470/library_600x900_2x.jpg",
        box_art: "https://steamcdn-a.akamaihd.net/steam/apps/1172470/library_600x900_2x.jpg",
        rating: 3.85,
        metacritic: 88,
        genres: [{ id: 4, name: "Action", slug: "action" }, { id: 2, name: "Shooter", slug: "shooter" }],
        platforms: [{ platform: { id: 1, name: "Steam" } }],
    },
];
