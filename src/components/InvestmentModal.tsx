import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Loader2, ArrowUpRight, ArrowDownRight, Shield, Percent, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { MarketAsset, AssetCategory } from "@/hooks/useMarketData";

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvest: (asset: MarketAsset, amount: number, shares: number) => void;
  availableCredits: number;
  marketData: MarketAsset[];
  isLoading: boolean;
}

const InvestmentModal = ({ 
  isOpen, 
  onClose, 
  onInvest, 
  availableCredits, 
  marketData,
  isLoading 
}: InvestmentModalProps) => {
  const [selectedAsset, setSelectedAsset] = useState<MarketAsset | null>(null);
  const [investAmount, setInvestAmount] = useState("");
  const [activeTab, setActiveTab] = useState<AssetCategory>("stocks");

  const filteredAssets = marketData.filter(asset => asset.category === activeTab);

  const categoryLabels: Record<AssetCategory, string> = {
    stocks: "Stocks",
    crypto: "Crypto",
    etf: "ETFs",
    fd: "Fixed Deposits",
    bonds: "Bonds",
    mutual_funds: "Mutual Funds",
    commodities: "Commodities",
  };

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case "Low": return "text-gain";
      case "Medium": return "text-yellow-500";
      case "High": return "text-loss";
      default: return "text-muted-foreground";
    }
  };

  const handleInvest = () => {
    if (selectedAsset && investAmount) {
      const amount = parseFloat(investAmount);
      const shares = amount / selectedAsset.currentPrice;
      onInvest(selectedAsset, amount, shares);
      setSelectedAsset(null);
      setInvestAmount("");
      onClose();
    }
  };

  const calculatedShares = selectedAsset && investAmount 
    ? (parseFloat(investAmount) / selectedAsset.currentPrice).toFixed(4)
    : "0";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-background border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground">
            Investment Options
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Fetching real-time market data...</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border mb-4">
              <span className="text-sm text-muted-foreground">Available Credits</span>
              <span className="font-display font-bold text-foreground">${availableCredits.toLocaleString()}</span>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AssetCategory)}>
              <div className="overflow-x-auto pb-2">
                <TabsList className="inline-flex w-auto min-w-full gap-1 h-auto flex-wrap">
                  {(Object.keys(categoryLabels) as AssetCategory[]).map((cat) => (
                    <TabsTrigger key={cat} value={cat} className="text-xs px-3 py-1.5">
                      {categoryLabels[cat]}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <TabsContent value={activeTab} className="space-y-2 mt-4 max-h-[300px] overflow-y-auto">
                {filteredAssets.map((asset) => (
                  <motion.div
                    key={asset.symbol}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setSelectedAsset(asset)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedAsset?.symbol === asset.symbol
                        ? "border-primary bg-primary/5"
                        : "border-border bg-gradient-card hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                          <span className="font-display font-semibold text-sm text-foreground">
                            {asset.symbol.slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{asset.name}</p>
                          <p className="text-xs text-muted-foreground">{asset.symbol}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {asset.category === "fd" || asset.category === "bonds" ? (
                          <>
                            <div className="flex items-center justify-end gap-1 text-primary">
                              <Percent className="w-3 h-3" />
                              <span className="font-display font-semibold">{asset.interestRate}% p.a.</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{asset.tenure}</p>
                          </>
                        ) : (
                          <>
                            <p className="font-display font-semibold text-foreground">
                              ${asset.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                            <div className={`flex items-center justify-end gap-1 text-sm ${
                              asset.change24h >= 0 ? "text-gain" : "text-loss"
                            }`}>
                              {asset.change24h >= 0 ? (
                                <ArrowUpRight className="w-3 h-3" />
                              ) : (
                                <ArrowDownRight className="w-3 h-3" />
                              )}
                              <span>{asset.change24h >= 0 ? "+" : ""}{asset.change24h.toFixed(2)}%</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-4 mt-3 pt-3 border-t border-border/50 flex-wrap">
                      {asset.riskLevel && (
                        <div className="flex items-center gap-1">
                          <Shield className="w-3 h-3 text-muted-foreground" />
                          <span className={`text-xs font-medium ${getRiskColor(asset.riskLevel)}`}>
                            {asset.riskLevel} Risk
                          </span>
                        </div>
                      )}
                      {asset.minInvestment && (
                        <div>
                          <p className="text-xs text-muted-foreground">Min: ${asset.minInvestment}</p>
                        </div>
                      )}
                      {asset.marketCap !== "N/A" && (
                        <div>
                          <p className="text-xs text-muted-foreground">Cap: {asset.marketCap}</p>
                        </div>
                      )}
                      {asset.volume !== "N/A" && (
                        <div>
                          <p className="text-xs text-muted-foreground">Vol: {asset.volume}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </TabsContent>
            </Tabs>

            {selectedAsset && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-xl bg-secondary/50 border border-border"
              >
                <p className="text-sm text-muted-foreground mb-2">
                  Invest in <span className="font-semibold text-foreground">{selectedAsset.name}</span>
                  {selectedAsset.interestRate && (
                    <span className="text-primary ml-2">@ {selectedAsset.interestRate}% p.a.</span>
                  )}
                </p>
                
                {selectedAsset.minInvestment && (
                  <p className="text-xs text-muted-foreground mb-2">
                    Minimum investment: ${selectedAsset.minInvestment}
                  </p>
                )}
                
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="Amount in credits"
                      value={investAmount}
                      onChange={(e) => setInvestAmount(e.target.value)}
                      max={availableCredits}
                      min={selectedAsset.minInvestment || 1}
                      className="bg-background"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedAsset.category === "fd" || selectedAsset.category === "bonds"
                        ? `Est. annual return: $${((parseFloat(investAmount) || 0) * (selectedAsset.interestRate || 0) / 100).toFixed(2)}`
                        : `≈ ${calculatedShares} units`
                      }
                    </p>
                  </div>
                  <Button 
                    onClick={handleInvest}
                    disabled={
                      !investAmount || 
                      parseFloat(investAmount) > availableCredits || 
                      parseFloat(investAmount) <= 0 ||
                      (selectedAsset.minInvestment && parseFloat(investAmount) < selectedAsset.minInvestment)
                    }
                    variant="hero"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Invest
                  </Button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InvestmentModal;
