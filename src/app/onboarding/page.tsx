"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const COLOR_PRESETS = [
    { name: "Indigo", value: "#6366f1" },
    { name: "Rose", value: "#f43f5e" },
    { name: "Emerald", value: "#10b981" },
    { name: "Amber", value: "#f59e0b" },
    { name: "Cyan", value: "#06b6d4" },
    { name: "Violet", value: "#8b5cf6" },
    { name: "Pink", value: "#ec4899" },
    { name: "Orange", value: "#f97316" },
];

export default function OnboardingPage() {
    const { data: session, status, update } = useSession();
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [accentColor, setAccentColor] = useState("#6366f1");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
    const [checkingUsername, setCheckingUsername] = useState(false);

    // Redirect if not logged in
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        }
    }, [status, router]);

    // Pre-fill with existing username if available
    useEffect(() => {
        if (session?.user?.username) {
            setUsername(session.user.username);
        }
    }, [session]);

    // Check username availability with debounce
    useEffect(() => {
        if (!username || username.length < 3) {
            setUsernameAvailable(null);
            return;
        }

        const timer = setTimeout(async () => {
            setCheckingUsername(true);
            try {
                const res = await fetch(`/api/users/check-username?username=${encodeURIComponent(username)}`);
                const data = await res.json();
                setUsernameAvailable(data.available || data.isCurrentUser);
            } catch {
                setUsernameAvailable(null);
            } finally {
                setCheckingUsername(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [username]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username || username.length < 3) {
            setError("Username must be at least 3 characters");
            return;
        }

        if (!usernameAvailable) {
            setError("Username is not available");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/user/onboarding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, bio, accentColor }),
            });

            if (res.ok) {
                // Update session to reflect new username
                await update();
                router.push(`/u/${username}`);
            } else {
                const data = await res.json();
                setError(data.error || "Failed to complete onboarding");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-[hsl(var(--text-muted))]">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Welcome to TasteID</h1>
                    <p className="text-[hsl(var(--text-muted))]">
                        Let&apos;s set up your profile
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Username */}
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium mb-2">
                            Username
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--text-muted))]">
                                @
                            </span>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                                placeholder="yourname"
                                className="w-full pl-8 pr-10 py-3 rounded-xl 
                                           bg-[hsl(var(--surface-raised))]
                                           border border-[hsl(var(--border-subtle))]
                                           focus:border-accent focus:outline-none
                                           placeholder:text-[hsl(var(--text-muted))]"
                                disabled={isLoading}
                                maxLength={20}
                            />
                            {checkingUsername && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                            {!checkingUsername && usernameAvailable !== null && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    {usernameAvailable ? (
                                        <span className="text-green-500">✓</span>
                                    ) : (
                                        <span className="text-red-500">✗</span>
                                    )}
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-[hsl(var(--text-muted))] mt-1">
                            3-20 characters, letters, numbers, and underscores only
                        </p>
                    </div>

                    {/* Bio */}
                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium mb-2">
                            Bio <span className="text-[hsl(var(--text-muted))]">(optional)</span>
                        </label>
                        <textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell us about your taste..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl 
                                       bg-[hsl(var(--surface-raised))]
                                       border border-[hsl(var(--border-subtle))]
                                       focus:border-accent focus:outline-none
                                       placeholder:text-[hsl(var(--text-muted))]
                                       resize-none"
                            disabled={isLoading}
                            maxLength={160}
                        />
                    </div>

                    {/* Accent Color */}
                    <div>
                        <label className="block text-sm font-medium mb-3">
                            Pick your accent color
                        </label>
                        <div className="grid grid-cols-4 gap-3">
                            {COLOR_PRESETS.map((color) => (
                                <button
                                    key={color.value}
                                    type="button"
                                    onClick={() => setAccentColor(color.value)}
                                    disabled={isLoading}
                                    className={`aspect-square rounded-xl transition-all ${accentColor === color.value
                                        ? "ring-2 ring-offset-2 ring-offset-[hsl(var(--surface-base))] scale-105"
                                        : "hover:scale-105"
                                        }`}
                                    style={{
                                        backgroundColor: color.value,
                                        // Use CSS custom property for ring color
                                        ["--tw-ring-color" as string]: color.value,
                                    }}
                                    title={color.name}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-red-400 text-sm text-center">{error}</p>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading || !username || username.length < 3 || !usernameAvailable}
                        className="w-full py-4 rounded-xl font-medium text-white
                                   transition-opacity disabled:opacity-50"
                        style={{ backgroundColor: accentColor }}
                    >
                        {isLoading ? "Setting up..." : "Complete Setup"}
                    </button>
                </form>
            </div>
        </div>
    );
}
