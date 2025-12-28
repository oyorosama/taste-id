import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteContext {
    params: Promise<{ id: string }>;
}

// GET /api/collections/[id] - Get a single collection
export async function GET(request: Request, context: RouteContext) {
    try {
        const { id } = await context.params;

        const collection = await prisma.collection.findUnique({
            where: { id },
            include: { items: { orderBy: { position: "asc" } } },
        });

        if (!collection) {
            return NextResponse.json(
                { error: "Collection not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(collection);
    } catch (error) {
        console.error("Failed to fetch collection:", error);
        return NextResponse.json(
            { error: "Failed to fetch collection" },
            { status: 500 }
        );
    }
}

// POST /api/collections/[id] - Add item to collection
export async function POST(request: Request, context: RouteContext) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const { externalId, type, title, image, year, rating, metadata } = body;

        // Get current item count for position
        const itemCount = await prisma.item.count({
            where: { collectionId: id },
        });

        // Create the item with its own immutable type
        const item = await prisma.item.create({
            data: {
                externalId,
                type: type, // Item's own type (movie, anime, game, etc.)
                title,
                image,
                year,
                rating,
                metadata: metadata || null, // Type-specific metadata as JSON string
                position: itemCount,
                collectionId: id,
            },
        });

        // Update collection cover if it's the first item
        if (itemCount === 0 && image) {
            await prisma.collection.update({
                where: { id },
                data: { coverImage: image },
            });
        }

        return NextResponse.json(item);
    } catch (error) {
        console.error("Failed to add item:", error);
        return NextResponse.json(
            { error: "Failed to add item" },
            { status: 500 }
        );
    }
}

// DELETE /api/collections/[id] - Delete collection
export async function DELETE(request: Request, context: RouteContext) {
    try {
        const { id } = await context.params;

        await prisma.collection.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete collection:", error);
        return NextResponse.json(
            { error: "Failed to delete collection" },
            { status: 500 }
        );
    }
}
