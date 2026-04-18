"use client";
import React, { useState } from "react";
import { CopyIcon, CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OTPInput } from "./OTPInput";

export function TwoFactorSetup() {
    const [copied, setCopied] = useState(false);
    const [otp, setOtp] = useState("");
    const secret = "JBSWY3DPEHPK3PXP"; // Dummy secret

    const handleCopy = () => {
        navigator.clipboard.writeText(secret);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleVerify = () => {
        console.log("Verifying OTP:", otp);
    };

    return (
        <div className="flex flex-col items-center">
            <p className="text-muted-foreground font-sans text-center text-sm mb-6 leading-relaxed">
                Scan the QR code with your authenticator app (like Google Authenticator or Authy), or enter the setup key manually.
            </p>

            {/* Dummy QR Code Block */}
            <div className="w-48 h-48 bg-background rounded-xl border-2 border-border flex items-center justify-center p-4 mb-6 shadow-inner">
                <div className="w-full h-full border-4 border-near-black border-dashed flex items-center justify-center relative">
                    <div className="w-8 h-8 bg-primary absolute" />
                </div>
            </div>

            <div className="w-full flex items-center justify-between bg-background p-3 rounded-lg border border-border mb-8">
                <code className="text-foreground font-mono text-sm tracking-widest">{secret}</code>
                <button onClick={handleCopy} className="text-muted-foreground hover:text-primary transition-colors p-2 bg-card rounded-md shadow-sm border border-border">
                    {copied ? <CheckIcon className="w-4 h-4 text-green-600" /> : <CopyIcon className="w-4 h-4" />}
                </button>
            </div>

            <div className="w-full mb-8">
                <label className="text-sm font-medium text-foreground font-sans block text-center mb-4">
                    Enter the 6-digit code from your app
                </label>
                <OTPInput value={otp} onChange={setOtp} length={6} />
            </div>

            <Button
                onClick={handleVerify}
                disabled={otp.length !== 6}
                className="w-full bg-near-black text-primary-foreground hover:bg-[#1a1c1a] py-6 text-base rounded-lg border-none"
            >
                Verify & Enable 2FA
            </Button>
        </div>
    );
}