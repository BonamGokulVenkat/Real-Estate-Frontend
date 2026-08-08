"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Shield, FileText, ArrowUp } from "lucide-react";

export default function TermsAndPrivacyPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Auto-scroll to section if hash or query param present
    const hash = window.location.hash || (searchParams.get("section") ? `#${searchParams.get("section")}` : "");
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, [searchParams]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.pushState(null, "", `#${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A192F] text-white flex flex-col selection:bg-amber-500/30">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            Legal & <span className="text-amber-500">Compliance</span>
          </h1>
          <p className="text-white/60 text-base sm:text-lg max-w-2xl mx-auto font-light">
            Transparency and privacy are at the heart of our client relationships. Review our Privacy Policy and Terms of Service below.
          </p>

          {/* Quick Navigation Tabs */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={() => scrollToSection("privacy-policy")}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/50 rounded-xl text-sm font-medium transition-all text-amber-400"
            >
              <Shield className="w-4 h-4 text-amber-500" />
              Privacy Policy
            </button>
            <button
              onClick={() => scrollToSection("terms-of-service")}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/50 rounded-xl text-sm font-medium transition-all text-amber-400"
            >
              <FileText className="w-4 h-4 text-amber-500" />
              Terms of Service
            </button>
          </div>
        </div>

        <div className="space-y-16">
          {/* SECTION 1: PRIVACY POLICY */}
          <section
            id="privacy-policy"
            className="bg-[#0D2137]/60 border border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-xl scroll-mt-32 shadow-2xl relative"
          >
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  Privacy Policy
                </h2>
                <p className="text-xs text-white/40 uppercase tracking-widest mt-0.5">
                  Last Updated: August 2026
                </p>
              </div>
            </div>

            <div className="space-y-6 text-white/80 leading-relaxed text-sm sm:text-base font-light">
              <p>
                At <strong className="text-white font-semibold">Luxora Estates</strong>, we respect your privacy and are committed to protecting the personal information you share with us. This Privacy Policy outlines how we collect, use, store, and safeguard your data when you visit our website or engage with our services.
              </p>

              <div>
                <h3 className="font-serif text-lg font-semibold text-amber-400 mb-2">
                  1. Information We Collect
                </h3>
                <ul className="list-disc list-inside space-y-1 text-white/70 pl-2">
                  <li><strong>Personal Identifier Information:</strong> Name, email address, phone number, and preferences provided when requesting private viewings or submitting inquiries.</li>
                  <li><strong>Account Credentials:</strong> Login credentials when registering as a buyer, agency, or builder.</li>
                  <li><strong>Technical & Usage Data:</strong> IP addresses, browser types, device information, and interaction metrics on our properties.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-serif text-lg font-semibold text-amber-400 mb-2">
                  2. How We Use Your Information
                </h3>
                <p className="text-white/70">
                  We use collected information strictly to:
                </p>
                <ul className="list-disc list-inside space-y-1 text-white/70 pl-2 mt-1">
                  <li>Facilitate introduction requests between clients, certified builders, and luxury agencies.</li>
                  <li>Provide curated property recommendations tailored to your preferences.</li>
                  <li>Maintain application security, fraud prevention, and system operational integrity.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-serif text-lg font-semibold text-amber-400 mb-2">
                  3. Data Sharing & Confidentiality
                </h3>
                <p className="text-white/70">
                  We do not sell or rent personal information to third-party advertisers. Information is only shared with verified agency partners or builders when you explicitly request a property viewing or confidential inquiry.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-lg font-semibold text-amber-400 mb-2">
                  4. Security Measures
                </h3>
                <p className="text-white/70">
                  We employ industry-standard encryption protocol (TLS/SSL) and administrative access controls to prevent unauthorized data access, disclosure, or alteration.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-lg font-semibold text-amber-400 mb-2">
                  5. Contact Us
                </h3>
                <p className="text-white/70">
                  For privacy queries or data deletion requests, contact our privacy officer at{" "}
                  <a href="mailto:privacy@luxoraestates.com" className="text-amber-400 hover:underline">
                    privacy@luxoraestates.com
                  </a>.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 2: TERMS OF SERVICE */}
          <section
            id="terms-of-service"
            className="bg-[#0D2137]/60 border border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-xl scroll-mt-32 shadow-2xl relative"
          >
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <FileText className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  Terms of Service
                </h2>
                <p className="text-xs text-white/40 uppercase tracking-widest mt-0.5">
                  Last Updated: August 2026
                </p>
              </div>
            </div>

            <div className="space-y-6 text-white/80 leading-relaxed text-sm sm:text-base font-light">
              <p>
                Welcome to <strong className="text-white font-semibold">Luxora Estates</strong>. By accessing or using our platform, mobile interfaces, or related services, you agree to comply with and be bound by the following Terms of Service.
              </p>

              <div>
                <h3 className="font-serif text-lg font-semibold text-amber-400 mb-2">
                  1. Acceptance of Terms
                </h3>
                <p className="text-white/70">
                  By using this website, you confirm that you are at least 18 years of age and legally competent to enter into binding agreements. If you do not agree to these terms, please refrain from using our services.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-lg font-semibold text-amber-400 mb-2">
                  2. Platform Scope & Listing Disclaimer
                </h3>
                <p className="text-white/70">
                  Luxora Estates serves as a luxury property representation and discovery platform. While we strive to maintain accurate, verified listings and pricing information:
                </p>
                <ul className="list-disc list-inside space-y-1 text-white/70 pl-2 mt-1">
                  <li>Property details, dimensions, and prices are provided by builders/agencies and subject to verification during formal legal execution.</li>
                  <li>Luxora Estates is not a party to direct real estate sale contracts unless explicitly stated.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-serif text-lg font-semibold text-amber-400 mb-2">
                  3. User Obligations & Code of Conduct
                </h3>
                <p className="text-white/70">
                  Users agree to provide accurate information when registering or submitting property inquiry requests and agree not to engage in scraping, spamming, or fraudulent listing activities.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-lg font-semibold text-amber-400 mb-2">
                  4. Intellectual Property
                </h3>
                <p className="text-white/70">
                  All website content, design branding, logos, graphics, and property media present on Luxora Estates are protected by intellectual property laws and remain the exclusive property of Luxora Estates or its licensors.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-lg font-semibold text-amber-400 mb-2">
                  5. Limitation of Liability
                </h3>
                <p className="text-white/70">
                  In no event shall Luxora Estates be liable for indirect, incidental, or consequential damages resulting from platform usage, server downtime, or third-party real estate transactions.
                </p>
              </div>
            </div>
          </section>

          {/* Back to Top */}
          <div className="flex justify-center pt-4">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/50 hover:text-amber-400 transition-colors"
            >
              <ArrowUp className="w-4 h-4 text-amber-500" />
              Back to Top
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
