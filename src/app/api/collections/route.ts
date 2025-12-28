import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/collections - Get all collections for demo user
export async function GET() {
    try {
        const collections = await prisma.collection.findMany({
            where: { user: { username: "demo" } },
            include: { items: { orderBy: { position: "asc" } } },
            orderBy: { position: "asc" },
        });

        return NextResponse.json(collections);
    } catch (error) {
        console.error("Failed to fetch collections:", error);
        return NextResponse.json(
            { error: "Failed to fetch collections" },
            { status: 500 }
        );
    }
}

// POST /api/collections - Create a new collection
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, type, position } = body;

        // Get demo user
        const user = await prisma.user.findUnique({
            where: { username: "demo" },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const collection = await prisma.collection.create({
            data: {
                name,
                type: type || "movie",
                position: position ?? 0,
                userId: user.id,
            },
            include: { items: true },
        });

        return NextResponse.json(collection);
    } catch (error) {
        console.error("Failed to create collection:", error);
        return NextResponse.json(
            { error: "Failed to create collection" },
            { status: 500 }
        );
    }
}
