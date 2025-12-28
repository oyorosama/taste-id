"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TextureType } from "@/types";

// Curated high-end color palette
const ACCENT_COLORS = [
    { name: "Indigo", hex: "#6366f1" },
    { name: "Rose", hex: "#f43f5e" },
    { name: "Amber", hex: "#f59e0b" },
    { name: "Emerald", hex: "#10b981" },
    { name: "Cyan", hex: "#06b6d4" },
    { name: "Violet", hex: "#8b5cf6" },
    { name: "Fuchsia", hex: "#d946ef" },
    { name: "Sky", hex: "#0ea5e9" },
    { name: "Lime", hex: "#84cc16" },
    { name: "Orange", hex: "#f97316" },
];

const TEXTURES: { id: TextureType; name: string; preview: string }[] = [
    { id: "none", name: "None", preview: "Clean, minimal" },
    { id: "grain", name: "Film Grain", preview: "Subtle noise" },
    { id: "paper", name: "Paper", preview: "Warm texture" },
    { id: "glass", name: "Glass", preview: "Glassmorphism" },
];

interface SettingsMenuProps {
    isOpen: boolean;
    onClose: () => void;
    currentColor: string;
    currentTexture: TextureType;
    onColorChange: (color: string) => void;
    onTextureChange: (texture: TextureType) => void;
    isSaving?: boolean;
}

export function SettingsMenu({
    isOpen,
    onClose,
    currentColor,
    currentTexture,
    onColorChange,
    onTextureChange,
    isSaving = false,
}: SettingsMenuProps) {
    const [activeTab, setActiveTab] = useState<"color" | "texture">("color");

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />

                    {/* Settings Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: 300 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 300 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-sm
                                   bg-[hsl(var(--surface-raised))] border-l border-[hsl(var(--border))]
                                   z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-[hsl(var(--border-subtle))]">
                            <h2 className="text-xl font-semibold">Settings</h2>
                            <div className="flex items-center gap-3">
                                {isSaving && (
                                    <span className="text-sm text-[hsl(var(--text-muted))]">
                                        Saving...
                                    </span>
                                )}
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg hover:bg-[hsl(var(--surface-overlay))] transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-[hsl(var(--border-subtle))]">
                            <button
                                onClick={() => setActiveTab("color")}
                                className={`flex-1 py-3 text-sm font-medium transition-colors
                                    ${activeTab === "color"
                                        ? "text-[hsl(var(--text-primary))] border-b-2"
                                        : "text-[hsl(var(--text-muted))]"
                                    }`}
                                style={{
                                    borderColor: activeTab === "color" ? currentColor : "transparent",
                                }}
                            >
                                Accent Color
                            </button>
                            <button
                                onClick={() => setActiveTab("texture")}
                                className={`flex-1 py-3 text-sm font-medium transition-colors
                                    ${activeTab === "texture"
                                        ? "text-[hsl(var(--text-primary))] border-b-2"
                                        : "text-[hsl(var(--text-muted))]"
                                    }`}
                                style={{
                                    borderColor: activeTab === "texture" ? currentColor : "transparent",
                                }}
                            >
                                Background
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6 overflow-y-auto">
                            {activeTab === "color" && (
                                <div className="space-y-4">
                                    <p className="text-sm text-[hsl(var(--text-muted))]">
                                        Choose your profile accent color
                                    </p>
                                    <div className="grid grid-cols-5 gap-3">
                                        {ACCENT_COLORS.map((color) => (
                                            <button
                                                key={color.hex}
                                                onClick={() => onColorChange(color.hex)}
                                                className={`aspect-square rounded-xl transition-all duration-200
                                                    ${currentColor === color.hex
                                                        ? "ring-2 ring-offset-2 ring-offset-[hsl(var(--surface-raised))] scale-110"
                                                        : "hover:scale-105"
                                                    }`}
                                                style={{
                                                    backgroundColor: color.hex,
                                                    "--tw-ring-color": color.hex,
                                                } as React.CSSProperties}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
                                    <div className="pt-4">
                                        <p className="text-xs text-[hsl(var(--text-muted))] mb-2">
                                            Current: {ACCENT_COLORS.find(c => c.hex === currentColor)?.name || "Custom"}
                                        </p>
                                        <div
                                            className="h-2 rounded-full"
                                            style={{ backgroundColor: currentColor }}
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === "texture" && (
                                <div className="space-y-3">
                                    <p className="text-sm text-[hsl(var(--text-muted))] mb-4">
                                        Choose your background style
                                    </p>
                                    {TEXTURES.map((texture) => (
                                        <button
                                            key={texture.id}
                                            onClick={() => onTextureChange(texture.id)}
                                            className={`w-full p-4 rounded-xl text-left transition-all
                                                border ${currentTexture === texture.id
                                                    ? "border-2"
                                                    : "border-[hsl(var(--border-subtle))] hover:border-[hsl(var(--border))]"
                                                }
                                                ${currentTexture === texture.id
                                                    ? "bg-[hsl(var(--surface-overlay))]"
                                                    : "bg-transparent hover:bg-[hsl(var(--surface-overlay))]"
                                                }`}
                                            style={{
                                                borderColor: currentTexture === texture.id ? currentColor : undefined,
                                            }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">{texture.name}</p>
                                                    <p className="text-sm text-[hsl(var(--text-muted))]">
                                                        {texture.preview}
                                                    </p>
                                                </div>
                                                {currentTexture === texture.id && (
                                                    <svg
                                                        className="w-5 h-5"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                        style={{ color: currentColor }}
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-[hsl(var(--border-subtle))]">
                            <p className="text-xs text-center text-[hsl(var(--text-muted))]">
                                Changes are saved automatically
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// Settings gear button
export function SettingsButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="p-2.5 rounded-xl glass hover:bg-[hsl(var(--surface-overlay))] 
                       transition-colors group"
            aria-label="Settings"
        >
            <svg
                className="w-5 h-5 text-[hsl(var(--text-secondary))] group-hover:text-[hsl(var(--text-primary))]
                           transition-all group-hover:rotate-45"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                />
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
            </svg>
        </button>
    );
}
