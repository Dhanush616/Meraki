"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ShieldAlertIcon, CheckCircle2Icon, AlertTriangleIcon, ActivityIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function GuardianPortalPage() {
    const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
    const [reportStep, setReportStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [escalationLevel, setEscalationLevel] = useState(0); // 0 = Normal, 3 = Escalated

    const handleReport = async () => {
        setIsSubmitting(true);
        try {
            // Mocking the backend API call POST /api/guardian/report
            await new Promise(resolve => setTimeout(resolve, 1500));
            setEscalationLevel(3);
            setIsReportDialogOpen(false);
            setReportStep(1); // reset
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-parchment flex flex-col p-4 md:p-8">
            <header className="w-full max-w-4xl mx-auto flex items-center justify-between mb-12">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center shadow-lg">
                        <span className="w-2.5 h-2.5 bg-ivory rounded-full"></span>
                    </div>
                    <span className="font-serif text-xl font-bold text-near-black">Paradosis</span>
                </Link>
                <div className="text-sm font-medium text-olive-gray bg-white px-4 py-2 rounded-full border border-border-cream shadow-sm">
                    Guardian Portal
                </div>
            </header>

            <main className="w-full max-w-4xl mx-auto flex-1 flex flex-col items-center justify-center text-center -mt-20">
                <div className="bg-ivory border border-border-cream rounded-3xl p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-2xl">
                    <ShieldAlertIcon className="w-12 h-12 text-brand mx-auto mb-6 opacity-90" />
                    <h1 className="text-3xl font-serif text-near-black mb-4">
                        You are a guardian for <span className="font-bold underline decoration-brand/30 underline-offset-4">Arjun</span> Kumar.
                    </h1>
                    <p className="text-olive-gray font-sans mb-8 max-w-md mx-auto leading-relaxed">
                        Your role is to notify us only if you suspect Arjun has passed away. You do not have access to view their assets or beneficiaries.
                    </p>

                    <div className="bg-parchment border border-border-cream rounded-xl p-6 mb-10 flex flex-col sm:flex-row items-center justify-between text-left gap-4">
                        <div className="flex items-center gap-4">
                            {escalationLevel === 0 ? (
                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                    <ActivityIcon className="w-6 h-6 text-green-700" />
                                </div>
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                    <AlertTriangleIcon className="w-6 h-6 text-red-600" />
                                </div>
                            )}
                            <div>
                                <h3 className="font-sans font-medium text-near-black flex items-center gap-2">
                                    Current Status
                                    {escalationLevel === 0 ? (
                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-bold tracking-wide uppercase">Level 0: Normal</span>
                                    ) : (
                                        <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full font-bold tracking-wide uppercase">Level 3: Suspected Death</span>
                                    )}
                                </h3>
                                <p className="text-sm text-olive-gray mt-1">
                                    {escalationLevel === 0 
                                        ? "The vault is safely secured. Arjun's normal check-in schedule is active." 
                                        : "You have reported a suspected death. The verification liveness window has started."}
                                </p>
                            </div>
                        </div>
                    </div>

                    <Button 
                        onClick={() => setIsReportDialogOpen(true)} 
                        disabled={escalationLevel > 0}
                        className={`w-full sm:w-auto px-8 py-6 rounded-full text-base font-medium transition-all ${escalationLevel > 0 ? "bg-gray-200 text-gray-400" : "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20"}`}
                    >
                        Report Suspected Death
                    </Button>
                </div>
            </main>

            <Dialog open={isReportDialogOpen} onOpenChange={(open) => {
                if(!isSubmitting) {
                    setIsReportDialogOpen(open);
                    if(!open) setTimeout(() => setReportStep(1), 300);
                }
            }}>
                <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-ivory border-none shadow-2xl">
                    <div className="p-8">
                        <DialogHeader className="mb-6">
                            <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                                <AlertTriangleIcon className="w-6 h-6 text-red-600" />
                            </div>
                            <DialogTitle className="text-center font-serif text-2xl text-near-black">
                                {reportStep === 1 ? "Are you sure?" : "Final Confirmation"}
                            </DialogTitle>
                            <DialogDescription className="text-center text-olive-gray font-sans pt-2">
                                {reportStep === 1 
                                    ? "This begins the formal death verification process. An automated liveness check will be sent to the owner."
                                    : "Have you been unable to reach Arjun for an extended period?"}
                            </DialogDescription>
                        </DialogHeader>

                        {reportStep === 1 ? (
                            <div className="flex flex-col gap-3 mt-8">
                                <Button 
                                    onClick={() => setReportStep(2)} 
                                    className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg py-6"
                                >
                                    Yes, I want to proceed
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    onClick={() => setIsReportDialogOpen(false)}
                                    className="w-full text-olive-gray hover:text-near-black"
                                >
                                    Cancel
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3 mt-8">
                                <Button 
                                    onClick={handleReport} 
                                    disabled={isSubmitting}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg py-6 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? "Processing..." : (
                                        <>
                                            <CheckCircle2Icon className="w-4 h-4" />
                                            Confirm Suspected Death
                                        </>
                                    )}
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    onClick={() => setReportStep(1)}
                                    disabled={isSubmitting}
                                    className="w-full text-olive-gray hover:text-near-black"
                                >
                                    Go Back
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>            
        </div>
    );
}
