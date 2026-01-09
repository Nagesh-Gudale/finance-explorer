import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, AreaChart, Area, BarChart, Bar } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Holding } from "@/hooks/useMarketData";
import { motion } from "framer-motion";
import { PieChart as PieChartIcon, BarChart2, TrendingUp, Activity } from "lucide-react";

interface PortfolioAnalyticsProps {
  holdings: Holding[];
  totalValue: number;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
];

const PortfolioAnalytics = ({ holdings, totalValue }: PortfolioAnalyticsProps) => {
  // Use demo data if no holdings
  const hasHoldings = holdings.length > 0;
  
  const demoHoldings: Holding[] = [
    { symbol: "AAPL", name: "Apple Inc.", shares: 10, avgBuyPrice: 175, currentPrice: 185, value: 1850, change: 2.5, profitLoss: 100, profitLossPercent: 5.7, category: "stocks" },
    { symbol: "BTC", name: "Bitcoin", shares: 0.05, avgBuyPrice: 42000, currentPrice: 44000, value: 2200, change: 3.2, profitLoss: 100, profitLossPercent: 4.8, category: "crypto" },
    { symbol: "SPY", name: "S&P 500 ETF", shares: 5, avgBuyPrice: 470, currentPrice: 480, value: 2400, change: 1.1, profitLoss: 50, profitLossPercent: 2.1, category: "etf" },
    { symbol: "SBI-FD", name: "SBI Fixed Deposit", shares: 1, avgBuyPrice: 2000, currentPrice: 2000, value: 2000, change: 0, profitLoss: 35, profitLossPercent: 1.75, category: "fd", interestRate: 7.1 },
    { symbol: "GOLD", name: "Gold", shares: 20, avgBuyPrice: 60, currentPrice: 63, value: 1260, change: 0.5, profitLoss: 60, profitLossPercent: 5, category: "commodities" },
  ];
  
  const displayHoldings = hasHoldings ? holdings : demoHoldings;
  const displayTotalValue = hasHoldings ? totalValue : demoHoldings.reduce((sum, h) => sum + h.value, 0);

  // Allocation by asset
  const allocationData = useMemo(() => {
    return displayHoldings.map((h, i) => ({
      name: h.symbol,
      value: h.value,
      percentage: ((h.value / displayTotalValue) * 100).toFixed(1),
      color: COLORS[i % COLORS.length],
    }));
  }, [displayHoldings, displayTotalValue]);

  // Allocation by category
  const categoryData = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    displayHoldings.forEach(h => {
      const cat = h.category.toUpperCase();
      categoryMap[cat] = (categoryMap[cat] || 0) + h.value;
    });
    return Object.entries(categoryMap).map(([name, value], i) => ({
      name,
      value,
      percentage: ((value / displayTotalValue) * 100).toFixed(1),
      color: COLORS[i % COLORS.length],
    }));
  }, [displayHoldings, displayTotalValue]);

  // Performance data (simulated historical)
  const performanceData = useMemo(() => {
    const baseValue = displayTotalValue * 0.85;
    return Array.from({ length: 30 }, (_, i) => {
      const progress = i / 29;
      const variation = Math.sin(i * 0.5) * 0.03 + Math.random() * 0.02;
      const value = baseValue + (displayTotalValue - baseValue) * progress + displayTotalValue * variation;
      return {
        day: `Day ${i + 1}`,
        value: parseFloat(value.toFixed(2)),
        profit: parseFloat((value - baseValue).toFixed(2)),
      };
    });
  }, [displayTotalValue]);

  // P/L by holding
  const plData = useMemo(() => {
    return displayHoldings.map(h => ({
      name: h.symbol,
      profitLoss: parseFloat(h.profitLoss.toFixed(2)),
      percentage: parseFloat(h.profitLossPercent.toFixed(2)),
      fill: h.profitLoss >= 0 ? "hsl(142.1 76.2% 36.3%)" : "hsl(346.8 77.2% 49.8%)",
    }));
  }, [displayHoldings]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="font-display flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Portfolio Analytics
            </div>
            {!hasHoldings && (
              <span className="text-xs font-normal text-muted-foreground bg-secondary px-2 py-1 rounded">
                Demo Data
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="allocation" className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="allocation" className="text-xs">
                <PieChartIcon className="w-3 h-3 mr-1" />
                Allocation
              </TabsTrigger>
              <TabsTrigger value="category" className="text-xs">
                <BarChart2 className="w-3 h-3 mr-1" />
                By Category
              </TabsTrigger>
              <TabsTrigger value="performance" className="text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="pl" className="text-xs">
                <Activity className="w-3 h-3 mr-1" />
                P/L
              </TabsTrigger>
            </TabsList>

            <TabsContent value="allocation" className="h-[300px]">
              <div className="flex items-center gap-6 h-full">
                <ResponsiveContainer width="50%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`$${value.toFixed(2)}`, "Value"]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2 overflow-y-auto max-h-[280px]">
                  {allocationData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-foreground">{item.name}</span>
                      </div>
                      <span className="text-muted-foreground">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="category" className="h-[300px]">
              <div className="flex items-center gap-6 h-full">
                <ResponsiveContainer width="50%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`$${value.toFixed(2)}`, "Value"]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {categoryData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-foreground">{item.name}</span>
                      </div>
                      <span className="text-muted-foreground">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    interval={6}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${(v/1000).toFixed(1)}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => [`$${value.toFixed(2)}`, "Value"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorValue)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="pl" className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={plData} layout="vertical">
                  <XAxis 
                    type="number"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    width={50}
                  />
                  <Tooltip
                    formatter={(value: number) => [`$${value.toFixed(2)}`, "P/L"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="profitLoss" radius={[0, 4, 4, 0]}>
                    {plData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PortfolioAnalytics;
