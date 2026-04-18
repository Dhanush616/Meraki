"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
    LayoutDashboardIcon, ShieldCheckIcon, UsersIcon, 
    VideoIcon, FileTextIcon, AlertTriangleIcon, 
    ActivityIcon, SettingsIcon, LogOutIcon, WalletIcon
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const handleSignOut = () => {
        localStorage.removeItem("paradosis_access_token");
        router.push("/auth/signin");
    };

    const navLinks = [
        { name: "Overview", href: "/dashboard", icon: <LayoutDashboardIcon className="w-5 h-5" /> },
        { name: "My Vault", href: "/dashboard/vault", icon: <WalletIcon className="w-5 h-5" /> },
        { name: "Beneficiaries", href: "/dashboard/beneficiaries", icon: <UsersIcon className="w-5 h-5" /> },
        { name: "Intent Declaration", href: "/dashboard/intent", icon: <VideoIcon className="w-5 h-5" /> },
        { name: "Will Document", href: "/dashboard/will", icon: <FileTextIcon className="w-5 h-5" /> },
        { name: "Escalation", href: "/dashboard/escalation", icon: <AlertTriangleIcon className="w-5 h-5" /> },
        { name: "Health Score", href: "/dashboard/health", icon: <ActivityIcon className="w-5 h-5" /> },
        { name: "Security", href: "/dashboard/security", icon: <ShieldCheckIcon className="w-5 h-5" /> },
        { name: "Activity Log", href: "/dashboard/activity", icon: <ActivityIcon className="w-5 h-5" /> },
    ];

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar Desktop */}
            <aside className="hidden md:flex w-64 flex-col bg-card border-r border-border pt-6">
                <Link href="/dashboard" className="px-6 mb-8 block">
                    <span className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-primary"></span>
                        Paradosis
                    </span>
                </Link>
                <nav className="flex-1 px-4 space-y-1">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link 
                                key={link.name} 
                                href={link.href}
                                className={"flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors " + (isActive ? "bg-muted text-foreground border border-border" : "text-muted-foreground border border-transparent hover:bg-muted/50 hover:text-foreground")}
                            >
                                {link.icon}
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-border mt-auto space-y-2">
                    <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 w-full text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50 border border-transparent hover:border-border">
                        <SettingsIcon className="w-5 h-5" />
                        Settings
                    </Link>
                    <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2 w-full text-left text-sm font-medium text-destructive hover:bg-destructive/10 border border-transparent transition-colors rounded-lg">
                        <LogOutIcon className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-screen max-h-screen overflow-hidden">
                <header className="md:hidden bg-card border-b border-border px-4 py-4 flex items-center justify-between z-10">
                    <span className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        Paradosis
                    </span>
                </header>
                <main className="flex-1 overflow-auto p-4 md:p-8 bg-background relative z-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
