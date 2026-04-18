import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
    title: "Paradosis",
    description: "Everything you built. In the right hands.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`font-sans antialiased text-black bg-white`}>
                <Navbar />
                {children}
                <Toaster position="top-right" richColors />
            </body>
        </html>
    );
}