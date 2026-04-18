"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { PlusCircleIcon, VideoIcon } from "lucide-react";

export function QuickActions() {
    return (
        <div className="grid grid-cols-2 gap-4">
            {[
                { href: "/dashboard/vault/add", icon: <PlusCircleIcon className="w-7 h-7 text-primary" />, label: "Add Asset",    hover: "hover:border-ring/40 hover:bg-primary/5" },
                { href: "/dashboard/intent",    icon: <VideoIcon className="w-7 h-7 text-blue-600" />,   label: "Record Will", hover: "hover:border-blue-400/40 hover:bg-blue-50" },
            ].map((a) => (
                <Link key={a.href} href={a.href}>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`flex flex-col items-center justify-center p-5 bg-card rounded-2xl border border-oat-border transition-all text-center cursor-pointer ${a.hover}`}>
                        {a.icon}
                        <span className="mt-2.5 text-sm font-medium text-foreground">{a.label}</span>
                    </motion.div>
                </Link>
            ))}
        </div>
    );
}
