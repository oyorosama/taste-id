import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteContext {
    params: Promise<{ id: string; itemId: string }>;
}

// DELETE /api/collections/[id]/items/[itemId] - Remove item from collection
export async function DELETE(request: Request, context: RouteContext) {
    try {
        const { id: collectionId, itemId } = await context.params;

        // Verify the item belongs to the collection
        const item = await prisma.item.findFirst({
            where: {
                id: itemId,
                collectionId: collectionId,
            },
        });

        if (!item) {
            return NextResponse.json(
                { error: "Item not found in collection" },
                { status: 404 }
            );
        }

        // Delete the item
        await prisma.item.delete({
            where: { id: itemId },
        });

        // Reorder remaining items
        const remainingItems = await prisma.item.findMany({
            where: { collectionId },
            orderBy: { position: "asc" },
        });

        // Update positions
        for (let i = 0; i < remainingItems.length; i++) {
            if (remainingItems[i].position !== i) {
                await prisma.item.update({
                    where: { id: remainingItems[i].id },
                    data: { position: i },
                });
            }
        }

        // Update collection cover if needed
        const collection = await prisma.collection.findUnique({
            where: { id: collectionId },
            include: { items: { orderBy: { position: "asc" }, take: 1 } },
        });

        if (collection) {
            const newCoverImage = collection.items[0]?.image || null;
            if (collection.coverImage !== newCoverImage) {
                await prisma.collection.update({
                    where: { id: collectionId },
                    data: { coverImage: newCoverImage },
                });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete item:", error);
        return NextResponse.json(
            { error: "Failed to delete item" },
            { status: 500 }
        );
    }
}
