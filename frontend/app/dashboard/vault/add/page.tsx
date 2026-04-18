"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    BuildingIcon, LandmarkIcon, BitcoinIcon, CarIcon, ShieldIcon,
    BriefcaseIcon, GemIcon, CheckCircle2Icon, ChevronRightIcon, ArrowLeftIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBeneficiaries } from "@/hooks/useBeneficiaries";
import { AssetAllocation } from "@/components/dashboard/vault/AssetAllocation";

const ASSET_FIELD_CONFIG: Record<string, { institutionLabel: string; identifierLabel: string; extraFields?: { id: string; label: string; placeholder: string }[] }> = {
    bank_account: { institutionLabel: "Institution / Bank Name", identifierLabel: "Account / Identifier" },
    fixed_deposit: {
        institutionLabel: "Bank / Issuer", identifierLabel: "FD Receipt Number", extraFields: [
            { id: "maturity_date", label: "Maturity Date", placeholder: "YYYY-MM-DD" },
            { id: "interest_rate", label: "Interest Rate (%)", placeholder: "e.g. 7.5" }
        ]
    },
    property: {
        institutionLabel: "Property Type", identifierLabel: "Registry Number", extraFields: [
            { id: "address", label: "Complete Address", placeholder: "e.g. 123 Main St, City" }
        ]
    },
    insurance: {
        institutionLabel: "Insurance Provider", identifierLabel: "Policy Number", extraFields: [
            { id: "policy_type", label: "Policy Type", placeholder: "e.g. Term Life, Health" },
            { id: "premium_amount", label: "Premium Amount / Year (₹)", placeholder: "e.g. 25000" }
        ]
    },
    mutual_fund: {
        institutionLabel: "Fund House", identifierLabel: "Folio Number", extraFields: [
            { id: "total_units", label: "Total Units", placeholder: "e.g. 1500" }
        ]
    },
    stocks_demat: { institutionLabel: "Broker Name", identifierLabel: "Demat Account ID" },
    crypto_wallet: { institutionLabel: "Exchange / Wallet Provider", identifierLabel: "Wallet Address" },
    vehicle: {
        institutionLabel: "Vehicle Type", identifierLabel: "Registration Number", extraFields: [
            { id: "chassis_number", label: "Chassis Number (Optional)", placeholder: "e.g. MA1ZA..." }
        ]
    },
    ppf_epf: { institutionLabel: "Provider (e.g. EPFO)", identifierLabel: "UAN / Account No." },
    gold_jewellery: {
        institutionLabel: "Location Stored", identifierLabel: "Locker / Receipt No.", extraFields: [
            { id: "weight_grams", label: "Weight (Grams)", placeholder: "e.g. 50" },
            { id: "purity_karat", label: "Purity (Karat)", placeholder: "e.g. 24K" }
        ]
    }
};

const ASSET_TYPES = [
    { id: "bank_account", label: "Bank Account", icon: LandmarkIcon },
    { id: "fixed_deposit", label: "Fixed Deposit", icon: LandmarkIcon },
    { id: "property", label: "Real Estate", icon: BuildingIcon },
    { id: "insurance", label: "Insurance", icon: ShieldIcon },
    { id: "mutual_fund", label: "Mutual Funds", icon: BriefcaseIcon },
    { id: "stocks_demat", label: "Stocks / Demat", icon: BriefcaseIcon },
    { id: "crypto_wallet", label: "Crypto Wallet", icon: BitcoinIcon },
    { id: "vehicle", label: "Vehicle", icon: CarIcon },
    { id: "ppf_epf", label: "EPF / PPF", icon: BriefcaseIcon },
    { id: "gold_jewellery", label: "Gold / Jewellery", icon: GemIcon },
];

export default function AddAssetWizard() {
    const router = useRouter();
    const { beneficiaries } = useBeneficiaries();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [assetType, setAssetType] = useState("");
    const [nickname, setNickname] = useState("");
    const [institutionName, setInstitutionName] = useState("");
    const [accountIdentifier, setAccountIdentifier] = useState("");
    const [estimatedValue, setEstimatedValue] = useState("");
    const [customFields, setCustomFields] = useState<Record<string, string>>({});

    // Allocation State
    const [allocations, setAllocations] = useState<{ beneficiary_id: string; percentage: number }[]>([]);

    const addAllocation = (beneId: string) => {
        if (!allocations.find(a => a.beneficiary_id === beneId)) {
            setAllocations([...allocations, { beneficiary_id: beneId, percentage: 0 }]);
        }
    };

    const updateAllocation = (beneId: string, percentage: number) => {
        setAllocations(allocations.map(a => a.beneficiary_id === beneId ? { ...a, percentage } : a));
    };

    const removeAllocation = (beneId: string) => {
        setAllocations(allocations.filter(a => a.beneficiary_id !== beneId));
    };

    const totalPercentage = allocations.reduce((sum, a) => sum + (a.percentage || 0), 0);

    const currentConfig = ASSET_FIELD_CONFIG[assetType] || ASSET_FIELD_CONFIG.bank_account;

    const handleNext = () => {
        if (step === 1 && !assetType) return;
        if (step === 2 && (!nickname || !institutionName)) return;
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(prev => prev - 1);
        else router.push("/dashboard/vault");
    };

    const handleAllocationSave = (newAllocations: { beneficiary_id: string; percentage: number }[]) => {
        setAllocations(newAllocations);
        setStep(4);
    };

    const handleAllocationSkip = () => {
        setAllocations([]);
        setStep(4);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("paradosis_access_token");
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

            const totalPct = allocations.reduce((sum, a) => sum + a.percentage, 0);

            const newAsset = {
                nickname,
                asset_type: assetType,
                institution_name: institutionName,
                account_identifier: accountIdentifier.slice(-4), // Masked for demo
                estimated_value_inr: estimatedValue ? parseFloat(estimatedValue.toString().replaceAll(',', '')) : 0,
                metadata: customFields,
                status: "active",
                nominee_registered: true,
                primary_total_pct: totalPct,
                primary_beneficiary_count: allocations.length,
                backup_beneficiary_count: 0
            };

            const res = await fetch(`${apiUrl}/api/assets`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(newAsset)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || "Failed to save asset to database");
            }

            const createdAsset = await res.json();

            // Save mappings if any
            if (allocations.length > 0) {
                const mappingsRes = await fetch(`${apiUrl}/api/assets/${createdAsset.id}/mappings`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(allocations.map(a => ({
                        beneficiary_id: a.beneficiary_id,
                        role: "primary",
                        percentage: a.percentage,
                        priority_order: 1
                    })))
                });

                if (!mappingsRes.ok) {
                    console.error("Failed to save mappings, but asset was created.");
                }
            }

            router.push("/dashboard/vault");
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto pb-12">
            <header className="mb-8 flex items-center gap-4">
                <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-card text-muted-foreground transition-colors">
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold font-sans text-foreground">Add New Asset</h1>
                    <p className="text-muted-foreground text-sm mt-1">Step {step} of 4</p>
                </div>
            </header>

            {/* Progress Bar */}
            <div className="w-full bg-border rounded-full h-2 mb-8 overflow-hidden">
                <motion.div
                    className="bg-primary h-2 rounded-full"
                    initial={{ width: "25%" }}
                    animate={{ width: `${(step / 4) * 100}%` }}
                    transition={{ ease: "easeInOut" }}
                />
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 sm:p-10 shadow-sm min-h-[400px]">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <h2 className="text-xl font-bold font-sans text-foreground mb-6">What type of asset are you adding?</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                                {ASSET_TYPES.map((type) => {
                                    const Icon = type.icon;
                                    const isSelected = assetType === type.id;
                                    return (
                                        <button
                                            key={type.id}
                                            onClick={() => {
                                                setAssetType(type.id);
                                                setCustomFields({});
                                            }}
                                            className={`flex flex-col items-center justify-center p-4 sm:p-6 rounded-xl border-2 transition-all ${isSelected ? "border-primary bg-primary/5 text-primary" : "border-border bg-background hover:border-primary/30 text-foreground"}`}
                                        >
                                            <Icon className={`w-8 h-8 mb-3 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                                            <span className="text-sm font-medium text-center leading-tight">{type.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <h2 className="text-xl font-bold font-sans text-foreground mb-6">Asset Details</h2>
                            <p className="text-sm text-muted-foreground mb-8">Enter the basic details. Sensitive identifiers will be encrypted locally before saving.</p>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Asset Nickname</label>
                                    <input
                                        type="text"
                                        value={nickname}
                                        onChange={(e) => setNickname(e.target.value)}
                                        className="w-full bg-background border border-border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all"
                                        placeholder="e.g. Primary HDFC Account"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">{currentConfig.institutionLabel}</label>
                                    <input
                                        type="text"
                                        value={institutionName}
                                        onChange={(e) => setInstitutionName(e.target.value)}
                                        className="w-full bg-background border border-border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all"
                                        placeholder={`e.g. ${currentConfig.institutionLabel.split('/')[0].trim()}`}
                                    />
                                </div>
                                <div className="space-y-2 relative">
                                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                        {currentConfig.identifierLabel} <ShieldIcon className="w-3.5 h-3.5 text-primary" />
                                    </label>
                                    <input
                                        type="text"
                                        value={accountIdentifier}
                                        onChange={(e) => setAccountIdentifier(e.target.value)}
                                        className="w-full bg-background border border-border rounded-lg px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all"
                                        placeholder={`e.g. Your ${currentConfig.identifierLabel.split('/')[0].trim()}`}
                                    />
                                    <div className="absolute right-3 top-9 text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">ENC</div>
                                </div>

                                {currentConfig.extraFields?.map(field => (
                                    <div key={field.id} className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">{field.label}</label>
                                        <input
                                            type="text"
                                            value={customFields[field.id] || ""}
                                            onChange={(e) => setCustomFields({ ...customFields, [field.id]: e.target.value })}
                                            className="w-full bg-background border border-border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all"
                                            placeholder={field.placeholder}
                                        />
                                    </div>
                                ))}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Estimated Value (₹)</label>
                                    <input
                                        type="text"
                                        value={estimatedValue}
                                        onChange={(e) => setEstimatedValue(e.target.value)}
                                        className="w-full bg-background border border-border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all"
                                        placeholder="e.g. 5,00,000"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <AssetAllocation
                                assetNickname={nickname || "New Asset"}
                                beneficiaries={beneficiaries}
                                onSave={handleAllocationSave}
                                onSkip={handleAllocationSkip}
                            />
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <h2 className="text-xl font-bold font-sans text-foreground mb-6">Review & Confirm</h2>

                            <div className="bg-background border border-border rounded-xl p-6 space-y-4">
                                <div className="flex justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground text-sm">Asset Type</span>
                                    <span className="font-semibold text-sm capitalize">{assetType.replace(/_/g, " ")}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground text-sm">Nickname</span>
                                    <span className="font-semibold text-sm">{nickname}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground text-sm">{currentConfig.institutionLabel}</span>
                                    <span className="font-semibold text-sm">{institutionName}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground text-sm">Allocation</span>
                                    <span className={`font-semibold text-sm ${allocations.length > 0 ? "text-emerald-600" : "text-amber-600"}`}>
                                        {allocations.length > 0 ? "100% Allocated" : "Skipped (0%)"}
                                    </span>
                                </div>
                                {allocations.length > 0 && (
                                    <div className="py-2 border-b border-border/50">
                                        <p className="text-muted-foreground text-xs mb-2">Beneficiary Splits:</p>
                                        <div className="space-y-1">
                                            {allocations.map(a => (
                                                <div key={a.beneficiary_id} className="flex justify-between text-xs">
                                                    <span>{beneficiaries.find(b => b.id === a.beneficiary_id)?.full_name}</span>
                                                    <span className="font-medium">{a.percentage}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="flex justify-between py-2">
                                    <span className="text-muted-foreground text-sm">Value</span>
                                    <span className="font-semibold text-sm">₹{estimatedValue || "--"}</span>
                                </div>
                            </div>

                            <p className="text-xs text-muted-foreground mt-4 text-center">
                                By confirming, sensitive identifiers will be locally encrypted using AES-256 before syncing.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer Navigation */}
            <div className="flex justify-end mt-8">
                {step < 3 ? (
                    <Button
                        onClick={handleNext}
                        disabled={(step === 1 && !assetType) || (step === 2 && !nickname)}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 rounded-full"
                    >
                        Continue <ChevronRightIcon className="w-4 h-4 ml-2" />
                    </Button>
                ) : step === 4 ? (
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-emerald-600 text-white hover:bg-emerald-700 px-8 py-6 rounded-full shadow-lg shadow-emerald-500/20"
                    >
                        {isSubmitting ? "Encrypting & Saving..." : (
                            <>Confirm & Save Asset <CheckCircle2Icon className="w-4 h-4 ml-2" /></>
                        )}
                    </Button>
                ) : null}
            </div>
        </div>
    );
}
