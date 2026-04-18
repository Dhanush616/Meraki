"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShieldIcon } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");
  const isDashboard = pathname?.startsWith("/dashboard");

  if (isAuthPage || isDashboard) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#e5e5e5] bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 transition-colors duration-300">
      <div className="mx-auto max-w-[1200px] flex h-16 items-center px-4 justify-between w-full">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-sans text-xl font-medium text-black tracking-tight flex items-center gap-2">
            <ShieldIcon className="w-5 h-5 text-black" strokeWidth={2.5} />
            Paradosis
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#737373]">
          <Link href="/#how-it-works" className="hover:text-black transition-colors">How it Works</Link>
          <Link href="/#features" className="hover:text-black transition-colors">Features</Link>
          <Link href="/#faq" className="hover:text-black transition-colors">FAQ</Link>
        </nav>
        <div className="flex items-center space-x-2">
          <Link href="/auth/signin">
            <Button variant="ghost" className="hidden sm:inline-flex text-black hover:bg-[#fafafa]">Sign In</Button>
          </Link>
          <Link href="/auth/signup">
            <Button className="bg-black text-white hover:bg-[#262626] rounded-full px-6 border-none">Get Started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
