import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const API_URL = process.env.API_INTERNAL_URL
  ?? process.env.NEXT_PUBLIC_API_URL
  ?? "http://localhost:4000";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",    type: "email" },
        phone:    { label: "Phone",    type: "text"  },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const password = credentials?.password as string;
        const email    = credentials?.email    as string | undefined;
        const phone    = credentials?.phone    as string | undefined;

        if (!password || (!email && !phone)) return null;

        try {
          const res = await fetch(`${API_URL}/api/v1/auth/login`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ email, phone, password }),
          });

          if (!res.ok) return null;

          const { data } = await res.json();
          const { user, accessToken, refreshToken } = data;

          return {
            id:           user.id,
            name:         user.fullName ?? user.email ?? user.phone ?? "User",
            email:        user.email,
            role:         user.role,
            accessToken,
            refreshToken,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        return {
          ...token,
          id:                  user.id,
          role:                (user as { role: string }).role,
          accessToken:         (user as { accessToken: string }).accessToken,
          refreshToken:        (user as { refreshToken: string }).refreshToken,
          accessTokenExpires:  Date.now() + 14 * 60 * 1000,
        };
      }

      // Token still valid
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Refresh expired access token (backend rotates both tokens)
      try {
        const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ refreshToken: token.refreshToken }),
        });

        if (!res.ok) throw new Error("Refresh failed");

        const { data } = await res.json();
        return {
          ...token,
          accessToken:        data.accessToken,
          refreshToken:       data.refreshToken ?? token.refreshToken,
          accessTokenExpires: Date.now() + 14 * 60 * 1000,
          error:              undefined,
        };
      } catch {
        return { ...token, error: "RefreshAccessTokenError" };
      }
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id:   token.id   as string,
          role: token.role as string,
        },
        accessToken: token.accessToken as string,
        error:       token.error       as string | undefined,
      };
    },
  },
  pages: {
    signIn: "/login",
    error:  "/login",
  },
});
