"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings, 
  Plus, 
  Save, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  IndianRupee,
  Layers,
  Clock,
  ShieldCheck,
  Edit3,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscriptionService } from "@/services/subscriptionService";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

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
        if (!newPlan.name || newPlan.price < 0 || newPlan.propertyLimit <= 0) {
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

    const handleTogglePlan = async (plan: Plan) => {
        try {
            await subscriptionService.updatePlan(plan.id!, { isActive: !plan.isActive });
            toast.success(`Plan ${!plan.isActive ? 'activated' : 'deactivated'}`);
            fetchData();
        } catch (error) {
            toast.error("Action failed");
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
                        <Card key={plan.id} className="bg-white/[0.02] border-white/5 group hover:border-amber-500/30 transition-all duration-500">
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
                                        onClick={() => handleTogglePlan(plan)}
                                        variant="ghost" 
                                        className={`flex-1 text-xs font-bold uppercase tracking-widest h-10 ${plan.isActive ? 'hover:bg-red-500/10 hover:text-red-500' : 'hover:bg-emerald-500/10 hover:text-emerald-500'}`}
                                    >
                                        {plan.isActive ? "Deactivate" : "Activate"}
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 text-white/20 hover:text-white">
                                        <Edit3 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    );
}
