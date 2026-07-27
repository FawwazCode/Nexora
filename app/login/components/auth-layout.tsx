import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({
  children,
}: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">

      {/* Left */}

      <div className="hidden lg:flex flex-col justify-center bg-[#7F46FA] p-16 text-white">

        <div className="max-w-md space-y-6">

          <div className="text-5xl font-black">
            Nexora
          </div>

          <h2 className="text-4xl font-bold leading-tight">
            Premium Tech Store
          </h2>

          <p className="text-white/80">
            Discover the latest smartphones with a premium
            shopping experience designed for speed,
            simplicity, and security.
          </p>

        </div>
      </div>

      {/* Right */}

      <div className="flex items-center justify-center bg-gray-50 p-6">

        <div className="w-full max-w-md">

          {children}

        </div>

      </div>
    </div>
  );
}