"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { CheckCircle2Icon, AlertTriangleIcon, InfoIcon, ShieldCheckIcon, ClockIcon, FileTextIcon, DownloadIcon, ChevronDownIcon, MapPinIcon, BookOpenIcon, ScaleIcon } from "lucide-react";

export function InheritanceGuideModal({
    isOpen,
    onClose,
    asset,
    owner,
    beneficiary
}: {
    isOpen: boolean;
    onClose: () => void;
    asset: any;
    owner: any;
    beneficiary: any;
}) {
    if (!asset || !owner || !beneficiary) return null;

    const religion = owner.owner_religion || "Unknown";
    const relationship = beneficiary.beneficiary_relationship || "Unknown";
    const state = owner.owner_state || "Unknown";
    const city = owner.owner_city || "Unknown";
    const assetType = asset.asset_type;
    const nomineeRegistered = asset.details?.nominee_registered === true || asset.details?.nominee_registered === "true"; // Assuming vault stores it this way

    // Derive Inheritance Path
    let primaryRoute = nomineeRegistered ? "nominee_claim" : "succession_certificate";
    let complexity = nomineeRegistered ? "simple" : "complex";
    let timeEstimate = nomineeRegistered ? "2–4 weeks" : "3–6 months";

    // Crypto overrides
    if (assetType === "crypto_wallet") {
        primaryRoute = "smart_contract";
        complexity = "simple";
        timeEstimate = "Instant";
    }

    // Vehicle overrides
    if (assetType === "vehicle") {
        primaryRoute = "rto_transfer";
        timeEstimate = "2–4 weeks";
    }

    let governingLaw = "Indian Succession Act, 1925";
    let isClass1 = false;

    if (religion === "Hindu" || religion === "Buddhist" || religion === "Jain" || religion === "Sikh") {
        governingLaw = "Hindu Succession Act, 1956";
        isClass1 = ["spouse", "son", "daughter", "mother"].includes(relationship.toLowerCase());
    } else if (religion === "Muslim") {
        governingLaw = "Muslim Personal Law";
    }

    const probateRequired = (assetType === "property" && 
        ["Maharashtra", "West Bengal", "Tamil Nadu"].includes(state) && 
        ["Mumbai", "Kolkata", "Chennai"].includes(city));

    const renderDocumentChecklist = () => {
        if (assetType === "crypto_wallet") {
            return (
                <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">No legal documents are required. The smart contract automatically transfers assets to your pre-registered wallet address.</p>
                </div>
            );
        }

        return (
            <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                    <CheckCircle2Icon className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                        <span className="font-semibold text-foreground block">Death Certificate</span>
                        <span className="text-muted-foreground">Download from DigiLocker or collect from municipal office.</span>
                    </div>
                </li>
                {primaryRoute === "succession_certificate" && assetType !== "property" && assetType !== "vehicle" && (
                    <li className="flex items-start gap-3">
                        <AlertTriangleIcon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                            <span className="font-semibold text-foreground block">Succession Certificate</span>
                            <span className="text-muted-foreground">Required because no nominee is registered. Obtain from district civil court (takes 3-6 months).</span>
                        </div>
                    </li>
                )}
                {(assetType === "property" || assetType === "vehicle" || primaryRoute === "succession_certificate") && (
                    <li className="flex items-start gap-3">
                        <AlertTriangleIcon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                            <span className="font-semibold text-foreground block">Legal Heir Certificate</span>
                            <span className="text-muted-foreground">Issued by Tehsildar or SDM office. Proves your relationship.</span>
                        </div>
                    </li>
                )}
                {assetType === "property" && probateRequired && (
                    <li className="flex items-start gap-3">
                        <AlertTriangleIcon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                            <span className="font-semibold text-foreground block">Probate of Will</span>
                            <span className="text-muted-foreground">Mandatory in {city}. Obtain from High Court.</span>
                        </div>
                    </li>
                )}
                {nomineeRegistered && (assetType === "bank_account" || assetType === "fixed_deposit" || assetType === "insurance" || assetType === "mutual_fund" || assetType === "stocks") && (
                    <li className="flex items-start gap-3">
                        <CheckCircle2Icon className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                            <span className="font-semibold text-foreground block">Your KYC Documents</span>
                            <span className="text-muted-foreground">Aadhaar Card, PAN Card, and cancelled cheque for bank transfer.</span>
                        </div>
                    </li>
                )}
            </ul>
        );
    };

    const renderSteps = () => {
        if (assetType === "crypto_wallet") {
            return (
                <div className="space-y-4">
                    <div className="border border-border rounded-xl p-4 bg-background">
                        <h4 className="font-bold text-foreground mb-1">Step 1: Wait for Smart Contract Execution</h4>
                        <p className="text-sm text-muted-foreground">The Paradosis smart contract will automatically trigger and transfer the assigned crypto to your registered wallet. You do not need to do anything.</p>
                    </div>
                    <div className="border border-border rounded-xl p-4 bg-background">
                        <h4 className="font-bold text-foreground mb-1">Step 2: Tax Considerations</h4>
                        <p className="text-sm text-muted-foreground">There is no inheritance tax. However, if you sell the crypto later, it is subject to a 30% VDA flat tax under Indian law. Maintain a record of receipt.</p>
                    </div>
                </div>
            );
        }

        if (assetType === "insurance") {
            return (
                <div className="space-y-4">
                    <div className="border border-border rounded-xl p-4 bg-background">
                        <h4 className="font-bold text-foreground mb-1">Step 1: Intimate the Insurer</h4>
                        <p className="text-sm text-muted-foreground">Contact the insurance company branch immediately with the death certificate. They will assign a claim number.</p>
                    </div>
                    <div className="border border-border rounded-xl p-4 bg-background">
                        <h4 className="font-bold text-foreground mb-1">Step 2: Submit Claim Forms</h4>
                        <p className="text-sm text-muted-foreground">Submit the filled claim form, original policy document, and KYC. IRDAI mandates a 30-day settlement period after all documents are received.</p>
                    </div>
                </div>
            );
        }

        if (assetType === "property") {
            return (
                <div className="space-y-4">
                    <div className="border border-border rounded-xl p-4 bg-background">
                        <h4 className="font-bold text-foreground mb-1">Step 1: Mutation of Property</h4>
                        <p className="text-sm text-muted-foreground">Apply for mutation at your local municipal authority or tehsildar. Submit death certificate, legal heir certificate, and existing property documents.</p>
                    </div>
                    <div className="border border-border rounded-xl p-4 bg-background">
                        <h4 className="font-bold text-foreground mb-1">Step 2: Update Title Deed</h4>
                        <p className="text-sm text-muted-foreground">For a clean title (required to sell or mortgage later), register a Partition Deed or Settlement Deed at the local Sub-Registrar office.</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                <div className="border border-border rounded-xl p-4 bg-background">
                    <h4 className="font-bold text-foreground mb-1">Step 1: Gather Required Certificates</h4>
                    <p className="text-sm text-muted-foreground">Secure the Death Certificate. If no nominee was registered, you must apply for a Succession Certificate in civil court before approaching the institution.</p>
                </div>
                <div className="border border-border rounded-xl p-4 bg-background">
                    <h4 className="font-bold text-foreground mb-1">Step 2: Submit Claim to Institution</h4>
                    <p className="text-sm text-muted-foreground">Visit the branch or contact the registrar (e.g. CAMS for mutual funds). Submit the death claim or transmission request form along with your KYC.</p>
                </div>
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-2xl h-[85vh] flex flex-col p-0 overflow-hidden bg-background">
                <DialogHeader className="px-6 py-5 border-b border-border shrink-0 bg-muted/30">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <BookOpenIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-bold">Inheritance Legal Guide</DialogTitle>
                            <DialogDescription>
                                Customized guide for <span className="font-semibold text-foreground">{asset.nickname}</span>
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    
                    {/* Status Banners */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        {religion === "Unknown" ? (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 col-span-2">
                                <AlertTriangleIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-bold text-amber-900">Religion not specified in vault</h4>
                                    <p className="text-xs text-amber-800 mt-1">The legal process for inheritance varies by religion. Since religion is unknown, general guidelines apply.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-3">
                                <ScaleIcon className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-bold text-indigo-900">Governing Law</h4>
                                    <p className="text-xs text-indigo-800 mt-1">{governingLaw}</p>
                                    <p className="text-[10px] text-indigo-600 mt-1 font-semibold uppercase tracking-wide">
                                        Relationship: {relationship} {isClass1 ? "(Class I Heir)" : ""}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className={`border rounded-xl p-4 flex gap-3 ${nomineeRegistered ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                            {nomineeRegistered ? <ShieldCheckIcon className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" /> : <AlertTriangleIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
                            <div>
                                <h4 className={`text-sm font-bold ${nomineeRegistered ? 'text-emerald-900' : 'text-amber-900'}`}>
                                    {nomineeRegistered ? "Nominee is Registered" : "No Nominee Registered"}
                                </h4>
                                <p className={`text-xs mt-1 ${nomineeRegistered ? 'text-emerald-800' : 'text-amber-800'}`}>
                                    {nomineeRegistered ? "You can claim this asset directly with minimal paperwork." : "Succession or Legal Heir Certificate is mandatory to claim this asset."}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Checklists */}
                    <section>
                        <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                            <FileTextIcon className="w-4 h-4 text-primary" />
                            Document Checklist
                        </h3>
                        <div className="bg-muted/50 border border-border rounded-2xl p-5">
                            {renderDocumentChecklist()}
                        </div>
                    </section>

                    {/* Step-by-Step */}
                    <section>
                        <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                            <MapPinIcon className="w-4 h-4 text-primary" />
                            Action Plan
                        </h3>
                        {renderSteps()}
                    </section>

                    {/* Estimates */}
                    <section className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex flex-col sm:flex-row gap-6 justify-between">
                        <div>
                            <h4 className="text-sm font-bold text-foreground flex items-center gap-2 mb-2">
                                <ClockIcon className="w-4 h-4 text-primary" />
                                Estimated Timeline
                            </h4>
                            <p className="text-sm text-muted-foreground">{timeEstimate}</p>
                        </div>
                        {assetType !== "crypto_wallet" && (
                            <div>
                                <h4 className="text-sm font-bold text-foreground flex items-center gap-2 mb-2">
                                    <FileTextIcon className="w-4 h-4 text-primary" />
                                    Forms Provided by Paradosis
                                </h4>
                                <button className="flex items-center gap-2 text-sm text-primary font-medium hover:underline bg-primary/10 px-3 py-1.5 rounded-lg transition-colors">
                                    <DownloadIcon className="w-4 h-4" /> Download Pre-filled Forms
                                </button>
                            </div>
                        )}
                    </section>

                </div>
            </DialogContent>
        </Dialog>
    );
}
