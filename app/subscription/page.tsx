"use client";

import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Shield, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useState, useEffect } from "react";
import { subscriptionService } from "@/services/subscriptionService";
import { apiClient } from "@/lib/apiClient";

export default function Subscription() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const data = await subscriptionService.getActivePlans();
        // Fallback to static if no plans in DB yet
        if (data && data.length > 0) {
          setPlans(data);
        } else {
            // Static fallback for initial setup
            setPlans([
                { id: 'free', name: "FREE", price: 0, propertyLimit: 3, description: "For starters", features: ["Up to 3 Property Listings", "Standard Visibility"] },
                { id: 'pro', name: "PRO", price: 299, propertyLimit: 50, description: "For professionals", features: ["Up to 50 Property Listings", "Priority Visibility", "Advanced AI Insights"] }
            ]);
        }
      } catch (error) {
        console.error("Failed to fetch plans", error);
      }
    }
    fetchPlans();
  }, []);

  const handlePayment = async (plan: any) => {
    if (!user) {
      toast.error("Please log in first");
      return;
    }

    setLoading(true);
    try {
      const orderResponse = await apiClient.post('/subscription/create-order', { amount: plan.price });
      const order = orderResponse.data;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Luxora Real Estate",
        description: `${plan.name} Plan Subscription`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await apiClient.post('/subscription/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: plan.id,
            });

            const upgradedUser = verifyRes.data;
            setUser(upgradedUser); // Update local store
            toast.success("Welcome to the PRO family!");
            router.push("/sell");
          } catch (error) {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#F59E0B",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error("Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-[#0A192F] text-white">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <span className="text-amber-500 text-xs font-bold tracking-[0.4em] uppercase mb-4 block">
            Elevate Your Presence
          </span>
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6">
            Architectural <span className="text-white/40 italic">Advantage</span>
          </h1>
          <p className="text-white/40 max-w-2xl mx-auto text-lg leading-relaxed">
            Unlock the full potential of Luxora. Showcase your entire portfolio to our global network of elite investors.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-10 rounded-[40px] border transition-all duration-500 ${
                plan.highlight 
                  ? "bg-white/[0.05] border-amber-500/50 shadow-2xl shadow-amber-500/10" 
                  : "bg-white/[0.02] border-white/10"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 right-8 bg-amber-500 text-[#0A192F] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Crown className="w-3 h-3" /> Recommended
                </div>
              )}

              <div className="mb-10">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-white/40 text-sm">{plan.description}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold font-serif">₹{plan.price}</span>
                  <span className="text-white/40">/{plan.durationDays || 30} days</span>
                </div>
              </div>

              <div className="space-y-6 mb-12 min-h-[150px]">
                {(plan.features || [`Up to ${plan.propertyLimit} Property Listings`, "Priority Visibility"]).map((feature: any) => (
                  <div key={feature} className="flex items-center gap-4">
                    <div className={`p-1 rounded-full ${plan.highlight ? "text-amber-500" : "text-white/20"}`}>
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="text-sm text-white/60">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => handlePayment(plan)}
                disabled={loading || plan.price === 0 || user?.plan === plan.name}
                className={`w-full h-14 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                  plan.price > 0
                    ? "bg-amber-500 hover:bg-amber-400 text-[#0A192F] shadow-lg shadow-amber-500/20"
                    : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                }`}
              >
                {loading
                  ? "Initializing..."
                  : user?.plan === plan.name
                  ? "✓ Current Plan"
                  : plan.price === 0
                  ? "Free Plan"
                  : "Upgrade Now →"}
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
                { icon: Zap, title: "Instant Access", desc: "Your limits are upgraded immediately after payment." },
                { icon: Shield, title: "Secure Checkout", desc: "Powered by Razorpay for bank-level security." },
                { icon: Sparkles, title: "AI Boost", desc: "PRO members get visibility in 'Just for You' sections." }
            ].map(item => (
                <div key={item.title} className="text-center space-y-3">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                        <item.icon className="w-6 h-6 text-amber-500/60" />
                    </div>
                    <h4 className="text-sm font-bold uppercase tracking-widest">{item.title}</h4>
                    <p className="text-white/30 text-xs leading-relaxed">{item.desc}</p>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
