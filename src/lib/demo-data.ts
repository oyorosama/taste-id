import type { User, Collection, MediaItem } from "@/types";

// Demo user data for development
export const demoUser: User = {
    id: "demo-user-1",
    username: "cinephile",
    name: "Alex Rivera",
    image: null,
    accentColor: "#6366f1", // Indigo
    bgTexture: "grain",
    collections: [],
};

// Demo collections with sample items
export const demoCollections: Collection[] = [
    {
        id: "col-1",
        name: "All-Time Favorites",
        type: "movie",
        position: 0,
        coverImage: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg", // Dune
        items: [
            {
                id: "item-1",
                externalId: "438631",
                type: "movie",
                title: "Dune",
                image: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
                year: "2021",
                rating: 8.0,
                position: 0,
            },
            {
                id: "item-2",
                externalId: "155",
                type: "movie",
                title: "The Dark Knight",
                image: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
                year: "2008",
                rating: 9.0,
                position: 1,
            },
            {
                id: "item-3",
                externalId: "27205",
                type: "movie",
                title: "Inception",
                image: "https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg",
                year: "2010",
                rating: 8.8,
                position: 2,
            },
            {
                id: "item-4",
                externalId: "680",
                type: "movie",
                title: "Pulp Fiction",
                image: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
                year: "1994",
                rating: 8.9,
                position: 3,
            },
            {
                id: "item-5",
                externalId: "862",
                type: "movie",
                title: "Toy Story",
                image: "https://image.tmdb.org/t/p/w500/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg",
                year: "1995",
                rating: 8.3,
                position: 4,
            },
        ],
    },
    {
        id: "col-2",
        name: "Sci-Fi Gems",
        type: "movie",
        position: 1,
        coverImage: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", // Interstellar
        items: [
            {
                id: "item-6",
                externalId: "157336",
                type: "movie",
                title: "Interstellar",
                image: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
                year: "2014",
                rating: 8.6,
                position: 0,
            },
            {
                id: "item-7",
                externalId: "603",
                type: "movie",
                title: "The Matrix",
                image: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
                year: "1999",
                rating: 8.7,
                position: 1,
            },
            {
                id: "item-8",
                externalId: "78",
                type: "movie",
                title: "Blade Runner",
                image: "https://image.tmdb.org/t/p/w500/63N9uy8nd9j7Eog2axPQ8lbr3Wj.jpg",
                year: "1982",
                rating: 8.1,
                position: 2,
            },
        ],
    },
    {
        id: "col-3",
        name: "Studio Ghibli",
        type: "anime",
        position: 2,
        coverImage: "https://image.tmdb.org/t/p/w500/rtGDOeG9LzoerkDGZF9dnVeLppL.jpg", // Spirited Away
        items: [
            {
                id: "item-9",
                externalId: "129",
                type: "anime",
                title: "Spirited Away",
                image: "https://image.tmdb.org/t/p/w500/rtGDOeG9LzoerkDGZF9dnVeLppL.jpg",
                year: "2001",
                rating: 8.5,
                position: 0,
            },
            {
                id: "item-10",
                externalId: "128",
                type: "anime",
                title: "Princess Mononoke",
                image: "https://image.tmdb.org/t/p/w500/jHWmNr7m544fJ8eItsfNk8fs2Ed.jpg",
                year: "1997",
                rating: 8.4,
                position: 1,
            },
        ],
    },
    {
        id: "col-4",
        name: "Comfort Watches",
        type: "movie",
        position: 3,
        coverImage: "https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg", // Avengers
        items: [
            {
                id: "item-11",
                externalId: "24428",
                type: "movie",
                title: "The Avengers",
                image: "https://image.tmdb.org/t/p/w500/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg",
                year: "2012",
                rating: 8.0,
                position: 0,
            },
        ],
    },
    {
        id: "col-5",
        name: "Mind-Benders",
        type: "movie",
        position: 4,
        coverImage: "https://image.tmdb.org/t/p/w500/btTdmkgIvOi0FFip1uj1RSLDsQa.jpg", // Fight Club
        items: [
            {
                id: "item-12",
                externalId: "550",
                type: "movie",
                title: "Fight Club",
                image: "https://image.tmdb.org/t/p/w500/btTdmkgIvOi0FFip1uj1RSLDsQa.jpg",
                year: "1999",
                rating: 8.8,
                position: 0,
            },
            {
                id: "item-13",
                externalId: "77",
                type: "movie",
                title: "Memento",
                image: "https://image.tmdb.org/t/p/w500/yuNs09hvpHVU1cBTCAk9zxsL2oW.jpg",
                year: "2000",
                rating: 8.4,
                position: 1,
            },
        ],
    },
    {
        id: "col-6",
        name: "90s Nostalgia",
        type: "movie",
        position: 5,
        coverImage: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg", // Pulp Fiction
        items: [
            {
                id: "item-14",
                externalId: "680",
                type: "movie",
                title: "Pulp Fiction",
                image: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
                year: "1994",
                rating: 8.9,
                position: 0,
            },
            {
                id: "item-15",
                externalId: "807",
                type: "movie",
                title: "Se7en",
                image: "https://image.tmdb.org/t/p/w500/6yoghtyTpznpBik8EngEmJskVUO.jpg",
                year: "1995",
                rating: 8.6,
                position: 1,
            },
        ],
    },
];

// Helper to get user with collections
export function getDemoUserWithCollections(): User {
    return {
        ...demoUser,
        collections: demoCollections,
    };
}

// Get all items from all collections (for swiper)
export function getAllDemoItems(): MediaItem[] {
    return demoCollections.flatMap((c) => c.items);
}
