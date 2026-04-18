"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    UploadCloudIcon, FileTextIcon, CheckCircle2Icon,
    XCircleIcon, ArrowLeftIcon, LoaderIcon, ArrowRightIcon,
    ShieldIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Step = "instructions" | "upload" | "processing" | "result";

interface VerificationResult {
    status: "verified" | "executed" | "rejected";
    message?: string;
    rejection_reason?: string;
    liveness_window_days?: number;
    submission_id?: string;
}

export default function GuardianVerifyPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryOwnerId = searchParams.get("ownerId");
    
    const fileRef = useRef<HTMLInputElement>(null);
    const [step, setStep] = useState<Step>("instructions");
    const [dragOver, setDragOver] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<VerificationResult | null>(null);
    const [ownerId, setOwnerId] = useState(queryOwnerId || "");
    const [guardianName, setGuardianName] = useState("");

    const token = typeof window !== "undefined" ? localStorage.getItem("guardian_token") : null;

    useEffect(() => {
        if (!token) {
            router.push("/guardian/login");
            return;
        }

        // Fetch guardian context
        fetch(`${API}/api/guardian/me`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            setGuardianName(data.guardian_name);
        })
        .catch(err => console.error(err));
    }, [token, router]);

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

    const [analysisStep, setAnalysisStep] = useState(0);

    const analysisLabels = [
        "Authenticating document signature...",
        "Extracting certificate metadata...",
        "Cross-referencing with Civil Registration System...",
        "Validating owner identity...",
        "Finalizing claim record..."
    ];

    async function submitCertificate() {
        if (!file || !token) return;
        setStep("processing");
        setAnalysisStep(0);

        const startTime = Date.now();

        // Visual simulation of analysis steps (5 steps * 200ms = 1s)
        const timer = setInterval(() => {
            setAnalysisStep(prev => (prev < analysisLabels.length - 1 ? prev + 1 : prev));
        }, 200);

        try {
            const formData = new FormData();
            formData.append("file", file);
            // No longer passing owner_id, backend gets it from token

            const res = await fetch(`${API}/api/guardian/verify`, {
                method: "POST",
                headers: { 
                    Authorization: `Bearer ${token}` 
                },
                body: formData,
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || "Failed to submit certificate");
            }

            const data = await res.json();
            
            // Ensure we wait at least 1 second total for the simulation to finish
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 1000 - elapsed);

            setTimeout(() => {
                clearInterval(timer);
                toast.success("Certificate analyzed successfully. Portal updated.");
                router.push("/guardian/portal");
            }, remaining);

        } catch (err: any) {
            clearInterval(timer);
            toast.error(err.message);
            setStep("upload");
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
                        onClick={() => step === "instructions" ? router.push("/guardian/portal") : setStep("instructions")}
                        className="text-muted-foreground hover:text-foreground transition-colors p-2"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2 text-sm font-medium text-primary bg-primary/10 px-4 py-2 rounded-full border border-primary/20 shadow-sm">
                        <ShieldIcon className="w-4 h-4" /> Guardian Verification
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
                                <h1 className="text-2xl font-sans font-bold text-foreground mb-3">Death Certificate Verification</h1>
                                <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
                                    Hello {guardianName || "Guardian"}. To proceed with the claim process for the vault you protect, 
                                    we require an official death certificate for the owner.
                                </p>
                            </div>
                            <div className="bg-background rounded-xl border border-border p-5 text-left space-y-3 max-w-md mx-auto">
                                {["Official Government Death Certificate", "PDF, JPG, or PNG format", "Under 10 MB", "Must be clear and readable"].map(t => (
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
                                Continue to Upload <ArrowRightIcon className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    )}

                    {/* Step 2 — Upload */}
                    {step === "upload" && (
                        <div className="space-y-6 text-left max-w-md mx-auto">
                            <h2 className="text-2xl font-sans font-bold text-foreground text-center">Upload Certificate</h2>

                            <p className="text-sm text-muted-foreground text-center mb-4">
                                Please upload the official government death certificate. 
                                Secure analysis will begin immediately.
                            </p>

                            {/* Drop zone */}
                            <div
                                onDrop={handleDrop}
                                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onClick={() => fileRef.current?.click()}
                                className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-background"
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
                                disabled={!file}
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
                            <div className="min-h-[80px]">
                                <h2 className="text-xl font-sans font-bold text-foreground mb-2">Analyzing Certificate</h2>
                                <p className="text-primary font-medium transition-all duration-500">
                                    {analysisLabels[analysisStep]}
                                </p>
                                <p className="text-muted-foreground/60 text-sm mt-4">
                                    This process involves secure government database synchronization.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 4 — Result */}
                    {step === "result" && result && (
                        <div className="text-center space-y-6 py-6 max-w-md mx-auto">
                            {(result.status === "verified" || result.status === "executed") ? (
                                <>
                                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2Icon className="w-8 h-8 text-green-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-sans font-bold text-foreground mb-3">
                                            {result.status === "executed" ? "Level 5 Activated" : "Thank You, Guardian"}
                                        </h2>
                                        <div className="bg-background rounded-xl border border-border p-5 text-left mb-6">
                                            <p className="text-muted-foreground text-sm leading-relaxed">
                                                {result.message || "The death certificate has been successfully verified."}
                                            </p>
                                            {result.status !== "executed" && (
                                                <p className="text-muted-foreground text-sm mt-3 pt-3 border-t border-border">
                                                    If the owner does not respond within the next <strong className="text-foreground">{result.liveness_window_days ?? 15} days</strong>, 
                                                    the vault will be automatically executed and beneficiaries will be notified.
                                                </p>
                                            )}
                                            {result.status === "executed" && (
                                                <p className="text-muted-foreground text-sm mt-3 pt-3 border-t border-border">
                                                    Beneficiaries have been granted access to their inheritance packages and 
                                                    automated asset distribution (including crypto routing) has begun.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => router.push("/guardian/portal")}
                                        className="w-full py-4 rounded-xl shadow-lg"
                                    >
                                        Back to Portal
                                    </Button>
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
