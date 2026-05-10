"use client";

import React, { useState } from "react";
import { Settings, Store, Bell, User, Palette, Check, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("store");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Mock states for UI
  const [storeName, setStoreName] = useState("My Retail Store");
  const [address, setAddress] = useState("123 Commerce St");
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("America/New_York");

  const [alertsLowStock, setAlertsLowStock] = useState(true);
  const [alertsExpiry, setAlertsExpiry] = useState(true);
  const [alertsSpike, setAlertsSpike] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);

  const [darkMode, setDarkMode] = useState(true);

  const tabs = [
    { id: "store", label: "Store Details", icon: Store },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "account", label: "Account", icon: User },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];

  return (
    <div className="p-8 pb-20 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Settings className="h-6 w-6 text-violet-400" /> Settings
        </h1>
        <p className="mt-1 text-sm text-zinc-400">Configure your store, alerts, and application preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 flex flex-col gap-1 shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  active 
                    ? "bg-violet-600/20 text-violet-300" 
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-violet-400" : "text-zinc-500"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-[#111118] border border-white/10 rounded-2xl p-6 min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === "store" && (
              <motion.div
                key="store"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-lg font-semibold text-white">Store Details</h2>
                  <p className="text-sm text-zinc-400 mt-1">Manage your business profile and localization.</p>
                </div>
                <div className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Store Name</label>
                    <input 
                      type="text" 
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Address</label>
                    <input 
                      type="text" 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1.5">Currency</label>
                      <select 
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-violet-500 appearance-none"
                      >
                        <option value="USD" className="bg-[#111118]">USD ($)</option>
                        <option value="EUR" className="bg-[#111118]">EUR (€)</option>
                        <option value="GBP" className="bg-[#111118]">GBP (£)</option>
                        <option value="INR" className="bg-[#111118]">INR (₹)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1.5">Timezone</label>
                      <select 
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-violet-500 appearance-none"
                      >
                        <option value="America/New_York" className="bg-[#111118]">Eastern Time</option>
                        <option value="America/Chicago" className="bg-[#111118]">Central Time</option>
                        <option value="America/Denver" className="bg-[#111118]">Mountain Time</option>
                        <option value="America/Los_Angeles" className="bg-[#111118]">Pacific Time</option>
                        <option value="Asia/Kolkata" className="bg-[#111118]">India Standard Time</option>
                      </select>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button className="bg-violet-600 hover:bg-violet-500 text-white rounded-xl">Save Changes</Button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "notifications" && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-lg font-semibold text-white">Alert Preferences</h2>
                  <p className="text-sm text-zinc-400 mt-1">Control which events trigger a system notification.</p>
                </div>
                
                <div className="space-y-4 max-w-lg">
                  {[
                    { label: "Low Stock Alerts", desc: "Notify when inventory falls below minimum threshold", state: alertsLowStock, set: setAlertsLowStock },
                    { label: "Expiry Warnings", desc: "Notify 7 days before product expiration", state: alertsExpiry, set: setAlertsExpiry },
                    { label: "Demand Spikes", desc: "Notify when upcoming demand exceeds normal averages", state: alertsSpike, set: setAlertsSpike },
                    { label: "Daily Email Digest", desc: "Send a summary of inventory alerts to your email", state: emailDigest, set: setEmailDigest },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-[#0a0a0f] border border-white/[0.06] rounded-xl">
                      <div>
                        <h4 className="text-sm font-medium text-white">{item.label}</h4>
                        <p className="text-xs text-zinc-400 mt-0.5">{item.desc}</p>
                      </div>
                      <button 
                        onClick={() => item.set(!item.state)}
                        className={`w-11 h-6 rounded-full transition-colors relative ${item.state ? 'bg-violet-600' : 'bg-white/[0.1]'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${item.state ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>
                  ))}
                  <div className="pt-4">
                    <Button className="bg-violet-600 hover:bg-violet-700 text-white">Update Preferences</Button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "account" && (
              <motion.div
                key="account"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-lg font-semibold text-white">Security & Password</h2>
                  <p className="text-sm text-zinc-400 mt-1">Manage your account security credentials.</p>
                </div>
                
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Current Password</label>
                    <input 
                      type="password" 
                      className="w-full bg-[#0a0a0f] border border-white/[0.1] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">New Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        className="w-full bg-[#0a0a0f] border border-white/[0.1] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500 pr-10"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Confirm New Password</label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        className="w-full bg-[#0a0a0f] border border-white/[0.1] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500 pr-10"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="pt-4 flex items-center gap-4">
                    <Button className="bg-violet-600 hover:bg-violet-700 text-white">Change Password</Button>
                    <span className="text-xs text-zinc-500">You will be logged out after changing.</span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "appearance" && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-lg font-semibold text-white">Theme & Display</h2>
                  <p className="text-sm text-zinc-400 mt-1">Customize how ShelfMind AI looks to you.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  <div 
                    onClick={() => setDarkMode(false)}
                    className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-3 transition-all ${
                      !darkMode ? 'border-violet-500 bg-violet-500/10' : 'border-white/[0.1] bg-[#0a0a0f] hover:border-white/[0.2]'
                    }`}
                  >
                    <div className="w-16 h-12 bg-zinc-100 rounded shadow-sm border border-zinc-200 flex flex-col p-1 gap-1">
                      <div className="w-full h-2 bg-white rounded-sm" />
                      <div className="w-full flex-1 flex gap-1">
                        <div className="w-3 h-full bg-white rounded-sm" />
                        <div className="flex-1 h-full bg-white rounded-sm" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${!darkMode ? 'border-violet-500' : 'border-zinc-600'}`}>
                        {!darkMode && <div className="w-2 h-2 bg-violet-500 rounded-full" />}
                      </div>
                      <span className="text-sm font-medium text-white">Light</span>
                    </div>
                  </div>

                  <div 
                    onClick={() => setDarkMode(true)}
                    className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-3 transition-all ${
                      darkMode ? 'border-violet-500 bg-violet-500/10' : 'border-white/[0.1] bg-[#0a0a0f] hover:border-white/[0.2]'
                    }`}
                  >
                    <div className="w-16 h-12 bg-[#111118] rounded shadow-sm border border-white/[0.1] flex flex-col p-1 gap-1">
                      <div className="w-full h-2 bg-white/[0.05] rounded-sm" />
                      <div className="w-full flex-1 flex gap-1">
                        <div className="w-3 h-full bg-white/[0.05] rounded-sm" />
                        <div className="flex-1 h-full bg-white/[0.05] rounded-sm" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${darkMode ? 'border-violet-500' : 'border-zinc-600'}`}>
                        {darkMode && <div className="w-2 h-2 bg-violet-500 rounded-full" />}
                      </div>
                      <span className="text-sm font-medium text-white">Dark</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 italic">Note: Light mode is currently disabled in the MVP. Dark mode is enforced for optimal viewing.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
