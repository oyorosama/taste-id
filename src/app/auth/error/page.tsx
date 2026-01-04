"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function ErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    const errorMessages: Record<string, string> = {
        Configuration: "There is a problem with the server configuration. Please contact support.",
        AccessDenied: "Access denied. You do not have permission to sign in.",
        Verification: "The verification link has expired or has already been used.",
        Default: "An authentication error occurred. Please try again.",
    };

    const message = errorMessages[error || "Default"] || errorMessages.Default;

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
                    <span className="text-3xl">⚠️</span>
                </div>
                <h1 className="text-2xl font-bold mb-2">Authentication Error</h1>
                <p className="text-[hsl(var(--text-muted))] mb-2">{message}</p>
                {error && (
                    <p className="text-sm text-[hsl(var(--text-muted))] mb-6">
                        Error code: <code className="bg-[hsl(var(--surface-raised))] px-2 py-1 rounded">{error}</code>
                    </p>
                )}
                <Link
                    href="/"
                    className="inline-block px-6 py-3 bg-accent text-white rounded-xl hover:opacity-90 transition-opacity"
                >
                    Back to Home
                </Link>
            </div>
        </div>
    );
}

export default function AuthErrorPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <ErrorContent />
        </Suspense>
    );
}
