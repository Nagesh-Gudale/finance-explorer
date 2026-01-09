import { useState, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Portfolio, { PortfolioHandle } from "@/components/Portfolio";
import PortfolioAnalytics from "@/components/PortfolioAnalytics";
import AIRecommendations from "@/components/AIRecommendations";
import { motion } from "framer-motion";
import { PieChart, TrendingUp, Wallet, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMarketData } from "@/hooks/useMarketData";

const PortfolioPage = () => {
  const [credits] = useState(8250);
  const portfolioRef = useRef<PortfolioHandle>(null);
  
  const {
    marketData,
    holdings,
    availableCredits,
    totalPortfolioValue,
    totalProfitLoss,
    totalProfitLossPercent,
  } = useMarketData();

  const handleTradeNow = () => {
    portfolioRef.current?.openInvestModal();
  };

  const handleViewAnalytics = () => {
    document.getElementById("analytics-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header credits={credits} />
      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_60%)]" />
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-6">
                <Wallet className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Simulated Trading</span>
              </div>
              
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Your Investment
                <span className="text-gradient-primary"> Portfolio</span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8">
                Practice investing with virtual credits. Make real market decisions 
                influenced by AI-analyzed trends.
              </p>

              <div className="flex justify-center gap-4">
                <Button variant="hero" className="gap-2" onClick={handleTradeNow}>
                  <TrendingUp className="w-4 h-4" />
                  Trade Now
                </Button>
                <Button variant="outline" className="gap-2" onClick={handleViewAnalytics}>
                  <PieChart className="w-4 h-4" />
                  View Analytics
                </Button>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-12"
            >
              <div className="p-4 rounded-xl bg-gradient-card border border-border text-center">
                <div className="font-display text-xl font-bold text-foreground">
                  ${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
                <div className="text-sm text-muted-foreground">Total Value</div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-card border border-border text-center">
                <div className={`font-display text-xl font-bold ${totalProfitLossPercent >= 0 ? 'text-gain' : 'text-loss'}`}>
                  {totalProfitLossPercent >= 0 ? '+' : ''}{totalProfitLossPercent.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Total Return</div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-card border border-border text-center">
                <div className="font-display text-xl font-bold text-foreground">{holdings.length}</div>
                <div className="text-sm text-muted-foreground">Holdings</div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-card border border-border text-center">
                <div className="font-display text-xl font-bold text-primary">
                  ${availableCredits.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Available</div>
              </div>
            </motion.div>
          </div>
        </section>

        <Portfolio ref={portfolioRef} />
        
        {/* Analytics & AI Section */}
        <section id="analytics-section" className="py-12">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
              <PortfolioAnalytics 
                holdings={holdings} 
                totalValue={totalPortfolioValue} 
              />
              <AIRecommendations 
                holdings={holdings}
                marketData={marketData}
                availableCredits={availableCredits}
                onTradeNow={handleTradeNow}
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PortfolioPage;
