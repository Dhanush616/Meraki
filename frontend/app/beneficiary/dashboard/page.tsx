"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
    LogOutIcon, PackageOpenIcon, VideoIcon, FileDownIcon, 
    ShieldCheckIcon, BuildingIcon, WalletIcon, LandmarkIcon, CreditCardIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
<<<<<<< Updated upstream

const MOCK_ASSETS = [
    { 
        id: "1", 
        nickname: "HDFC Savings Account", 
        asset_type: "bank_account",
        percentage: 100, 
        details: { account_number: "XXXX-XXXX-1234", branch: "Anna Nagar, Chennai", balance_estimate: "4,50,000 INR" }
    },
    { 
        id: "2", 
        nickname: "Family Flat in Adyar", 
        asset_type: "property",
        percentage: 50, 
        details: { address: "14, Gandhi Nagar, Adyar", area: "1500 sqft", status: "fully_paid" }
    },
    { 
        id: "3", 
        nickname: "Bitcoin Wallet", 
        asset_type: "crypto_wallet",
        percentage: 100, 
        details: { wallet_type: "Hardware (Ledger)", location: "Left drawer of the study desk", instructions: "PIN is same as my secondary phone" }
=======
import { Logo } from "@/components/shared/Logo";

const AssetDetailsCard = ({ type, details }: { type: string, details: any }) => {
    if (!details || Object.keys(details).length === 0) {
        return <p className="text-sm text-muted-foreground">No additional details available.</p>;
>>>>>>> Stashed changes
    }
];

export default function BeneficiaryDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => setLoading(false), 800);
    }, []);

    function signOut() {
        localStorage.removeItem("beneficiary_token");
        localStorage.removeItem("beneficiary_id");
        localStorage.removeItem("paradosis_access_token");
        localStorage.removeItem("guardian_token");
        router.push("/auth/signin");
    }

    const getAssetIcon = (type: string) => {
        if (type === "bank_account") return <LandmarkIcon className="w-5 h-5 text-indigo-600" />;
        if (type === "property") return <BuildingIcon className="w-5 h-5 text-emerald-600" />;
        if (type === "crypto_wallet") return <WalletIcon className="w-5 h-5 text-orange-600" />;
        return <CreditCardIcon className="w-5 h-5 text-blue-600" />;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col px-4 py-8 pb-24 font-sans">
            <header className="w-full max-w-5xl mx-auto flex items-center justify-between mb-12">
                <Logo />
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex px-3 py-1.5 bg-green-50/50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20 rounded-full text-xs font-bold uppercase tracking-wider items-center gap-1.5">
                        <ShieldCheckIcon className="w-3.5 h-3.5" /> Vault Unlocked
                    </div>
                    <button onClick={signOut} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
                        <LogOutIcon className="w-4 h-4" /> <span className="hidden sm:inline">Sign out</span>
                    </button>
                </div>
            </header>

            <main className="w-full max-w-5xl mx-auto flex-1 flex flex-col">
                <div className="bg-card border border-border shadow-sm rounded-3xl p-8 mb-8 flex flex-col sm:flex-row items-center gap-6 justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">Arjun's Vault</h1>
                        <p className="text-muted-foreground">The death certificate has been verified. You now have full access to your allocated assets, personal messages, and next-step instructions left by the vault owner.</p>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <PackageOpenIcon className="w-8 h-8 text-primary" />
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold text-foreground mb-4">Allocated Assets</h2>
                        <div className="space-y-4">
                            {MOCK_ASSETS.map((asset) => (
                                <div key={asset.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                                                {getAssetIcon(asset.asset_type)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-foreground">{asset.nickname}</h3>
                                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                    {asset.asset_type.replace("_", " ")}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-lg text-sm font-bold">
                                            {asset.percentage}% Share
                                        </div>
                                    </div>
                                    
                                    <div className="bg-muted border border-border rounded-xl p-4 mt-4">
                                        <h4 className="text-xs font-bold uppercase text-muted-foreground mb-3 tracking-wider">Confidential Details</h4>
                                        <div className="grid sm:grid-cols-2 gap-3">
                                            {Object.entries(asset.details).map(([key, val]) => (
                                                <div key={key}>
                                                    <p className="text-xs text-muted-foreground capitalize">{key.replace("_", " ")}</p>
                                                    <p className="text-sm font-medium text-foreground">{val as string}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-foreground mb-4">Personal Media</h2>
                        
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                                <VideoIcon className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-foreground mb-1">Personal Message</h3>
                            <p className="text-sm text-muted-foreground mb-4">Arjun recorded a private video message specifically for you.</p>
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 font-medium">Watch Video</Button>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-4">
                                <FileDownIcon className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-foreground mb-1">Legal Will (PDF)</h3>
                            <p className="text-sm text-muted-foreground mb-4">Download the executed will document assigning your allocated assets.</p>
                            <Button variant="outline" className="w-full rounded-xl gap-2 font-medium">Download PDF</Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
