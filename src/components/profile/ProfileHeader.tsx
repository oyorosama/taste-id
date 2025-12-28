"use client";

import Image from "next/image";

interface ProfileHeaderProps {
    username: string;
    name: string | null;
    image: string | null;
    accentColor: string;
    isOwner?: boolean;
    onEdit?: () => void;
}

export function ProfileHeader({
    username,
    name,
    image,
    accentColor,
    isOwner = false,
    onEdit,
}: ProfileHeaderProps) {
    return (
        <header className="flex items-center gap-6 mb-12">
            {/* Avatar with accent ring */}
            <div
                className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden"
                style={{
                    boxShadow: `0 0 0 3px ${accentColor}40, 0 0 20px ${accentColor}20`,
                }}
            >
                {image ? (
                    <Image
                        src={image}
                        alt={name || username}
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div
                        className="w-full h-full flex items-center justify-center text-3xl font-bold"
                        style={{ backgroundColor: accentColor + "20", color: accentColor }}
                    >
                        {(name || username).charAt(0).toUpperCase()}
                    </div>
                )}
            </div>

            {/* Name & Username */}
            <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {name || username}
                </h1>
                <p className="text-[hsl(var(--text-muted))] mt-1">@{username}</p>

                {isOwner && onEdit && (
                    <button
                        onClick={onEdit}
                        className="mt-3 px-4 py-2 text-sm rounded-lg 
                       bg-[hsl(var(--surface-raised))] 
                       hover:bg-[hsl(var(--surface-overlay))]
                       border border-[hsl(var(--border-subtle))]
                       transition-colors"
                    >
                        Edit Profile
                    </button>
                )}
            </div>
        </header>
    );
}
