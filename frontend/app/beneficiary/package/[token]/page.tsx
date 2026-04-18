"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
    LandmarkIcon, BuildingIcon, ShieldIcon, TrendingUpIcon,
    BarChart2Icon, BitcoinIcon, CarIcon, PiggyBankIcon,
    GemIcon, BriefcaseIcon, PackageIcon, DownloadIcon,
    QuoteIcon, ExternalLinkIcon, HeartHandshakeIcon,
    ChevronDownIcon, ChevronUpIcon, MailIcon,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const ASSET_ICONS: Record<string, React.ReactNode> = {
    bank_account:       <LandmarkIcon className="w-5 h-5" />,
    fixed_deposit:      <BuildingIcon className="w-5 h-5" />,
    property:           <BuildingIcon className="w-5 h-5" />,
    insurance:          <ShieldIcon className="w-5 h-5" />,
    mutual_fund:        <TrendingUpIcon className="w-5 h-5" />,
    stocks_demat:       <BarChart2Icon className="w-5 h-5" />,
    crypto_wallet:      <BitcoinIcon className="w-5 h-5" />,
    vehicle:            <CarIcon className="w-5 h-5" />,
    ppf_epf:            <PiggyBankIcon className="w-5 h-5" />,
    gold_jewellery:     <GemIcon className="w-5 h-5" />,
    business_ownership: <BriefcaseIcon className="w-5 h-5" />,
    other:              <PackageIcon className="w-5 h-5" />,
};

function formatINR(v: number) {
    if (v >= 10_000_000) return `₹${(v / 10_000_000).toFixed(1)} Cr`;
    if (v >= 100_000)    return `₹${(v / 100_000).toFixed(1)} L`;
    return `₹${v.toLocaleString("en-IN")}`;
}

interface Asset {
    id: string;
    nickname: string;
    asset_type: string;
    type_label: string;
    institution: string;
    account_identifier: string;
    percentage: number;
    estimated_value_inr: number | null;
    next_steps: string;
}

interface Package {
    owner_name: string;
    date_of_passing: string | null;
    personal_message: string | null;
    beneficiary_name: string;
    assets: Asset[];
    crypto_tx: string | null;
    execution_id: string;
    beneficiary_id: string;
    package_id: string;
}

// ── Accordion item ─────────────────────────────────────────────────────────────

function AssetCard({ asset, packageToken, executionId, beneficiaryId }: {
    asset: Asset;
    packageToken: string;
    executionId: string;
    beneficiaryId: string;
}) {
    const [open, setOpen] = useState(false);
    const [downloading, setDownloading] = useState(false);

    async function downloadForm() {
        setDownloading(true);
        try {
            const res = await fetch(`${API}/api/documents/claim-form`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    asset_id: asset.id,
                    beneficiary_id: beneficiaryId,
                    execution_id: executionId,
                    package_access_token: packageToken,
                }),
            });
            if (!res.ok) throw new Error("Download failed");
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `claim_${asset.nickname.replace(/\s+/g, "_")}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch { } finally {
            setDownloading(false);
        }
    }

    const icon = ASSET_ICONS[asset.asset_type] ?? ASSET_ICONS.other;
    const isCrypto = asset.asset_type === "crypto_wallet";

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            {/* Card header */}
            <div className="p-5">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-white/60">
                        {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/40 font-medium uppercase tracking-wider">{asset.type_label}</p>
                        <h3 className="text-base font-semibold text-white mt-0.5">{asset.nickname}</h3>
                        {asset.institution && (
                            <p className="text-sm text-white/50 mt-0.5">{asset.institution}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <span className="text-sm font-medium text-white">
                                {asset.percentage.toFixed(0)}% share
                            </span>
                            {asset.estimated_value_inr && (
                                <span className="text-sm text-white/50">
                                    ≈ {formatINR(asset.estimated_value_inr * asset.percentage / 100)}
                                </span>
                            )}
                            {asset.account_identifier && (
                                <span className="text-xs text-white/30 font-mono">
                                    ···{asset.account_identifier.slice(-4)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Accordion toggle */}
            <button
                onClick={() => setOpen(v => !v)}
                className="w-full flex items-center justify-between px-5 py-3 border-t border-white/10 text-sm text-white/50 hover:text-white/70 hover:bg-white/5 transition-colors"
            >
                <span>What to do</span>
                {open ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
            </button>

            {/* Accordion content */}
            {open && (
                <div className="px-5 pb-5 pt-3 border-t border-white/5 space-y-4">
                    {isCrypto ? (
                        <p className="text-sm text-white/60">
                            Your crypto assets have been automatically routed to the wallet address on file.
                            No further action is required.
                        </p>
                    ) : (
                        <p className="text-sm text-white/60 leading-relaxed">{asset.next_steps}</p>
                    )}
                    <button
                        onClick={downloadForm}
                        disabled={downloading}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm font-medium transition-colors disabled:opacity-40"
                    >
                        <DownloadIcon className="w-4 h-4" />
                        {downloading ? "Generating…" : "Download Pre-filled Form"}
                    </button>
                </div>
            )}
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PackagePage() {
    const { token } = useParams<{ token: string }>();
    const [pkg, setPkg] = useState<Package | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [downloadingAll, setDownloadingAll] = useState(false);

    useEffect(() => {
        fetch(`${API}/api/execution/package/${token}`)
            .then(r => {
                if (!r.ok) throw new Error("Invalid or expired link");
                return r.json();
            })
            .then(setPkg)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [token]);

    async function downloadAll() {
        if (!pkg) return;
        setDownloadingAll(true);
        try {
            const res = await fetch(`${API}/api/documents/claim-forms/all`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    execution_id: pkg.execution_id,
                    beneficiary_id: pkg.beneficiary_id,
                    package_access_token: token,
                }),
            });
            if (!res.ok) throw new Error("Download failed");
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "inheritance_forms.zip";
            a.click();
            URL.revokeObjectURL(url);
        } catch { } finally {
            setDownloadingAll(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !pkg) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 text-center">
                <div className="max-w-sm">
                    <p className="text-white/40 text-sm mb-2">This link may have expired or is invalid.</p>
                    <p className="text-white/25 text-xs">{error}</p>
                </div>
            </div>
        );
    }

    const hasCrypto = pkg.crypto_tx !== null;
    const cryptoAssets = pkg.assets.filter(a => a.asset_type === "crypto_wallet");
    const nonCryptoAssets = pkg.assets.filter(a => a.asset_type !== "crypto_wallet");

    return (
        <div className="min-h-screen">
            {/* Letter header — full-width centered serif */}
            <div className="max-w-2xl mx-auto px-6 pt-20 pb-12 text-center">
                <div className="flex justify-center mb-8">
                    <HeartHandshakeIcon className="w-10 h-10 text-white/20" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-serif font-medium text-white leading-tight">
                    {pkg.owner_name} prepared this for you.
                </h1>
                <p className="text-white/50 text-lg mt-4 leading-relaxed font-serif">
                    They wanted to make sure you were taken care of. Below is everything they left for you,
                    and exactly what to do next.
                </p>
                {pkg.date_of_passing && (
                    <p className="text-white/30 text-sm mt-6">
                        Date of passing: {new Date(pkg.date_of_passing).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                )}
            </div>

            <div className="border-t border-white/10" />

            {/* Personal message */}
            {pkg.personal_message && (
                <div className="max-w-2xl mx-auto px-6 py-10">
                    <div className="bg-amber-950/30 border border-amber-500/20 rounded-2xl p-6">
                        <p className="text-xs font-medium uppercase tracking-wider text-amber-400/60 mb-4">
                            A message from {pkg.owner_name.split(" ")[0]}:
                        </p>
                        <div className="flex gap-3">
                            <QuoteIcon className="w-5 h-5 text-amber-400/40 shrink-0 mt-0.5" />
                            <blockquote className="text-white/70 font-serif text-base leading-relaxed italic">
                                {pkg.personal_message}
                            </blockquote>
                        </div>
                    </div>
                </div>
            )}

            {/* Assets */}
            <div className="max-w-2xl mx-auto px-6 pb-6">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-4">
                    What they left for you
                </h2>
                <div className="space-y-3">
                    {nonCryptoAssets.map(asset => (
                        <AssetCard
                            key={asset.id}
                            asset={asset}
                            packageToken={token}
                            executionId={pkg.execution_id}
                            beneficiaryId={pkg.beneficiary_id}
                        />
                    ))}
                </div>
            </div>

            {/* Crypto section */}
            {hasCrypto && (
                <div className="max-w-2xl mx-auto px-6 pb-6">
                    <div className="bg-violet-950/30 border border-violet-500/20 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <BitcoinIcon className="w-4 h-4 text-violet-400" />
                            <h3 className="text-sm font-semibold text-violet-200">Crypto Assets</h3>
                        </div>
                        <p className="text-sm text-white/60 mb-3">
                            Your crypto assets have been automatically routed to the wallet address on file.
                        </p>
                        {pkg.crypto_tx && (
                            <div className="bg-white/5 rounded-lg px-3 py-2 flex items-center justify-between gap-2">
                                <p className="text-xs font-mono text-white/40 truncate">{pkg.crypto_tx}</p>
                                <ExternalLinkIcon className="w-3.5 h-3.5 text-white/30 shrink-0" />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Download all */}
            {pkg.assets.length > 0 && (
                <div className="max-w-2xl mx-auto px-6 pb-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-white">Download All Forms</p>
                            <p className="text-xs text-white/40 mt-0.5">All pre-filled claim forms in one ZIP archive.</p>
                        </div>
                        <button
                            onClick={downloadAll}
                            disabled={downloadingAll}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-zinc-900 text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-40 shrink-0"
                        >
                            <DownloadIcon className="w-4 h-4" />
                            {downloadingAll ? "Generating…" : "Download All (ZIP)"}
                        </button>
                    </div>
                </div>
            )}

            {/* Support section */}
            <div className="max-w-2xl mx-auto px-6 pb-20">
                <div className="text-center py-10 border-t border-white/10">
                    <MailIcon className="w-6 h-6 text-white/20 mx-auto mb-3" />
                    <p className="text-sm font-medium text-white/60">Need help?</p>
                    <p className="text-white/30 text-sm mt-1">Our team is here for you.</p>
                    <a
                        href="mailto:support@amaanat.in"
                        className="inline-flex items-center gap-1.5 mt-3 text-sm text-white/50 hover:text-white/70 underline underline-offset-2 transition-colors"
                    >
                        support@amaanat.in
                    </a>
                </div>
            </div>
        </div>
    );
}
