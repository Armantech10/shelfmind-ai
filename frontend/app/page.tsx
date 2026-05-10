"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Brain, 
  TrendingUp, 
  Lightbulb, 
  ShoppingCart, 
  BotMessageSquare, 
  Bell, 
  BarChart3,
  CheckCircle2,
  PackageSearch,
  ArrowRight,
  Plus,
  Minus
} from "lucide-react";

// --- Data Arrays ---

const features = [
  {
    icon: TrendingUp,
    title: "Demand Forecasting",
    desc: "Predict future sales using advanced ARIMA machine learning models trained on your historical data."
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    desc: "Get instantly notified about low stock, expiring products, massive overstock, and sudden demand spikes."
  },
  {
    icon: Lightbulb,
    title: "AI Insights",
    desc: "Gemini 1.5 Flash analyzes your entire inventory to generate actionable business intelligence."
  },
  {
    icon: ShoppingCart,
    title: "Reorder Engine",
    desc: "Calculates precise reorder quantities based on safety stock, lead times, and calculated stockout risk."
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    desc: "Track critical KPIs, revenue trends, top moving products, and dead stock in real-time."
  },
  {
    icon: BotMessageSquare,
    title: "AI Assistant",
    desc: "Chat directly with your inventory. Ask questions like 'What should I restock before the weekend?'"
  }
];

const testimonials = [
  {
    quote: "ShelfMind completely changed how we order inventory. We've reduced our stockouts by over 40% in just two months.",
    name: "Sarah Jenkins",
    role: "Operations Manager",
    initials: "SJ",
    color: "from-blue-500 to-cyan-500"
  },
  {
    quote: "The AI insights feel like having a full-time data analyst on the team. It spotted a trend in our beverage category we totally missed.",
    name: "Michael Chen",
    role: "Retail Store Owner",
    initials: "MC",
    color: "from-violet-500 to-purple-600"
  },
  {
    quote: "Setup was a breeze. I uploaded my CSV and within minutes I had machine learning forecasts for all 3,000 of my SKUs.",
    name: "Elena Rodriguez",
    role: "Inventory Director",
    initials: "ER",
    color: "from-emerald-500 to-teal-500"
  }
];

const faqs = [
  {
    q: "How does the machine learning forecast work?",
    a: "ShelfMind uses the ARIMA model to analyze your historical daily sales data and identify trends and seasonality, projecting demand 7 and 30 days into the future."
  },
  {
    q: "Do I need technical skills to use this?",
    a: "Not at all. You just need to upload your inventory and sales data via CSV, and our platform handles all the complex data science automatically."
  },
  {
    q: "What data format is required for upload?",
    a: "We accept standard CSV files. You'll need two files: one for Products (SKU, Name, Current Stock) and one for Sales History (Date, SKU, Quantity Sold)."
  },
  {
    q: "Is my data secure?",
    a: "Yes. Your data is isolated in secure databases and is only processed to generate insights for your account. We do not train public models on your proprietary data."
  },
  {
    q: "Can the AI Assistant access my live data?",
    a: "Yes! The AI Chat Assistant uses RAG to pull your live stock levels and forecasts directly into its context window before answering your questions."
  }
];

// --- Components ---

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.6, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

const AccordionItem = ({ q, a }: { q: string, a: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-2xl bg-[#111118] overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left text-white font-medium hover:bg-white/[0.02] transition-colors"
      >
        <span>{q}</span>
        {isOpen ? <Minus className="h-5 w-5 text-violet-400 shrink-0" /> : <Plus className="h-5 w-5 text-zinc-500 shrink-0" />}
      </button>
      {isOpen && (
        <div className="px-6 pb-6 text-zinc-400 text-left leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
};

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-violet-500/30 selection:text-violet-200 overflow-x-hidden font-sans">
      
      {/* Navbar */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-black/40 backdrop-blur-md border-b border-white/10 py-4" : "bg-transparent py-6"
      }`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 shadow-[0_0_15px_rgba(124,58,237,0.3)]">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">ShelfMind AI</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">How It Works</a>
            <a href="#pricing" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors hidden sm:block">
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="px-5 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-purple-500/25"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-20 px-6 overflow-hidden text-center">
        {/* Subtle radial purple/violet glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm text-zinc-300 font-medium mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-violet-400 animate-pulse"></span>
            Powered by Gemini 1.5 Flash
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]"
          >
            AI-Powered Inventory<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
              Intelligence
            </span> for Smart Retailers
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-400 max-w-lg mx-auto mb-10 leading-relaxed"
          >
            Stop guessing what to order. ShelfMind uses machine learning to forecast demand, prevent stockouts, and provide conversational insights.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-20"
          >
            <Link 
              href="/signup" 
              className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-semibold bg-violet-600 text-white hover:bg-violet-500 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_30px_rgba(124,58,237,0.6)]"
            >
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link 
              href="#how-it-works" 
              className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-semibold bg-transparent border border-white/20 text-white hover:bg-white/5 transition-all flex items-center justify-center"
            >
              See How It Works
            </Link>
          </motion.div>

          {/* Stats Bar (Centered inside Hero) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full max-w-3xl border-t border-white/10 pt-10"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
              <div className="flex flex-col items-center justify-center pt-4 sm:pt-0">
                <h3 className="text-4xl md:text-5xl font-bold text-white mb-2">2,400+</h3>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Retailers</p>
              </div>
              <div className="flex flex-col items-center justify-center pt-8 sm:pt-0">
                <h3 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500 mb-2">94%</h3>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Forecast Accuracy</p>
              </div>
              <div className="flex flex-col items-center justify-center pt-8 sm:pt-0">
                <h3 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-500 mb-2">38%</h3>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Less Stockouts</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative text-center border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <FadeIn className="max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">
              Everything you need to manage inventory
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              ShelfMind replaces spreadsheets with intelligent automation, predictive analytics, and natural language AI.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {features.map((feature, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="bg-[#111118] border border-white/10 hover:border-white/20 transition-all rounded-2xl p-8 h-full group flex flex-col items-center text-center">
                  <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-violet-500/10 group-hover:border-violet-500/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-violet-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-zinc-400 leading-relaxed text-sm md:text-base">
                    {feature.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-32 bg-[#0a0a0f] relative border-t border-white/5 text-center">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <FadeIn className="mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-white">How it works</h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">Get up and running in minutes, not months.</p>
          </FadeIn>

          <div className="relative max-w-5xl mx-auto">
            {/* Desktop Dashed Line connecting steps */}
            <div className="hidden md:block absolute top-12 left-24 right-24 border-t-2 border-dashed border-white/10" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10">
              {[
                { title: "Upload Your Data", desc: "Export your current inventory and sales history to CSV and securely upload it.", icon: PackageSearch },
                { title: "AI Generation", desc: "Our backend automatically runs ARIMA models to generate 30-day demand forecasts.", icon: Brain },
                { title: "Act on Insights", desc: "Review daily alerts, chat with the AI assistant, and approve reorders.", icon: CheckCircle2 }
              ].map((step, i) => (
                <FadeIn key={i} delay={i * 0.2} className="flex flex-col items-center">
                  <div className="h-24 w-24 rounded-full bg-[#111118] border-2 border-white/10 flex items-center justify-center mb-8 relative shadow-xl shadow-black/50">
                    <step.icon className="h-10 w-10 text-violet-400" />
                    <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold flex items-center justify-center shadow-lg">
                      {i + 1}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-zinc-400 leading-relaxed text-sm md:text-base">{step.desc}</p>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 relative border-t border-white/5 text-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <FadeIn className="mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Trusted by operators everywhere</h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-8 flex flex-col h-full items-center">
                  <div className="flex gap-1 mb-6">
                    {[1,2,3,4,5].map(star => <svg key={star} className="w-5 h-5 text-purple-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
                  </div>
                  <p className="text-lg text-zinc-300 italic mb-8 flex-1">"{t.quote}"</p>
                  
                  <div className="flex flex-col items-center gap-3">
                    <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold shadow-lg`}>
                      {t.initials}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{t.name}</h4>
                      <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{t.role}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 bg-[#0a0a0f] border-t border-white/5 text-center">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <FadeIn className="mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-white">Simple, transparent pricing</h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">Start free, upgrade when you need more power.</p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <FadeIn delay={0}>
              <div className="bg-[#111118] border border-white/10 rounded-3xl p-10 flex flex-col h-full items-center">
                <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
                <p className="text-zinc-500 text-sm mb-8">Perfect for small shops.</p>
                <div className="mb-10">
                  <span className="text-5xl font-extrabold text-white">Free</span>
                </div>
                <ul className="space-y-4 mb-10 w-full text-center">
                  {['Up to 100 SKUs', 'Basic Dashboard', 'Manual CSV Uploads', 'Community Support'].map((f, i) => (
                    <li key={i} className="flex flex-col items-center gap-1 text-zinc-300 text-sm font-medium">
                       {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto w-full">
                  <Link href="/signup" className="block w-full py-4 rounded-xl text-center text-sm font-bold bg-white/5 text-white hover:bg-white/10 transition-colors border border-white/10">
                    Get Started
                  </Link>
                </div>
              </div>
            </FadeIn>

            {/* Growth */}
            <FadeIn delay={0.1}>
              <div className="bg-[#111118] border border-purple-500 rounded-3xl p-10 relative shadow-[0_0_40px_rgba(168,85,247,0.15)] flex flex-col h-full items-center transform md:-translate-y-4">
                <div className="absolute top-0 inset-x-0 transform -translate-y-1/2 flex justify-center">
                  <span className="bg-gradient-to-r from-purple-500 to-violet-600 text-white text-xs font-bold uppercase tracking-widest py-1.5 px-4 rounded-full shadow-lg">Most Popular</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Growth</h3>
                <p className="text-purple-400 text-sm mb-8">For growing retailers.</p>
                <div className="mb-10">
                  <span className="text-5xl font-extrabold text-white">₹999</span>
                  <span className="text-zinc-500 font-medium">/mo</span>
                </div>
                <ul className="space-y-4 mb-10 w-full text-center">
                  {['Unlimited SKUs', 'ARIMA Forecasting', 'Gemini AI Insights', 'AI Chat Assistant', 'Email Support'].map((f, i) => (
                    <li key={i} className="flex flex-col items-center gap-1 text-zinc-200 text-sm font-bold">
                       {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto w-full">
                  <Link href="/signup" className="block w-full py-4 rounded-xl text-center text-sm font-bold bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25">
                    Start Free Trial
                  </Link>
                </div>
              </div>
            </FadeIn>

            {/* Enterprise */}
            <FadeIn delay={0.2}>
              <div className="bg-[#111118] border border-white/10 rounded-3xl p-10 flex flex-col h-full items-center">
                <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
                <p className="text-zinc-500 text-sm mb-8">For large scale operations.</p>
                <div className="mb-10">
                  <span className="text-5xl font-extrabold text-white">Custom</span>
                </div>
                <ul className="space-y-4 mb-10 w-full text-center">
                  {['API Access', 'Custom Integrations', 'Dedicated Account Mgr', 'SLA Guarantee', 'SSO Login'].map((f, i) => (
                    <li key={i} className="flex flex-col items-center gap-1 text-zinc-300 text-sm font-medium">
                       {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto w-full">
                  <button className="block w-full py-4 rounded-xl text-center text-sm font-bold bg-white/5 text-white hover:bg-white/10 transition-colors border border-white/10">
                    Contact Sales
                  </button>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-32 border-t border-white/5 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <FadeIn className="mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">Frequently Asked Questions</h2>
          </FadeIn>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <AccordionItem q={faq.q} a={faq.a} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0a0f] border-t border-white/5 py-12 text-center">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-6">
            <Brain className="h-6 w-6 text-violet-500" />
            <span className="text-lg font-bold text-white tracking-tight">ShelfMind AI</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-zinc-500 mb-8">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
          <div className="text-sm text-zinc-600 font-medium">
            &copy; {new Date().getFullYear()} ShelfMind AI Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
