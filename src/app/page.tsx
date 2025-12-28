import Link from "next/link";

export default function HomePage() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-8">
            {/* Hero Section */}
            <div className="text-center max-w-2xl mx-auto animate-fade-in">
                {/* Logo */}
                <div className="mb-8">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                        Taste<span className="text-accent">ID</span>
                    </h1>
                    <p className="mt-4 text-lg md:text-xl text-[hsl(var(--text-secondary))]">
                        Your digital taste fingerprint
                    </p>
                </div>

                {/* Tagline */}
                <p className="text-[hsl(var(--text-muted))] text-lg mb-12 text-balance">
                    Curate your world. Movies, music, games, anime, books —
                    all in one beautiful, swipeable profile.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/profile/demo"
                        className="px-8 py-4 bg-accent text-white font-medium rounded-xl 
                       hover:opacity-90 transition-opacity text-lg"
                    >
                        View Demo Profile
                    </Link>
                    <button
                        className="px-8 py-4 glass rounded-xl font-medium
                       hover:bg-[hsl(var(--surface-overlay))] transition-colors text-lg"
                    >
                        Create Your ID
                    </button>
                </div>

                {/* Feature Pills */}
                <div className="mt-16 flex flex-wrap justify-center gap-3">
                    {["Movies", "Music", "Games", "Anime", "Books"].map((category) => (
                        <span
                            key={category}
                            className="px-4 py-2 rounded-full text-sm 
                         bg-[hsl(var(--surface-raised))] 
                         text-[hsl(var(--text-secondary))]
                         border border-[hsl(var(--border-subtle))]"
                        >
                            {category}
                        </span>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <footer className="absolute bottom-8 text-center text-sm text-[hsl(var(--text-muted))]">
                <p>Discover. Curate. Share.</p>
            </footer>
        </main>
    );
}
