import type { NextAuthConfig } from "next-auth";

const authConfig = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "nexora-production-secret-key-placeholder",
  trustHost: true,
  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  providers: [],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role || "CUSTOMER";
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.sub ?? token.id ?? "") as string;
        session.user.role = (typeof token.role === "string" ? token.role : "CUSTOMER") as string;
      }

      return session;
    },
  },
} satisfies NextAuthConfig;

export default authConfig;