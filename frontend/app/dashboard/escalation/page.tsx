"use client";
import React from "react";
import { ShieldAlertIcon, Loader2Icon } from "lucide-react";
import { useEscalationSettings } from "@/hooks/useEscalationSettings";
import { EscalationLadder } from "@/components/dashboard/escalation/EscalationLadder";
import { CheckInFrequency } from "@/components/dashboard/escalation/CheckInFrequency";
import { VacationMode } from "@/components/dashboard/escalation/VacationMode";
import { EmergencyContactForm } from "@/components/dashboard/escalation/EmergencyContactForm";
import { BeneficiaryContactOrder } from "@/components/dashboard/escalation/BeneficiaryContactOrder";

export default function EscalationPage() {
    const {
        settings,
        emergencyContact,
        beneficiaryOrder,
        isLoading,
        error,
        updateSettings,
        activateVacation,
        deactivateVacation,
        updateEmergencyContact,
        updateBeneficiaryOrder,
    } = useEscalationSettings();

    if (error) {
        return (
            <div className="p-6 bg-muted border border-border rounded-xl flex items-start gap-4">
                <ShieldAlertIcon className="w-6 h-6 text-foreground shrink-0" />
                <div>
                    <h3 className="font-semibold text-foreground">Connection Error</h3>
                    <p className="text-muted-foreground mt-1">{error}</p>
                </div>
            </div>
        );
    }

    if (isLoading || !settings) {
        return (
            <div className="flex flex-col items-center justify-center py-24">
                <Loader2Icon className="w-6 h-6 text-muted-foreground animate-spin" />
                <p className="text-sm text-muted-foreground mt-3">Loading escalation settings…</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            {/* Header */}
            <header className="mb-2">
                <h1 className="text-3xl font-sans font-bold text-foreground">Escalation</h1>
                <p className="text-muted-foreground mt-2">
                    Configure how Paradosis monitors you and contacts people if something seems wrong.
                </p>
            </header>

            {/* Two-column layout: Ladder | Settings */}
            <div className="grid lg:grid-cols-5 gap-6 items-start">
                {/* Left — Escalation Ladder (bigger) */}
                <div className="lg:col-span-2">
                    <EscalationLadder currentLevel={settings.current_escalation_level} />
                </div>

                {/* Right — Configuration panels */}
                <div className="lg:col-span-3 space-y-6">
                    <CheckInFrequency
                        frequencyDays={settings.check_in_frequency_days}
                        lastCheckIn={settings.last_check_in_responded_at}
                        onSave={async (days) => {
                            await updateSettings({ check_in_frequency_days: days });
                        }}
                    />

                    <VacationMode
                        isActive={settings.vacation_mode_active}
                        startDate={settings.vacation_mode_start}
                        endDate={settings.vacation_mode_end}
                        onActivate={activateVacation}
                        onDeactivate={deactivateVacation}
                    />
                </div>
            </div>

            {/* Full-width sections */}
            <div className="grid lg:grid-cols-2 gap-6">
                <EmergencyContactForm
                    contact={emergencyContact}
                    onSave={updateEmergencyContact}
                />

                <BeneficiaryContactOrder
                    beneficiaries={beneficiaryOrder}
                    onSave={updateBeneficiaryOrder}
                />
            </div>
        </div>
    );
}
