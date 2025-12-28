import "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            username: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            accentColor: string;
            bgTexture: string;
            bio?: string | null;
            onboardingCompleted: boolean;
        };
    }

    interface User {
        username?: string;
        accentColor?: string;
        bgTexture?: string;
        bio?: string | null;
        onboardingCompleted?: boolean;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        username: string;
        accentColor: string;
        bgTexture: string;
    }
}
