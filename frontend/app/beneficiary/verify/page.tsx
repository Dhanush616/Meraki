"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    UploadCloudIcon, FileTextIcon, CheckCircle2Icon,
    XCircleIcon, ArrowLeftIcon, LoaderIcon, ArrowRightIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
        <div className="min-h-screen bg-background flex flex-col p-4 md:p-8">
            <header className="w-full max-w-4xl mx-auto flex items-center justify-between mb-12">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
                        <span className="w-2.5 h-2.5 bg-card rounded-full"></span>
                    </div>
                    <span className="font-sans text-xl font-bold text-foreground hidden sm:block">Paradosis</span>
                </Link>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => step === "instructions" ? router.back() : setStep("instructions")}
                        className="text-muted-foreground hover:text-foreground transition-colors p-2"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div className="text-sm font-medium text-muted-foreground bg-white px-4 py-2 rounded-full border border-border shadow-sm">
                        Verification
                    </div>
                </div>
            </header>

            <main className="w-full max-w-4xl mx-auto flex-1 flex flex-col items-center justify-center text-center -mt-16">
                <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-2xl">
                    
                    {/* Step 1 — Instructions */}
                    {step === "instructions" && (
                        <div className="space-y-6 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-background border border-border flex items-center justify-center mx-auto shadow-sm">
                                <FileTextIcon className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-sans font-bold text-foreground mb-3">Upload the Death Certificate</h1>
                                <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
                                    Please obtain the official death certificate. If you have a digital copy,
                                    you can download it from{" "}
                                    <a href="https://digilocker.gov.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        DigiLocker
                                    </a>
                                    {" "}or your local Municipal Corporation portal.
                                </p>
                            </div>
                            <div className="bg-background rounded-xl border border-border p-5 text-left space-y-3 max-w-md mx-auto">
                                {["PDF, JPG, or PNG format", "Under 10 MB", "Clear, readable scan or digital copy", "Must show name, date, and issuing authority"].map(t => (
                                    <div key={t} className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                                        <CheckCircle2Icon className="w-4 h-4 text-green-500 shrink-0" />
                                        {t}
                                    </div>
                                ))}
                            </div>
                            <Button
                                onClick={() => setStep("upload")}
                                className="w-full sm:w-auto px-8 py-6 rounded-full text-base font-medium shadow-lg mt-4"
                            >
                                Continue <ArrowRightIcon className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    )}

                    {/* Step 2 — Upload */}
                    {step === "upload" && (
                        <div className="space-y-6 text-left max-w-md mx-auto">
                            <h2 className="text-2xl font-sans font-bold text-foreground text-center">Upload Certificate</h2>

                            {/* Owner ID input */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Vault Owner&apos;s User ID
                                    <span className="text-muted-foreground font-normal ml-2 block sm:inline text-xs">(provided separately by Paradosis)</span>
                                </label>
                                <input
                                    type="text"
                                    value={ownerId}
                                    onChange={e => setOwnerId(e.target.value)}
                                    placeholder="xxxxxxxx-xxxx-xxxx"
                                    className="w-full h-12 rounded-xl border border-border bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                                />
                            </div>

                            {/* Drop zone */}
                            <div
                                onDrop={handleDrop}
                                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onClick={() => fileRef.current?.click()}
                                className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
                                    dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-background"
                                }`}
                            >
                                <UploadCloudIcon className={`w-10 h-10 ${dragOver ? "text-primary" : "text-muted-foreground"}`} />
                                {file ? (
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-foreground">{file.name}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{(file.size / 1024).toFixed(0)} KB · Click to change</p>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-foreground">Drag & drop or click to select</p>
                                        <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG — max 10 MB</p>
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

                            <Button
                                onClick={submitCertificate}
                                disabled={!file || !ownerId.trim()}
                                className="w-full py-6 rounded-xl text-base font-medium shadow-md transition-all"
                            >
                                Submit for Verification
                            </Button>
                        </div>
                    )}

                    {/* Step 3 — Processing */}
                    {step === "processing" && (
                        <div className="text-center space-y-6 py-12">
                            <LoaderIcon className="w-12 h-12 text-primary mx-auto animate-spin" />
                            <div>
                                <h2 className="text-xl font-sans font-bold text-foreground mb-2">Verifying Certificate</h2>
                                <p className="text-muted-foreground font-medium">Verifying certificate with government records…</p>
                                <p className="text-muted-foreground/60 text-sm mt-2">This may take a moment.</p>
                            </div>
                        </div>
                    )}

                    {/* Step 4 — Result */}
                    {step === "result" && result && (
                        <div className="text-center space-y-6 py-6 max-w-md mx-auto">
                            {result.status === "verified" ? (
                                <>
                                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2Icon className="w-8 h-8 text-green-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-sans font-bold text-foreground mb-3">Certificate Verified</h2>
                                        <div className="bg-background rounded-xl border border-border p-5 text-left mb-6">
                                            <p className="text-muted-foreground text-sm leading-relaxed">
                                                The death certificate has been verified. The vault owner will have{" "}
                                                <strong className="text-foreground">{result.liveness_window_days ?? 15} days</strong>{" "}
                                                to confirm they are alive.
                                            </p>
                                            <p className="text-muted-foreground text-sm mt-3 pt-3 border-t border-border">
                                                If there is no response, the vault will be unlocked and you will be notified.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-left">
                                        <p className="text-primary text-sm font-medium flex items-center gap-2">
                                            <CheckCircle2Icon className="w-4 h-4" /> You will receive an email once the process is complete.
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                                        <XCircleIcon className="w-8 h-8 text-red-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-sans font-bold text-foreground mb-3">Verification Failed</h2>
                                        <div className="bg-background rounded-xl border border-border p-5">
                                            <p className="text-muted-foreground text-sm">{result.rejection_reason ?? "The certificate could not be verified."}</p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => { setFile(null); setStep("upload"); }}
                                        variant="outline"
                                        className="mt-4"
                                    >
                                        Try Again
                                    </Button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
