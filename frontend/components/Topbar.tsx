"use client";

import React, { useEffect, useState, useRef } from "react";
import { Bell, Check, Info, AlertTriangle, AlertOctagon, X, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

import { Alert, getAlerts, markAlertAsRead } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function Topbar() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Format pathname to a readable title
  const getPageTitle = () => {
    if (!pathname || pathname === "/dashboard") return "Dashboard";
    const segment = pathname.split("/").pop() || "Dashboard";
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  useEffect(() => {
    loadAlerts();
    // In a real app, we might poll this or use WebSockets
    const interval = setInterval(loadAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadAlerts = async () => {
    try {
      const data = await getAlerts();
      setAlerts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAlerts();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleRead = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await markAlertAsRead(id);
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical": return <AlertOctagon className="h-4 w-4 text-rose-500" />;
      case "high": return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "medium": return <Info className="h-4 w-4 text-yellow-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full h-16 border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl flex items-center justify-between px-6 lg:px-10 flex-shrink-0">
      <div className="font-semibold text-white text-[15px]">
        {getPageTitle()}
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={handleRefresh}
          className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/[0.05]"
        >
          <RotateCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>

        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/[0.05]"
          >
            <Bell className="h-4 w-4" />
            {alerts.length > 0 && (
              <>
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-ping opacity-75" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
              </>
            )}
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#111118] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#111118]">
                  <h3 className="font-semibold text-white">Notifications</h3>
                  <span className="text-xs bg-violet-600 text-white px-2 py-0.5 rounded-full font-medium">
                    {alerts.length} new
                  </span>
                </div>

                <div className="max-h-[60vh] overflow-y-auto">
                  {alerts.length === 0 ? (
                    <div className="p-6 text-center text-zinc-500">
                      <Check className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">You're all caught up!</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/10">
                      {alerts.slice(0, 5).map((alert) => (
                        <div 
                          key={alert.id} 
                          className="p-4 hover:bg-white/5 transition-colors flex items-start gap-3 cursor-pointer group"
                          onClick={() => {
                            setIsOpen(false);
                            router.push('/alerts');
                          }}
                        >
                          <div className="mt-1">
                            {getIcon(alert.severity)}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-white line-clamp-1">{alert.title}</h4>
                            <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{alert.message}</p>
                            <p className="text-[10px] text-zinc-500 mt-2">
                              {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                            </p>
                          </div>
                          <button 
                            onClick={(e) => handleRead(e, alert.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/10 rounded-md transition-all text-zinc-400 hover:text-white"
                            title="Mark as read"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-white/10 p-2 bg-[#111118]">
                  <Link 
                    href="/alerts"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center py-2 text-xs font-bold text-violet-400 hover:text-violet-300 hover:bg-white/5 rounded-xl transition-colors"
                  >
                    View All Alerts
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-px h-5 bg-white/10 mx-2"></div>
        
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-violet-600/30 text-violet-300 text-xs font-semibold cursor-pointer hover:bg-violet-600/40 transition-colors">
          {user?.full_name?.charAt(0).toUpperCase() ?? "U"}
        </div>
      </div>
    </header>
  );
}
