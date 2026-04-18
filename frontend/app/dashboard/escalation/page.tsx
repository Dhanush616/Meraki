"use client";

import React from "react";
import { EscalationLadder } from "@/components/dashboard/escalation/EscalationLadder";
import { CheckInFrequency } from "@/components/dashboard/escalation/CheckInFrequency";
import { VacationMode } from "@/components/dashboard/escalation/VacationMode";
import { EmergencyContactForm } from "@/components/dashboard/escalation/EmergencyContactForm";
import { BeneficiaryContactOrder } from "@/components/dashboard/escalation/BeneficiaryContactOrder";
import { useEscalationSettings } from "@/hooks/useEscalationSettings";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function EscalationPage() {
    const {
        settings,
        emergencyContact,
        beneficiaryOrder,
        loading,
        error,
        updateSettings,
        updateEmergencyContact,
        updateBeneficiaryOrder,
        toggleVacationMode,
    } = useEscalationSettings();

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center bg-red-50 border-2 border-red-200 rounded-3xl mt-10 mx-auto max-w-2xl">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-red-800">Something went wrong</h2>
                <p className="text-red-600 mt-2">{error}</p>
            </div>
        );
    }

    const handleUpdateFrequency = async (val: number) => {
        await updateSettings({ check_in_frequency_days: val });
        toast.success("Check-in frequency updated");
    };

    const handleUpdateEmergencyContact = async (data: any) => {
        await updateEmergencyContact(data);
        toast.success("Emergency contact updated");
    };

    const handleToggleVacation = async (active: boolean, dates?: { start: string; end: string }) => {
        await toggleVacationMode(active, dates);
        toast.success(active ? "Vacation mode activated" : "Vacation mode deactivated");
    };

    const handleOrderChange = async (newOrder: string[]) => {
        await updateBeneficiaryOrder(newOrder);
        toast.success("Contact order updated");
    };

    return (
        <div className="p-6 md:p-10 space-y-12 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <header className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-amber-100 text-amber-700 shadow-sm border-2 border-amber-200">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight">Escalation Settings</h1>
                </div>
                <p className="text-muted-foreground text-lg max-w-2xl">
                    Configure how Amaanat monitors your wellbeing and who should be contacted if we don't hear from you for a while.
                </p>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Left Column: Ladder (Visual) */}
                <div className="xl:col-span-5">
                    <div className="sticky top-24">
                        <h2 className="text-xs uppercase tracking-[0.2em] font-black text-muted-foreground mb-6">
                            The Escalation Ladder
                        </h2>
                        <EscalationLadder currentLevel={settings?.current_escalation_level || "level_0_normal"} />
                    </div>
                </div>

                {/* Right Column: Controls */}
                <div className="xl:col-span-7 space-y-10">
                    <section>
                        <h2 className="text-xs uppercase tracking-[0.2em] font-black text-muted-foreground mb-6">
                            Safety Controls
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <CheckInFrequency 
                                value={settings?.check_in_frequency_days || 90} 
                                lastCheckIn={settings?.last_check_in_responded_at || null}
                                onChange={handleUpdateFrequency}
                            />
                            <VacationMode 
                                isActive={settings?.vacation_mode_active || false}
                                startDate={settings?.vacation_mode_start || null}
                                endDate={settings?.vacation_mode_end || null}
                                onToggle={handleToggleVacation}
                            />
                        </div>
                    </section>

                    <section className="grid grid-cols-1 gap-10">
                        <div>
                            <h2 className="text-xs uppercase tracking-[0.2em] font-black text-muted-foreground mb-6">
                                People
                            </h2>
                            <div className="space-y-10">
                                <EmergencyContactForm 
                                    initialData={emergencyContact} 
                                    onSubmit={handleUpdateEmergencyContact} 
                                />
                                <BeneficiaryContactOrder 
                                    items={beneficiaryOrder} 
                                    onOrderChange={handleOrderChange} 
                                />
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
