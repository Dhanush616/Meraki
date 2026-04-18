"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserIcon, MapPinIcon, UsersIcon, SaveIcon, ShieldCheckIcon, UploadCloudIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const TABS = [
    { id: "personal", label: "Personal Details", icon: <UserIcon className="w-4 h-4 mr-2" /> },
    { id: "address", label: "Address Information", icon: <MapPinIcon className="w-4 h-4 mr-2" /> },
    { id: "family", label: "Family & Legal", icon: <UsersIcon className="w-4 h-4 mr-2" /> }
];

export default function SettingsPage() {
    const supabase = createClient();
    const [activeTab, setActiveTab] = useState("personal");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        full_name: "",
        avatar_url: "",
        date_of_birth: "",
        phone_number: "",
        aadhaar_number: "",
        pan_number: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
        father_name: "",
        mother_name: "",
        spouse_name: "",
        religion: ""
    });

    useEffect(() => {
        async function fetchProfile() {
            setLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const token = localStorage.getItem("paradosis_access_token");
            try {
                const res = await fetch(`${apiUrl}/api/profiles`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setFormData(prev => ({ ...prev, ...data }));
                }
            } catch (err) {
                console.error("Failed to fetch profile");
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const { data: userData } = await supabase.auth.getUser();
            const userId = userData.user?.id;
            if (!userId) return;

            const fileExt = file.name.split(".").pop();
            const fileName = `${userId}-${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(fileName);
            if (urlData.publicUrl) {
                setFormData(prev => ({ ...prev, avatar_url: urlData.publicUrl }));
            }
        } catch (error) {
            console.error("Error uploading avatar:", error);
            alert("Failed to upload avatar.");
        }
    };

    const handleSave = async () => {
        setSaving(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const token = localStorage.getItem("paradosis_access_token");
        try {
            const res = await fetch(`${apiUrl}/api/profiles`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                alert("Profile saved successfully.");
            } else {
                alert("Failed to save profile.");
            }
        } catch (err) {
            console.error("Save error:", err);
            alert("Failed to save profile due to an error.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground font-sans animate-pulse">Loading Profile Data...</div>;

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-20">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-sans font-bold text-foreground flex items-center gap-2">
                        <UserIcon className="w-8 h-8" />
                        Profile Settings
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Securely manage your personal and legal records.
                    </p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-[#b05637] text-white">
                    {saving ? "Saving..." : "Save Changes"} <SaveIcon className="w-4 h-4 ml-2" />
                </Button>
            </header>

            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col md:flex-row">
                <nav className="w-full md:w-64 bg-muted/30 border-r border-border p-4 flex flex-col gap-2 shrink-0">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-background shadow-sm border border-border text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}

                    {/* Avatar Upload (Only visible in Personal) */}
                    {activeTab === "personal" && (
                        <div className="mt-8 border-t border-border pt-6 flex flex-col items-center text-center px-4">
                            <div className="w-24 h-24 rounded-full bg-border overflow-hidden mb-4 relative group shrink-0 shadow-inner">
                                {formData.avatar_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={formData.avatar_url} alt="Profile Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-3xl font-medium">
                                        {formData.full_name?.charAt(0) || "?"}
                                    </div>
                                )}
                                <label className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <UploadCloudIcon className="w-6 h-6 text-foreground mb-1" />
                                    <span className="text-[10px] font-medium text-foreground">Upload</span>
                                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                                </label>
                            </div>
                            <p className="text-xs text-muted-foreground">Click image to update avatar. Publicly accessible link.</p>
                        </div>
                    )}
                </nav>

                <div className="flex-1 p-6 md:p-8 min-h-[500px]">
                    <AnimatePresence mode="wait">
                        {activeTab === "personal" && (
                            <motion.div key="personal" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                                <h3 className="text-xl font-bold font-sans text-foreground mb-6 flex items-center gap-2">
                                    Personal Identity <ShieldCheckIcon className="w-5 h-5 text-primary" />
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Full Name (Legal)</label>
                                        <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring/20 font-sans" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Date of Birth</label>
                                        <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring/20 font-sans" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Aadhaar Number</label>
                                        <input type="text" name="aadhaar_number" value={formData.aadhaar_number} onChange={handleChange} placeholder="XXXX-XXXX-XXXX" className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring/20 font-sans" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">PAN Number</label>
                                        <input type="text" name="pan_number" value={formData.pan_number} onChange={handleChange} placeholder="ABCDE1234F" className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring/20 font-sans" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Phone Number</label>
                                        <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="+91 XXXXX XXXXX" className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring/20 font-sans" />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        {activeTab === "address" && (
                            <motion.div key="address" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                                <h3 className="text-xl font-bold font-sans text-foreground mb-6">Address Information</h3>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Address Line 1</label>
                                        <input type="text" name="address_line1" value={formData.address_line1} onChange={handleChange} className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring/20 font-sans" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Address Line 2</label>
                                        <input type="text" name="address_line2" value={formData.address_line2} onChange={handleChange} className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring/20 font-sans" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">City</label>
                                            <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring/20 font-sans" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">State</label>
                                            <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring/20 font-sans" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Pincode</label>
                                            <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring/20 font-sans" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        {activeTab === "family" && (
                            <motion.div key="family" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                                <h3 className="text-xl font-bold font-sans text-foreground mb-6">Family & Legal Roots</h3>
                                <p className="text-sm text-muted-foreground mb-6">This information is requested upfront so it can be automatically prepopulated into generated legal documents (ex: Will, Succession certificates).</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Father&apos;s Name</label>
                                        <input type="text" name="father_name" value={formData.father_name} onChange={handleChange} className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring/20 font-sans" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Mother&apos;s Name</label>
                                        <input type="text" name="mother_name" value={formData.mother_name} onChange={handleChange} className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring/20 font-sans" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Spouse&apos;s Name (Optional)</label>
                                        <input type="text" name="spouse_name" value={formData.spouse_name} onChange={handleChange} className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring/20 font-sans" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Religion</label>
                                        <select name="religion" value={formData.religion} onChange={handleChange} className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring/20 font-sans">
                                            <option value="">Select Religion</option>
                                            <option value="Hindu">Hindu</option>
                                            <option value="Muslim">Muslim</option>
                                            <option value="Christian">Christian</option>
                                            <option value="Sikh">Sikh</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
