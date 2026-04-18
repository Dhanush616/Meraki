"use client";
import Link from "next/link";
import { PlusIcon, VideoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QuickActions() {
    return (
        <div className="space-y-3">
            {[
                { href: "/dashboard/vault/add", icon: <PlusIcon className="w-4 h-4" />, label: "Add Asset" },
                { href: "/dashboard/intent",    icon: <VideoIcon className="w-4 h-4" />,   label: "Record Intent" },
            ].map((a) => (
                <Link key={a.href} href={a.href} className="block w-full">
                    <Button variant="outline" className="w-full justify-start gap-3 rounded-lg border-border h-11 hover:bg-muted transition-colors font-medium">
                        {a.icon}
                        {a.label}
                    </Button>
                </Link>
            ))}
        </div>
    );
}
