import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { UserProfileClient } from "./client";
import type { MediaType } from "@/types";

interface PageProps {
    params: Promise<{ username: string }>;
}

export default async function UserProfilePage({ params }: PageProps) {
    const { username } = await params;

    // Fetch user data
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
        notFound();
    }

    // Check if current user is the owner
    const session = await auth();
    const isOwner = session?.user?.id === user.id;

    // Transform to client-safe format (cast Prisma strings to our MediaType)
    const profileData = {
        id: user.id,
        username: user.username,
        name: user.name,
        image: user.image,
        bio: user.bio,
        accentColor: user.accentColor,
        bgTexture: user.bgTexture,
        collections: user.collections.map((c) => ({
            id: c.id,
            name: c.name,
            type: c.type as MediaType,
            position: c.position,
            coverImage: c.coverImage,
            items: c.items.map((item) => ({
                id: item.id,
                externalId: item.externalId,
                type: item.type as MediaType,
                title: item.title,
                image: item.image,
                year: item.year,
                rating: item.rating,
                review: item.review,
                metadata: item.metadata,
                position: item.position,
            })),
        })),
    };

    return <UserProfileClient profile={profileData} isOwner={isOwner} />;
}

// Generate static params for common usernames (optional optimization)
export async function generateStaticParams() {
    return [];
}

// Dynamic metadata
export async function generateMetadata({ params }: PageProps) {
    const { username } = await params;
    const user = await prisma.user.findUnique({
        where: { username },
        select: { name: true, username: true },
    });

    if (!user) {
        return { title: "User Not Found | TasteID" };
    }

    return {
        title: `${user.name || user.username} | TasteID`,
        description: `Check out ${user.name || user.username}'s curated collections on TasteID`,
    };
}
