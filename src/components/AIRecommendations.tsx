import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Holding, MarketAsset } from "@/hooks/useMarketData";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Sparkles, 
  RefreshCw,
  ArrowRight,
  Shield,
  Target,
  Lightbulb
} from "lucide-react";

interface Recommendation {
  id: string;
  type: "buy" | "sell" | "hold" | "diversify" | "alert";
  asset?: string;
  title: string;
  description: string;
  confidence: number;
  reasoning: string;
}

interface AIRecommendationsProps {
  holdings: Holding[];
  marketData: MarketAsset[];
  availableCredits: number;
  onTradeNow: () => void;
}

const AIRecommendations = ({ 
  holdings, 
  marketData, 
  availableCredits,
  onTradeNow 
}: AIRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);

  const generateRecommendations = () => {
    setIsLoading(true);
    
    // Simulate AI analysis delay
    setTimeout(() => {
      const recs: Recommendation[] = [];
      
      // Analyze portfolio diversity
      const categories = new Set(holdings.map(h => h.category));
      if (categories.size < 3 && holdings.length > 0) {
        recs.push({
          id: "div-1",
          type: "diversify",
          title: "Diversify Your Portfolio",
          description: `You're only invested in ${categories.size} asset class${categories.size > 1 ? "es" : ""}. Consider spreading across stocks, bonds, and commodities.`,
          confidence: 92,
          reasoning: "Diversification reduces risk by spreading investments across uncorrelated assets.",
        });
      }

      // Check for high cash allocation
      const totalInvested = holdings.reduce((sum, h) => sum + h.value, 0);
      const cashRatio = availableCredits / (availableCredits + totalInvested);
      if (cashRatio > 0.5 && availableCredits > 1000) {
        recs.push({
          id: "cash-1",
          type: "buy",
          title: "High Cash Allocation",
          description: `${(cashRatio * 100).toFixed(0)}% of your portfolio is in cash. Consider investing to maximize returns.`,
          confidence: 85,
          reasoning: "Cash loses value to inflation over time. Investing in assets with growth potential can preserve and grow wealth.",
        });
      }

      // Analyze underperforming assets
      const losers = holdings.filter(h => h.profitLossPercent < -5);
      if (losers.length > 0) {
        const worstLoser = losers.reduce((prev, curr) => 
          curr.profitLossPercent < prev.profitLossPercent ? curr : prev
        );
        recs.push({
          id: `sell-${worstLoser.symbol}`,
          type: "sell",
          asset: worstLoser.symbol,
          title: `Consider Selling ${worstLoser.symbol}`,
          description: `${worstLoser.name} is down ${Math.abs(worstLoser.profitLossPercent).toFixed(1)}%. Evaluate if fundamentals still support holding.`,
          confidence: 68,
          reasoning: "Cutting losses early can preserve capital for better opportunities.",
        });
      }

      // Analyze top performers
      const winners = holdings.filter(h => h.profitLossPercent > 10);
      if (winners.length > 0) {
        const topWinner = winners.reduce((prev, curr) => 
          curr.profitLossPercent > prev.profitLossPercent ? curr : prev
        );
        recs.push({
          id: `hold-${topWinner.symbol}`,
          type: "hold",
          asset: topWinner.symbol,
          title: `Strong Performance: ${topWinner.symbol}`,
          description: `${topWinner.name} is up ${topWinner.profitLossPercent.toFixed(1)}%. Consider taking partial profits.`,
          confidence: 75,
          reasoning: "Taking profits locks in gains. Consider rebalancing to maintain target allocations.",
        });
      }

      // Market opportunity alerts
      const topGainers = marketData
        .filter(a => a.change24h > 3 && !holdings.find(h => h.symbol === a.symbol))
        .slice(0, 2);
      
      topGainers.forEach(asset => {
        recs.push({
          id: `opp-${asset.symbol}`,
          type: "buy",
          asset: asset.symbol,
          title: `Trending: ${asset.symbol}`,
          description: `${asset.name} is up ${asset.change24h.toFixed(1)}% today with strong volume.`,
          confidence: Math.floor(60 + Math.random() * 20),
          reasoning: "Momentum strategies can capture short-term gains in trending assets.",
        });
      });

      // Safe haven suggestion
      const hasSafeAssets = holdings.some(h => 
        h.category === "fd" || h.category === "bonds" || h.symbol === "GOLD"
      );
      if (!hasSafeAssets && holdings.length > 2) {
        recs.push({
          id: "safe-1",
          type: "diversify",
          title: "Add Safe Haven Assets",
          description: "Consider adding Fixed Deposits, Bonds, or Gold for portfolio stability.",
          confidence: 88,
          reasoning: "Safe assets provide stability during market volatility and guaranteed returns.",
        });
      }

      // If no specific recommendations, add a general one
      if (recs.length === 0) {
        recs.push({
          id: "general-1",
          type: "hold",
          title: "Portfolio Looks Healthy",
          description: "No immediate actions recommended. Continue monitoring market conditions.",
          confidence: 80,
          reasoning: "Patience is key in investing. Avoid overtrading and stick to your strategy.",
        });
      }

      setRecommendations(recs.slice(0, 5));
      setLastGenerated(new Date());
      setIsLoading(false);
    }, 1500);
  };

  useEffect(() => {
    generateRecommendations();
  }, [holdings.length]);

  const getTypeIcon = (type: Recommendation["type"]) => {
    switch (type) {
      case "buy": return <TrendingUp className="w-4 h-4" />;
      case "sell": return <TrendingDown className="w-4 h-4" />;
      case "hold": return <Target className="w-4 h-4" />;
      case "diversify": return <Shield className="w-4 h-4" />;
      case "alert": return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getTypeBadgeVariant = (type: Recommendation["type"]) => {
    switch (type) {
      case "buy": return "default";
      case "sell": return "destructive";
      case "hold": return "secondary";
      case "diversify": return "outline";
      case "alert": return "destructive";
    }
  };

  const getTypeLabel = (type: Recommendation["type"]) => {
    switch (type) {
      case "buy": return "Buy Signal";
      case "sell": return "Sell Signal";
      case "hold": return "Hold";
      case "diversify": return "Diversify";
      case "alert": return "Alert";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="bg-gradient-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            AI Investment Advisor
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={generateRecommendations}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {lastGenerated && (
            <p className="text-xs text-muted-foreground mb-4">
              <Sparkles className="w-3 h-3 inline mr-1" />
              AI analysis generated at {lastGenerated.toLocaleTimeString()}
            </p>
          )}

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 rounded-lg bg-secondary/50 animate-pulse" />
              ))}
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="space-y-3">
                {recommendations.map((rec, index) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-4 rounded-xl bg-secondary/30 border border-border hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={getTypeBadgeVariant(rec.type)} className="gap-1">
                          {getTypeIcon(rec.type)}
                          {getTypeLabel(rec.type)}
                        </Badge>
                        {rec.asset && (
                          <span className="text-xs font-mono text-muted-foreground">
                            {rec.asset}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Lightbulb className="w-3 h-3" />
                        {rec.confidence}% confidence
                      </div>
                    </div>
                    
                    <h4 className="font-medium text-foreground mb-1">{rec.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                    
                    <p className="text-xs text-muted-foreground/80 italic">
                      💡 {rec.reasoning}
                    </p>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}

          <div className="mt-4 pt-4 border-t border-border">
            <Button 
              variant="hero" 
              className="w-full gap-2"
              onClick={onTradeNow}
            >
              <TrendingUp className="w-4 h-4" />
              Trade Now
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AIRecommendations;
