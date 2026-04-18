"use client";

import React from "react";
import { EscalationLadder } from "@/components/dashboard/escalation/EscalationLadder";
import { CheckInFrequency } from "@/components/dashboard/escalation/CheckInFrequency";
import { VacationMode } from "@/components/dashboard/escalation/VacationMode";
import { EmergencyContactForm } from "@/components/dashboard/escalation/EmergencyContactForm";
import { BeneficiaryContactOrder } from "@/components/dashboard/escalation/BeneficiaryContactOrder";
import { useEscalationSettings } from "@/hooks/useEscalationSettings";
import { ShieldAlertIcon, Loader2 } from "lucide-react";
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
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-10 border border-border rounded-xl bg-muted/30 max-w-2xl mx-auto mt-20 text-center">
                <ShieldAlertIcon className="w-10 h-10 text-foreground mx-auto mb-4" />
                <h2 className="text-lg font-bold text-foreground">Configuration Error</h2>
                <p className="text-muted-foreground mt-1 text-sm">{error}</p>
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
        <div className="p-6 md:p-10 space-y-10 max-w-[90rem] mx-auto pb-20">
            {/* Standard Header */}
            <header className="space-y-2 pb-6 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-black text-white">
                        <ShieldAlertIcon className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Escalation Protocol</h1>
                </div>
                <p className="text-muted-foreground text-sm max-w-2xl">
                    Configure automated monitoring and the sequence of contact if your vault remains inactive.
                </p>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                {/* Left Column: Visual Ladder + Emergency Contact */}
                <div className="xl:col-span-6 space-y-8">
                    <section className="space-y-4">
                        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1">
                            System Progression
                        </h2>
                        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
                            <EscalationLadder currentLevel={settings?.current_escalation_level || "level_0_normal"} />
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1">
                            Verification Point
                        </h2>
                        <EmergencyContactForm 
                            initialData={emergencyContact} 
                            onSubmit={handleUpdateEmergencyContact} 
                        />
                    </section>
                </div>

                {/* Right Column: Monitoring + Hierarchy */}
                <div className="xl:col-span-6 space-y-8">
                    <section className="space-y-4">
                        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1">
                            Monitoring Parameters
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    <section className="space-y-4">
                        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1">
                            Succession Chain
                        </h2>
                        <BeneficiaryContactOrder 
                            items={beneficiaryOrder} 
                            onOrderChange={handleOrderChange} 
                        />
                    </section>
                </div>
            </div>
        </div>
    );
}
