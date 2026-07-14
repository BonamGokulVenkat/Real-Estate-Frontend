"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Save, 
  Trash2, 
  AlertCircle,
  IndianRupee,
  Layers,
  Clock,
  ShieldCheck,
  Edit3,
  Loader2,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscriptionService } from "@/services/subscriptionService";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

export default function SystemSettings() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [settings, setSettings] = useState<Setting[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingSettings, setSavingSettings] = useState(false);
    const [isAddingPlan, setIsAddingPlan] = useState(false);
    
    const [newPlan, setNewPlan] = useState<Plan>({
        name: "",
        price: 0,
        propertyLimit: 0,
        durationDays: 30,
        isActive: true
    });

    const [freeLimit, setFreeLimit] = useState("1");

    // Edit plan state
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [editForm, setEditForm] = useState<Plan>({ name: "", price: 0, propertyLimit: 0, durationDays: 30, isActive: true });
    const [savingEdit, setSavingEdit] = useState(false);

    // Delete plan state
    const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Toggle plan state
    const [planToToggle, setPlanToToggle] = useState<Plan | null>(null);
    const [toggling, setToggling] = useState(false);

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
        } catch (error) {
            toast.error("Failed to update global settings");
        } finally {
            setSavingSettings(false);
        }
    };

    const handleCreatePlan = async () => {
        if (!newPlan.name || newPlan.price < 0 || newPlan.propertyLimit <= 0 || newPlan.durationDays <= 0) {
            toast.error("Please fill all fields correctly");
            return;
        }
        try {
            await subscriptionService.createPlan(newPlan);
            toast.success("Plan created successfully");
            setIsAddingPlan(false);
            setNewPlan({ name: "", price: 0, propertyLimit: 0, durationDays: 30, isActive: true });
            fetchData();
        } catch (error) {
            toast.error("Failed to create plan");
        }
    };

    // ── Edit Plan ─────────────────────────────────────────────────────
    const openEditDialog = (plan: Plan) => {
        setEditingPlan(plan);
        setEditForm({ ...plan });
    };

    const handleSaveEdit = async () => {
        if (!editingPlan?.id) return;
        if (!editForm.name || editForm.price < 0 || editForm.propertyLimit <= 0 || editForm.durationDays <= 0) {
            toast.error("Please fill all fields correctly");
            return;
        }
        setSavingEdit(true);
        try {
            await subscriptionService.updatePlan(editingPlan.id, {
                name: editForm.name,
                price: editForm.price,
                propertyLimit: editForm.propertyLimit,
                durationDays: editForm.durationDays,
                isActive: editForm.isActive
            });
            toast.success(`Plan updated successfully`);
            setEditingPlan(null);
            fetchData();
        } catch (error) {
            toast.error("Failed to update plan");
        } finally {
            setSavingEdit(false);
        }
    };

    // ── Delete Plan ───────────────────────────────────────────────────
    const handleDeletePlan = async () => {
        if (!planToDelete?.id) return;
        setDeleting(true);
        try {
            await subscriptionService.deletePlan(planToDelete.id);
            toast.success(`Plan deleted successfully`);
            setPlanToDelete(null);
            fetchData();
        } catch (error) {
            toast.error("Failed to delete plan");
        } finally {
            setDeleting(false);
        }
    };

    // ── Toggle Active/Inactive ────────────────────────────────────────
    const handleTogglePlan = async () => {
        if (!planToToggle?.id) return;
        setToggling(true);
        try {
            await subscriptionService.updatePlan(planToToggle.id, { isActive: !planToToggle.isActive });
            toast.success(`Plan ${!planToToggle.isActive ? 'activated' : 'deactivated'}`);
            setPlanToToggle(null);
            fetchData();
        } catch (error) {
            toast.error("Action failed");
        } finally {
            setToggling(false);
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
                                        {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply Changes"}
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
                        onClick={() => setIsAddingPlan(true)}
                        className="bg-amber-500 hover:bg-amber-400 text-[#0A192F] font-bold"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Create New Tier
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {isAddingPlan && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <Card className="bg-amber-500/5 border-amber-500/20 h-full border-dashed">
                                    <CardHeader>
                                        <CardTitle className="text-lg">New Plan Details</CardTitle>
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
                                                <Label className="text-[10px] uppercase tracking-widest text-white/40">Limit</Label>
                                                <Input 
                                                    type="number" 
                                                    value={newPlan.propertyLimit}
                                                    onChange={(e) => setNewPlan({...newPlan, propertyLimit: Number(e.target.value)})}
                                                    className="bg-black/20 border-white/10"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase tracking-widest text-white/40">Duration (Days)</Label>
                                            <Input 
                                                type="number" 
                                                value={newPlan.durationDays}
                                                onChange={(e) => setNewPlan({...newPlan, durationDays: Number(e.target.value)})}
                                                className="bg-black/20 border-white/10"
                                            />
                                        </div>
                                        <div className="flex gap-2 pt-4">
                                            <Button onClick={handleCreatePlan} className="flex-1 bg-amber-500 text-[#0A192F] font-bold">Create</Button>
                                            <Button onClick={() => setIsAddingPlan(false)} variant="ghost" className="flex-1 text-white/40">Cancel</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {plans.map((plan) => (
                        <Card key={plan.id} className={`bg-white/[0.02] border-white/5 group hover:border-amber-500/30 transition-all duration-500 ${!plan.isActive ? 'opacity-60' : ''}`}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                                    <Badge variant={plan.isActive ? "default" : "secondary"} className={plan.isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-white/5 text-white/20"}>
                                        {plan.isActive ? "Active" : "Archived"}
                                    </Badge>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-bold font-serif">₹{plan.price}</span>
                                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">Monthly</p>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-white/40">Property Limit</span>
                                        <span className="font-bold text-amber-500">{plan.propertyLimit} Listings</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-white/40">Validity Period</span>
                                        <span className="text-white/60">{plan.durationDays} Days</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button 
                                        onClick={() => setPlanToToggle(plan)}
                                        variant="ghost" 
                                        className={`flex-1 text-xs font-bold uppercase tracking-widest h-10 ${plan.isActive ? 'hover:bg-red-500/10 hover:text-red-500' : 'hover:bg-emerald-500/10 hover:text-emerald-500'}`}
                                    >
                                        {plan.isActive ? "Deactivate" : "Activate"}
                                    </Button>
                                    <Button 
                                        onClick={() => openEditDialog(plan)} 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-10 w-10 text-white/20 hover:text-amber-500 hover:bg-amber-500/10"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                        onClick={() => setPlanToDelete(plan)} 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-10 w-10 text-white/20 hover:text-red-500 hover:bg-red-500/10"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* ── Edit Plan Dialog ── */}
            <AlertDialog open={!!editingPlan} onOpenChange={(open) => { if (!open) setEditingPlan(null); }}>
                <AlertDialogContent className="bg-[#0D2137] border border-white/10 text-white rounded-3xl max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-serif">Edit Plan</AlertDialogTitle>
                        <AlertDialogDescription className="text-white/50 text-sm">
                            Modify the details for <span className="text-amber-400 font-semibold">{editingPlan?.name}</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest text-white/40">Tier Name</Label>
                            <Input 
                                value={editForm.name}
                                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                className="bg-white/5 border-white/10"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-widest text-white/40">Price (INR)</Label>
                                <Input 
                                    type="number" 
                                    value={editForm.price}
                                    onChange={(e) => setEditForm({...editForm, price: Number(e.target.value)})}
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-widest text-white/40">Property Limit</Label>
                                <Input 
                                    type="number" 
                                    value={editForm.propertyLimit}
                                    onChange={(e) => setEditForm({...editForm, propertyLimit: Number(e.target.value)})}
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest text-white/40">Duration (Days)</Label>
                            <Input 
                                type="number" 
                                value={editForm.durationDays}
                                onChange={(e) => setEditForm({...editForm, durationDays: Number(e.target.value)})}
                                className="bg-white/5 border-white/10"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label className="text-[10px] uppercase tracking-widest text-white/40">Active</Label>
                            <Switch
                                checked={editForm.isActive}
                                onCheckedChange={(checked) => setEditForm({...editForm, isActive: checked})}
                            />
                        </div>
                    </div>
                    <AlertDialogFooter className="gap-3">
                        <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl px-6 h-11 flex-1">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleSaveEdit}
                            disabled={savingEdit}
                            className="bg-amber-500 hover:bg-amber-400 text-[#0A192F] border-none rounded-xl px-6 h-11 font-bold flex-1"
                        >
                            {savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ── Delete Confirmation ── */}
            <AlertDialog open={!!planToDelete} onOpenChange={(open) => { if (!open) setPlanToDelete(null); }}>
                <AlertDialogContent className="bg-[#0D2137] border border-white/10 text-white rounded-3xl max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-serif">Delete Plan?</AlertDialogTitle>
                        <AlertDialogDescription className="text-white/50 text-sm leading-relaxed">
                            This will permanently delete <span className="text-amber-400 font-semibold">&quot;{planToDelete?.name}&quot;</span>. Users on this plan will be downgraded to FREE. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-3 mt-2">
                        <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl px-6 h-11 flex-1">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeletePlan}
                            disabled={deleting}
                            className="bg-red-500 hover:bg-red-600 text-white border-none rounded-xl px-6 h-11 font-bold flex-1"
                        >
                            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Plan"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ── Toggle Confirmation ── */}
            <AlertDialog open={!!planToToggle} onOpenChange={(open) => { if (!open) setPlanToToggle(null); }}>
                <AlertDialogContent className="bg-[#0D2137] border border-white/10 text-white rounded-3xl max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-serif">
                            {planToToggle?.isActive ? 'Deactivate' : 'Activate'} Plan?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-white/50 text-sm leading-relaxed">
                            {planToToggle?.isActive 
                                ? <>Deactivating <span className="text-amber-400 font-semibold">&quot;{planToToggle?.name}&quot;</span> will hide it from new subscribers.</>
                                : <>Activating <span className="text-amber-400 font-semibold">&quot;{planToToggle?.name}&quot;</span> will make it available to subscribers.</>
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-3 mt-2">
                        <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl px-6 h-11 flex-1">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleTogglePlan}
                            disabled={toggling}
                            className={`border-none rounded-xl px-6 h-11 font-bold flex-1 ${planToToggle?.isActive ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
                        >
                            {toggling ? <Loader2 className="w-4 h-4 animate-spin" /> : (planToToggle?.isActive ? "Deactivate" : "Activate")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
