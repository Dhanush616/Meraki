"use client";

import React, { useState } from "react";
import { VideoIcon, MicIcon, UploadCloudIcon, UserIcon, Trash2Icon, RotateCwIcon, CheckCircle2Icon, InfoIcon, ShieldAlertIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function IntentDeclarationPage() {
    const [tab, setTab] = useState<"asset" | "personal">("asset");
    const [recording, setRecording] = useState(false);
    const [processing, setProcessing] = useState(false);

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
                        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CheckCircle2Icon className="w-5 h-5 text-primary" />
                                <span className="font-medium text-foreground">Intent recorded - 14 April 2026 - 3 mappings extracted and accepted.</span>
                            </div>
                            <Button variant="outline" size="sm" className="rounded-full">Re-record</Button>
                        </div>

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
                                <div className="flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-2xl hover:border-primary/50 transition-colors bg-muted/10 cursor-pointer">
                                    <MicIcon className="w-10 h-10 text-muted-foreground mb-4" />
                                    <h4 className="font-semibold text-foreground text-lg">Record Now</h4>
                                    <p className="text-sm text-muted-foreground text-center mt-1">Start recording directly from your browser</p>
                                </div>
                                <div className="flex items-center justify-center">
                                    <span className="text-muted-foreground font-medium text-sm">OR</span>
                                </div>
                                <div className="flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-2xl hover:border-primary/50 transition-colors bg-muted/10 cursor-pointer">
                                    <UploadCloudIcon className="w-10 h-10 text-muted-foreground mb-4" />
                                    <h4 className="font-semibold text-foreground text-lg">Upload Video</h4>
                                    <p className="text-sm text-muted-foreground text-center mt-1">MP4, MOV, WEBM (Max 500MB)</p>
                                </div>
                            </div>

                            {/* Dummy Processing Bar */}
                            <div className="px-6 pb-6 pt-2 text-center border-t border-border bg-muted/10">
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
                            {/* Card 1 */}
                            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                                <div className="flex items-center gap-3 border-b border-border pb-3">
                                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                        <UserIcon className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">Kavitha Iyer</h3>
                                        <p className="text-xs text-muted-foreground">Spouse</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <div className="w-2 h-2 rounded-full bg-border"></div>
                                    No message recorded yet
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button variant="outline" className="flex-1 rounded-xl gap-2 font-medium bg-background"><VideoIcon className="w-4 h-4" /> Record Message</Button>
                                    <Button variant="outline" className="flex-1 rounded-xl gap-2 font-medium bg-background"><UploadCloudIcon className="w-4 h-4" /> Upload</Button>
                                </div>
                            </div>

                            {/* Card 2 */}
                            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                                <div className="flex items-center gap-3 border-b border-border pb-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <UserIcon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">Arjun Kumar</h3>
                                        <p className="text-xs text-muted-foreground">Son</p>
                                    </div>
                                </div>
                                <div className="bg-green-50 text-green-700 border border-green-200 rounded-lg p-2.5 text-xs font-medium flex items-center gap-2">
                                    <CheckCircle2Icon className="w-4 h-4 text-green-600" />
                                    Message recorded - 2 mins 14 secs
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button variant="outline" className="flex-1 rounded-xl text-xs sm:text-sm bg-background font-medium">Preview</Button>
                                    <Button variant="outline" className="flex-1 rounded-xl text-xs sm:text-sm bg-background font-medium gap-1"><RotateCwIcon className="w-3.5 h-3.5" /> Re-record</Button>
                                    <Button variant="outline" className="rounded-xl px-3 bg-background text-red-600 hover:text-red-700 hover:bg-red-50"><Trash2Icon className="w-4 h-4" /></Button>
                                </div>
                            </div>
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
