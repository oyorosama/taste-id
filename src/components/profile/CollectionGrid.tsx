"use client";

import type { Collection } from "@/types";
import { CollectionCard, EmptyCollectionSlot } from "./CollectionCard";

interface CollectionGridProps {
    collections: Collection[];
    accentColor: string;
    isOwner?: boolean;
    onCollectionClick: (collection: Collection) => void;
    onAddCollection?: (position: number) => void;
}

export function CollectionGrid({
    collections,
    accentColor,
    isOwner = false,
    onCollectionClick,
    onAddCollection,
}: CollectionGridProps) {
    // Create a 3x3 grid with collections in their positions
    const grid = Array.from({ length: 9 }, (_, index) => {
        return collections.find((c) => c.position === index) || null;
    });

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {grid.map((collection, index) => {
                if (collection) {
                    return (
                        <CollectionCard
                            key={collection.id}
                            collection={collection}
                            accentColor={accentColor}
                            onClick={() => onCollectionClick(collection)}
                        />
                    );
                }

                // Only show empty slots for owner
                if (isOwner && onAddCollection) {
                    return (
                        <EmptyCollectionSlot
                            key={`empty-${index}`}
                            position={index}
                            accentColor={accentColor}
                            onClick={() => onAddCollection(index)}
                        />
                    );
                }

                // For visitors, don't show empty slots
                return null;
            })}
        </div>
    );
}
