"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart
} from "recharts";
import {
  UploadCloud,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  AlertTriangle,
  CheckCircle2,
  CalendarDays,
  PackageSearch
} from "lucide-react";

import {
  getAllForecasts,
  getProductForecast,
  uploadSalesCSV,
  ForecastResponse,
} from "@/lib/api";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ForecastsPage() {
  const [forecasts, setForecasts] = useState<ForecastResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Selected Product for Chart
  const [selectedProduct, setSelectedProduct] = useState<ForecastResponse | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [viewWindow, setViewWindow] = useState<"7D" | "30D">("30D");
  const [isChartOpen, setIsChartOpen] = useState(false);

  const fetchForecasts = async () => {
    try {
      setLoading(true);
      const data = await getAllForecasts();
      setForecasts(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load forecasts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecasts();
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await uploadSalesCSV(file);
      toast.success(res.message);
      
      // Wait a few seconds for background ML task to process some data, then refresh
      setTimeout(() => {
        fetchForecasts();
      }, 5000);

    } catch (err: any) {
      toast.error(err.message || "Failed to upload CSV");
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    multiple: false,
  });

  const handleRowClick = async (f: ForecastResponse) => {
    try {
      toast.loading("Loading forecast chart...", { id: "chart-load" });
      const fullData = await getProductForecast(f.product.id);
      setSelectedProduct(fullData);
      
      // Build chart data
      const dataMap = new Map();
      fullData.historical_sales.forEach((s) => {
        dataMap.set(s.date, { date: s.date, actual: s.quantity });
      });
      fullData.daily_forecasts.forEach((f) => {
        const d = f.forecast_date.split("T")[0];
        const existing = dataMap.get(d) || { date: d };
        dataMap.set(d, {
          ...existing,
          predicted: f.predicted_quantity,
          conf_lower: f.confidence_lower,
          conf_upper: f.confidence_upper,
        });
      });

      const merged = Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));
      setChartData(merged);
      setIsChartOpen(true);
      toast.dismiss("chart-load");
    } catch (err: any) {
      toast.error("Failed to load chart data", { id: "chart-load" });
    }
  };

  const renderTrend = (trend?: string) => {
    if (trend === "increasing") return <TrendingUp className="h-4 w-4 text-emerald-400" />;
    if (trend === "decreasing") return <TrendingDown className="h-4 w-4 text-red-400" />;
    return <Minus className="h-4 w-4 text-zinc-500" />;
  };

  const renderRiskBadge = (prob: number) => {
    if (prob > 0.7) {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-red-500/10 px-2 py-1 text-xs font-medium text-red-500">
          <AlertTriangle className="h-3 w-3" /> High Risk
        </span>
      );
    }
    if (prob > 0.3) {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-500">
          <AlertTriangle className="h-3 w-3" /> Medium
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500">
        <CheckCircle2 className="h-3 w-3" /> Safe
      </span>
    );
  };

  return (
    <div className="p-8 pb-20 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Activity className="h-6 w-6 text-violet-400" /> Demand Forecasting
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Upload sales data to train models and generate ARIMA-based demand predictions.
        </p>
      </div>

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`min-h-[140px] border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-colors text-center cursor-pointer ${
          isDragActive
            ? "border-violet-500 bg-violet-500/5"
            : "border-white/10 bg-[#111118] hover:border-violet-500/50 hover:bg-violet-500/5"
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto h-10 w-10 mb-4 text-violet-400" />
        <h3 className="text-base font-semibold text-gray-400 mb-1">
          {uploading ? "Uploading and processing..." : "Drop your CSV here or click to browse"}
        </h3>
        <p className="text-xs text-gray-600">
          Format: date, product_name, quantity_sold, revenue
        </p>
        {uploading && (
          <div className="mt-4 flex justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-violet-500"></div>
          </div>
        )}
      </div>

      {/* Metrics Table */}
      <div className="rounded-2xl border border-white/10 bg-[#111118] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
          <h2 className="text-lg font-semibold text-white">Forecast Overview</h2>
          <Button variant="outline" size="sm" onClick={fetchForecasts} disabled={loading} className="border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white rounded-xl">
            Refresh
          </Button>
        </div>
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-b border-white/10 hover:bg-transparent">
              <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">Product</TableHead>
              <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">Current Stock</TableHead>
              <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">7D Demand</TableHead>
              <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">30D Demand</TableHead>
              <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">Trend</TableHead>
              <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">Stockout Risk</TableHead>
              <TableHead className="text-zinc-400 text-xs uppercase tracking-wider text-right">Suggested Reorder</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-zinc-500">
                  Loading forecasts...
                </TableCell>
              </TableRow>
            ) : forecasts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16">
                  <div className="mx-auto max-w-sm rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-12">
                    <TrendingUp className="h-16 w-16 mx-auto mb-4 text-violet-500/40" />
                    <h3 className="text-white font-medium mb-1">No forecasts yet</h3>
                    <p className="text-gray-500 text-sm mb-6">Upload a CSV file above to train ARIMA models</p>
                    <Button variant="default" className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm h-9">
                      Upload CSV &rarr;
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              forecasts.map((f) => (
                <TableRow 
                  key={f.product.id} 
                  className="border-b border-white/10 hover:bg-white/5 text-zinc-300 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(f)}
                >
                  <TableCell className="font-medium text-white">{f.product.name}</TableCell>
                  <TableCell>{f.product.current_stock}</TableCell>
                  <TableCell>{f.summary ? Math.round(f.summary.demand_7_day) : "—"}</TableCell>
                  <TableCell>{f.summary ? Math.round(f.summary.demand_30_day) : "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {renderTrend(f.summary?.demand_trend)}
                      <span className="capitalize text-xs">{f.summary?.demand_trend || "N/A"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {f.summary ? renderRiskBadge(f.summary.stockout_probability) : "—"}
                  </TableCell>
                  <TableCell className="text-right text-violet-400 font-bold">
                    {f.summary ? `+${f.summary.recommended_reorder_quantity}` : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Chart Dialog */}
      <Dialog open={isChartOpen} onOpenChange={setIsChartOpen}>
        <DialogContent className="bg-[#111118] border-white/10 text-white max-w-4xl rounded-2xl">
          <DialogHeader className="mb-4 flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Activity className="h-5 w-5 text-violet-400"/> {selectedProduct?.product.name} Forecast
              </DialogTitle>
              <p className="text-sm text-zinc-400 mt-1">ARIMA Model • {Math.round((selectedProduct?.summary?.confidence_score || 0) * 100)}% Confidence</p>
            </div>
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              <button 
                onClick={() => setViewWindow("7D")}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${viewWindow === "7D" ? "bg-violet-600 text-white shadow" : "text-zinc-400 hover:text-white"}`}
              >
                7 Days
              </button>
              <button 
                onClick={() => setViewWindow("30D")}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${viewWindow === "30D" ? "bg-violet-600 text-white shadow" : "text-zinc-400 hover:text-white"}`}
              >
                30 Days
              </button>
            </div>
          </DialogHeader>
          
          <div className="h-[400px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#52525b" 
                  fontSize={12} 
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return `${d.getMonth()+1}/${d.getDate()}`;
                  }}
                  minTickGap={30}
                />
                <YAxis stroke="#52525b" fontSize={12} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#111118', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px' }}
                  itemStyle={{ color: '#e4e4e7' }}
                />
                
                {/* Confidence Interval Area */}
                <Area 
                  type="monotone" 
                  dataKey="conf_upper" 
                  stroke="none" 
                  fill="#8b5cf6" 
                  fillOpacity={0.1} 
                />
                <Area 
                  type="monotone" 
                  dataKey="conf_lower" 
                  stroke="none" 
                  fill="#111118" 
                  fillOpacity={1} 
                />

                {/* Actual Sales Line */}
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                  name="Historical Sales"
                />

                {/* Predicted Sales Line */}
                <Line 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#8b5cf6" 
                  strokeWidth={2} 
                  strokeDasharray="5 5"
                  dot={false}
                  name="Predicted Demand"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6 border-t border-white/10 pt-4">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <p className="text-zinc-400 text-xs uppercase font-bold tracking-wider mb-1">Stockout Risk</p>
              <div className="text-xl font-semibold">
                {Math.round((selectedProduct?.summary?.stockout_probability || 0) * 100)}%
              </div>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <p className="text-zinc-400 text-xs uppercase font-bold tracking-wider mb-1">Suggested Reorder</p>
              <div className="text-xl font-semibold text-violet-400">
                +{selectedProduct?.summary?.recommended_reorder_quantity || 0} units
              </div>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <p className="text-zinc-400 text-xs uppercase font-bold tracking-wider mb-1">30D Forecast</p>
              <div className="text-xl font-semibold">
                {Math.round(selectedProduct?.summary?.demand_30_day || 0)} units
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
