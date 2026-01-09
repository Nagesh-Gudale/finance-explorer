import { useState, useEffect, useCallback } from "react";

export interface MarketAsset {
  symbol: string;
  name: string;
  currentPrice: number;
  change24h: number;
  marketCap: string;
  volume: string;
  category: "stocks" | "crypto" | "etf";
}

export interface Holding {
  symbol: string;
  name: string;
  shares: number;
  avgBuyPrice: number;
  currentPrice: number;
  value: number;
  change: number;
  profitLoss: number;
  profitLossPercent: number;
}

// Simulated real-world market data (in production, this would come from Gemini API)
const generateMarketData = (): MarketAsset[] => {
  const baseAssets = [
    // Stocks
    { symbol: "AAPL", name: "Apple Inc.", basePrice: 178.50, category: "stocks" as const },
    { symbol: "GOOGL", name: "Alphabet Inc.", basePrice: 141.80, category: "stocks" as const },
    { symbol: "MSFT", name: "Microsoft Corp.", basePrice: 378.90, category: "stocks" as const },
    { symbol: "NVDA", name: "NVIDIA Corp.", basePrice: 495.20, category: "stocks" as const },
    { symbol: "TSLA", name: "Tesla Inc.", basePrice: 248.30, category: "stocks" as const },
    { symbol: "AMZN", name: "Amazon.com Inc.", basePrice: 178.25, category: "stocks" as const },
    // Crypto
    { symbol: "BTC", name: "Bitcoin", basePrice: 43250.00, category: "crypto" as const },
    { symbol: "ETH", name: "Ethereum", basePrice: 2280.50, category: "crypto" as const },
    { symbol: "SOL", name: "Solana", basePrice: 98.75, category: "crypto" as const },
    { symbol: "ADA", name: "Cardano", basePrice: 0.52, category: "crypto" as const },
    { symbol: "DOT", name: "Polkadot", basePrice: 7.85, category: "crypto" as const },
    // ETFs
    { symbol: "SPY", name: "S&P 500 ETF", basePrice: 478.50, category: "etf" as const },
    { symbol: "QQQ", name: "Nasdaq 100 ETF", basePrice: 405.30, category: "etf" as const },
    { symbol: "VTI", name: "Total Stock Market", basePrice: 238.20, category: "etf" as const },
    { symbol: "ARKK", name: "ARK Innovation", basePrice: 48.90, category: "etf" as const },
    { symbol: "GLD", name: "Gold ETF", basePrice: 189.40, category: "etf" as const },
  ];

  return baseAssets.map(asset => {
    // Add realistic price fluctuation
    const volatility = asset.category === "crypto" ? 0.08 : 0.03;
    const priceChange = (Math.random() - 0.5) * 2 * volatility;
    const currentPrice = asset.basePrice * (1 + priceChange);
    const change24h = (Math.random() - 0.5) * 10; // -5% to +5%
    
    const marketCapMultiplier = asset.category === "crypto" ? 1000000000 : 10000000000;
    const volumeMultiplier = asset.category === "crypto" ? 100000000 : 1000000000;
    
    return {
      symbol: asset.symbol,
      name: asset.name,
      currentPrice: parseFloat(currentPrice.toFixed(2)),
      change24h: parseFloat(change24h.toFixed(2)),
      marketCap: formatLargeNumber(Math.random() * marketCapMultiplier * 10),
      volume: formatLargeNumber(Math.random() * volumeMultiplier),
      category: asset.category,
    };
  });
};

const formatLargeNumber = (num: number): string => {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toFixed(2)}`;
};

export const useMarketData = () => {
  const [marketData, setMarketData] = useState<MarketAsset[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [availableCredits, setAvailableCredits] = useState(10000);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMarketData = useCallback(async () => {
    setIsLoading(true);
    
    // Simulate API call delay (would be Gemini API in production)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const data = generateMarketData();
    setMarketData(data);
    setLastUpdated(new Date());
    
    // Update holdings with new prices
    setHoldings(prev => prev.map(holding => {
      const currentAsset = data.find(a => a.symbol === holding.symbol);
      if (!currentAsset) return holding;
      
      const currentPrice = currentAsset.currentPrice;
      const value = holding.shares * currentPrice;
      const costBasis = holding.shares * holding.avgBuyPrice;
      const profitLoss = value - costBasis;
      const profitLossPercent = ((value - costBasis) / costBasis) * 100;
      
      return {
        ...holding,
        currentPrice,
        value,
        change: currentAsset.change24h,
        profitLoss,
        profitLossPercent,
      };
    }));
    
    setIsLoading(false);
  }, []);

  const addInvestment = useCallback((asset: MarketAsset, amount: number, shares: number) => {
    if (amount > availableCredits) return false;
    
    setHoldings(prev => {
      const existingIndex = prev.findIndex(h => h.symbol === asset.symbol);
      
      if (existingIndex >= 0) {
        // Add to existing holding - calculate new average buy price
        const existing = prev[existingIndex];
        const totalShares = existing.shares + shares;
        const totalCost = (existing.shares * existing.avgBuyPrice) + amount;
        const newAvgPrice = totalCost / totalShares;
        const newValue = totalShares * asset.currentPrice;
        const profitLoss = newValue - totalCost;
        const profitLossPercent = (profitLoss / totalCost) * 100;
        
        const updated = [...prev];
        updated[existingIndex] = {
          ...existing,
          shares: totalShares,
          avgBuyPrice: newAvgPrice,
          value: newValue,
          profitLoss,
          profitLossPercent,
        };
        return updated;
      } else {
        // New holding
        return [...prev, {
          symbol: asset.symbol,
          name: asset.name,
          shares,
          avgBuyPrice: asset.currentPrice,
          currentPrice: asset.currentPrice,
          value: amount,
          change: asset.change24h,
          profitLoss: 0,
          profitLossPercent: 0,
        }];
      }
    });
    
    setAvailableCredits(prev => prev - amount);
    return true;
  }, [availableCredits]);

  const sellHolding = useCallback((symbol: string, sharesToSell: number) => {
    const holding = holdings.find(h => h.symbol === symbol);
    if (!holding || sharesToSell > holding.shares) return false;
    
    const saleValue = sharesToSell * holding.currentPrice;
    
    setHoldings(prev => {
      if (sharesToSell >= holding.shares) {
        return prev.filter(h => h.symbol !== symbol);
      }
      
      return prev.map(h => {
        if (h.symbol !== symbol) return h;
        
        const remainingShares = h.shares - sharesToSell;
        const newValue = remainingShares * h.currentPrice;
        const costBasis = remainingShares * h.avgBuyPrice;
        const profitLoss = newValue - costBasis;
        const profitLossPercent = ((newValue - costBasis) / costBasis) * 100;
        
        return {
          ...h,
          shares: remainingShares,
          value: newValue,
          profitLoss,
          profitLossPercent,
        };
      });
    });
    
    setAvailableCredits(prev => prev + saleValue);
    return true;
  }, [holdings]);

  // Initial fetch
  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchMarketData, 30000);
    return () => clearInterval(interval);
  }, [fetchMarketData]);

  const totalPortfolioValue = holdings.reduce((sum, h) => sum + h.value, 0);
  const totalProfitLoss = holdings.reduce((sum, h) => sum + h.profitLoss, 0);
  const totalProfitLossPercent = holdings.length > 0
    ? (totalProfitLoss / holdings.reduce((sum, h) => sum + (h.shares * h.avgBuyPrice), 0)) * 100
    : 0;

  return {
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
  };
};
