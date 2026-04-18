"use client";
import React, { useState, useRef, useEffect } from "react";

interface OTPInputProps {
    length?: number;
    value: string;
    onChange: (value: string) => void;
}

export function OTPInput({ length = 6, value, onChange }: OTPInputProps) {
    const [otp, setOtp] = useState(value.split("").concat(Array(length).fill("")).slice(0, length));
    const inputs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        setOtp(value.split("").concat(Array(length).fill("")).slice(0, length));
    }, [value, length]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const val = e.target.value;
        if (isNaN(Number(val))) return;

        const newOtp = [...otp];
        newOtp[index] = val.substring(val.length - 1);
        setOtp(newOtp);
        onChange(newOtp.join(""));

        if (val && index < length - 1) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    return (
        <div className="flex gap-2 justify-center">
            {otp.map((digit, index) => (
                <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="\d{1}"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    ref={(el) => { inputs.current[index] = el; }}
                    className="w-12 h-14 text-center text-xl font-medium bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 text-foreground shadow-inner transition-all"
                />
            ))}
        </div>
    );
}