import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST /api/user/onboarding - Complete user onboarding
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
        const { username, bio, accentColor } = body;

        // Validate username
        if (!username || !/^[a-z0-9_]{3,20}$/.test(username)) {
            return NextResponse.json(
                { error: "Invalid username. Use 3-20 lowercase letters, numbers, or underscores." },
                { status: 400 }
            );
        }

        // Check if username is taken (by someone else)
        const existingUser = await prisma.user.findUnique({
            where: { username },
            select: { id: true },
        });

        if (existingUser && existingUser.id !== session.user.id) {
            return NextResponse.json(
                { error: "Username is already taken" },
                { status: 400 }
            );
        }

        // Update user profile and mark onboarding as complete
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                username,
                bio: bio?.trim() || null,
                accentColor: accentColor || "#6366f1",
                onboardingCompleted: true,
            },
            select: {
                id: true,
                username: true,
                bio: true,
                accentColor: true,
                onboardingCompleted: true,
            },
        });

        // Check if user has any collections, if not create defaults
        const collectionCount = await prisma.collection.count({
            where: { userId: session.user.id },
        });

        if (collectionCount === 0) {
            await prisma.collection.createMany({
                data: [
                    { name: "Favorites", type: "mixed", position: 0, userId: session.user.id },
                    { name: "Watchlist", type: "movie", position: 1, userId: session.user.id },
                    { name: "Playing", type: "game", position: 2, userId: session.user.id },
                ],
            });
        }

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Failed to complete onboarding:", error);
        return NextResponse.json(
            { error: "Failed to complete onboarding" },
            { status: 500 }
        );
    }
}
