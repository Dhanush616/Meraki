"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    UploadCloudIcon, FileTextIcon, CheckCircle2Icon,
    XCircleIcon, ArrowLeftIcon, LoaderIcon, ArrowRightIcon,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Step = "instructions" | "upload" | "processing" | "result";

interface VerificationResult {
    status: "verified" | "rejected";
    rejection_reason?: string;
    liveness_window_days?: number;
    submission_id?: string;
}

export default function BeneficiaryVerifyPage() {
    const router = useRouter();
    const fileRef = useRef<HTMLInputElement>(null);
    const [step, setStep] = useState<Step>("instructions");
    const [dragOver, setDragOver] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<VerificationResult | null>(null);
    const [ownerId, setOwnerId] = useState("");

    const token = typeof window !== "undefined" ? localStorage.getItem("paradosis_access_token") || localStorage.getItem("beneficiary_token") : null;
    const beneficiaryId = typeof window !== "undefined" ? localStorage.getItem("beneficiary_id") || "" : "";

    function handleFile(f: File) {
        const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
        if (!allowed.includes(f.type)) { alert("Please upload a PDF or image file."); return; }
        if (f.size > 10 * 1024 * 1024) { alert("File must be under 10 MB."); return; }
        setFile(f);
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
    }

    async function submitCertificate() {
        if (!file || !ownerId.trim()) return;
        setStep("processing");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("owner_id", ownerId.trim());
        formData.append("beneficiary_id", beneficiaryId);

        try {
            const res = await fetch(`${API}/api/verification/submit`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Submission failed");
            setResult({ status: data.status, rejection_reason: data.rejection_reason, liveness_window_days: data.liveness_window_days });
            setStep("result");
        } catch (e: any) {
            setResult({ status: "rejected", rejection_reason: e.message });
            setStep("result");
        }
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="px-6 py-5 border-b border-white/5 flex items-center gap-4">
                <button
                    onClick={() => step === "instructions" ? router.back() : setStep("instructions")}
                    className="text-white/40 hover:text-white/70 transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium text-white/60">Death Certificate Verification</span>
            </header>

            <main className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-lg">

                    {/* Step 1 — Instructions */}
                    {step === "instructions" && (
                        <div className="space-y-6 text-center">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                                <FileTextIcon className="w-7 h-7 text-white/40" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-serif font-medium text-white mb-3">Upload the Death Certificate</h1>
                                <p className="text-white/50 leading-relaxed">
                                    Please obtain the official death certificate. If you have a digital copy,
                                    you can download it from{" "}
                                    <a href="https://digilocker.gov.in" target="_blank" rel="noopener noreferrer" className="text-white/70 underline">
                                        DigiLocker
                                    </a>
                                    {" "}or your local Municipal Corporation portal.
                                </p>
                            </div>
                            <div className="bg-white/5 rounded-xl border border-white/10 p-4 text-left space-y-2">
                                {["PDF, JPG, or PNG format", "Under 10 MB", "Clear, readable scan or digital copy", "Must show name, date, and issuing authority"].map(t => (
                                    <div key={t} className="flex items-center gap-2 text-sm text-white/60">
                                        <CheckCircle2Icon className="w-3.5 h-3.5 text-white/30 shrink-0" />
                                        {t}
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => setStep("upload")}
                                className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-white text-zinc-900 text-sm font-medium hover:bg-white/90 transition-colors"
                            >
                                Continue <ArrowRightIcon className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Step 2 — Upload */}
                    {step === "upload" && (
                        <div className="space-y-5">
                            <h2 className="text-xl font-serif font-medium text-white text-center">Upload Certificate</h2>

                            {/* Owner ID input */}
                            <div>
                                <label className="block text-xs font-medium text-white/40 mb-1.5">
                                    Vault Owner&apos;s User ID
                                    <span className="text-white/25 ml-1">(provided separately by Amaanat)</span>
                                </label>
                                <input
                                    type="text"
                                    value={ownerId}
                                    onChange={e => setOwnerId(e.target.value)}
                                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                                    className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 font-mono focus:outline-none focus:ring-2 focus:ring-white/20"
                                />
                            </div>

                            {/* Drop zone */}
                            <div
                                onDrop={handleDrop}
                                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onClick={() => fileRef.current?.click()}
                                className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
                                    dragOver ? "border-white/40 bg-white/10" : "border-white/15 hover:border-white/25 hover:bg-white/5"
                                }`}
                            >
                                <UploadCloudIcon className="w-8 h-8 text-white/30" />
                                {file ? (
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-white">{file.name}</p>
                                        <p className="text-xs text-white/40 mt-1">{(file.size / 1024).toFixed(0)} KB · Click to change</p>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <p className="text-sm text-white/60">Drag & drop or click to select</p>
                                        <p className="text-xs text-white/30 mt-1">PDF, JPG, PNG — max 10 MB</p>
                                    </div>
                                )}
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept=".pdf,image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                                />
                            </div>

                            <button
                                onClick={submitCertificate}
                                disabled={!file || !ownerId.trim()}
                                className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-white text-zinc-900 text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                Submit for Verification
                            </button>
                        </div>
                    )}

                    {/* Step 3 — Processing */}
                    {step === "processing" && (
                        <div className="text-center space-y-6 py-12">
                            <LoaderIcon className="w-12 h-12 text-white/40 mx-auto animate-spin" />
                            <div>
                                <h2 className="text-xl font-serif font-medium text-white mb-2">Verifying Certificate</h2>
                                <p className="text-white/50">Verifying certificate with government records…</p>
                                <p className="text-white/30 text-sm mt-2">This may take a moment.</p>
                            </div>
                        </div>
                    )}

                    {/* Step 4 — Result */}
                    {step === "result" && result && (
                        <div className="text-center space-y-6 py-6">
                            {result.status === "verified" ? (
                                <>
                                    <CheckCircle2Icon className="w-14 h-14 text-emerald-400 mx-auto" />
                                    <div>
                                        <h2 className="text-xl font-serif font-medium text-white mb-3">Certificate Verified ✓</h2>
                                        <p className="text-white/60 leading-relaxed">
                                            The death certificate has been verified. The vault owner will have{" "}
                                            <strong className="text-white">{result.liveness_window_days ?? 15} days</strong>{" "}
                                            to confirm they are alive.
                                        </p>
                                        <p className="text-white/40 text-sm mt-3">
                                            If there is no response, the vault will be unlocked and you will be notified.
                                        </p>
                                    </div>
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                                        <p className="text-emerald-400 text-sm">
                                            You will receive an email once the process is complete.
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <XCircleIcon className="w-14 h-14 text-rose-400 mx-auto" />
                                    <div>
                                        <h2 className="text-xl font-serif font-medium text-white mb-3">Verification Failed ✗</h2>
                                        <p className="text-white/60">{result.rejection_reason ?? "The certificate could not be verified."}</p>
                                    </div>
                                    <button
                                        onClick={() => { setFile(null); setStep("upload"); }}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm font-medium transition-colors"
                                    >
                                        Try Again
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
