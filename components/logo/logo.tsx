import Link from "next/link";

type LogoProps = {
  className?: string;
};

export default function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className ?? ""}`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7F46FA] text-lg font-bold text-white shadow-md">
        N
      </div>

      <div className="flex flex-col leading-none">
        <span className="text-xl font-bold text-gray-900">Nexora</span>
        <span className="text-xs text-gray-500">Premium Tech Store</span>
      </div>
    </Link>
  );
}