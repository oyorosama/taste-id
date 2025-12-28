/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "image.tmdb.org",
                pathname: "/t/p/**",
            },
            {
                protocol: "https",
                hostname: "i.scdn.co",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "cdn.myanimelist.net",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "s4.anilist.co",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "images.igdb.com",
                pathname: "/**",
            },
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
