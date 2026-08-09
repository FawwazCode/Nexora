import type { NextAuthConfig } from "next-auth";

const authConfig = {
  pages: {
    signIn: "/login",
  },

  providers: [],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        const sessionUser = session.user as {
          id?: string;
          role?: string;
        };

        sessionUser.id = token.sub ?? undefined;

        sessionUser.role =
          typeof token.role === "string"
            ? token.role
            : undefined;
      }

      return session;
    },
  },
} satisfies NextAuthConfig;

export default authConfig;