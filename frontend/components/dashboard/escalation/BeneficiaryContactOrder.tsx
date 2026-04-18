import React, { useState, useEffect } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Users } from "lucide-react";
import { BeneficiaryOrder } from "@/hooks/useEscalationSettings";

interface SortableItemProps {
    id: string;
    beneficiary: BeneficiaryOrder;
}

function SortableItem({ id, beneficiary }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-4 p-4 bg-background border-2 rounded-xl mb-3 ${
                isDragging ? "border-primary shadow-lg ring-2 ring-primary/20" : "border-oat-border"
            }`}
        >
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded">
                <GripVertical className="w-5 h-5 text-muted-foreground" />
            </div>
            
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{beneficiary.full_name}</span>
                    <Badge variant="outline" className="text-[10px] uppercase font-bold py-0 h-5">
                        {beneficiary.relationship}
                    </Badge>
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Disclosure:</span>
                    <Badge 
                        className={`text-[9px] uppercase font-black px-1.5 h-4 ${
                            beneficiary.disclosure_level === 'full_transparency' 
                                ? 'bg-matcha-100 text-matcha-700' 
                                : beneficiary.disclosure_level === 'partial_awareness'
                                ? 'bg-slushie-100 text-slushie-700'
                                : 'bg-muted text-muted-foreground'
                        }`}
                    >
                        {beneficiary.disclosure_level.replace('_', ' ')}
                    </Badge>
                </div>
            </div>
        </div>
    );
}

interface BeneficiaryContactOrderProps {
    items: BeneficiaryOrder[];
    onOrderChange: (newOrder: string[]) => void;
}

export function BeneficiaryContactOrder({ items, onOrderChange }: BeneficiaryContactOrderProps) {
    const [list, setList] = useState(items);

    useEffect(() => {
        setList(items);
    }, [items]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = list.findIndex((i) => i.id === active.id);
            const newIndex = list.findIndex((i) => i.id === over.id);

            const newList = arrayMove(list, oldIndex, newIndex);
            setList(newList);
            onOrderChange(newList.map((i) => i.id));
        }
    };

    return (
        <Card className="border-2 border-oat-border shadow-clay">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-ube-800">
                    <Users className="w-5 h-5 text-ube-800" />
                    Beneficiary Contact Order
                </CardTitle>
                <CardDescription>
                    Drag and drop to set the order in which your beneficiaries are contacted.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={list.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                        {list.length > 0 ? (
                            list.map((item) => <SortableItem key={item.id} id={item.id} beneficiary={item} />)
                        ) : (
                            <div className="p-8 border-2 border-dashed border-muted rounded-2xl text-center">
                                <p className="text-sm text-muted-foreground font-medium">No beneficiaries added yet.</p>
                                <p className="text-xs text-muted-foreground mt-1">Add beneficiaries in the 'Beneficiaries' tab to see them here.</p>
                            </div>
                        )}
                    </SortableContext>
                </DndContext>
                
                <div className="mt-6 p-4 bg-ube-50 border border-ube-200 rounded-xl">
                    <p className="text-xs text-ube-800 leading-relaxed">
                        <span className="font-black uppercase mr-2">Pro Tip:</span> 
                        Place your most trusted or tech-savvy beneficiaries at the top. They will be the first to receive the execution package when the vault is unlocked.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
