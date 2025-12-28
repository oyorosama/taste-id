/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            // TMDB - Movies & TV
            {
                protocol: "https",
                hostname: "image.tmdb.org",
                pathname: "/t/p/**",
            },
            // Spotify
            {
                protocol: "https",
                hostname: "i.scdn.co",
                pathname: "/**",
            },
            // MyAnimeList
            {
                protocol: "https",
                hostname: "cdn.myanimelist.net",
                pathname: "/**",
            },
            // AniList - Anime & Manga
            {
                protocol: "https",
                hostname: "s4.anilist.co",
                pathname: "/**",
            },
            // RAWG - Games
            {
                protocol: "https",
                hostname: "media.rawg.io",
                pathname: "/**",
            },
            // IGDB - Games
            {
                protocol: "https",
                hostname: "images.igdb.com",
                pathname: "/**",
            },
            // Steam CDN - Games
            {
                protocol: "https",
                hostname: "cdn.akamai.steamstatic.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "steamcdn-a.akamaihd.net",
                pathname: "/**",
            },
            // Google Books API covers
            {
                protocol: "https",
                hostname: "books.google.com",
                pathname: "/books/**",
            },
            // Art Institute of Chicago IIIF images
            {
                protocol: "https",
                hostname: "www.artic.edu",
                pathname: "/iiif/**",
            },
        ],
    },
};

export default nextConfig;

