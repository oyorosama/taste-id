import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/user - Get or create demo user with all collections
export async function GET() {
    try {
        // Get or create demo user
        let user = await prisma.user.findUnique({
            where: { username: "demo" },
            include: {
                collections: {
                    include: { items: { orderBy: { position: "asc" } } },
                    orderBy: { position: "asc" },
                },
            },
        });

        if (!user) {
            // Create demo user with default collections and sample items
            user = await prisma.user.create({
                data: {
                    username: "demo",
                    name: "Alex Rivera",
                    accentColor: "#6366f1",
                    bgTexture: "grain",
                    collections: {
                        create: [
                            {
                                name: "Favorites",
                                type: "movie",
                                position: 0,
                                coverImage: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
                                items: {
                                    create: [
                                        {
                                            externalId: "438631",
                                            type: "movie",
                                            title: "Dune",
                                            image: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
                                            year: "2021",
                                            rating: 8.0,
                                            position: 0,
                                        },
                                        {
                                            externalId: "155",
                                            type: "movie",
                                            title: "The Dark Knight",
                                            image: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
                                            year: "2008",
                                            rating: 9.0,
                                            position: 1,
                                        },
                                        {
                                            externalId: "27205",
                                            type: "movie",
                                            title: "Inception",
                                            image: "https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg",
                                            year: "2010",
                                            rating: 8.8,
                                            position: 2,
                                        },
                                        {
                                            externalId: "680",
                                            type: "movie",
                                            title: "Pulp Fiction",
                                            image: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
                                            year: "1994",
                                            rating: 8.9,
                                            position: 3,
                                        },
                                    ],
                                },
                            },
                            {
                                name: "Sci-Fi",
                                type: "movie",
                                position: 1,
                                coverImage: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
                                items: {
                                    create: [
                                        {
                                            externalId: "157336",
                                            type: "movie",
                                            title: "Interstellar",
                                            image: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
                                            year: "2014",
                                            rating: 8.6,
                                            position: 0,
                                        },
                                        {
                                            externalId: "603",
                                            type: "movie",
                                            title: "The Matrix",
                                            image: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
                                            year: "1999",
                                            rating: 8.7,
                                            position: 1,
                                        },
                                        {
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
                            },
                            {
                                name: "Anime",
                                type: "anime",
                                position: 2,
                                coverImage: "https://image.tmdb.org/t/p/w500/rtGDOeG9LzoerkDGZF9dnVeLppL.jpg",
                                items: {
                                    create: [
                                        {
                                            externalId: "129",
                                            type: "anime",
                                            title: "Spirited Away",
                                            image: "https://image.tmdb.org/t/p/w500/rtGDOeG9LzoerkDGZF9dnVeLppL.jpg",
                                            year: "2001",
                                            rating: 8.5,
                                            position: 0,
                                        },
                                        {
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
                            },
                        ],
                    },
                },
                include: {
                    collections: {
                        include: { items: { orderBy: { position: "asc" } } },
                        orderBy: { position: "asc" },
                    },
                },
            });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Failed to fetch user:", error);
        return NextResponse.json(
            { error: "Failed to fetch user" },
            { status: 500 }
        );
    }
}

// PATCH /api/user - Update user settings (accent color, texture)
export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { accentColor, bgTexture } = body;

        const user = await prisma.user.update({
            where: { username: "demo" },
            data: {
                ...(accentColor && { accentColor }),
                ...(bgTexture && { bgTexture }),
            },
            include: {
                collections: {
                    include: { items: { orderBy: { position: "asc" } } },
                    orderBy: { position: "asc" },
                },
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("Failed to update user:", error);
        return NextResponse.json(
            { error: "Failed to update user" },
            { status: 500 }
        );
    }
}
