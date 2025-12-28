import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Lazy initialization to avoid errors during build phase
function getPrismaClient(): PrismaClient {
    if (!globalForPrisma.prisma) {
        globalForPrisma.prisma = new PrismaClient({
            log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
        });
    }
    return globalForPrisma.prisma;
}

// Export a proxy that lazily initializes the client on first use
// This prevents initialization during Next.js build's "Collecting page data" phase
const prisma = new Proxy({} as PrismaClient, {
    get(target, prop) {
        const client = getPrismaClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (client as any)[prop];
    },
});

export { prisma };
export default prisma;
