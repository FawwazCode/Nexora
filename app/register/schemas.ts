import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(3, "Nama minimal 3 karakter.")
      .max(50, "Nama maksimal 50 karakter."),

    email: z
      .string()
      .email("Format email tidak valid."),

    password: z
      .string()
      .min(8, "Password minimal 8 karakter.")
      .max(100, "Password maksimal 100 karakter.")
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d).+$/,
        "Password harus mengandung huruf dan angka."
      ),

    confirmPassword: z
      .string()
      .min(1, "Konfirmasi password wajib diisi."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi password tidak sama.",
  });

export type RegisterSchema = z.infer<typeof registerSchema>;