"use client";
import React from "react";
import { useScroll, useTransform } from "framer-motion";
import { GoogleGeminiEffect } from "@/components/ui/google-gemini-effect";

export function HeroGemini() {
    const ref = React.useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });

    const pathLengths = [
        useTransform(scrollYProgress, [0, 0.8], [0.2, 1.2]),
        useTransform(scrollYProgress, [0, 0.8], [0.15, 1.2]),
        useTransform(scrollYProgress, [0, 0.8], [0.1, 1.2]),
        useTransform(scrollYProgress, [0, 0.8], [0.05, 1.2]),
        useTransform(scrollYProgress, [0, 0.8], [0, 1.2]),
    ];

    return (
        <div
            className="h-[200vh] w-full relative pt-20 overflow-clip"
            ref={ref}
        >
            <GoogleGeminiEffect
                pathLengths={pathLengths}
                title="Everything you built,\nin the right hands."
                description="Paradosis helps you organise every asset you own — bank accounts, property, insurance, and crypto — and ensures your family receives it all without the paperwork nightmare."
            />
        </div>
    );
}