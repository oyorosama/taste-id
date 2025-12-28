import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/saved-items - Get current user's saved items
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const savedItems = await prisma.savedItem.findMany({
            where: { userId: session.user.id },
            orderBy: { savedAt: "desc" },
        });

        return NextResponse.json(savedItems);
    } catch (error) {
        console.error("Failed to fetch saved items:", error);
        return NextResponse.json(
            { error: "Failed to fetch saved items" },
            { status: 500 }
        );
    }
}

// POST /api/saved-items - Save an item from swiper (adds to "My Likes" collection)
export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        const body = await request.json();
        const { externalId, type, title, image, metadata } = body;

        // Find or create "My Likes" collection for the user
        let likesCollection = await prisma.collection.findFirst({
            where: {
                userId,
                name: "My Likes",
            },
        });

        if (!likesCollection) {
            // Find the next available position (0-8)
            const existingCollections = await prisma.collection.findMany({
                where: { userId },
                select: { position: true },
            });
            const usedPositions = new Set(existingCollections.map(c => c.position));
            let nextPosition = 0;
            while (usedPositions.has(nextPosition) && nextPosition < 9) {
                nextPosition++;
            }

            likesCollection = await prisma.collection.create({
                data: {
                    name: "My Likes",
                    type: "movie", // Default type, will contain mixed content
                    position: nextPosition,
                    userId,
                },
            });
        }

        // Check if item already exists in this collection
        const existingItem = await prisma.item.findFirst({
            where: {
                collectionId: likesCollection.id,
                externalId,
                type,
            },
        });

        if (existingItem) {
            return NextResponse.json(existingItem);
        }

        // Get current item count for position
        const itemCount = await prisma.item.count({
            where: { collectionId: likesCollection.id },
        });

        // Create the item in My Likes collection
        const item = await prisma.item.create({
            data: {
                externalId,
                type,
                title,
                image,
                metadata,
                position: itemCount,
                collectionId: likesCollection.id,
            },
        });

        // Update collection cover if it's the first item
        if (itemCount === 0 && image) {
            await prisma.collection.update({
                where: { id: likesCollection.id },
                data: { coverImage: image },
            });
        }

        // Also save to SavedItem for quick lookups
        await prisma.savedItem.upsert({
            where: {
                userId_externalId_type: {
                    userId,
                    externalId,
                    type,
                },
            },
            update: {
                title,
                image,
                metadata,
            },
            create: {
                externalId,
                type,
                title,
                image,
                metadata,
                userId,
            },
        });

        return NextResponse.json(item);
    } catch (error) {
        console.error("Failed to save item:", error);
        return NextResponse.json(
            { error: "Failed to save item" },
            { status: 500 }
        );
    }
}

// DELETE /api/saved-items - Remove a saved item
export async function DELETE(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "Item ID required" },
                { status: 400 }
            );
        }

        await prisma.savedItem.delete({
            where: { id, userId: session.user.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete saved item:", error);
        return NextResponse.json(
            { error: "Failed to delete saved item" },
            { status: 500 }
        );
    }
}
