"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");

  if (isAuthPage) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-cream bg-parchment/80 backdrop-blur-md supports-[backdrop-filter]:bg-parchment/60 transition-colors duration-300">
      <div className="mx-auto max-w-[1200px] flex h-16 items-center px-4 justify-between w-full">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-serif text-2xl font-bold text-near-black tracking-tight flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-brand hidden sm:block delay-150"></span>
            Paradosis
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-olive-gray">
          <Link href="/#how-it-works" className="hover:text-brand transition-colors">How it Works</Link>
          <Link href="/#features" className="hover:text-brand transition-colors">Features</Link>
          <Link href="/#pricing" className="hover:text-brand transition-colors">Pricing</Link>
        </nav>
        <div className="flex items-center space-x-2">
          <Link href="/auth/signin">
            <Button variant="ghost" className="hidden sm:inline-flex text-near-black hover:text-brand hover:bg-brand/10">Sign In</Button>
          </Link>
          <Link href="/auth/signup">
            <Button className="bg-brand text-ivory hover:bg-[#b05637] shadow-sm rounded-full px-6 border-none">Get Started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
