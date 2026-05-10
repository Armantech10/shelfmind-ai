"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, AlertOctagon, AlertTriangle, Info, CheckCircle2, Package, Calendar } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";

import { Button } from "@/components/ui/button";
import { ReorderRecommendation, generateRecommendations, getRecommendations, approveRecommendation } from "@/lib/api";

export default function AlertsPage() {
  const [recommendations, setRecommendations] = useState<ReorderRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const data = await getRecommendations();
      setRecommendations(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      toast.loading("Calculating reorder quantities...", { id: "rec" });
      const data = await generateRecommendations();
      setRecommendations(data);
      toast.success("Recommendations generated successfully!", { id: "rec" });
    } catch (err: any) {
      toast.error(err.message || "Failed to generate recommendations", { id: "rec" });
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await approveRecommendation(id);
      toast.success("Marked as ordered!");
      setRecommendations(recommendations.filter(r => r.id !== id));
    } catch (err: any) {
      toast.error(err.message || "Failed to approve");
    }
  };

  const getUrgencyStyles = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case "critical": return { icon: <AlertOctagon className="h-5 w-5" />, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" };
      case "high": return { icon: <AlertTriangle className="h-5 w-5" />, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" };
      case "medium": return { icon: <Info className="h-5 w-5" />, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" };
      default: return { icon: <CheckCircle2 className="h-5 w-5" />, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
    }
  };

  const filtered = filter === "all" ? recommendations : recommendations.filter(r => r.urgency === filter);

  return (
    <div className="p-8 pb-20 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShoppingCart className="h-6 w-6 text-violet-400" /> Reorder Recommendations
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Smart restock alerts based on predictive demand and stockout risk.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl text-sm text-white px-3 py-2 outline-none focus:border-violet-500"
          >
            <option value="all" className="bg-[#111118]">All Urgencies</option>
            <option value="critical" className="bg-[#111118]">Critical</option>
            <option value="high" className="bg-[#111118]">High</option>
            <option value="medium" className="bg-[#111118]">Medium</option>
            <option value="low" className="bg-[#111118]">Low</option>
          </select>
          <Button 
            onClick={handleGenerate} 
            disabled={generating}
            className="bg-violet-600 hover:bg-violet-500 text-white rounded-xl gap-2"
          >
            {generating ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
            Run Recommendation Engine
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-white/5 border border-white/10 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/5">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">You're all caught up!</h3>
            <p className="text-zinc-400 mb-6">No recommendations found for this filter.</p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((rec, index) => {
              const styles = getUrgencyStyles(rec.urgency);
              return (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-[#111118] border-l-4 rounded-2xl p-6 hover:bg-white/5 transition-colors border-y border-r border-y-white/10 border-r-white/10`}
                  style={{ borderLeftColor: styles.color.replace('text-', '') }}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-xl border ${styles.bg} ${styles.border} ${styles.color}`}>
                        {styles.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-semibold text-white">{rec.product.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wider ${styles.bg} ${styles.color}`}>
                            {rec.urgency}
                          </span>
                        </div>
                        <p className="text-zinc-300 text-sm">
                          {rec.reasoning}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-zinc-400">
                          <div className="flex items-center gap-1.5">
                            <Package className="h-3.5 w-3.5" />
                            Current Stock: <span className="text-white font-medium">{rec.product.current_stock}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <ShoppingCart className="h-3.5 w-3.5" />
                            Suggested: <span className="text-violet-400 font-bold">+{rec.recommended_quantity}</span>
                          </div>
                          {rec.estimated_stockout_date && (
                            <div className="flex items-center gap-1.5 text-rose-400">
                              <Calendar className="h-3.5 w-3.5" />
                              Stockout by: {format(new Date(rec.estimated_stockout_date), "MMM d")}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex md:flex-col gap-3 justify-end min-w-[140px]">
                      <Button 
                        onClick={() => handleApprove(rec.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl"
                      >
                        Mark as Ordered
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
