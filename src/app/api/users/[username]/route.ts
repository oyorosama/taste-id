import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface RouteContext {
    params: Promise<{ username: string }>;
}

// GET /api/users/[username] - Get user profile
export async function GET(request: Request, context: RouteContext) {
    try {
        const { username } = await context.params;

        const user = await prisma.user.findUnique({
            where: { username },
            include: {
                collections: {
                    include: { items: { orderBy: { position: "asc" } } },
                    orderBy: { position: "asc" },
                },
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
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

// PATCH /api/users/[username] - Update user profile (owner only)
export async function PATCH(request: Request, context: RouteContext) {
    try {
        const { username } = await context.params;
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Verify ownership
        const user = await prisma.user.findUnique({
            where: { username },
        });

        if (!user || user.id !== session.user.id) {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { name, bio, accentColor, bgTexture } = body;

        const updatedUser = await prisma.user.update({
            where: { username },
            data: {
                ...(name !== undefined && { name }),
                ...(bio !== undefined && { bio }),
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

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Failed to update user:", error);
        return NextResponse.json(
            { error: "Failed to update user" },
            { status: 500 }
        );
    }
}
