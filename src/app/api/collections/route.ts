import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/collections - Get all collections for current user
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const collections = await prisma.collection.findMany({
            where: { userId: session.user.id },
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
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { name, type } = body;

        if (!name) {
            return NextResponse.json(
                { error: "Collection name is required" },
                { status: 400 }
            );
        }

        // Get current collection count to determine position
        const collectionCount = await prisma.collection.count({
            where: { userId: session.user.id },
        });

        if (collectionCount >= 9) {
            return NextResponse.json(
                { error: "Maximum of 9 collections allowed" },
                { status: 400 }
            );
        }

        // Find the first available position
        const existingPositions = await prisma.collection.findMany({
            where: { userId: session.user.id },
            select: { position: true },
        });
        const usedPositions = new Set(existingPositions.map(c => c.position));
        let position = 0;
        while (usedPositions.has(position) && position < 9) {
            position++;
        }

        const collection = await prisma.collection.create({
            data: {
                name,
                type: type || "mixed",
                position,
                userId: session.user.id,
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
