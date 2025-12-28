// Google Books API Client
// Requires NEXT_PUBLIC_GOOGLE_BOOKS_KEY in .env.local

const GOOGLE_BOOKS_API = "https://www.googleapis.com/books/v1/volumes";

export interface GoogleBook {
    id: string;
    volumeInfo: {
        title: string;
        authors?: string[];
        publishedDate?: string;
        description?: string;
        categories?: string[];
        pageCount?: number;
        averageRating?: number;
        imageLinks?: {
            thumbnail?: string;
            small?: string;
            medium?: string;
            large?: string;
            extraLarge?: string;
        };
    };
}

interface GoogleBooksResponse {
    totalItems: number;
    items?: GoogleBook[];
}

// Get best quality cover image
function getBestCover(imageLinks?: GoogleBook["volumeInfo"]["imageLinks"]): string | null {
    if (!imageLinks) return null;

    // Prioritize highest quality, convert HTTP to HTTPS
    const url = imageLinks.extraLarge
        || imageLinks.large
        || imageLinks.medium
        || imageLinks.small
        || imageLinks.thumbnail;

    if (!url) return null;

    // Google Books often returns HTTP, convert to HTTPS and increase zoom
    return url.replace("http://", "https://").replace("zoom=1", "zoom=2");
}

export async function searchBooks(query: string): Promise<{ books: GoogleBook[] }> {
    if (!query.trim()) {
        return { books: [] };
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_KEY;

    try {
        const url = apiKey
            ? `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}&maxResults=12&key=${apiKey}`
            : `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}&maxResults=12`;

        const response = await fetch(url, {
            headers: { Accept: "application/json" },
        });

        if (!response.ok) {
            console.error(`Google Books API error: ${response.status}`);
            return { books: filterFallbackBooks(query) };
        }

        const data: GoogleBooksResponse = await response.json();

        if (!data.items || data.items.length === 0) {
            return { books: filterFallbackBooks(query) };
        }

        // Filter out books without covers
        const booksWithCovers = data.items.filter(
            (book) => book.volumeInfo.imageLinks?.thumbnail
        );

        return { books: booksWithCovers.length > 0 ? booksWithCovers : filterFallbackBooks(query) };
    } catch (error) {
        console.error("Google Books search failed:", error);
        return { books: filterFallbackBooks(query) };
    }
}

// Convert to our unified format
export function bookToMediaItem(book: GoogleBook) {
    const author = book.volumeInfo.authors?.[0] || null;
    const year = book.volumeInfo.publishedDate?.split("-")[0] || null;
    const cover = getBestCover(book.volumeInfo.imageLinks);

    return {
        externalId: book.id,
        type: "book" as const,
        title: book.volumeInfo.title,
        image: cover,
        year,
        rating: book.volumeInfo.averageRating || null,
        metadata: JSON.stringify({
            author,
            categories: book.volumeInfo.categories?.slice(0, 2) || [],
            pageCount: book.volumeInfo.pageCount,
        }),
    };
}

// Filter fallback books by query
function filterFallbackBooks(query: string): GoogleBook[] {
    const queryLower = query.toLowerCase();
    const filtered = FALLBACK_BOOKS.filter(
        (b) =>
            b.volumeInfo.title.toLowerCase().includes(queryLower) ||
            b.volumeInfo.authors?.some((a) => a.toLowerCase().includes(queryLower))
    );
    return filtered.length > 0 ? filtered : FALLBACK_BOOKS.slice(0, 12);
}

// Fallback: Popular books with Google Books covers
export const FALLBACK_BOOKS: GoogleBook[] = [
    {
        id: "wrOQLV6xB-wC",
        volumeInfo: {
            title: "Harry Potter and the Philosopher's Stone",
            authors: ["J.K. Rowling"],
            publishedDate: "1997-06-26",
            categories: ["Fiction", "Fantasy"],
            pageCount: 223,
            averageRating: 4.5,
            imageLinks: {
                thumbnail: "https://books.google.com/books/content?id=wrOQLV6xB-wC&printsec=frontcover&img=1&zoom=2",
            },
        },
    },
    {
        id: "aWZzLPhY4o0C",
        volumeInfo: {
            title: "The Great Gatsby",
            authors: ["F. Scott Fitzgerald"],
            publishedDate: "1925-04-10",
            categories: ["Fiction", "Classics"],
            pageCount: 180,
            averageRating: 4.0,
            imageLinks: {
                thumbnail: "https://books.google.com/books/content?id=aWZzLPhY4o0C&printsec=frontcover&img=1&zoom=2",
            },
        },
    },
    {
        id: "PGR2AwAAQBAJ",
        volumeInfo: {
            title: "To Kill a Mockingbird",
            authors: ["Harper Lee"],
            publishedDate: "1960-07-11",
            categories: ["Fiction", "Classics"],
            pageCount: 281,
            averageRating: 4.5,
            imageLinks: {
                thumbnail: "https://books.google.com/books/content?id=PGR2AwAAQBAJ&printsec=frontcover&img=1&zoom=2",
            },
        },
    },
    {
        id: "kotPYEqx7kMC",
        volumeInfo: {
            title: "1984",
            authors: ["George Orwell"],
            publishedDate: "1949-06-08",
            categories: ["Fiction", "Dystopian"],
            pageCount: 328,
            averageRating: 4.5,
            imageLinks: {
                thumbnail: "https://books.google.com/books/content?id=kotPYEqx7kMC&printsec=frontcover&img=1&zoom=2",
            },
        },
    },
    {
        id: "s1gVAAAAYAAJ",
        volumeInfo: {
            title: "Pride and Prejudice",
            authors: ["Jane Austen"],
            publishedDate: "1813-01-28",
            categories: ["Fiction", "Romance"],
            pageCount: 279,
            averageRating: 4.5,
            imageLinks: {
                thumbnail: "https://books.google.com/books/content?id=s1gVAAAAYAAJ&printsec=frontcover&img=1&zoom=2",
            },
        },
    },
    {
        id: "sSKNDwAAQBAJ",
        volumeInfo: {
            title: "Dune",
            authors: ["Frank Herbert"],
            publishedDate: "1965-08-01",
            categories: ["Fiction", "Science Fiction"],
            pageCount: 688,
            averageRating: 4.5,
            imageLinks: {
                thumbnail: "https://books.google.com/books/content?id=sSKNDwAAQBAJ&printsec=frontcover&img=1&zoom=2",
            },
        },
    },
    {
        id: "pD6arNyKyi8C",
        volumeInfo: {
            title: "The Hobbit",
            authors: ["J.R.R. Tolkien"],
            publishedDate: "1937-09-21",
            categories: ["Fiction", "Fantasy"],
            pageCount: 310,
            averageRating: 4.5,
            imageLinks: {
                thumbnail: "https://books.google.com/books/content?id=pD6arNyKyi8C&printsec=frontcover&img=1&zoom=2",
            },
        },
    },
    {
        id: "aer_NAAACAAJ",
        volumeInfo: {
            title: "The Lord of the Rings",
            authors: ["J.R.R. Tolkien"],
            publishedDate: "1954-07-29",
            categories: ["Fiction", "Fantasy"],
            pageCount: 1178,
            averageRating: 4.5,
            imageLinks: {
                thumbnail: "https://books.google.com/books/content?id=aer_NAAACAAJ&printsec=frontcover&img=1&zoom=2",
            },
        },
    },
    {
        id: "Nhe2AAAAQBAJ",
        volumeInfo: {
            title: "The Catcher in the Rye",
            authors: ["J.D. Salinger"],
            publishedDate: "1951-07-16",
            categories: ["Fiction", "Classics"],
            pageCount: 277,
            averageRating: 4.0,
            imageLinks: {
                thumbnail: "https://books.google.com/books/content?id=Nhe2AAAAQBAJ&printsec=frontcover&img=1&zoom=2",
            },
        },
    },
    {
        id: "k_IPcQs1vb0C",
        volumeInfo: {
            title: "Brave New World",
            authors: ["Aldous Huxley"],
            publishedDate: "1932-01-01",
            categories: ["Fiction", "Dystopian"],
            pageCount: 268,
            averageRating: 4.0,
            imageLinks: {
                thumbnail: "https://books.google.com/books/content?id=k_IPcQs1vb0C&printsec=frontcover&img=1&zoom=2",
            },
        },
    },
    {
        id: "7R37DwAAQBAJ",
        volumeInfo: {
            title: "The Alchemist",
            authors: ["Paulo Coelho"],
            publishedDate: "1988-01-01",
            categories: ["Fiction", "Philosophy"],
            pageCount: 208,
            averageRating: 4.0,
            imageLinks: {
                thumbnail: "https://books.google.com/books/content?id=7R37DwAAQBAJ&printsec=frontcover&img=1&zoom=2",
            },
        },
    },
    {
        id: "FKziDwAAQBAJ",
        volumeInfo: {
            title: "Atomic Habits",
            authors: ["James Clear"],
            publishedDate: "2018-10-16",
            categories: ["Self-Help"],
            pageCount: 320,
            averageRating: 4.5,
            imageLinks: {
                thumbnail: "https://books.google.com/books/content?id=FKziDwAAQBAJ&printsec=frontcover&img=1&zoom=2",
            },
        },
    },
    {
        id: "XfFvDwAAQBAJ",
        volumeInfo: {
            title: "Sapiens: A Brief History of Humankind",
            authors: ["Yuval Noah Harari"],
            publishedDate: "2011-09-04",
            categories: ["History", "Science"],
            pageCount: 443,
            averageRating: 4.5,
            imageLinks: {
                thumbnail: "https://books.google.com/books/content?id=XfFvDwAAQBAJ&printsec=frontcover&img=1&zoom=2",
            },
        },
    },
    {
        id: "OcBZAAAAYAAJ",
        volumeInfo: {
            title: "Crime and Punishment",
            authors: ["Fyodor Dostoevsky"],
            publishedDate: "1866-01-01",
            categories: ["Fiction", "Classics"],
            pageCount: 430,
            averageRating: 4.5,
            imageLinks: {
                thumbnail: "https://books.google.com/books/content?id=OcBZAAAAYAAJ&printsec=frontcover&img=1&zoom=2",
            },
        },
    },
    {
        id: "gKJwDwAAQBAJ",
        volumeInfo: {
            title: "The Silent Patient",
            authors: ["Alex Michaelides"],
            publishedDate: "2019-02-05",
            categories: ["Fiction", "Thriller"],
            pageCount: 336,
            averageRating: 4.0,
            imageLinks: {
                thumbnail: "https://books.google.com/books/content?id=gKJwDwAAQBAJ&printsec=frontcover&img=1&zoom=2",
            },
        },
    },
    {
        id: "sazytgAACAAJ",
        volumeInfo: {
            title: "Project Hail Mary",
            authors: ["Andy Weir"],
            publishedDate: "2021-05-04",
            categories: ["Fiction", "Science Fiction"],
            pageCount: 476,
            averageRating: 4.5,
            imageLinks: {
                thumbnail: "https://books.google.com/books/content?id=sazytgAACAAJ&printsec=frontcover&img=1&zoom=2",
            },
        },
    },
];
