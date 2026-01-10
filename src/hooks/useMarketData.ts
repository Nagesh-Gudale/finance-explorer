import { useState, useEffect, useCallback } from "react";

export type AssetCategory = "stocks" | "crypto" | "etf" | "fd" | "bonds" | "mutual_funds" | "commodities";

export interface MarketAsset {
  symbol: string;
  name: string;
  currentPrice: number;
  change24h: number;
  marketCap: string;
  volume: string;
  category: AssetCategory;
  // Additional fields for FDs and Bonds
  interestRate?: number;
  tenure?: string;
  minInvestment?: number;
  riskLevel?: "Low" | "Medium" | "High";
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
  category: AssetCategory;
  maturityDate?: string;
  interestRate?: number;
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

  // Fixed Deposits
  const fdAssets: MarketAsset[] = [
    { symbol: "SBI-FD", name: "SBI Fixed Deposit", currentPrice: 1000, change24h: 0, marketCap: "N/A", volume: "N/A", category: "fd", interestRate: 7.10, tenure: "1 Year", minInvestment: 1000, riskLevel: "Low" },
    { symbol: "HDFC-FD", name: "HDFC Bank FD", currentPrice: 1000, change24h: 0, marketCap: "N/A", volume: "N/A", category: "fd", interestRate: 7.25, tenure: "1 Year", minInvestment: 5000, riskLevel: "Low" },
    { symbol: "ICICI-FD", name: "ICICI Bank FD", currentPrice: 1000, change24h: 0, marketCap: "N/A", volume: "N/A", category: "fd", interestRate: 7.00, tenure: "1 Year", minInvestment: 1000, riskLevel: "Low" },
    { symbol: "AXIS-FD", name: "Axis Bank FD", currentPrice: 1000, change24h: 0, marketCap: "N/A", volume: "N/A", category: "fd", interestRate: 7.15, tenure: "2 Years", minInvestment: 5000, riskLevel: "Low" },
    { symbol: "KOT-FD", name: "Kotak Mahindra FD", currentPrice: 1000, change24h: 0, marketCap: "N/A", volume: "N/A", category: "fd", interestRate: 7.20, tenure: "3 Years", minInvestment: 5000, riskLevel: "Low" },
  ];

  // Bonds
  const bondAssets: MarketAsset[] = [
    { symbol: "GOV-10Y", name: "Govt Bond 10Y", currentPrice: 100, change24h: 0.05, marketCap: "$1.2T", volume: "$50B", category: "bonds", interestRate: 7.18, tenure: "10 Years", riskLevel: "Low" },
    { symbol: "GOV-5Y", name: "Govt Bond 5Y", currentPrice: 100, change24h: 0.03, marketCap: "$800B", volume: "$30B", category: "bonds", interestRate: 7.02, tenure: "5 Years", riskLevel: "Low" },
    { symbol: "CORP-AAA", name: "Corporate Bond AAA", currentPrice: 100, change24h: 0.08, marketCap: "$200B", volume: "$5B", category: "bonds", interestRate: 8.50, tenure: "5 Years", riskLevel: "Medium" },
    { symbol: "MUNI-BD", name: "Municipal Bond", currentPrice: 100, change24h: 0.02, marketCap: "$100B", volume: "$2B", category: "bonds", interestRate: 6.80, tenure: "7 Years", riskLevel: "Low" },
    { symbol: "INFRA-BD", name: "Infrastructure Bond", currentPrice: 100, change24h: 0.10, marketCap: "$150B", volume: "$3B", category: "bonds", interestRate: 8.20, tenure: "10 Years", riskLevel: "Medium" },
  ];

  // Mutual Funds
  const mfAssets: MarketAsset[] = [
    { symbol: "NIFTY-IDX", name: "Nifty 50 Index Fund", currentPrice: 185.50, change24h: 0.85, marketCap: "$50B", volume: "$500M", category: "mutual_funds", riskLevel: "Medium" },
    { symbol: "BLUECHIP", name: "Large Cap Equity Fund", currentPrice: 425.30, change24h: 1.20, marketCap: "$30B", volume: "$300M", category: "mutual_funds", riskLevel: "Medium" },
    { symbol: "MIDCAP-F", name: "Mid Cap Growth Fund", currentPrice: 89.75, change24h: 1.80, marketCap: "$15B", volume: "$150M", category: "mutual_funds", riskLevel: "High" },
    { symbol: "DEBT-F", name: "Debt Fund Ultra Short", currentPrice: 52.40, change24h: 0.02, marketCap: "$25B", volume: "$200M", category: "mutual_funds", interestRate: 6.50, riskLevel: "Low" },
    { symbol: "HYBRID-F", name: "Balanced Hybrid Fund", currentPrice: 145.80, change24h: 0.65, marketCap: "$20B", volume: "$180M", category: "mutual_funds", riskLevel: "Medium" },
    { symbol: "ELSS-F", name: "Tax Saver ELSS Fund", currentPrice: 210.25, change24h: 1.45, marketCap: "$18B", volume: "$160M", category: "mutual_funds", riskLevel: "High" },
  ];

  // Commodities
  const commodityAssets: MarketAsset[] = [
    { symbol: "GOLD", name: "Gold (per gram)", currentPrice: 62.50, change24h: 0.35, marketCap: "$12T", volume: "$200B", category: "commodities", riskLevel: "Low" },
    { symbol: "SILVER", name: "Silver (per gram)", currentPrice: 0.78, change24h: 0.55, marketCap: "$1.4T", volume: "$50B", category: "commodities", riskLevel: "Medium" },
    { symbol: "CRUDE", name: "Crude Oil (per barrel)", currentPrice: 78.50, change24h: -1.20, marketCap: "$3T", volume: "$100B", category: "commodities", riskLevel: "High" },
    { symbol: "COPPER", name: "Copper (per kg)", currentPrice: 8.45, change24h: 0.80, marketCap: "$800B", volume: "$30B", category: "commodities", riskLevel: "Medium" },
    { symbol: "NATGAS", name: "Natural Gas", currentPrice: 2.85, change24h: -2.10, marketCap: "$500B", volume: "$25B", category: "commodities", riskLevel: "High" },
  ];

  const marketAssets = baseAssets.map(asset => {
    const volatility = asset.category === "crypto" ? 0.08 : 0.03;
    const priceChange = (Math.random() - 0.5) * 2 * volatility;
    const currentPrice = asset.basePrice * (1 + priceChange);
    const change24h = (Math.random() - 0.5) * 10;
    
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

  return [...marketAssets, ...fdAssets, ...bondAssets, ...mfAssets, ...commodityAssets];
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
  const [transactionHistory, setTransactionHistory] = useState<Array<{
    type: "buy" | "sell";
    asset: MarketAsset;
    amount: number;
    shares: number;
    previousHolding?: Holding;
  }>>([]);
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
    
    // Update holdings with new prices (skip FDs and Bonds as they have fixed returns)
    setHoldings(prev => prev.map(holding => {
      const currentAsset = data.find(a => a.symbol === holding.symbol);
      if (!currentAsset) return holding;
      
      // For FDs and Bonds, calculate based on interest rate
      if (holding.category === "fd" || holding.category === "bonds") {
        const interestRate = holding.interestRate || 0;
        const annualReturn = (holding.value * interestRate) / 100;
        const dailyReturn = annualReturn / 365;
        const profitLoss = dailyReturn * 30; // Monthly return simulation
        const profitLossPercent = (profitLoss / holding.value) * 100;
        
        return {
          ...holding,
          profitLoss,
          profitLossPercent,
          change: 0,
        };
      }
      
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
    
    // Check minimum investment for FDs
    if (asset.minInvestment && amount < asset.minInvestment) return false;
    
    // Store the previous state for potential revert
    const existingHolding = holdings.find(h => h.symbol === asset.symbol);
    setTransactionHistory(prev => [...prev, {
      type: "buy",
      asset,
      amount,
      shares,
      previousHolding: existingHolding ? { ...existingHolding } : undefined,
    }]);
    
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
        // Calculate maturity date for FDs and Bonds
        let maturityDate: string | undefined;
        if (asset.tenure) {
          const years = parseInt(asset.tenure) || 1;
          const maturity = new Date();
          maturity.setFullYear(maturity.getFullYear() + years);
          maturityDate = maturity.toLocaleDateString();
        }
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
          category: asset.category,
          maturityDate,
          interestRate: asset.interestRate,
        }];
      }
    });
    
    setAvailableCredits(prev => prev - amount);
    return true;
  }, [availableCredits, holdings]);

  const sellHolding = useCallback((symbol: string, sharesToSell: number) => {
    const holding = holdings.find(h => h.symbol === symbol);
    if (!holding || sharesToSell > holding.shares) return false;
    
    const saleValue = sharesToSell * holding.currentPrice;
    const asset = marketData.find(m => m.symbol === symbol);
    
    // Store the previous state for potential revert
    if (asset) {
      setTransactionHistory(prev => [...prev, {
        type: "sell",
        asset,
        amount: saleValue,
        shares: sharesToSell,
        previousHolding: { ...holding },
      }]);
    }
    
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
  }, [holdings, marketData]);

  const revertLastTransaction = useCallback(() => {
    if (transactionHistory.length === 0) return null;
    
    const lastTx = transactionHistory[transactionHistory.length - 1];
    
    if (lastTx.type === "buy") {
      // Revert a buy: remove shares and refund credits
      if (lastTx.previousHolding) {
        // Had existing holding - restore it
        setHoldings(prev => prev.map(h => 
          h.symbol === lastTx.asset.symbol ? lastTx.previousHolding! : h
        ));
      } else {
        // Was a new holding - remove it entirely
        setHoldings(prev => prev.filter(h => h.symbol !== lastTx.asset.symbol));
      }
      setAvailableCredits(prev => prev + lastTx.amount);
    } else {
      // Revert a sell: restore the holding
      if (lastTx.previousHolding) {
        setHoldings(prev => {
          const existingIndex = prev.findIndex(h => h.symbol === lastTx.asset.symbol);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = lastTx.previousHolding!;
            return updated;
          } else {
            return [...prev, lastTx.previousHolding!];
          }
        });
        setAvailableCredits(prev => prev - lastTx.amount);
      }
    }
    
    // Remove the transaction from history
    setTransactionHistory(prev => prev.slice(0, -1));
    
    return lastTx;
  }, [transactionHistory]);

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
    transactionHistory,
    fetchMarketData,
    addInvestment,
    sellHolding,
    revertLastTransaction,
  };
};
