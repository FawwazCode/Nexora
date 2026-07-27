import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";

import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        console.log("========== LOGIN ATTEMPT ==========");

        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Email atau password kosong");
          return null;
        }

        console.log("📧 Email:", credentials.email);

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });

        console.log("👤 User ditemukan:", user);

        if (!user) {
          console.log("❌ User tidak ditemukan");
          return null;
        }

        if (!user.password) {
          console.log("❌ User tidak memiliki password");
          return null;
        }

        const isValid = await compare(
          credentials.password as string,
          user.password
        );

        console.log("🔑 Password valid:", isValid);

        if (!isValid) {
          console.log("❌ Password salah");
          return null;
        }

        console.log("✅ LOGIN BERHASIL");

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string; role?: string }).id = token.sub!;
        const role = typeof token.role === "string" ? token.role : undefined;
        (session.user as { id?: string; role?: string }).role = role;
      }

      return session;
    },
  },
});