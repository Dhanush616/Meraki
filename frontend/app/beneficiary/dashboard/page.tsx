"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    LogOutIcon, PackageOpenIcon, VideoIcon, FileDownIcon,
    ShieldCheckIcon, BuildingIcon, WalletIcon, LandmarkIcon, CreditCardIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";

const AssetDetailsCard = ({ type, details }: { type: string, details: any }) => {
    if (!details || Object.keys(details).length === 0) {
        return <p className="text-sm text-muted-foreground">No additional details available.</p>;
    }

    const renderField = (label: string, value: any) => (
        <div className="flex flex-col">
            <span className="text-xs text-muted-foreground capitalize">{label.replace(/_/g, " ")}</span>
            <span className="text-sm font-medium text-foreground">{value !== null && value !== undefined && value !== "" ? String(value) : "—"}</span>
        </div>
    );

    if (type === "bank_account" || type === "fixed_deposit") {
        return (
            <div className="grid sm:grid-cols-2 gap-4 bg-background border border-border p-4 rounded-xl">
                {details.account_type && renderField("Account Type", details.account_type)}
                {details.branch_address && renderField("Branch", details.branch_address)}
                {details.nominee_registered !== undefined && renderField("Nominee Status", details.nominee_registered === "true" || details.nominee_registered === true ? "Registered" : "Not Registered")}
                {details.nominee_name && renderField("Nominee Name", details.nominee_name)}
                {Object.entries(details).filter(([k]) => !['account_type', 'branch_address', 'nominee_registered', 'nominee_name'].includes(k)).map(([k, v]) => <React.Fragment key={k}>{renderField(k, v)}</React.Fragment>)}
            </div>
        );
    }

    if (type === "crypto_wallet") {
        return (
            <div className="grid sm:grid-cols-2 gap-4 bg-[#f8f9fa] dark:bg-[#1a1a1a] border border-border p-4 rounded-xl">
                {details.wallet_address && (
                    <div className="col-span-2">
                        <span className="text-xs text-muted-foreground">Wallet Address</span>
                        <div className="font-mono text-xs bg-muted p-2 rounded-md break-all mt-1">{details.wallet_address}</div>
                    </div>
                )}
                {details.chain && renderField("Network/Chain", details.chain)}
                {details.wallet_type && renderField("Wallet Type", details.wallet_type)}
                {details.has_hardware_wallet !== undefined && renderField("Hardware Wallet", details.has_hardware_wallet === "true" || details.has_hardware_wallet === true ? "Yes" : "No")}
                {Object.entries(details).filter(([k]) => !['wallet_address', 'chain', 'wallet_type', 'has_hardware_wallet'].includes(k)).map(([k, v]) => <React.Fragment key={k}>{renderField(k, v)}</React.Fragment>)}
            </div>
        );
    }

    if (type === "property") {
        return (
            <div className="grid sm:grid-cols-2 gap-4 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 p-4 rounded-xl">
                {details.registration_number && renderField("Registration No.", details.registration_number)}
                {details.survey_number && renderField("Survey No.", details.survey_number)}
                {details.area_sqft && renderField("Area (Sq Ft)", details.area_sqft)}
                {details.mortgage_status && renderField("Mortgage Status", details.mortgage_status)}
                {details.registrar_office && renderField("Registrar Office", details.registrar_office)}
                {Object.entries(details).filter(([k]) => !['registration_number', 'survey_number', 'area_sqft', 'mortgage_status', 'registrar_office'].includes(k)).map(([k, v]) => <React.Fragment key={k}>{renderField(k, v)}</React.Fragment>)}
            </div>
        );
    }

    if (type === "mutual_fund" || type === "stocks_demat") {
        return (
            <div className="grid sm:grid-cols-2 gap-4 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30 p-4 rounded-xl">
                {details.folio_number && renderField("Folio Number", details.folio_number)}
                {(details.amc_name || details.broker_name) && renderField("AMC / Broker", details.amc_name || details.broker_name)}
                {details.scheme_name && renderField("Scheme Name", details.scheme_name)}
                {details.dp_id && renderField("DP ID", details.dp_id)}
                {Object.entries(details).filter(([k]) => !['folio_number', 'amc_name', 'broker_name', 'scheme_name', 'dp_id'].includes(k)).map(([k, v]) => <React.Fragment key={k}>{renderField(k, v)}</React.Fragment>)}
            </div>
        );
    }

    // Generic Fallback
    return (
        <div className="grid sm:grid-cols-2 gap-3 bg-background border border-border p-4 rounded-xl">
            {Object.entries(details).map(([key, val]) => (
                <React.Fragment key={key}>{renderField(key, val)}</React.Fragment>
            ))}
        </div>
    );
};

export default function BeneficiaryDashboard() {
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedAssetForGuide, setSelectedAssetForGuide] = useState<any>(null);
    const [isGuideOpen, setIsGuideOpen] = useState(false);

    const openGuide = (asset: any) => {
        setSelectedAssetForGuide(asset);
        setIsGuideOpen(true);
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem("beneficiary_token");
                if (!token) {
                    router.push("/auth/signin");
                    return;
                }

                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                const res = await fetch(`${apiUrl}/api/beneficiaries/portal/dashboard`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (!res.ok) {
                    throw new Error("Failed to load dashboard data");
                }

                const json = await res.json();
                setData(json);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [router]);

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
                        <h1 className="text-3xl font-bold text-foreground mb-2">{data?.owner_name || "Vault Owner"}&apos;s Vault</h1>
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
                            {data?.allocated_assets?.length === 0 ? (
                                <p className="text-muted-foreground">No assets allocated to you.</p>
                            ) : (
                                data?.allocated_assets?.map((asset: any) => (
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
                                            <h4 className="text-xs font-bold uppercase text-muted-foreground mb-3 tracking-wider">Asset Details</h4>
                                            <AssetDetailsCard type={asset.asset_type} details={asset.details} />
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-border flex justify-end">
                                            <Button
                                                variant="outline"
                                                className="border-primary/20 hover:bg-primary/5 text-primary text-xs h-8"
                                                onClick={() => router.push(`/beneficiary/dashboard/guide/${asset.id}`)}
                                            >
                                                Inheritance Guide
                                            </Button>
                                        </div>

                                        {asset.other_beneficiaries && asset.other_beneficiaries.length > 0 && (
                                            <div className="mt-4 border-t border-border pt-4">
                                                <p className="text-xs text-muted-foreground">Also shared with: {asset.other_beneficiaries.map((b: any) => `${b.name} (${b.percentage}%)`).join(", ")}</p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}

                            {data?.other_assets?.length > 0 && (
                                <>
                                    <h2 className="text-xl font-bold text-foreground mb-4 mt-8">Other Assets in Vault</h2>
                                    {data?.other_assets?.map((asset: any) => (
                                        <div key={asset.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm opacity-80">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                                            </div>
                                            <div className="mt-4">
                                                <p className="text-sm text-muted-foreground">
                                                    Allocated to: {asset.beneficiaries?.map((b: any) => `${b.name} (${b.percentage}%)`).join(", ")}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-foreground mb-4">Personal Media</h2>

                        {data?.personal_message ? (
                            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                                    <VideoIcon className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-foreground mb-1">Personal Message</h3>
                                <p className="text-sm text-muted-foreground mb-4">{data.owner_name} recorded a private video message specifically for you.</p>
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 font-medium">Watch Video</Button>
                            </div>
                        ) : (
                            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm opacity-70">
                                <div className="w-12 h-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center mb-4">
                                    <VideoIcon className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-foreground mb-1">No Personal Message</h3>
                                <p className="text-sm text-muted-foreground">No private video message was left for you.</p>
                            </div>
                        )}

                        {data?.will_document ? (
                            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                                <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-4">
                                    <FileDownIcon className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-foreground mb-1">Legal Will (PDF)</h3>
                                <p className="text-sm text-muted-foreground mb-4">Download the executed will document assigning the allocated assets.</p>
                                <Button variant="outline" className="w-full rounded-xl gap-2 font-medium">Download PDF</Button>
                            </div>
                        ) : (
                            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm opacity-70">
                                <div className="w-12 h-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center mb-4">
                                    <FileDownIcon className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-foreground mb-1">No Legal Will Found</h3>
                                <p className="text-sm text-muted-foreground">No executed will document is available.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
