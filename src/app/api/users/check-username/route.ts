import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/users/check-username - Check if username is available
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const username = searchParams.get("username");

        if (!username) {
            return NextResponse.json(
                { error: "Username is required" },
                { status: 400 }
            );
        }

        // Validate username format
        if (!/^[a-z0-9_]{3,20}$/.test(username)) {
            return NextResponse.json(
                { available: false, error: "Invalid username format" }
            );
        }

        // Check if current user owns this username
        const session = await auth();
        if (session?.user?.username === username) {
            return NextResponse.json({ available: true, isCurrentUser: true });
        }

        // Check if username exists
        const existingUser = await prisma.user.findUnique({
            where: { username },
            select: { id: true },
        });

        return NextResponse.json({ available: !existingUser });
    } catch (error) {
        console.error("Failed to check username:", error);
        return NextResponse.json(
            { error: "Failed to check username" },
            { status: 500 }
        );
    }
}
