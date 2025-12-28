"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COLLECTION_TYPES = [
    { value: "movie", label: "Movies", emoji: "🎬" },
    { value: "anime", label: "Anime", emoji: "🎌" },
    { value: "game", label: "Games", emoji: "🎮" },
    { value: "manga", label: "Manga", emoji: "🥭" },
    { value: "book", label: "Books", emoji: "📚" },
    { value: "art", label: "Art", emoji: "🎨" },
    { value: "mixed", label: "Mixed", emoji: "✨" },
];

interface CreateCollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateCollection: (name: string, type: string) => Promise<void>;
    accentColor: string;
}

export function CreateCollectionModal({
    isOpen,
    onClose,
    onCreateCollection,
    accentColor,
}: CreateCollectionModalProps) {
    const [name, setName] = useState("");
    const [type, setType] = useState("mixed");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Collection name is required");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            await onCreateCollection(name.trim(), type);
            setName("");
            setType("mixed");
            onClose();
        } catch (err) {
            setError("Failed to create collection");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setName("");
            setType("mixed");
            setError("");
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
                                   w-full max-w-md z-50 p-4"
                    >
                        <div className="glass rounded-2xl border border-[hsl(var(--border-subtle))] 
                                        shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-[hsl(var(--border-subtle))]">
                                <h2 className="text-xl font-semibold">New Collection</h2>
                                <p className="text-sm text-[hsl(var(--text-muted))] mt-1">
                                    Create a new collection to organize your taste
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                {/* Name Input */}
                                <div>
                                    <label
                                        htmlFor="collection-name"
                                        className="block text-sm font-medium mb-2"
                                    >
                                        Collection Name
                                    </label>
                                    <input
                                        id="collection-name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g., Sci-Fi Favorites"
                                        className="w-full px-4 py-3 rounded-xl 
                                                   bg-[hsl(var(--surface-raised))]
                                                   border border-[hsl(var(--border-subtle))]
                                                   focus:border-accent focus:outline-none
                                                   placeholder:text-[hsl(var(--text-muted))]"
                                        disabled={isLoading}
                                        autoFocus
                                    />
                                </div>

                                {/* Type Selection */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Collection Type
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {COLLECTION_TYPES.map((t) => (
                                            <button
                                                key={t.value}
                                                type="button"
                                                onClick={() => setType(t.value)}
                                                disabled={isLoading}
                                                className={`flex flex-col items-center gap-1 p-3 rounded-xl 
                                                           border transition-all ${type === t.value
                                                        ? "border-accent bg-accent/10"
                                                        : "border-[hsl(var(--border-subtle))] hover:border-[hsl(var(--border-default))]"
                                                    }`}
                                            >
                                                <span className="text-xl">{t.emoji}</span>
                                                <span className="text-xs text-[hsl(var(--text-secondary))]">
                                                    {t.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Error */}
                                {error && (
                                    <p className="text-red-400 text-sm">{error}</p>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        disabled={isLoading}
                                        className="flex-1 px-4 py-3 rounded-xl font-medium
                                                   bg-[hsl(var(--surface-raised))]
                                                   hover:bg-[hsl(var(--surface-overlay))]
                                                   transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading || !name.trim()}
                                        className="flex-1 px-4 py-3 rounded-xl font-medium
                                                   text-white transition-opacity
                                                   disabled:opacity-50"
                                        style={{ backgroundColor: accentColor }}
                                    >
                                        {isLoading ? "Creating..." : "Create Collection"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
