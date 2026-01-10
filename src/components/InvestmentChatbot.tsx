import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  TrendingUp, 
  TrendingDown,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  RotateCcw,
  Clock
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Holding, MarketAsset } from "@/hooks/useMarketData";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface InvestmentChatbotProps {
  holdings: Holding[];
  marketData: MarketAsset[];
  totalPortfolioValue: number;
  availableCredits: number;
  lastTransaction?: {
    type: "buy" | "sell";
    asset: string;
    amount: number;
    shares: number;
  } | null;
}

const InvestmentChatbot = ({
  holdings,
  marketData,
  totalPortfolioValue,
  availableCredits,
  lastTransaction,
}: InvestmentChatbotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "bot",
      content: "👋 Hi! I'm your AI investment advisor. I'll provide suggestions after each investment to help you build a balanced portfolio. How can I help you today?",
      timestamp: new Date(),
      suggestions: ["Analyze my portfolio", "What should I invest in?", "Market overview", "Revert a decision"],
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isReverting, setIsReverting] = useState(false);
  const [revertComplete, setRevertComplete] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevTransactionRef = useRef<typeof lastTransaction>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // React to new transactions
  useEffect(() => {
    if (lastTransaction && lastTransaction !== prevTransactionRef.current) {
      prevTransactionRef.current = lastTransaction;
      generateTransactionAdvice(lastTransaction);
      if (!isOpen) setIsOpen(true);
    }
  }, [lastTransaction]);

  const generateTransactionAdvice = (transaction: NonNullable<typeof lastTransaction>) => {
    setIsTyping(true);
    
    setTimeout(() => {
      const advice = generateAIAdvice(transaction);
      const newMessage: Message = {
        id: Date.now().toString(),
        type: "bot",
        content: advice.message,
        timestamp: new Date(),
        suggestions: advice.suggestions,
      };
      setMessages(prev => [...prev, newMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIAdvice = (transaction: NonNullable<typeof lastTransaction>) => {
    const { type, asset, amount, shares } = transaction;
    const holding = holdings.find(h => h.symbol === asset);
    const marketAsset = marketData.find(m => m.symbol === asset);
    
    // Calculate portfolio metrics
    const stocksValue = holdings.filter(h => h.category === "stocks").reduce((sum, h) => sum + h.value, 0);
    const cryptoValue = holdings.filter(h => h.category === "crypto").reduce((sum, h) => sum + h.value, 0);
    const etfValue = holdings.filter(h => h.category === "etf").reduce((sum, h) => sum + h.value, 0);
    const otherValue = totalPortfolioValue - stocksValue - cryptoValue - etfValue;
    
    const stocksPercent = totalPortfolioValue > 0 ? (stocksValue / totalPortfolioValue) * 100 : 0;
    const cryptoPercent = totalPortfolioValue > 0 ? (cryptoValue / totalPortfolioValue) * 100 : 0;
    const etfPercent = totalPortfolioValue > 0 ? (etfValue / totalPortfolioValue) * 100 : 0;
    
    let message = "";
    let suggestions: string[] = [];

    if (type === "buy") {
      message = `✅ **Great investment!** You bought ${shares.toFixed(4)} shares of ${asset} for $${amount.toFixed(2)}.\n\n`;
      
      // Analyze the investment
      if (marketAsset) {
        if (marketAsset.change24h > 0) {
          message += `📈 ${asset} is up ${marketAsset.change24h.toFixed(2)}% today - you're riding the momentum!\n\n`;
        } else {
          message += `📉 ${asset} is down ${Math.abs(marketAsset.change24h).toFixed(2)}% today - could be a good entry point for long-term gains.\n\n`;
        }
      }

      // Portfolio balance advice
      if (cryptoPercent > 40) {
        message += `⚠️ **Diversification Alert:** Your crypto allocation is ${cryptoPercent.toFixed(1)}%. Consider balancing with more stable assets like ETFs or bonds.`;
        suggestions = ["Show me stable investments", "Why diversify?", "Rebalance tips"];
      } else if (stocksPercent > 60) {
        message += `💡 **Tip:** Your stock allocation is ${stocksPercent.toFixed(1)}%. Consider adding some ETFs for broader market exposure.`;
        suggestions = ["Explore ETFs", "What are ETFs?", "Portfolio analysis"];
      } else if (holdings.length === 1) {
        message += `🎯 **Next Step:** Great start! Consider diversifying across different asset classes to reduce risk.`;
        suggestions = ["Diversification strategies", "Suggested investments", "Risk management"];
      } else if (availableCredits > 5000) {
        message += `💰 You have $${availableCredits.toLocaleString()} available. Consider putting more of your capital to work!`;
        suggestions = ["Investment opportunities", "How much to invest?", "Market trends"];
      } else {
        message += `✨ Nice balanced move! Your portfolio is looking diversified.`;
        suggestions = ["Portfolio review", "Market outlook", "Optimize returns"];
      }
    } else {
      // Sell transaction
      message = `💵 **Sale Complete!** You sold ${shares.toFixed(4)} shares of ${asset} for $${amount.toFixed(2)}.\n\n`;
      
      if (holding && holding.profitLoss > 0) {
        message += `🎉 Great timing! You locked in profits on this position.\n\n`;
      } else if (holding) {
        message += `📊 Sometimes cutting losses is the smart move. Free up capital for better opportunities.\n\n`;
      }
      
      message += `💡 **Reinvestment Ideas:** With your available credits now at $${availableCredits.toLocaleString()}, consider rebalancing or exploring new opportunities.`;
      suggestions = ["Where to reinvest?", "Market opportunities", "Portfolio rebalance"];
    }

    return { message, suggestions };
  };

  const handleUserMessage = (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const response = generateResponse(content);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: response.message,
        timestamp: new Date(),
        suggestions: response.suggestions,
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const generateResponse = (query: string): { message: string; suggestions: string[] } => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes("portfolio") || lowerQuery.includes("analyze")) {
      const topHolding = holdings.sort((a, b) => b.value - a.value)[0];
      const profitableCount = holdings.filter(h => h.profitLoss > 0).length;
      
      return {
        message: `📊 **Portfolio Analysis:**\n\n` +
          `• Total Value: $${totalPortfolioValue.toLocaleString()}\n` +
          `• Holdings: ${holdings.length} assets\n` +
          `• Profitable: ${profitableCount}/${holdings.length}\n` +
          `• Available: $${availableCredits.toLocaleString()}\n\n` +
          (topHolding ? `Your largest position is ${topHolding.symbol} at $${topHolding.value.toFixed(2)}.` : "Start investing to build your portfolio!"),
        suggestions: ["Improve my portfolio", "Risk assessment", "Top opportunities"],
      };
    }
    
    if (lowerQuery.includes("invest") || lowerQuery.includes("buy") || lowerQuery.includes("should")) {
      const opportunities = marketData
        .filter(m => m.change24h < -1)
        .slice(0, 3);
      
      if (opportunities.length > 0) {
        return {
          message: `🎯 **Investment Opportunities:**\n\n` +
            opportunities.map(o => `• **${o.symbol}** (${o.name}): Down ${Math.abs(o.change24h).toFixed(2)}% - potential buying opportunity`).join("\n") +
            `\n\n💡 Remember: Past performance doesn't guarantee future results. Diversify your investments!`,
          suggestions: ["More opportunities", "Safe investments", "High growth options"],
        };
      }
      
      return {
        message: `📈 **Current Market Outlook:**\n\nThe market is showing mixed signals. Consider:\n\n• **ETFs** for broad exposure\n• **Bonds** for stability\n• **Blue-chip stocks** for long-term growth\n\nYour available credits: $${availableCredits.toLocaleString()}`,
        suggestions: ["Show me ETFs", "Conservative options", "Growth stocks"],
      };
    }
    
    if (lowerQuery.includes("market") || lowerQuery.includes("overview") || lowerQuery.includes("trend")) {
      const gainers = marketData.filter(m => m.change24h > 0).length;
      const losers = marketData.filter(m => m.change24h < 0).length;
      const topGainer = [...marketData].sort((a, b) => b.change24h - a.change24h)[0];
      
      return {
        message: `📈 **Market Overview:**\n\n` +
          `• Gainers: ${gainers} assets\n` +
          `• Losers: ${losers} assets\n\n` +
          (topGainer ? `🏆 Top performer: **${topGainer.symbol}** +${topGainer.change24h.toFixed(2)}%` : "") +
          `\n\n💡 Markets are dynamic. Keep an eye on your positions!`,
        suggestions: ["Top gainers", "Top losers", "Sector analysis"],
      };
    }
    
    if (lowerQuery.includes("diversif") || lowerQuery.includes("balance") || lowerQuery.includes("rebalance")) {
      return {
        message: `⚖️ **Diversification Tips:**\n\n` +
          `A balanced portfolio typically includes:\n\n` +
          `• **40-60%** Stocks/ETFs\n` +
          `• **20-30%** Bonds/FDs\n` +
          `• **10-20%** Crypto (higher risk)\n` +
          `• **5-10%** Commodities\n\n` +
          `This helps reduce risk while maintaining growth potential.`,
        suggestions: ["Check my balance", "Rebalance now", "Risk tolerance"],
      };
    }
    
    if (lowerQuery.includes("risk")) {
      const cryptoPercent = holdings.filter(h => h.category === "crypto").reduce((sum, h) => sum + h.value, 0) / totalPortfolioValue * 100;
      const riskLevel = cryptoPercent > 30 ? "High" : cryptoPercent > 15 ? "Medium" : "Low";
      
      return {
        message: `⚠️ **Risk Assessment:**\n\n` +
          `Your portfolio risk level: **${riskLevel}**\n\n` +
          `• Crypto allocation: ${cryptoPercent.toFixed(1)}%\n\n` +
          (riskLevel === "High" ? "Consider reducing volatile positions for more stability." : "Your risk profile looks reasonable. Keep monitoring your positions."),
        suggestions: ["Reduce risk", "Risk-reward balance", "Safe haven assets"],
      };
    }

    if (lowerQuery.includes("revert") || lowerQuery.includes("undo") || lowerQuery.includes("change decision")) {
      return {
        message: `⏪ **Time Travel Mode**\n\nWant to go back in time and change a past investment decision?\n\nClick the button below to activate the time reversal feature!`,
        suggestions: ["🕐 Activate Time Reversal", "Cancel"],
      };
    }

    if (lowerQuery.includes("activate time reversal")) {
      triggerRevertAnimation();
      return {
        message: "",
        suggestions: [],
      };
    }
    
    return {
      message: `I'm here to help with your investment decisions! I can:\n\n` +
        `• 📊 Analyze your portfolio\n` +
        `• 🎯 Suggest investments\n` +
        `• 📈 Provide market overview\n` +
        `• ⚖️ Help with diversification\n` +
        `• ⏪ Revert past decisions\n\n` +
        `What would you like to know?`,
      suggestions: ["Portfolio analysis", "Investment ideas", "Market trends", "Revert a decision"],
    };
  };

  const triggerRevertAnimation = () => {
    setIsReverting(true);
    setIsTyping(false);
    
    // After animation completes, show the completion message
    setTimeout(() => {
      setIsReverting(false);
      setRevertComplete(true);
      
      const completionMessage: Message = {
        id: Date.now().toString(),
        type: "bot",
        content: `✨ **Time Reversal Complete!**\n\n🎉 You've successfully traveled back in time!\n\nYou can now change your past investment decision. Head to your portfolio and make a different choice - the timeline is yours to rewrite!\n\n💡 Remember: With great power comes great responsibility. Choose wisely this time!`,
        timestamp: new Date(),
        suggestions: ["View my portfolio", "Investment tips", "What changed?"],
      };
      setMessages(prev => [...prev, completionMessage]);
      
      setTimeout(() => setRevertComplete(false), 3000);
    }, 3500);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-border bg-secondary/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground">Investment Advisor</h3>
                  <p className="text-xs text-muted-foreground">AI-powered suggestions</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="h-[350px] p-4" ref={scrollRef}>
              <div className="space-y-4">
                <AnimatePresence>
                  {isReverting && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-10 flex items-center justify-center bg-background/95 backdrop-blur-sm"
                    >
                      <div className="text-center space-y-6">
                        <motion.div
                          animate={{ 
                            rotate: -360,
                            scale: [1, 1.2, 1],
                          }}
                          transition={{ 
                            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                            scale: { duration: 1, repeat: Infinity }
                          }}
                          className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center"
                        >
                          <RotateCcw className="w-10 h-10 text-primary" />
                        </motion.div>
                        
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <h3 className="text-lg font-semibold text-foreground mb-2">Reversing Time...</h3>
                          <p className="text-sm text-muted-foreground">Traveling back to your past decision</p>
                        </motion.div>
                        
                        <motion.div className="flex justify-center gap-2">
                          {[0, 1, 2, 3, 4].map((i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0.3 }}
                              animate={{ 
                                opacity: [0.3, 1, 0.3],
                                scale: [1, 1.2, 1]
                              }}
                              transition={{ 
                                duration: 0.5, 
                                delay: i * 0.1,
                                repeat: Infinity,
                                repeatDelay: 0.5
                              }}
                              className="w-3 h-3 rounded-full bg-primary"
                            />
                          ))}
                        </motion.div>

                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 3, ease: "easeInOut" }}
                          className="h-1 bg-primary rounded-full mx-auto max-w-[200px]"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        msg.type === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {msg.suggestions.map((suggestion, i) => (
                            <button
                              key={i}
                              onClick={() => handleUserMessage(suggestion)}
                              className="text-xs px-3 py-1.5 rounded-full bg-background/50 hover:bg-background text-foreground transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-secondary rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border bg-background">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (inputValue.trim()) {
                    handleUserMessage(inputValue.trim());
                  }
                }}
                className="flex gap-2"
              >
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about investments..."
                  className="flex-1 bg-secondary border-0"
                />
                <Button type="submit" size="icon" disabled={!inputValue.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default InvestmentChatbot;
