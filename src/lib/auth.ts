import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

// Create a direct Prisma client for auth (not using the global singleton)
const prisma = new PrismaClient();

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        GitHub({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
        }),
        Google({
            clientId: process.env.GOOGLE_ID!,
            clientSecret: process.env.GOOGLE_SECRET!,
        }),
    ],
    trustHost: true, // Required for Vercel serverless
    debug: process.env.NODE_ENV === "development",
    callbacks: {
        async session({ session, user }) {
            if (session.user) {
                session.user.id = user.id;

                try {
                    const dbUser = await prisma.user.findUnique({
                        where: { id: user.id },
                        select: {
                            username: true,
                            accentColor: true,
                            bgTexture: true,
                            bio: true,
                            onboardingCompleted: true,
                        },
                    });

                    if (dbUser) {
                        session.user.username = dbUser.username;
                        session.user.accentColor = dbUser.accentColor;
                        session.user.bgTexture = dbUser.bgTexture;
                        session.user.bio = dbUser.bio;
                        session.user.onboardingCompleted = dbUser.onboardingCompleted;
                    }
                } catch (error) {
                    console.error("Session callback error:", error);
                }
            }
            return session;
        },
    },
    events: {
        async createUser({ user }) {
            if (user.email && user.id) {
                try {
                    const baseUsername = user.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
                    let username = baseUsername || "user";
                    let counter = 1;

                    while (await prisma.user.findUnique({ where: { username } })) {
                        username = `${baseUsername}${counter}`;
                        counter++;
                    }

                    await prisma.user.update({
                        where: { id: user.id },
                        data: { username },
                    });
                } catch (error) {
                    console.error("Create user event error:", error);
                }
            }
        },
    },
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
    },
});
