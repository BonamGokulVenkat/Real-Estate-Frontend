"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Loader2, User, Phone, FileText, Building2, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import TagInput from "@/components/common/ui/TagInputProps";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { userService } from "@/services/userService";
import { useAuthStore } from "@/store/useAuthStore";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const inputClass =
  "w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 transition-all text-sm";
const labelClass =
  "block text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-2";

export default function EditProfileModal({ isOpen, onClose }: Props) {
  const { user, updateUser } = useAuthStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    bio: "",
    company_name: "",
    specializations: [] as string[],
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Sync form with current user data on open
  useEffect(() => {
    if (user && isOpen) {
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        bio: user.bio || "",
        company_name: user.company_name || "",
        specializations: user.specializations || [],
      });
      setAvatarPreview(user.avatar_url || null);
      setAvatarFile(null);
    }
  }, [user, isOpen]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be under 5 MB");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      let avatar_url = user.avatar_url;

      // Upload new avatar if one was selected
      if (avatarFile) {
        setIsUploadingPhoto(true);
        const ext = avatarFile.name.split(".").pop();
        const path = `${user.user_id}/${uuidv4()}.${ext}`;

        const { error: uploadErr } = await supabase.storage
          .from("properties")
          .upload(`avatars/${path}`, avatarFile, { upsert: true });

        if (uploadErr) throw new Error(uploadErr.message);

        const { data: { publicUrl } } = supabase.storage
          .from("properties")
          .getPublicUrl(`avatars/${path}`);

        avatar_url = publicUrl;
        setIsUploadingPhoto(false);
      }

      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        bio: form.bio.trim(),
        avatar_url,
        ...(user.role === "builder" && {
          company_name: form.company_name.trim(),
          specializations: form.specializations,
        }),
      };

      const updated = await userService.updateProfile(payload);

      // Merge into auth store so navbar/profile refresh immediately
      updateUser({
        name: updated.name,
        phone: updated.phone,
        bio: updated.bio,
        avatar_url: updated.avatar_url,
        company_name: updated.company_name,
        specializations: updated.specializations,
      });

      toast.success("Profile updated successfully!");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setIsSaving(false);
      setIsUploadingPhoto(false);
    }
  };

  if (!isOpen || !user) return null;

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200] flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-[#0A192F] border border-white/10 rounded-[32px] w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#0A192F] border-b border-white/5 px-8 py-6 flex items-center justify-between z-10 rounded-t-[32px]">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500 mb-1">Account Settings</p>
                <h2 className="font-serif text-2xl font-bold text-white">Edit Profile</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-8 py-8 space-y-8">
              {/* ── Avatar Upload ── */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-[28px] overflow-hidden border-2 border-white/10 group-hover:border-amber-500/40 transition-all bg-[#0D2137] flex items-center justify-center">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-serif font-bold text-3xl text-amber-500">{initials}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-500 hover:bg-amber-400 rounded-xl flex items-center justify-center text-[#0A192F] transition-all shadow-lg"
                  >
                    {isUploadingPhoto ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoSelect}
                  />
                </div>
                <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold">
                  Click the camera icon to update photo
                </p>
              </div>

              {/* ── Basic Info ── */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <User className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Personal Details</span>
                </div>

                <div>
                  <label className={labelClass}>Full Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your full name"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Phone Number</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Bio / Tagline</label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    placeholder="A short professional bio or tagline..."
                    rows={3}
                    maxLength={500}
                    className={`${inputClass} resize-none`}
                  />
                  <p className="text-white/20 text-[10px] mt-1 text-right">{form.bio.length}/500</p>
                </div>
              </div>

              {/* ── Builder-Only Section ── */}
              {user.role === "builder" && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                    <Building2 className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Agency Details</span>
                  </div>

                  <div>
                    <label className={labelClass}>Company / Agency Name</label>
                    <input
                      value={form.company_name}
                      onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                      placeholder="Prestige Realty Group"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Specializations</label>
                    <p className="text-white/20 text-[10px] mb-3">Add tags for your areas of expertise (press Enter)</p>
                    <TagInput
                      value={form.specializations}
                      onChange={(tags) => setForm({ ...form, specializations: tags })}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-[#0A192F] border-t border-white/5 px-8 py-6 flex gap-3 rounded-b-[32px]">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSaving}
                className="flex-1 border-white/10 bg-white/5 hover:bg-white/10 text-white/60 rounded-xl h-12"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-[#0A192F] font-bold rounded-xl h-12 shadow-lg shadow-amber-500/20"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Save Changes
                  </span>
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}