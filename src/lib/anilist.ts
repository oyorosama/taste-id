// AniList GraphQL API Client
// AniList API is free to use and doesn't require authentication for searches

const ANILIST_API = "https://graphql.anilist.co";

export interface AniListMedia {
    id: number;
    title: {
        romaji: string;
        english: string | null;
        native: string | null;
    };
    coverImage: {
        large: string;
        medium: string;
    };
    startDate: {
        year: number | null;
    };
    averageScore: number | null;
    studios: {
        nodes: { name: string }[];
    };
    staff?: {
        nodes: { name: { full: string } }[];
    };
    volumes?: number | null;
    chapters?: number | null;
    genres: string[];
    type: "ANIME" | "MANGA";
    format: string;
}

export interface AniListSearchResponse {
    data: {
        Page: {
            media: AniListMedia[];
            pageInfo: {
                total: number;
                currentPage: number;
                hasNextPage: boolean;
            };
        };
    };
}

const SEARCH_QUERY = `
query ($search: String, $type: MediaType, $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      currentPage
      hasNextPage
    }
    media(search: $search, type: $type, sort: POPULARITY_DESC) {
      id
      title {
        romaji
        english
        native
      }
      coverImage {
        large
        medium
      }
      startDate {
        year
      }
      averageScore
      studios(isMain: true) {
        nodes {
          name
        }
      }
      staff(perPage: 3, sort: [RELEVANCE]) {
        nodes {
          name {
            full
          }
        }
      }
      volumes
      chapters
      genres
      type
      format
    }
  }
}
`;

export async function searchAnime(
    query: string,
    page = 1,
    perPage = 12
): Promise<{ media: AniListMedia[]; hasMore: boolean }> {
    try {
        const response = await fetch(ANILIST_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                query: SEARCH_QUERY,
                variables: {
                    search: query,
                    type: "ANIME",
                    page,
                    perPage,
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`AniList API error: ${response.status}`);
        }

        const data: AniListSearchResponse = await response.json();
        return {
            media: data.data.Page.media,
            hasMore: data.data.Page.pageInfo.hasNextPage,
        };
    } catch (error) {
        console.error("AniList search failed:", error);
        return { media: [], hasMore: false };
    }
}

export async function searchManga(
    query: string,
    page = 1,
    perPage = 12
): Promise<{ media: AniListMedia[]; hasMore: boolean }> {
    try {
        const response = await fetch(ANILIST_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                query: SEARCH_QUERY,
                variables: {
                    search: query,
                    type: "MANGA",
                    page,
                    perPage,
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`AniList API error: ${response.status}`);
        }

        const data: AniListSearchResponse = await response.json();
        return {
            media: data.data.Page.media,
            hasMore: data.data.Page.pageInfo.hasNextPage,
        };
    } catch (error) {
        console.error("AniList search failed:", error);
        return { media: [], hasMore: false };
    }
}

// Convert AniList media to our unified format
export function anilistToMediaItem(media: AniListMedia) {
    const studio = media.studios.nodes[0]?.name || null;
    const mangaka = media.staff?.nodes[0]?.name?.full || null;
    const isManga = media.type === "MANGA";

    return {
        externalId: String(media.id),
        type: media.type.toLowerCase() as "anime" | "manga",
        title: media.title.english || media.title.romaji,
        image: media.coverImage.large,
        year: media.startDate.year ? String(media.startDate.year) : null,
        rating: media.averageScore ? media.averageScore / 10 : null,
        metadata: JSON.stringify({
            // For manga: mangaka (author), for anime: studio
            ...(isManga ? { mangaka } : { studio }),
            genres: media.genres.slice(0, 3),
            format: media.format,
            nativeTitle: media.title.native,
            // Manga-specific fields
            ...(isManga && media.volumes && { volumes: media.volumes }),
            ...(isManga && media.chapters && { chapters: media.chapters }),
        }),
    };
}
