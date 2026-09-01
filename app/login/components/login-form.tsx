"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { loginSchema, type LoginSchema } from "../schemas";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import LoginHeader from "./login-header";

export default function LoginForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginSchema) => {
    console.log("🚀 onSubmit dipanggil", data);

    startTransition(async () => {
      try {
        const result = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        console.log("📦 signIn result:", result);

        if (!result) {
          toast.error("Tidak ada response dari Auth.js");
          return;
        }

        if (result.error) {
          toast.error(result.error);
          return;
        }

        if (result.ok) {
          toast.success("Login berhasil!");

          // Fetch resolved session to get user role
          const sessionRes = await fetch("/api/auth/session");
          const sessionData = await sessionRes.json();
          const role = sessionData?.user?.role;

          console.log("🔑 Resolved Session Role after login:", role);

          if (role === "CUSTOMER") {
            router.push("/customer");
          } else {
            router.push("/dashboard");
          }

          router.refresh();
        }
      } catch (error) {
        console.error("❌ Login Error:", error);
        toast.error("Terjadi kesalahan saat login.");
      }
    });
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardContent className="space-y-6 p-5 sm:p-8">
        <LoginHeader
          title="Welcome Back"
          description="Sign in to continue to Nexora."
        />

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>

            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...register("email")}
            />

            {errors.email && (
              <p className="text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>

            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="********"
                {...register("password")}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-zinc-100 active:scale-95"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {errors.password && (
              <p className="text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="h-11 w-full bg-[#7F46FA] hover:bg-[#6D35F5]"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="flex flex-col gap-2 text-center text-sm">
          <Link href="/" className="font-medium text-[#7F46FA] hover:underline">
            ← Back to Home
          </Link>

          <p className="text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-[#7F46FA] hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
