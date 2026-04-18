"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MailCheckIcon, ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[420px] bg-card rounded-3xl p-10 border border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-primary"></div>
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <MailCheckIcon className="w-10 h-10 text-primary" />
                </div>
                
                <h1 className="text-3xl font-sans font-bold text-foreground mb-4">Verify your email</h1>
                <p className="text-muted-foreground font-sans mb-8 leading-relaxed">
                    We&apos;ve sent a verification link to your email address. Please click the link to verify your account so you can begin building your vault safely.
                </p>
                
                <Link href="/auth/signin" className="w-full block">
                    <Button className="w-full bg-primary hover:bg-[#b05637] text-white py-6 rounded-xl text-base gap-2 group">
                        Proceed to Sign In 
                        <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </Link>
            </motion.div>
        </div>
    );
}
