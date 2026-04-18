import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldCheck, User, Phone, Mail } from "lucide-react";

const formSchema = z.object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    relationship: z.string().min(2, "Relationship must be at least 2 characters"),
    phone_number: z.string().min(10, "Phone number must be at least 10 digits"),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
});

interface EmergencyContactFormProps {
    initialData: any;
    onSubmit: (data: z.infer<typeof formSchema>) => void;
}

export function EmergencyContactForm({ initialData, onSubmit }: EmergencyContactFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            full_name: "",
            relationship: "",
            phone_number: "",
            email: "",
        },
    });

    return (
        <Card className="border border-border rounded-xl shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border py-4 px-6">
                <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" />
                    Guardian Details
                </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="full_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Legal Name</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 h-3.5 w-3.5 text-muted-foreground" />
                                                <Input placeholder="Enter name" className="pl-10 h-10 border rounded-lg text-sm bg-background focus:ring-black/5" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="relationship"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Relationship</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Spouse" className="h-10 border rounded-lg text-sm bg-background focus:ring-black/5" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="phone_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contact Number</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-3 h-3.5 w-3.5 text-muted-foreground" />
                                                <Input placeholder="+91..." className="pl-10 h-10 border rounded-lg text-sm bg-background focus:ring-black/5 font-mono" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Address</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 h-3.5 w-3.5 text-muted-foreground" />
                                                <Input placeholder="contact@vault.com" className="pl-10 h-10 border rounded-lg text-sm bg-background focus:ring-black/5" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button 
                                type="submit" 
                                className="h-11 rounded-full px-8 font-bold bg-black text-white hover:bg-zinc-800 transition-all text-xs uppercase tracking-widest"
                            >
                                Commit Updates
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
