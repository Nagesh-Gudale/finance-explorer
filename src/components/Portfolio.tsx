import { useState, forwardRef, useImperativeHandle } from "react";
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  DollarSign, 
  TrendingDown, 
  TrendingUp, 
  RefreshCw,
  Plus,
  Minus,
  Bot
} from "lucide-react";
import { Button } from "./ui/button";
import AnimatedSection from "./AnimatedSection";
import { motion } from "framer-motion";
import { useMarketData, Holding, MarketAsset } from "@/hooks/useMarketData";
import InvestmentModal from "./InvestmentModal";
import InvestmentChatbot from "./InvestmentChatbot";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface PortfolioHandle {
  openInvestModal: () => void;
}

interface LastTransaction {
  type: "buy" | "sell";
  asset: string;
  amount: number;
  shares: number;
}

const Portfolio = forwardRef<PortfolioHandle>((_, ref) => {
  const {
    marketData,
    holdings,
    isLoading,
    availableCredits,
    lastUpdated,
    totalPortfolioValue,
    totalProfitLoss,
    totalProfitLossPercent,
    fetchMarketData,
    addInvestment,
    sellHolding,
  } = useMarketData();

  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false);
  const [sellModalData, setSellModalData] = useState<Holding | null>(null);
  const [sellAmount, setSellAmount] = useState("");
  const [lastTransaction, setLastTransaction] = useState<LastTransaction | null>(null);

  useImperativeHandle(ref, () => ({
    openInvestModal: () => setIsInvestModalOpen(true),
  }));

  const handleInvest = (asset: MarketAsset, amount: number, shares: number) => {
    addInvestment(asset, amount, shares);
    setLastTransaction({
      type: "buy",
      asset: asset.symbol,
      amount,
      shares,
    });
  };

  const handleSell = () => {
    if (sellModalData && sellAmount) {
      const shares = parseFloat(sellAmount);
      const amount = shares * sellModalData.currentPrice;
      sellHolding(sellModalData.symbol, shares);
      setLastTransaction({
        type: "sell",
        asset: sellModalData.symbol,
        amount,
        shares,
      });
      setSellModalData(null);
      setSellAmount("");
    }
  };

  return (
    <section id="portfolio" className="py-24 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.05),transparent_70%)]" />
      
      <div className="container mx-auto px-6 relative z-10">
        <AnimatedSection className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-4">
            <Bot className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">AI-Powered Market Analysis</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Simulated Portfolio
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Practice investing with virtual credits. Real-time market data powered by AI analysis.
          </p>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </AnimatedSection>

        <div className="max-w-4xl mx-auto">
          {/* Portfolio Overview */}
          <AnimatedSection delay={0.1}>
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="rounded-2xl bg-gradient-card border border-border p-8 mb-6"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Portfolio Value</p>
                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-4xl font-bold text-foreground">
                      ${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <div className={`flex items-center gap-1 ${totalProfitLoss >= 0 ? 'text-gain' : 'text-loss'}`}>
                      {totalProfitLoss >= 0 ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5" />
                      )}
                      <span className="font-semibold">
                        {totalProfitLoss >= 0 ? '+' : ''}${totalProfitLoss.toFixed(2)} ({totalProfitLossPercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Available Credits: <span className="font-semibold text-foreground">${availableCredits.toLocaleString()}</span>
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button variant="hero" onClick={() => setIsInvestModalOpen(true)}>
                    <Plus className="w-4 h-4" />
                    Invest
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={fetchMarketData}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>
            </motion.div>
          </AnimatedSection>

          {/* Holdings */}
          <AnimatedSection delay={0.2}>
            <div className="rounded-2xl bg-gradient-card border border-border overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-display font-semibold text-foreground">Your Holdings</h3>
                <span className="text-sm text-muted-foreground">{holdings.length} assets</span>
              </div>
              
              {holdings.length === 0 ? (
                <div className="p-8 text-center">
                  <TrendingUp className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No investments yet. Start building your portfolio!</p>
                  <Button variant="hero" onClick={() => setIsInvestModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Make Your First Investment
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {holdings.map((holding, index) => (
                    <motion.div 
                      key={holding.symbol} 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      whileHover={{ backgroundColor: "hsl(var(--secondary) / 0.3)" }}
                      className="p-4 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <motion.div 
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center"
                          >
                            <span className="font-display font-semibold text-sm text-foreground">
                              {holding.symbol.slice(0, 2)}
                            </span>
                          </motion.div>
                          <div>
                            <p className="font-medium text-foreground">{holding.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {holding.shares.toFixed(4)} shares @ ${holding.avgBuyPrice.toFixed(2)} avg
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-display font-semibold text-foreground">
                              ${holding.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <div className={`flex items-center justify-end gap-1 text-sm ${holding.profitLoss >= 0 ? 'text-gain' : 'text-loss'}`}>
                              {holding.profitLoss >= 0 ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : (
                                <TrendingDown className="w-3 h-3" />
                              )}
                              <span>
                                {holding.profitLoss >= 0 ? '+' : ''}${holding.profitLoss.toFixed(2)} 
                                ({holding.profitLossPercent.toFixed(2)}%)
                              </span>
                            </div>
                          </div>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSellModalData(holding)}
                          >
                            <Minus className="w-3 h-3 mr-1" />
                            Sell
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                        <span>Current: ${holding.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        <span className={holding.change >= 0 ? 'text-gain' : 'text-loss'}>
                          24h: {holding.change >= 0 ? '+' : ''}{holding.change.toFixed(2)}%
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* Investment Modal */}
      <InvestmentModal
        isOpen={isInvestModalOpen}
        onClose={() => setIsInvestModalOpen(false)}
        onInvest={handleInvest}
        availableCredits={availableCredits}
        marketData={marketData}
        isLoading={isLoading}
      />

      {/* Sell Modal */}
      <Dialog open={!!sellModalData} onOpenChange={() => setSellModalData(null)}>
        <DialogContent className="bg-background border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">
              Sell {sellModalData?.name}
            </DialogTitle>
          </DialogHeader>
          
          {sellModalData && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Current Holdings</span>
                  <span className="font-medium text-foreground">{sellModalData.shares.toFixed(4)} shares</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Current Price</span>
                  <span className="font-medium text-foreground">${sellModalData.currentPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">P/L</span>
                  <span className={`font-medium ${sellModalData.profitLoss >= 0 ? 'text-gain' : 'text-loss'}`}>
                    {sellModalData.profitLoss >= 0 ? '+' : ''}${sellModalData.profitLoss.toFixed(2)}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Shares to sell</label>
                <Input
                  type="number"
                  placeholder="Enter number of shares"
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                  max={sellModalData.shares}
                  step="0.0001"
                  className="bg-background"
                />
                {sellAmount && (
                  <p className="text-xs text-muted-foreground mt-1">
                    You'll receive: ${(parseFloat(sellAmount) * sellModalData.currentPrice).toFixed(2)}
                  </p>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setSellAmount(sellModalData.shares.toString())}
                >
                  Sell All
                </Button>
                <Button 
                  variant="hero" 
                  className="flex-1"
                  onClick={handleSell}
                  disabled={!sellAmount || parseFloat(sellAmount) > sellModalData.shares || parseFloat(sellAmount) <= 0}
                >
                  <DollarSign className="w-4 h-4 mr-1" />
                  Confirm Sale
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* AI Chatbot */}
      <InvestmentChatbot
        holdings={holdings}
        marketData={marketData}
        totalPortfolioValue={totalPortfolioValue}
        availableCredits={availableCredits}
        lastTransaction={lastTransaction}
      />
    </section>
  );
});

Portfolio.displayName = "Portfolio";

export default Portfolio;
