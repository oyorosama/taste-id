// Art Institute of Chicago API Client
// Public API - NO KEY REQUIRED
// Documentation: https://api.artic.edu/docs/

const ART_API = "https://api.artic.edu/api/v1";
const IIIF_BASE = "https://www.artic.edu/iiif/2";

export interface ArtWork {
    id: number;
    title: string;
    artist_display: string;
    artist_title: string | null;
    date_display: string;
    medium_display: string;
    dimensions: string;
    image_id: string | null;
    thumbnail: {
        alt_text: string;
        width: number;
        height: number;
    } | null;
}

interface ArtSearchResponse {
    data: ArtWork[];
    pagination: {
        total: number;
        current_page: number;
        total_pages: number;
    };
}

// Construct IIIF image URL with given size
// Chicago Art Institute uses IIIF standard: identifier/region/size/rotation/quality.format
export function getArtImageUrl(imageId: string | null, size: "thumbnail" | "medium" | "large" = "medium"): string | null {
    if (!imageId) return null;

    const sizeMap = {
        thumbnail: "200,",  // 200px width
        medium: "600,",     // 600px width
        large: "1200,",     // 1200px width
    };

    return `${IIIF_BASE}/${imageId}/full/${sizeMap[size]}/0/default.jpg`;
}

export async function searchArt(query: string): Promise<{ artworks: ArtWork[] }> {
    if (!query.trim()) {
        return { artworks: [] };
    }

    try {
        const response = await fetch(
            `${ART_API}/artworks/search?q=${encodeURIComponent(query)}&limit=12&fields=id,title,artist_display,artist_title,date_display,medium_display,dimensions,image_id,thumbnail`,
            {
                headers: { Accept: "application/json" },
            }
        );

        if (!response.ok) {
            console.error(`Art Institute API error: ${response.status}`);
            return { artworks: filterFallbackArt(query) };
        }

        const data: ArtSearchResponse = await response.json();

        if (!data.data || data.data.length === 0) {
            return { artworks: filterFallbackArt(query) };
        }

        // Filter artworks with images
        const withImages = data.data.filter((art) => art.image_id);

        return { artworks: withImages.length > 0 ? withImages : filterFallbackArt(query) };
    } catch (error) {
        console.error("Art search failed:", error);
        return { artworks: filterFallbackArt(query) };
    }
}

// Convert to our unified format
export function artToMediaItem(art: ArtWork) {
    const artist = art.artist_title || art.artist_display?.split("\n")[0] || null;

    // Extract year from date_display (e.g., "1889" or "c. 1503-1519")
    const yearMatch = art.date_display?.match(/\d{4}/);
    const year = yearMatch ? yearMatch[0] : null;

    return {
        externalId: String(art.id),
        type: "art" as const,
        title: art.title,
        image: getArtImageUrl(art.image_id, "large"),
        year,
        rating: null, // Art doesn't have ratings
        metadata: JSON.stringify({
            artist,
            medium: art.medium_display,
            dimensions: art.dimensions,
        }),
    };
}

// Filter fallback artworks
function filterFallbackArt(query: string): ArtWork[] {
    const queryLower = query.toLowerCase();
    const filtered = FALLBACK_ART.filter(
        (a) =>
            a.title.toLowerCase().includes(queryLower) ||
            a.artist_display.toLowerCase().includes(queryLower)
    );
    return filtered.length > 0 ? filtered : FALLBACK_ART.slice(0, 12);
}

// Fallback: Famous artworks from Art Institute of Chicago
export const FALLBACK_ART: ArtWork[] = [
    {
        id: 27992,
        title: "A Sunday on La Grande Jatte",
        artist_display: "Georges Seurat\nFrench, 1859-1891",
        artist_title: "Georges Seurat",
        date_display: "1884-1886",
        medium_display: "Oil on canvas",
        dimensions: "207.5 × 308.1 cm",
        image_id: "2d484387-2509-5e8e-2c43-22f9981972eb",
        thumbnail: { alt_text: "Pointillist painting of people in a park", width: 3000, height: 2000 },
    },
    {
        id: 28560,
        title: "The Bedroom",
        artist_display: "Vincent van Gogh\nDutch, 1853-1890",
        artist_title: "Vincent van Gogh",
        date_display: "1889",
        medium_display: "Oil on canvas",
        dimensions: "73.6 × 92.3 cm",
        image_id: "25c31d8d-21a4-9ea1-1d73-f171bfe220e0",
        thumbnail: { alt_text: "Painting of a bedroom with bed and chairs", width: 3000, height: 2400 },
    },
    {
        id: 111628,
        title: "Nighthawks",
        artist_display: "Edward Hopper\nAmerican, 1882-1967",
        artist_title: "Edward Hopper",
        date_display: "1942",
        medium_display: "Oil on canvas",
        dimensions: "84.1 × 152.4 cm",
        image_id: "831a05de-d3f6-f138-7b12-45f41e5e2f04",
        thumbnail: { alt_text: "Painting of people in a diner at night", width: 3000, height: 1656 },
    },
    {
        id: 20684,
        title: "American Gothic",
        artist_display: "Grant Wood\nAmerican, 1891-1942",
        artist_title: "Grant Wood",
        date_display: "1930",
        medium_display: "Oil on beaver board",
        dimensions: "78 × 65.3 cm",
        image_id: "b272df73-a965-ac37-4172-be4e99483f84",
        thumbnail: { alt_text: "Painting of a farmer and his daughter", width: 2500, height: 3000 },
    },
    {
        id: 14598,
        title: "The Old Guitarist",
        artist_display: "Pablo Picasso\nSpanish, 1881-1973",
        artist_title: "Pablo Picasso",
        date_display: "1903-1904",
        medium_display: "Oil on panel",
        dimensions: "122.9 × 82.6 cm",
        image_id: "d4c6b80c-22df-c14f-c5eb-e6f4a33f9503",
        thumbnail: { alt_text: "Blue period painting of an elderly man with guitar", width: 2000, height: 3000 },
    },
    {
        id: 16568,
        title: "Paris Street; Rainy Day",
        artist_display: "Gustave Caillebotte\nFrench, 1848-1894",
        artist_title: "Gustave Caillebotte",
        date_display: "1877",
        medium_display: "Oil on canvas",
        dimensions: "212.2 × 276.2 cm",
        image_id: "f8b4b99e-5553-b87d-cfdb-2a0e81d3de44",
        thumbnail: { alt_text: "Impressionist painting of Paris street", width: 3000, height: 2300 },
    },
    {
        id: 87479,
        title: "Water Lilies",
        artist_display: "Claude Monet\nFrench, 1840-1926",
        artist_title: "Claude Monet",
        date_display: "1906",
        medium_display: "Oil on canvas",
        dimensions: "89.9 × 94.1 cm",
        image_id: "3c27b499-af56-f0d5-93b5-a7f2f1ad5813",
        thumbnail: { alt_text: "Impressionist painting of water lilies", width: 3000, height: 2900 },
    },
    {
        id: 129884,
        title: "The Starry Night",
        artist_display: "Vincent van Gogh\nDutch, 1853-1890",
        artist_title: "Vincent van Gogh",
        date_display: "1889",
        medium_display: "Oil on canvas",
        dimensions: "73.7 × 92.1 cm",
        image_id: "e966799b-97ee-1cc6-bd2f-a94b4b8bb8f9",
        thumbnail: { alt_text: "Swirling night sky over village", width: 3000, height: 2380 },
    },
    {
        id: 16487,
        title: "The Birth of Venus",
        artist_display: "William-Adolphe Bouguereau\nFrench, 1825-1905",
        artist_title: "William-Adolphe Bouguereau",
        date_display: "1879",
        medium_display: "Oil on canvas",
        dimensions: "300 × 218 cm",
        image_id: "35fcbbec-e6e7-5c81-4c54-d9b3e8a11319",
        thumbnail: { alt_text: "Classical painting of Venus", width: 2100, height: 3000 },
    },
    {
        id: 24645,
        title: "Two Sisters (On the Terrace)",
        artist_display: "Pierre-Auguste Renoir\nFrench, 1841-1919",
        artist_title: "Pierre-Auguste Renoir",
        date_display: "1881",
        medium_display: "Oil on canvas",
        dimensions: "100.5 × 81 cm",
        image_id: "53237d37-c7d2-9099-8e04-be1e31db0fa8",
        thumbnail: { alt_text: "Impressionist portrait of two sisters", width: 2400, height: 3000 },
    },
    {
        id: 64818,
        title: "The Herring Net",
        artist_display: "Winslow Homer\nAmerican, 1836-1910",
        artist_title: "Winslow Homer",
        date_display: "1885",
        medium_display: "Oil on canvas",
        dimensions: "76.5 × 122.9 cm",
        image_id: "26af5e7e-7c1e-6fc6-9a51-e5af0296aa55",
        thumbnail: { alt_text: "Painting of fishermen at sea", width: 3000, height: 1900 },
    },
    {
        id: 117266,
        title: "The Cliff Walk at Pourville",
        artist_display: "Claude Monet\nFrench, 1840-1926",
        artist_title: "Claude Monet",
        date_display: "1882",
        medium_display: "Oil on canvas",
        dimensions: "66.5 × 82.3 cm",
        image_id: "c93d5f05-9e7f-f099-1dae-da15c82f5db4",
        thumbnail: { alt_text: "Impressionist painting of cliffs", width: 3000, height: 2400 },
    },
];
