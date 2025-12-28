import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        GitHub({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
        }),
        Google({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET,
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            // Auto-generate username from email or name if not set
            if (user.email) {
                const existingUser = await prisma.user.findUnique({
                    where: { email: user.email },
                });

                if (!existingUser) {
                    // New user - create with auto-generated username
                    const baseUsername = user.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
                    let username = baseUsername;
                    let counter = 1;

                    // Ensure unique username
                    while (await prisma.user.findUnique({ where: { username } })) {
                        username = `${baseUsername}${counter}`;
                        counter++;
                    }

                    // The adapter will create the user, but we need to set username
                    // We'll handle this in the session callback
                }
            }
            return true;
        },
        async session({ session, user }) {
            if (session.user) {
                session.user.id = user.id;

                // Get full user data including username
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
            }
            return session;
        },
    },
    events: {
        async createUser({ user }) {
            // Set username after user is created by adapter
            if (user.email && user.id) {
                const baseUsername = user.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
                let username = baseUsername;
                let counter = 1;

                while (await prisma.user.findUnique({ where: { username } })) {
                    username = `${baseUsername}${counter}`;
                    counter++;
                }

                await prisma.user.update({
                    where: { id: user.id },
                    data: { username },
                });
                // Note: Default collections are now created during onboarding
            }
        },
    },
    pages: {
        signIn: "/auth/signin",
    },
});
