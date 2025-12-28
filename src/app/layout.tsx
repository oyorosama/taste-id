import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Navbar } from "@/components/ui";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

export const metadata: Metadata = {
    title: "TasteID - Your Digital Taste Fingerprint",
    description:
        "A minimalist social network for curators of personal taste. Showcase your collections of movies, music, games, anime, and books.",
    keywords: ["taste", "collections", "movies", "music", "anime", "social"],
    authors: [{ name: "TasteID" }],
    openGraph: {
        title: "TasteID - Your Digital Taste Fingerprint",
        description: "Showcase your curated collections",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={inter.variable}>
            <body className="texture-none min-h-screen antialiased">
                <SessionProvider>
                    <Navbar />
                    <div className="pt-16">
                        {children}
                    </div>
                </SessionProvider>
            </body>
        </html>
    );
}
