"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import { VideoIcon, UploadCloudIcon, UserIcon, Trash2Icon, CheckCircle2Icon, InfoIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

// The media recorder must be loaded client-only: its dependency
// (extendable-media-recorder) creates a Web Worker at import time, which
// does not exist while prerendering pages on the server.
const RecorderCard = dynamic(
    () => import("./recorder").then((m) => m.RecorderCard),
    { ssr: false, loading: () => null }
);


export default function IntentDeclarationPage() {
    const [tab, setTab] = useState<"asset" | "personal">("asset");
    const [processing, setProcessing] = useState(false);

    // Data states
    const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
    const [personalMessages, setPersonalMessages] = useState<any[]>([]);
    const [assetIntent, setAssetIntent] = useState<any>(null);
    const [assetMappings, setAssetMappings] = useState<any[]>([]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const token = localStorage.getItem("paradosis_access_token");
            if (!token) return;

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const headers = { "Authorization": `Bearer ${token}` };

            // Fetch Beneficiaries
            const bRes = await fetch(`${apiUrl}/api/beneficiaries`, { headers });
            if (bRes.ok) {
                const bData = await bRes.json();
                setBeneficiaries(bData.beneficiaries || bData || []);
            }

            // Fetch Asset Intent
            const iRes = await fetch(`${apiUrl}/api/intent/`, { headers });
            if (iRes.ok) {
                const iData = await iRes.json();
                setAssetIntent(iData.intent);
                setAssetMappings(iData.mappings || []);
            }

            // Fetch Personal Messages
            const pmRes = await fetch(`${apiUrl}/api/intent/messages`, { headers });
            if (pmRes.ok) {
                const pmData = await pmRes.json();
                setPersonalMessages(pmData.messages || []);
            }

        } catch (err) {
            console.error(err);
        }
    };

    const handleUploadAssetIntent = async (file: File) => {
        setProcessing(true);
        try {
            const token = localStorage.getItem("paradosis_access_token");
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch(`${apiUrl}/api/intent/upload`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                await fetchInitialData(); // Refresh to show new mappings
            } else {
                alert("Upload failed");
            }
        } catch (e) {
            console.error(e);
            alert("Upload failed");
        } finally {
            setProcessing(false);
        }
    };

    const handleUploadPersonalMsg = async (file: File, beneficiaryId: string) => {
        setProcessing(true);
        try {
            const token = localStorage.getItem("paradosis_access_token");
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

            const formData = new FormData();
            formData.append("file", file);
            formData.append("beneficiary_id", beneficiaryId);

            const res = await fetch(`${apiUrl}/api/intent/messages/upload`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                await fetchInitialData();
            } else {
                alert("Upload failed");
            }
        } catch (e) {
            console.error(e);
            alert("Upload failed");
        } finally {
            setProcessing(false);
        }
    };

    const handleDeletePersonalMsg = async (messageId: string) => {
        if (!confirm("Are you sure you want to delete this message?")) return;

        try {
            const token = localStorage.getItem("paradosis_access_token");
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${apiUrl}/api/intent/messages/${messageId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                await fetchInitialData();
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Helper to find message for a b
    const getMsgForBeneficiary = (bId: string) => {
        return personalMessages.find(m => m.beneficiary_id === bId);
    };

    return (
        <div className="p-6 md:p-10 space-y-12 max-w-5xl mx-auto pb-20">
            <header className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-sans font-bold tracking-tight text-foreground">Intent Declaration</h1>
                        <p className="text-muted-foreground mt-2 text-lg">
                            Record your wishes and personal messages for the people you love.
                        </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                        <VideoIcon className="w-8 h-8" />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-muted rounded-full border border-border w-fit">
                    <button
                        onClick={() => setTab("asset")}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${tab === "asset" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        Asset Intent Will
                    </button>
                    <button
                        onClick={() => setTab("personal")}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${tab === "personal" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        Personal Messages
                    </button>
                </div>
            </header>

            <main>
                {tab === "asset" && (
                    <div className="space-y-8">
                        {/* Status banner */}
                        {assetIntent && (
                            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2Icon className="w-5 h-5 text-primary" />
                                    <span className="font-medium text-foreground">Intent recorded - {new Date(assetIntent.created_at).toLocaleDateString()} - {assetMappings.length} mappings extracted and accepted.</span>
                                </div>
                            </div>
                        )}

                        {/* Prompt Card */}
                        <div className="bg-card border border-border shadow-sm rounded-3xl overflow-hidden">
                            <div className="p-6 border-b border-border bg-muted/30">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <InfoIcon className="w-4 h-4 text-primary" />
                                    </div>
                                    <h3 className="font-sans font-bold text-foreground text-lg">What to include in your video</h3>
                                </div>
                                <ul className="space-y-2 text-sm text-muted-foreground ml-10 list-disc">
                                    <li>Mention each asset by name or description</li>
                                    <li>Say clearly who you want it to go to</li>
                                    <li>Mention percentages if splitting ("half to each")</li>
                                    <li>Add any special instructions ("only after completing education")</li>
                                </ul>
                                <div className="mt-4 ml-10 p-4 bg-background border border-border rounded-xl text-sm italic text-foreground/80">
                                    "My HDFC savings account should go to my wife Kavitha.
                                    My flat in Chennai - half to Kavitha, half to my son Arjun.
                                    My crypto wallet goes entirely to Arjun. My LIC policy goes
                                    to my daughter Priya."
                                </div>
                            </div>

                            <div className="p-8 flex flex-col md:flex-row gap-6 items-stretch">
                                <RecorderCard onSave={handleUploadAssetIntent} isProcessing={processing} label={assetIntent ? "Re-record Intent" : "Record Now"} />

                                <div className="flex items-center justify-center">
                                    <span className="text-muted-foreground font-medium text-sm">OR</span>
                                </div>
                                <label className={`flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-2xl hover:border-primary/50 transition-colors bg-muted/10 cursor-pointer ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <input
                                        type="file"
                                        accept="video/*"
                                        className="hidden"
                                        disabled={processing}
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                handleUploadAssetIntent(e.target.files[0]);
                                            }
                                        }}
                                    />
                                    <UploadCloudIcon className="w-10 h-10 text-muted-foreground mb-4" />
                                    <h4 className="font-semibold text-foreground text-lg">Upload Video</h4>
                                    <p className="text-sm text-muted-foreground text-center mt-1">MP4, MOV, WEBM (Max 500MB)</p>
                                </label>
                            </div>

                            {/* Dummy Processing Bar */}
                            <div className="px-6 pb-6 pt-2 text-center border-t border-border bg-muted/10 hidden">
                                <Button className="w-full sm:w-auto px-8 rounded-full shadow-md mt-4 gap-2" onClick={() => setProcessing(true)}>
                                    <RefreshCwIcon className="w-4 h-4" /> Process with AI
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {tab === "personal" && (
                    <div className="space-y-8">
                        <div className="bg-card border border-border shadow-sm p-6 rounded-3xl">
                            <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                                Leave a personal message for each person. These videos are encrypted and only released to the named person after your vault executes. They are not processed by AI - they are delivered exactly as recorded.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {beneficiaries.map((b: any) => {
                                const msg = getMsgForBeneficiary(b.id);
                                return (
                                    <div key={b.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 flex flex-col">
                                        <div className="flex items-center gap-3 border-b border-border pb-3 shrink-0">
                                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                                <UserIcon className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-foreground">{b.full_name}</h3>
                                                <p className="text-xs text-muted-foreground capitalize">{b.relationship}</p>
                                            </div>
                                        </div>

                                        {msg ? (
                                            <div className="flex-1 flex flex-col flex-1">
                                                <div className="bg-green-50 text-green-700 border border-green-200 rounded-lg p-2.5 text-xs font-medium flex items-center gap-2 mb-4">
                                                    <CheckCircle2Icon className="w-4 h-4 text-green-600" />
                                                    Message recorded - {new Date(msg.created_at).toLocaleDateString()}
                                                </div>
                                                <div className="flex-1 min-h-[160px] rounded-xl overflow-hidden bg-black mb-4 relative">
                                                    <video src={msg.video_url} controls className="w-full h-full object-contain absolute inset-0" />
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" className="flex-1 rounded-xl px-3 bg-background text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100" onClick={() => handleDeletePersonalMsg(msg.id)}>
                                                        <Trash2Icon className="w-4 h-4 mr-2" /> Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex flex-col flex-1">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                                    <div className="w-2 h-2 rounded-full bg-border"></div>
                                                    No message recorded yet
                                                </div>
                                                <RecorderCard onSave={(file: File) => handleUploadPersonalMsg(file, b.id)} isProcessing={processing} label="Record Message" isPersonal={true} />
                                                <div className="mt-4 text-center">
                                                    <label className="text-sm font-medium text-primary hover:underline cursor-pointer">
                                                        <input
                                                            type="file"
                                                            accept="video/*"
                                                            className="hidden"
                                                            disabled={processing}
                                                            onChange={(e) => {
                                                                if (e.target.files && e.target.files[0]) {
                                                                    handleUploadPersonalMsg(e.target.files[0], b.id);
                                                                }
                                                            }}
                                                        />
                                                        Or upload an existing video instead
                                                    </label>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {beneficiaries.length === 0 && (
                                <div className="col-span-full p-8 text-center text-muted-foreground border-2 border-dashed rounded-2xl">
                                    Add some beneficiaries first to record personal messages.
                                </div>
                            )}
                        </div>

                        <Button className="w-full h-14 rounded-2xl border-dashed border-2 bg-transparent text-foreground hover:bg-muted border-muted-foreground/30 shadow-none font-semibold">
                            + Add message for someone not in your vault
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}
