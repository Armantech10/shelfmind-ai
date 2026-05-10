"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Package, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  Target 
} from "lucide-react";
import { toast } from "sonner";

import {
  getAnalyticsSummary,
  getRevenueTrend,
  getTopProducts,
  getSlowMovers,
  getAllForecasts,
  AnalyticsSummary,
  RevenueTrend,
  TopProduct,
  ForecastResponse
} from "@/lib/api";

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrend[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [slowMovers, setSlowMovers] = useState<TopProduct[]>([]);
  const [forecasts, setForecasts] = useState<ForecastResponse[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [sum, rev, top, slow, fcs] = await Promise.all([
          getAnalyticsSummary(),
          getRevenueTrend(),
          getTopProducts(),
          getSlowMovers(),
          getAllForecasts()
        ]);
        setSummary(sum);
        setRevenueTrend(rev);
        setTopProducts(top);
        setSlowMovers(slow);
        setForecasts(fcs);
      } catch (err: any) {
        toast.error("Failed to load analytics dashboard data.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="p-8 pb-20 space-y-6">
        <div className="h-8 w-48 bg-white/[0.05] rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-white/[0.02] rounded-xl border border-white/[0.05] animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[400px] bg-white/[0.02] rounded-xl border border-white/[0.05] animate-pulse"></div>
          <div className="h-[400px] bg-white/[0.02] rounded-xl border border-white/[0.05] animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Build demand overlay data for the first forecasted product (as a sample)
  let demandOverlayData: any[] = [];
  let sampleProductName = "No product";
  if (forecasts.length > 0) {
    const p = forecasts[0];
    sampleProductName = p.product.name;
    const dataMap = new Map();
    p.historical_sales.slice(-14).forEach((s) => {
      dataMap.set(s.date, { date: s.date, actual: s.quantity });
    });
    p.daily_forecasts.slice(0, 7).forEach((f) => {
      const d = f.forecast_date.split("T")[0];
      const existing = dataMap.get(d) || { date: d };
      dataMap.set(d, { ...existing, predicted: f.predicted_quantity });
    });
    demandOverlayData = Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  return (
    <motion.div 
      className="p-8 pb-20 space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Activity className="h-6 w-6 text-violet-400" /> Analytics Overview
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Your inventory and sales metrics at a glance.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="bg-[#111118] border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:bg-white/5 transition-colors">
          <div className="flex items-center justify-between text-zinc-400 mb-4">
            <span className="text-xs uppercase tracking-wider font-medium">Total Products</span>
            <Package className="h-5 w-5 text-violet-500" />
          </div>
          <div className="text-4xl font-bold text-white">{summary?.total_products || 0}</div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-[#111118] border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:bg-white/5 transition-colors">
          <div className="flex items-center justify-between text-zinc-400 mb-4">
            <span className="text-xs uppercase tracking-wider font-medium">Monthly Revenue</span>
            <DollarSign className="h-5 w-5 text-teal-500" />
          </div>
          <div className="flex items-end gap-2">
            <div className="text-4xl font-bold text-white">
              ${(summary?.total_revenue_30d || 0).toLocaleString()}
            </div>
            <span className="text-xs font-semibold text-emerald-500 mb-1 flex items-center bg-emerald-500/10 px-2 py-0.5 rounded-full">
              +12%
            </span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-[#111118] border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:bg-white/5 transition-colors">
          <div className="flex items-center justify-between text-zinc-400 mb-4">
            <span className="text-xs uppercase tracking-wider font-medium">Weekly Sales</span>
            <TrendingUp className="h-5 w-5 text-purple-500" />
          </div>
          <div className="text-4xl font-bold text-white">
            ${(summary?.weekly_sales || 0).toLocaleString()}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-[#111118] border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:bg-white/5 transition-colors">
          <div className="flex items-center justify-between text-zinc-400 mb-4">
            <span className="text-xs uppercase tracking-wider font-medium">Forecast (7d)</span>
            <Activity className="h-5 w-5 text-violet-400" />
          </div>
          <div className="flex items-end gap-2">
            <div className="text-4xl font-bold text-white">
              {Math.round(summary?.predicted_demand_next_7d || 0)}
            </div>
            <span className="text-sm font-medium text-zinc-500 mb-1">units</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-[#111118] border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:bg-white/5 transition-colors">
          <div className="flex items-center justify-between text-zinc-400 mb-4">
            <span className="text-xs uppercase tracking-wider font-medium">Low Stock</span>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div className="flex items-end gap-2">
            <div className="text-4xl font-bold text-red-400">{summary?.low_stock_count || 0}</div>
            {summary?.low_stock_count ? (
              <span className="text-xs font-semibold text-red-400 mb-1 flex items-center bg-red-500/10 px-2 py-0.5 rounded-full">
                Action needed
              </span>
            ) : null}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-[#111118] border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:bg-white/5 transition-colors">
          <div className="flex items-center justify-between text-zinc-400 mb-4">
            <span className="text-xs uppercase tracking-wider font-medium">Accuracy</span>
            <Target className="h-5 w-5 text-teal-400" />
          </div>
          <div className="text-4xl font-bold text-white">
            {Math.round((summary?.forecast_accuracy_score || 0) * 100)}%
          </div>
        </motion.div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="bg-[#111118] border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Revenue Trend (30 Days)</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="date" stroke="#52525b" fontSize={12} tickFormatter={(val) => new Date(val).getDate().toString()} />
                <YAxis stroke="#52525b" fontSize={12} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#111118', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-[#111118] border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Top Products (by Volume)</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#52525b" fontSize={12} tick={{ fill: '#a1a1aa' }} />
                <YAxis stroke="#52525b" fontSize={12} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#111118', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="quantity_sold" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="bg-[#111118] border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Demand Overlay: {sampleProductName}</h2>
          {demandOverlayData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={demandOverlayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="date" stroke="#52525b" fontSize={12} tickFormatter={(val) => new Date(val).getDate().toString()} />
                  <YAxis stroke="#52525b" fontSize={12} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#111118', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px' }}
                  />
                  <Line type="monotone" dataKey="actual" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} name="Actual Sales" />
                  <Line type="monotone" dataKey="predicted" stroke="#14b8a6" strokeWidth={2} strokeDasharray="5 5" name="Predicted Demand" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-zinc-500 border border-dashed border-white/10 rounded-2xl">
              No forecast data available
            </div>
          )}
        </motion.div>

        {/* Low Stock Panel */}
        <motion.div variants={itemVariants} className="bg-[#111118] border border-white/10 rounded-2xl flex flex-col h-full">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" /> Action Required: Slow Movers
            </h2>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-2 max-h-[300px]">
            {slowMovers.length === 0 ? (
              <div className="text-zinc-500 text-center py-8">No slow moving products.</div>
            ) : (
              slowMovers.map((sm, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-colors rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center">
                      <Package className="h-4 w-4 text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{sm.name}</p>
                      <p className="text-xs text-zinc-500">Only {sm.quantity_sold} sold in 30 days</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-400">${sm.revenue.toLocaleString()}</p>
                    <p className="text-xs text-zinc-500">Revenue</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

    </motion.div>
  );
}
