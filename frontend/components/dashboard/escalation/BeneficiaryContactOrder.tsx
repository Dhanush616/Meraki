"use client";
import React, { useState, useEffect } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon, SaveIcon, Loader2Icon, UsersIcon } from "lucide-react";
import { DisclosureBadge } from "@/components/dashboard/beneficiaries/DisclosureBadge";
import type { BeneficiaryOrder } from "@/hooks/useEscalationSettings";

interface BeneficiaryContactOrderProps {
    beneficiaries: BeneficiaryOrder[];
    onSave: (orderedIds: string[]) => Promise<void>;
}

function formatRelationship(r: string) {
    return r.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function SortableRow({ item, index }: { item: BeneficiaryOrder; index: number }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                isDragging
                    ? "bg-muted border-foreground/20 shadow-lg z-50 scale-[1.02]"
                    : "bg-background border-border hover:border-foreground/10"
            }`}
        >
            {/* Drag handle */}
            <button
                {...attributes}
                {...listeners}
                className="p-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing rounded transition-colors"
                aria-label="Reorder"
            >
                <GripVerticalIcon className="w-4 h-4" />
            </button>

            {/* Order number */}
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-foreground/5 text-[11px] font-bold text-foreground shrink-0">
                {index + 1}
            </span>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-foreground/5 border border-border flex items-center justify-center shrink-0">
                <span className="text-xs font-semibold text-foreground">
                    {item.full_name.charAt(0).toUpperCase()}
                </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{item.full_name}</p>
                <p className="text-xs text-muted-foreground">{formatRelationship(item.relationship)}</p>
            </div>

            {/* Disclosure badge */}
            <DisclosureBadge
                level={item.disclosure_level as "total_secrecy" | "partial_awareness" | "full_transparency"}
                compact
            />
        </div>
    );
}

export function BeneficiaryContactOrder({ beneficiaries, onSave }: BeneficiaryContactOrderProps) {
    const [items, setItems] = useState<BeneficiaryOrder[]>(beneficiaries);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setItems(beneficiaries);
    }, [beneficiaries]);

    const isDirty = items.some((item, i) => item.id !== beneficiaries[i]?.id);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setItems((prev) => {
                const oldIndex = prev.findIndex((p) => p.id === active.id);
                const newIndex = prev.findIndex((p) => p.id === over.id);
                return arrayMove(prev, oldIndex, newIndex);
            });
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(items.map((i) => i.id));
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch {
            // handled upstream
        } finally {
            setIsSaving(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="bg-card border border-border rounded-2xl p-6 text-center">
                <UsersIcon className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No beneficiaries to order. Add beneficiaries first.</p>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-foreground">Beneficiary Contact Order</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Drag to set the order in which beneficiaries are contacted during escalation.
                    </p>
                </div>
                {isDirty && (
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-foreground text-background rounded-lg text-xs font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
                    >
                        {isSaving ? (
                            <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <SaveIcon className="w-3.5 h-3.5" />
                        )}
                        {saved ? "Saved!" : "Save Order"}
                    </button>
                )}
            </div>

            <div className="p-4 space-y-2">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                        {items.map((item, index) => (
                            <SortableRow key={item.id} item={item} index={index} />
                        ))}
                    </SortableContext>
                </DndContext>
            </div>

            {/* Legend */}
            <div className="px-6 py-3 border-t border-border flex items-center gap-4 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Secrecy</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Partial</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Transparent</span>
            </div>
        </div>
    );
}
