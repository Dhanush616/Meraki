import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldCheck, UserPlus, Phone, Mail, User } from "lucide-react";

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
        <Card className="border-2 border-oat-border shadow-clay h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slushie-800">
                    <ShieldCheck className="w-5 h-5 text-slushie-500" />
                    Emergency Contact
                </CardTitle>
                <CardDescription>
                    This person is contacted before your beneficiaries to check on your wellbeing.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="full_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input placeholder="Ramesh Iyer" className="pl-10 h-11 border-2" {...field} />
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
                                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Relationship</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Brother, Spouse, Close Friend" className="h-11 border-2" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="phone_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone Number</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input placeholder="+91 9876543210" className="pl-10 h-11 border-2" {...field} />
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
                                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email (Optional)</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input placeholder="contact@example.com" className="pl-10 h-11 border-2" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full h-12 rounded-xl mt-4 font-bold shadow-clay hover:rotate-[-2deg] hover:translate-y-[-2px] transition-all bg-slushie-500 hover:bg-slushie-600 text-white"
                        >
                            <UserPlus className="mr-2 h-5 w-5" />
                            Update Contact Information
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
