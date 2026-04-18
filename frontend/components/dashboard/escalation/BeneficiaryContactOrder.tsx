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
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
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
            className={`flex items-center gap-4 p-4 bg-background border rounded-lg mb-2 transition-all ${
                isDragging ? "border-black shadow-lg ring-2 ring-muted" : "border-border hover:border-zinc-300"
            }`}
        >
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded text-muted-foreground hover:text-black transition-colors">
                <GripVertical className="w-4 h-4" />
            </div>
            
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-black">{beneficiary.full_name}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2 py-0.5 bg-muted rounded">
                        {beneficiary.relationship}
                    </span>
                </div>
            </div>

            <div className="text-right">
                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0 border-zinc-200">
                    {beneficiary.disclosure_level.replace('_', ' ')}
                </Badge>
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
        <Card className="border border-border rounded-xl shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border py-4 px-6">
                <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                    <Users className="w-4 h-4" />
                    Succession Chain
                </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
                <p className="text-xs text-muted-foreground mb-6 font-medium">
                    Establish the hierarchical sequence of notification. Top-tier nodes are contacted first.
                </p>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={list.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                        {list.length > 0 ? (
                            <div className="space-y-1">
                                {list.map((item) => <SortableItem key={item.id} id={item.id} beneficiary={item} />)}
                            </div>
                        ) : (
                            <div className="p-12 border border-dashed border-border rounded-lg text-center bg-muted/20">
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">No_Active_Nodes</p>
                            </div>
                        )}
                    </SortableContext>
                </DndContext>
                
                <div className="mt-8 p-4 bg-muted/50 border border-border rounded-lg">
                    <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase tracking-tight">
                        <span className="text-black mr-2">PROTOCOL_NOTE:</span> 
                        Hierarchy determines the order of asset execution packages. Ensure primary nodes are correctly prioritized at the top.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
