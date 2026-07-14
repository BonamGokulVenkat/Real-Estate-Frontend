"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Save, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  IndianRupee,
  Layers,
  Clock,
  ShieldCheck,
  Edit3,
  Loader2,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscriptionService } from "@/services/subscriptionService";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface Plan {
    id?: string;
    name: string;
    price: number;
    propertyLimit: number;
    durationDays: number;
    isActive: boolean;
}

interface Setting {
    key: string;
    value: string;
}

const emptyPlan: Plan = {
    name: "",
    price: 0,
    propertyLimit: 0,
    durationDays: 30,
    isActive: true,
};

export default function SystemSettings() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [settings, setSettings] = useState<Setting[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingSettings, setSavingSettings] = useState(false);
    const [isAddingPlan, setIsAddingPlan] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);
    const [savingPlan, setSavingPlan] = useState(false);
    
    const [newPlan, setNewPlan] = useState<Plan>(emptyPlan);
    const [freeLimit, setFreeLimit] = useState("1");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [plansData, settingsData] = await Promise.all([
                subscriptionService.getAllPlans(),
                subscriptionService.getSettings()
            ]);
            setPlans(plansData);
            setSettings(settingsData);
            
            const freeLimitSetting = settingsData.find((s: Setting) => s.key === "FREE_PROPERTY_LIMIT");
            if (freeLimitSetting) setFreeLimit(freeLimitSetting.value);
            
        } catch (error) {
            console.log(error);
            toast.error("Failed to fetch settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveGlobalSettings = async () => {
        setSavingSettings(true);
        try {
            await subscriptionService.updateSetting("FREE_PROPERTY_LIMIT", freeLimit);
            toast.success("Global settings updated");
        } catch {
            toast.error("Failed to update global settings");
        } finally {
            setSavingSettings(false);
        }
    };

    const handleCreatePlan = async () => {
        if (!newPlan.name.trim() || newPlan.price < 0 || newPlan.propertyLimit <= 0 || newPlan.durationDays <= 0) {
            toast.error("Please fill all fields correctly");
            return;
        }
        setSavingPlan(true);
        try {
            await subscriptionService.createPlan(newPlan);
            toast.success(`Plan "${newPlan.name}" created successfully`);
            setIsAddingPlan(false);
            setNewPlan(emptyPlan);
            fetchData();
        } catch {
            toast.error("Failed to create plan");
        } finally {
            setSavingPlan(false);
        }
    };

    const handleTogglePlan = async (plan: Plan) => {
        try {
            await subscriptionService.updatePlan(plan.id!, { isActive: !plan.isActive });
            toast.success(`Plan ${!plan.isActive ? "activated" : "deactivated"}`);
            fetchData();
        } catch {
            toast.error("Action failed");
        }
    };

    const handleEditPlan = (plan: Plan) => {
        setEditingPlan({ ...plan });
        // Close add form if open
        setIsAddingPlan(false);
    };

    const handleUpdatePlan = async () => {
        if (!editingPlan) return;
        if (!editingPlan.name.trim() || editingPlan.price < 0 || editingPlan.propertyLimit <= 0 || editingPlan.durationDays <= 0) {
            toast.error("Please fill all fields correctly");
            return;
        }
        setSavingPlan(true);
        try {
            await subscriptionService.updatePlan(editingPlan.id!, {
                name: editingPlan.name,
                price: editingPlan.price,
                propertyLimit: editingPlan.propertyLimit,
                durationDays: editingPlan.durationDays,
            });
            toast.success(`Plan "${editingPlan.name}" updated successfully`);
            setEditingPlan(null);
            fetchData();
        } catch {
            toast.error("Failed to update plan");
        } finally {
            setSavingPlan(false);
        }
    };

    const handleDeletePlan = async (plan: Plan) => {
        // First click sets the "confirm" state, second click deletes
        if (deletingPlanId !== plan.id) {
            setDeletingPlanId(plan.id!);
            toast.warning(`Click delete again to confirm removing "${plan.name}"`);
            // Auto-reset confirmation state after 4 seconds
            setTimeout(() => setDeletingPlanId(null), 4000);
            return;
        }
        // Confirmed — proceed with delete
        setDeletingPlanId(null);
        try {
            await subscriptionService.deletePlan(plan.id!);
            toast.success(`Plan "${plan.name}" deleted`);
            fetchData();
        } catch {
            toast.error("Failed to delete plan");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
                <p className="text-white/40 animate-pulse">Loading System Architecture...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <div>
                <h1 className="font-serif text-4xl font-bold mb-2">System <span className="text-white/40 italic">Configurations</span></h1>
                <p className="text-white/40 max-w-2xl text-sm leading-relaxed">
                    Manage platform-wide limits, subscription tiers, and architectural parameters.
                </p>
            </div>

            {/* Global Settings Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4 text-blue-500" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">Global Guardrails</h2>
                </div>

                <Card className="bg-white/[0.02] border-white/5 overflow-hidden">
                    <CardContent className="p-8">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-4">
                                <Label className="text-sm font-bold uppercase tracking-widest text-white/60">Free User Property Limit</Label>
                                <p className="text-xs text-white/30 leading-relaxed mb-4">
                                    Defines the maximum number of properties a user on the FREE plan can post. 
                                    Changes take effect immediately for new posts.
                                </p>
                                <div className="flex gap-4">
                                    <Input 
                                        type="number" 
                                        value={freeLimit} 
                                        onChange={(e) => setFreeLimit(e.target.value)}
                                        className="bg-white/5 border-white/10 h-12 w-32 text-lg font-bold text-amber-500"
                                    />
                                    <Button 
                                        onClick={handleSaveGlobalSettings}
                                        disabled={savingSettings}
                                        className="bg-white text-black hover:bg-white/90 font-bold px-8"
                                    >
                                        {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" />Apply Changes</>}
                                    </Button>
                                </div>
                            </div>
                            <div className="hidden md:block">
                                <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                                    <div className="flex items-start gap-4">
                                        <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                                        <div>
                                            <h4 className="text-sm font-bold text-amber-500 mb-1">Impact Analysis</h4>
                                            <p className="text-[11px] text-white/40 leading-relaxed">
                                                Modifying this limit affects all non-subscribed users. 
                                                Reducing the limit will not delete existing properties but will prevent new ones if they exceed the new threshold.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* Subscription Plans Section */}
            <section className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                            <Layers className="w-4 h-4 text-amber-500" />
                        </div>
                        <h2 className="text-xl font-bold tracking-tight">Revenue Tiers</h2>
                    </div>
                    <Button 
                        onClick={() => { setIsAddingPlan(true); setEditingPlan(null); }}
                        className="bg-amber-500 hover:bg-amber-400 text-[#0A192F] font-bold"
                        disabled={isAddingPlan}
                    >
                        <Plus className="w-4 h-4 mr-2" /> Create New Tier
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {/* ── Add New Plan Card ── */}
                        {isAddingPlan && (
                            <motion.div
                                key="add-plan-card"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <Card className="bg-amber-500/5 border-amber-500/20 h-full border-dashed">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-lg">New Plan Details</CardTitle>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-white/30 hover:text-white"
                                            onClick={() => { setIsAddingPlan(false); setNewPlan(emptyPlan); }}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase tracking-widest text-white/40">Tier Name</Label>
                                            <Input 
                                                placeholder="e.g. PLATINUM" 
                                                value={newPlan.name}
                                                onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
                                                className="bg-black/20 border-white/10"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] uppercase tracking-widest text-white/40">Price (INR)</Label>
                                                <div className="relative">
                                                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20" />
                                                    <Input 
                                                        type="number" 
                                                        value={newPlan.price}
                                                        onChange={(e) => setNewPlan({...newPlan, price: Number(e.target.value)})}
                                                        className="bg-black/20 border-white/10 pl-8"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] uppercase tracking-widest text-white/40">Property Limit</Label>
                                                <Input 
                                                    type="number" 
                                                    value={newPlan.propertyLimit}
                                                    onChange={(e) => setNewPlan({...newPlan, propertyLimit: Number(e.target.value)})}
                                                    className="bg-black/20 border-white/10"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase tracking-widest text-white/40 flex items-center gap-1.5">
                                                <Clock className="w-3 h-3" /> Duration (Days)
                                            </Label>
                                            <Input 
                                                type="number" 
                                                value={newPlan.durationDays}
                                                onChange={(e) => setNewPlan({...newPlan, durationDays: Number(e.target.value)})}
                                                className="bg-black/20 border-white/10"
                                            />
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <Button 
                                                onClick={handleCreatePlan} 
                                                disabled={savingPlan}
                                                className="flex-1 bg-amber-500 text-[#0A192F] font-bold"
                                            >
                                                {savingPlan ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
                                            </Button>
                                            <Button 
                                                onClick={() => { setIsAddingPlan(false); setNewPlan(emptyPlan); }} 
                                                variant="ghost" 
                                                className="flex-1 text-white/40"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {/* ── Existing Plan Cards ── */}
                        {plans.map((plan) => {
                            const isEditing = editingPlan?.id === plan.id;
                            const isConfirmingDelete = deletingPlanId === plan.id;

                            return (
                                <motion.div key={plan.id} layout>
                                    <Card className={`bg-white/[0.02] border-white/5 group transition-all duration-500 ${isEditing ? "border-blue-500/30" : "hover:border-amber-500/30"}`}>
                                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                                            <div className="space-y-1">
                                                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                                                <Badge variant={plan.isActive ? "default" : "secondary"} className={plan.isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-white/5 text-white/20"}>
                                                    {plan.isActive ? <><CheckCircle2 className="w-3 h-3 mr-1" />Active</> : "Archived"}
                                                </Badge>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-2xl font-bold font-serif">₹{plan.price}</span>
                                                <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">Monthly</p>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="pt-4">
                                            <AnimatePresence mode="wait">
                                                {isEditing ? (
                                                    /* ── Inline Edit Form ── */
                                                    <motion.div
                                                        key="edit-form"
                                                        initial={{ opacity: 0, y: -8 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -8 }}
                                                        className="space-y-3"
                                                    >
                                                        <div className="space-y-1.5">
                                                            <Label className="text-[10px] uppercase tracking-widest text-white/40">Plan Name</Label>
                                                            <Input
                                                                value={editingPlan?.name ?? ""}
                                                                onChange={(e) => setEditingPlan(p => p ? {...p, name: e.target.value} : p)}
                                                                className="bg-black/20 border-white/10 h-9 text-sm"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="space-y-1.5">
                                                                <Label className="text-[10px] uppercase tracking-widest text-white/40">Price (₹)</Label>
                                                                <div className="relative">
                                                                    <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20" />
                                                                    <Input
                                                                        type="number"
                                                                        value={editingPlan?.price ?? 0}
                                                                        onChange={(e) => setEditingPlan(p => p ? {...p, price: Number(e.target.value)} : p)}
                                                                        className="bg-black/20 border-white/10 h-9 text-sm pl-7"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <Label className="text-[10px] uppercase tracking-widest text-white/40">Listing Limit</Label>
                                                                <Input
                                                                    type="number"
                                                                    value={editingPlan?.propertyLimit ?? 0}
                                                                    onChange={(e) => setEditingPlan(p => p ? {...p, propertyLimit: Number(e.target.value)} : p)}
                                                                    className="bg-black/20 border-white/10 h-9 text-sm"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <Label className="text-[10px] uppercase tracking-widest text-white/40 flex items-center gap-1">
                                                                <Clock className="w-3 h-3" /> Duration (Days)
                                                            </Label>
                                                            <Input
                                                                type="number"
                                                                value={editingPlan?.durationDays ?? 30}
                                                                onChange={(e) => setEditingPlan(p => p ? {...p, durationDays: Number(e.target.value)} : p)}
                                                                className="bg-black/20 border-white/10 h-9 text-sm"
                                                            />
                                                        </div>
                                                        <div className="flex gap-2 pt-1">
                                                            <Button
                                                                onClick={handleUpdatePlan}
                                                                disabled={savingPlan}
                                                                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold h-9"
                                                            >
                                                                {savingPlan ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-3 h-3 mr-1.5" />Save</>}
                                                            </Button>
                                                            <Button
                                                                onClick={() => setEditingPlan(null)}
                                                                variant="ghost"
                                                                className="flex-1 text-white/40 text-xs h-9"
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </motion.div>
                                                ) : (
                                                    /* ── Read-only Plan Info ── */
                                                    <motion.div
                                                        key="plan-info"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                    >
                                                        <div className="space-y-3 mb-6">
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="text-white/40">Property Limit</span>
                                                                <span className="font-bold text-amber-500">{plan.propertyLimit} Listings</span>
                                                            </div>
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="text-white/40">Validity Period</span>
                                                                <span className="text-white/60 flex items-center gap-1"><Clock className="w-3 h-3" />{plan.durationDays} Days</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button 
                                                                onClick={() => handleTogglePlan(plan)}
                                                                variant="ghost" 
                                                                className={`flex-1 text-xs font-bold uppercase tracking-widest h-9 ${plan.isActive ? "hover:bg-red-500/10 hover:text-red-500" : "hover:bg-emerald-500/10 hover:text-emerald-500"}`}
                                                            >
                                                                {plan.isActive ? "Deactivate" : "Activate"}
                                                            </Button>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-9 w-9 text-white/30 hover:text-blue-400 hover:bg-blue-500/10"
                                                                onClick={() => handleEditPlan(plan)}
                                                                title="Edit plan"
                                                            >
                                                                <Edit3 className="w-4 h-4" />
                                                            </Button>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className={`h-9 w-9 transition-all ${isConfirmingDelete ? "text-red-500 bg-red-500/10 animate-pulse" : "text-white/20 hover:text-red-500 hover:bg-red-500/10"}`}
                                                                onClick={() => handleDeletePlan(plan)}
                                                                title={isConfirmingDelete ? "Click again to confirm deletion" : "Delete plan"}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </section>
        </div>
    );
}
