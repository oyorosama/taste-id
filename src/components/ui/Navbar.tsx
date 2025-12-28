"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export function Navbar() {
    const { data: session, status } = useSession();
    const isLoading = status === "loading";

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-[hsl(var(--border-subtle))]">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <span className="text-xl font-bold tracking-tight">
                        Taste<span className="text-accent">ID</span>
                    </span>
                </Link>

                {/* Auth Section */}
                <div className="flex items-center gap-4">
                    {isLoading ? (
                        <div className="w-8 h-8 rounded-full bg-[hsl(var(--surface-raised))] animate-pulse" />
                    ) : session?.user ? (
                        <>
                            {/* User Profile Link */}
                            <Link
                                href={`/u/${session.user.username}`}
                                className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-[hsl(var(--surface-raised))] transition-colors"
                            >
                                {session.user.image ? (
                                    <Image
                                        src={session.user.image}
                                        alt={session.user.name || "Avatar"}
                                        width={32}
                                        height={32}
                                        className="rounded-full"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-sm font-medium">
                                        {(session.user.name?.[0] || session.user.username?.[0] || "U").toUpperCase()}
                                    </div>
                                )}
                                <span className="text-sm font-medium hidden sm:block">
                                    @{session.user.username}
                                </span>
                            </Link>

                            {/* Sign Out Button */}
                            <button
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="text-sm text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))] transition-colors"
                            >
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => signIn()}
                            className="px-5 py-2 bg-accent text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
                        >
                            Get Started
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}
