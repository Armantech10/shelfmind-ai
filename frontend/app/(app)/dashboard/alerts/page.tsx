"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, AlertOctagon, AlertTriangle, Info, ScanSearch, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Alert, getAlerts, scanAlerts, markAlertAsRead } from "@/lib/api";

export default function AlertsDashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await getAlerts();
      setAlerts(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    try {
      setScanning(true);
      toast.loading("Scanning inventory for issues...", { id: "scan" });
      await scanAlerts();
      await loadAlerts();
      toast.success("Scan complete!", { id: "scan" });
    } catch (err: any) {
      toast.error(err.message || "Failed to scan", { id: "scan" });
    } finally {
      setScanning(false);
    }
  };

  const handleRead = async (id: number) => {
    try {
      await markAlertAsRead(id);
      toast.success("Alert acknowledged");
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (err: any) {
      toast.error(err.message || "Failed to mark as read");
    }
  };

  const getIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical": return <AlertOctagon className="h-5 w-5 text-rose-500" />;
      case "high": return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case "medium": return <Info className="h-5 w-5 text-yellow-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const filteredAlerts = filter === "all" ? alerts : alerts.filter(a => a.alert_type === filter);

  return (
    <div className="p-8 pb-20 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Bell className="h-6 w-6 text-violet-400" /> Alerts Center
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            System-generated alerts for low stock, expiries, and demand anomalies.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl text-sm text-white px-3 py-2 outline-none focus:border-violet-500"
          >
            <option value="all" className="bg-[#111118]">All Types</option>
            <option value="low_stock" className="bg-[#111118]">Low Stock</option>
            <option value="expiry_warning" className="bg-[#111118]">Expiring Soon</option>
            <option value="stockout_risk" className="bg-[#111118]">Stockout Risk</option>
            <option value="overstock" className="bg-[#111118]">Overstock</option>
            <option value="demand_spike" className="bg-[#111118]">Demand Spike</option>
          </select>
          <Button 
            onClick={handleScan} 
            disabled={scanning}
            className="bg-violet-600 hover:bg-violet-500 text-white rounded-xl gap-2"
          >
            {scanning ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ScanSearch className="h-4 w-4" />
            )}
            Run Auto-Scan
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-white/5 border border-white/10 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/5">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No active alerts</h3>
            <p className="text-zinc-400 mb-6">Your inventory is looking healthy. Run a scan to double-check.</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[#111118] border border-white/10 rounded-2xl p-5 hover:bg-white/5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 bg-white/5 p-2 rounded-xl border border-white/10">
                    {getIcon(alert.severity)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-white">{alert.title}</h3>
                      <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/10">
                        {alert.alert_type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-300">{alert.message}</p>
                    <p className="text-xs text-zinc-500 mt-2">
                      Generated {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => handleRead(alert.id)}
                  className="bg-transparent border-white/[0.1] text-zinc-300 hover:bg-white/[0.05] hover:text-white self-start sm:self-center shrink-0"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark as Read
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
