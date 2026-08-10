import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";

import authConfig from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";

export const {
  handlers,
  signIn,
  signOut,
  auth,
} = NextAuth({
  // Konfigurasi yang ringan dan bisa dipakai middleware
  ...authConfig,

  // Prisma hanya digunakan di auth server-side
  adapter: PrismaAdapter(prisma),

  // Gunakan JWT supaya session tidak membutuhkan database session
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

        // Pastikan email dan password tersedia
        if (
          !credentials?.email ||
          !credentials?.password
        ) {
          console.log("❌ Email atau password kosong");
          return null;
        }

        const email = String(credentials.email);
        const password = String(credentials.password);

        console.log("📧 Login:", email);

        // Cari user berdasarkan email
        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (!user) {
          console.log("❌ User tidak ditemukan");
          return null;
        }

        // Pastikan user mempunyai password
        if (!user.password) {
          console.log("❌ User tidak memiliki password");
          return null;
        }

        if (!user.isActive) {
          console.log("❌ Akun ter-nonaktifkan");
          return null;
        }

        // Bandingkan password dengan hash di database
        const isValid = await compare(
          password,
          user.password
        );

        console.log(
          "🔑 Password valid:",
          isValid
        );

        if (!isValid) {
          console.log("❌ Password salah");
          return null;
        }

        console.log("✅ LOGIN BERHASIL. Role resolved:", user.role);

        // Data ini akan masuk ke JWT
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: String(user.role),
        };
      },
    }),
  ],
});