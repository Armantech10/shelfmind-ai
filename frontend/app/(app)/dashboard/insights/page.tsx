"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, Clock } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { AIInsight, generateInsights, getInsights } from "@/lib/api";

export default function InsightsPage() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const data = await getInsights();
      setInsights(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load insights");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      toast.loading("Gemini is analyzing your data...", { id: "gen" });
      const data = await generateInsights();
      setInsights(data);
      toast.success("Insights generated successfully!", { id: "gen" });
    } catch (err: any) {
      toast.error(err.message || "Failed to generate insights", { id: "gen" });
    } finally {
      setGenerating(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "risk": return <AlertTriangle className="h-5 w-5 text-red-400" />;
      case "opportunity": return <Lightbulb className="h-5 w-5 text-yellow-400" />;
      case "demand": return <TrendingUp className="h-5 w-5 text-blue-400" />;
      default: return <Sparkles className="h-5 w-5 text-violet-400" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "risk": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "opportunity": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "demand": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      default: return "bg-violet-500/10 text-violet-400 border-violet-500/20";
    }
  };

  return (
    <div className="p-8 pb-20 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-violet-400" /> AI Business Insights
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Powered by Gemini 1.5 Flash. Actionable intelligence from your sales and forecasts.
          </p>
        </div>
        <Button 
          onClick={handleGenerate} 
          disabled={generating}
          className="bg-violet-600 hover:bg-violet-500 text-white rounded-xl gap-2"
        >
          {generating ? (
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Generate Fresh Insights
        </Button>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-white/5 border border-white/10 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : insights.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/5">
            <Sparkles className="h-10 w-10 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Insights Yet</h3>
            <p className="text-zinc-400 mb-6">Click the button above to analyze your inventory data.</p>
          </div>
        ) : (
          <AnimatePresence>
            {insights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#111118] border border-white/10 rounded-2xl p-6 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl border bg-black/40 ${getBadgeColor(insight.insight_type)}`}>
                    {getIcon(insight.insight_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white">{insight.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full border capitalize ${getBadgeColor(insight.insight_type)}`}>
                        {insight.insight_type}
                      </span>
                    </div>
                    <p className="text-zinc-300 leading-relaxed">
                      {insight.content}
                    </p>
                    <div className="mt-4 flex items-center gap-1.5 text-xs text-zinc-500">
                      <Clock className="h-3 w-3" />
                      Generated {formatDistanceToNow(new Date(insight.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
