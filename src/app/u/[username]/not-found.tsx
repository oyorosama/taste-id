import Link from "next/link";

export default function UserNotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center texture-grain">
            <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[hsl(var(--surface-raised))]
                                flex items-center justify-center text-5xl opacity-50">
                    👤
                </div>
                <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
                <p className="text-[hsl(var(--text-muted))] mb-8">
                    This profile doesn&apos;t exist or has been removed.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                               font-medium bg-[hsl(var(--accent))] text-white
                               hover:opacity-90 transition-opacity"
                >
                    ← Back to Home
                </Link>
            </div>
        </div>
    );
}
