import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coins,
  Loader2,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface CourseSection {
  title: string;
  content: string;
  keyPoints: string[];
}

interface CourseContent {
  introduction: string;
  sections: CourseSection[];
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
  }[];
  summary: string;
}

// Simulated course data that would come from Gemini API
const courseDatabase: Record<string, CourseContent> = {
  "budgeting-basics": {
    introduction:
      "Welcome to Budgeting Basics! This module will teach you how to create a personal budget that aligns with your financial goals. A budget is the foundation of financial success, giving you control over where your money goes each month.",
    sections: [
      {
        title: "What is a Budget?",
        content:
          "A budget is a financial plan that outlines your expected income and expenses over a specific period, typically a month. It helps you understand where your money is going and ensures you're living within your means.",
        keyPoints: [
          "Track all sources of income",
          "Categorize your expenses (needs vs wants)",
          "Set realistic spending limits",
          "Review and adjust regularly",
        ],
      },
      {
        title: "The 50/30/20 Rule",
        content:
          "One popular budgeting method is the 50/30/20 rule. This simple framework suggests allocating 50% of your income to needs, 30% to wants, and 20% to savings and debt repayment.",
        keyPoints: [
          "50% for needs: rent, utilities, groceries, insurance",
          "30% for wants: entertainment, dining out, hobbies",
          "20% for savings: emergency fund, investments, debt payoff",
        ],
      },
      {
        title: "Creating Your First Budget",
        content:
          "Start by listing all your income sources, then track your spending for a month to understand your habits. Use categories like housing, transportation, food, and entertainment to organize expenses.",
        keyPoints: [
          "Use budgeting apps or spreadsheets",
          "Include irregular expenses (annual subscriptions, gifts)",
          "Build in a buffer for unexpected costs",
          "Automate savings transfers",
        ],
      },
    ],
    quiz: [
      {
        question: "What percentage should go to needs according to the 50/30/20 rule?",
        options: ["30%", "50%", "20%", "40%"],
        correctIndex: 1,
      },
      {
        question: "Which of these is considered a 'need' in budgeting?",
        options: ["Netflix subscription", "Dining out", "Rent", "Concert tickets"],
        correctIndex: 2,
      },
    ],
    summary:
      "Congratulations! You've learned the fundamentals of budgeting. Remember: a budget isn't about restriction—it's about giving every dollar a purpose and taking control of your financial future.",
  },
  "emergency-fund-strategy": {
    introduction:
      "An emergency fund is your financial safety net. This module will teach you how to build and maintain a fund that protects you from life's unexpected challenges.",
    sections: [
      {
        title: "Why You Need an Emergency Fund",
        content:
          "Life is unpredictable. Job loss, medical emergencies, or major repairs can happen at any time. An emergency fund prevents you from going into debt when the unexpected occurs.",
        keyPoints: [
          "Protects against job loss",
          "Covers unexpected medical bills",
          "Handles emergency home or car repairs",
          "Provides peace of mind",
        ],
      },
      {
        title: "How Much Should You Save?",
        content:
          "Financial experts recommend saving 3-6 months of living expenses. If you have variable income or are self-employed, aim for 6-12 months.",
        keyPoints: [
          "Calculate your monthly essential expenses",
          "Multiply by 3-6 (or more for variable income)",
          "Start with a $1,000 mini emergency fund",
          "Build up gradually over time",
        ],
      },
      {
        title: "Where to Keep Your Emergency Fund",
        content:
          "Your emergency fund should be easily accessible but separate from your regular checking account. A high-yield savings account is ideal.",
        keyPoints: [
          "High-yield savings accounts offer better interest",
          "Keep it separate to avoid temptation",
          "Ensure FDIC/NCUA insurance",
          "Consider a money market account",
        ],
      },
    ],
    quiz: [
      {
        question: "How many months of expenses should an emergency fund cover?",
        options: ["1-2 months", "3-6 months", "12-24 months", "Just $100"],
        correctIndex: 1,
      },
    ],
    summary:
      "You now understand the importance of an emergency fund and how to build one. Start small, stay consistent, and you'll have a solid safety net before you know it!",
  },
  "credit-score-mastery": {
    introduction:
      "Your credit score is a three-digit number that can significantly impact your financial life. Learn what affects your score and how to improve it.",
    sections: [
      {
        title: "Understanding Credit Scores",
        content:
          "Credit scores range from 300 to 850. They're used by lenders to determine your creditworthiness. A higher score means better interest rates and more financial opportunities.",
        keyPoints: [
          "Excellent: 750-850",
          "Good: 700-749",
          "Fair: 650-699",
          "Poor: Below 650",
        ],
      },
      {
        title: "Factors That Affect Your Score",
        content:
          "Your credit score is calculated based on five main factors, each weighted differently in the overall calculation.",
        keyPoints: [
          "Payment history (35%)",
          "Credit utilization (30%)",
          "Length of credit history (15%)",
          "Credit mix (10%)",
          "New credit inquiries (10%)",
        ],
      },
      {
        title: "Strategies to Improve Your Score",
        content:
          "Improving your credit score takes time, but consistent good habits will pay off. Focus on the factors that have the biggest impact.",
        keyPoints: [
          "Always pay bills on time",
          "Keep credit utilization below 30%",
          "Don't close old credit accounts",
          "Limit hard credit inquiries",
        ],
      },
    ],
    quiz: [
      {
        question: "What factor has the biggest impact on your credit score?",
        options: ["Credit mix", "Payment history", "New credit", "Length of history"],
        correctIndex: 1,
      },
    ],
    summary:
      "Mastering your credit score is key to unlocking better financial opportunities. Keep paying on time, manage your utilization, and watch your score climb!",
  },
  "introduction-to-stocks": {
    introduction:
      "Welcome to the stock market! This module introduces you to how stocks work, why companies issue them, and how you can start investing.",
    sections: [
      {
        title: "What Are Stocks?",
        content:
          "When you buy a stock, you're purchasing a small piece of ownership in a company. As the company grows and becomes more valuable, so does your investment.",
        keyPoints: [
          "Stocks represent company ownership",
          "Stock prices fluctuate based on supply and demand",
          "You can earn through price appreciation and dividends",
          "Stocks are traded on exchanges like NYSE and NASDAQ",
        ],
      },
      {
        title: "Types of Stocks",
        content:
          "Not all stocks are created equal. Understanding the different types helps you build a diversified portfolio.",
        keyPoints: [
          "Growth stocks: High potential but more volatile",
          "Value stocks: Undervalued companies with solid fundamentals",
          "Dividend stocks: Regular income through dividend payments",
          "Blue-chip stocks: Large, established companies",
        ],
      },
      {
        title: "Getting Started with Investing",
        content:
          "You don't need thousands of dollars to start investing. Many brokerages offer fractional shares, allowing you to invest with as little as $1.",
        keyPoints: [
          "Open a brokerage account",
          "Start with index funds or ETFs for diversification",
          "Invest consistently (dollar-cost averaging)",
          "Think long-term, don't panic sell",
        ],
      },
    ],
    quiz: [
      {
        question: "What do you own when you buy a stock?",
        options: ["A loan to the company", "A piece of the company", "A bond", "Nothing"],
        correctIndex: 1,
      },
    ],
    summary:
      "Congratulations on taking your first steps into stock market investing! Remember: invest for the long term, diversify your holdings, and keep learning.",
  },
};

const moduleInfo: Record<string, { title: string; duration: string; reward: number; difficulty: number }> = {
  "budgeting-basics": { title: "Budgeting Basics", duration: "15 min", reward: 500, difficulty: 1 },
  "emergency-fund-strategy": { title: "Emergency Fund Strategy", duration: "20 min", reward: 750, difficulty: 1 },
  "credit-score-mastery": { title: "Credit Score Mastery", duration: "25 min", reward: 1000, difficulty: 2 },
  "introduction-to-stocks": { title: "Introduction to Stocks", duration: "30 min", reward: 1500, difficulty: 2 },
  "risk-management": { title: "Risk Management", duration: "35 min", reward: 2000, difficulty: 3 },
  "portfolio-diversification": { title: "Portfolio Diversification", duration: "40 min", reward: 2500, difficulty: 3 },
};

const CoursePage = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Initializing AI...");
  const [courseContent, setCourseContent] = useState<CourseContent | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [courseCompleted, setCourseCompleted] = useState(false);

  const module = moduleId ? moduleInfo[moduleId] : null;

  // Simulate AI content generation
  useEffect(() => {
    if (!moduleId) return;

    const loadingMessages = [
      "Initializing AI...",
      "Analyzing course topic...",
      "Generating personalized content...",
      "Preparing interactive elements...",
      "Finalizing course material...",
    ];

    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      messageIndex++;
      if (messageIndex < loadingMessages.length) {
        setLoadingMessage(loadingMessages[messageIndex]);
      }
    }, 600);

    // Simulate API fetch delay
    const fetchTimeout = setTimeout(() => {
      clearInterval(messageInterval);
      const content = courseDatabase[moduleId];
      if (content) {
        setCourseContent(content);
      } else {
        // Generate placeholder for locked/unavailable courses
        setCourseContent({
          introduction: `Welcome to ${module?.title || "this course"}! This AI-generated content will help you master this topic.`,
          sections: [
            {
              title: "Coming Soon",
              content: "This course content is being prepared. Check back soon for full AI-generated lessons.",
              keyPoints: ["Content in development", "AI-powered learning", "Interactive quizzes coming"],
            },
          ],
          quiz: [],
          summary: "Thank you for your interest! Full content coming soon.",
        });
      }
      setIsLoading(false);
    }, 3000);

    return () => {
      clearInterval(messageInterval);
      clearTimeout(fetchTimeout);
    };
  }, [moduleId, module?.title]);

  const handleSectionComplete = () => {
    if (!completedSections.includes(currentSection)) {
      setCompletedSections([...completedSections, currentSection]);
    }

    if (courseContent && currentSection < courseContent.sections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      setShowQuiz(true);
    }
  };

  const handleQuizSubmit = () => {
    if (!courseContent) return;

    const correctAnswers = courseContent.quiz.filter(
      (q, i) => quizAnswers[i] === q.correctIndex
    ).length;

    setQuizSubmitted(true);

    if (correctAnswers === courseContent.quiz.length) {
      setCourseCompleted(true);
      toast({
        title: "Perfect Score! 🎉",
        description: `You earned ${module?.reward || 0} credits!`,
      });
    } else if (correctAnswers >= courseContent.quiz.length / 2) {
      setCourseCompleted(true);
      toast({
        title: "Course Completed!",
        description: `You got ${correctAnswers}/${courseContent.quiz.length} correct and earned ${module?.reward || 0} credits!`,
      });
    } else {
      toast({
        title: "Keep Learning!",
        description: `You got ${correctAnswers}/${courseContent.quiz.length} correct. Review the material and try again.`,
        variant: "destructive",
      });
    }
  };

  const progress = courseContent
    ? ((completedSections.length + (showQuiz ? 1 : 0)) / (courseContent.sections.length + 1)) * 100
    : 0;

  if (!module) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Course Not Found</h1>
          <Button onClick={() => navigate("/learn")}>Back to Modules</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/learn")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Modules
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {module.duration}
              <div className="flex items-center gap-1 ml-3">
                <Coins className="w-4 h-4 text-gold" />
                <span className="font-semibold text-gold">+{module.reward}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <h1 className="font-display text-xl font-bold text-foreground">{module.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Progress value={progress} className="h-2 flex-1" />
                <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <AnimatePresence mode="wait">
          {/* Loading State */}
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary mb-6"
              />
              <div className="flex items-center gap-2 text-primary mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold">AI Generating Course Content</span>
              </div>
              <motion.p
                key={loadingMessage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-muted-foreground"
              >
                {loadingMessage}
              </motion.p>
            </motion.div>
          )}

          {/* Course Completed */}
          {!isLoading && courseCompleted && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Trophy className="w-12 h-12 text-primary" />
              </motion.div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Course Completed!</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {courseContent?.summary}
              </p>
              <div className="flex items-center justify-center gap-2 text-2xl font-bold text-gold mb-8">
                <Coins className="w-8 h-8" />
                +{module.reward} Credits Earned
              </div>
              <Button onClick={() => navigate("/learn")} size="lg">
                Continue Learning
              </Button>
            </motion.div>
          )}

          {/* Course Content */}
          {!isLoading && !courseCompleted && courseContent && (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Navigation Tabs */}
              <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                {courseContent.sections.map((section, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (index <= Math.max(...completedSections, 0) || index === 0) {
                        setCurrentSection(index);
                        setShowQuiz(false);
                      }
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      currentSection === index && !showQuiz
                        ? "bg-primary text-primary-foreground"
                        : completedSections.includes(index)
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {completedSections.includes(index) ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <span className="w-4 h-4 flex items-center justify-center text-xs">
                        {index + 1}
                      </span>
                    )}
                    {section.title}
                  </button>
                ))}
                <button
                  onClick={() => {
                    if (completedSections.length === courseContent.sections.length) {
                      setShowQuiz(true);
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    showQuiz
                      ? "bg-primary text-primary-foreground"
                      : completedSections.length === courseContent.sections.length
                      ? "bg-secondary text-foreground"
                      : "bg-secondary/50 text-muted-foreground"
                  }`}
                >
                  <Star className="w-4 h-4" />
                  Quiz
                </button>
              </div>

              {/* Introduction */}
              {currentSection === 0 && !showQuiz && completedSections.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-8"
                >
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">AI-Generated Overview</h3>
                      <p className="text-muted-foreground">{courseContent.introduction}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Section Content */}
              {!showQuiz && (
                <motion.div
                  key={currentSection}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-card border border-border rounded-xl p-8"
                >
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    {courseContent.sections[currentSection].title}
                  </h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {courseContent.sections[currentSection].content}
                  </p>

                  <div className="bg-secondary/50 rounded-lg p-6 mb-8">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      Key Takeaways
                    </h4>
                    <ul className="space-y-2">
                      {courseContent.sections[currentSection].keyPoints.map((point, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-start gap-2 text-muted-foreground"
                        >
                          <ChevronRight className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                          {point}
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSectionComplete} size="lg">
                      {currentSection < courseContent.sections.length - 1
                        ? "Continue to Next Section"
                        : "Proceed to Quiz"}
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Quiz */}
              {showQuiz && courseContent.quiz.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-card border border-border rounded-xl p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Star className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Knowledge Check</h2>
                      <p className="text-sm text-muted-foreground">
                        Answer the questions to complete this module
                      </p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {courseContent.quiz.map((q, qIndex) => (
                      <div key={qIndex} className="border-b border-border pb-6 last:border-0">
                        <p className="font-medium text-foreground mb-4">
                          {qIndex + 1}. {q.question}
                        </p>
                        <div className="grid gap-2">
                          {q.options.map((option, oIndex) => {
                            const isSelected = quizAnswers[qIndex] === oIndex;
                            const isCorrect = quizSubmitted && q.correctIndex === oIndex;
                            const isWrong = quizSubmitted && isSelected && !isCorrect;

                            return (
                              <button
                                key={oIndex}
                                onClick={() => {
                                  if (!quizSubmitted) {
                                    const newAnswers = [...quizAnswers];
                                    newAnswers[qIndex] = oIndex;
                                    setQuizAnswers(newAnswers);
                                  }
                                }}
                                disabled={quizSubmitted}
                                className={`text-left px-4 py-3 rounded-lg border transition-all ${
                                  isCorrect
                                    ? "border-green-500 bg-green-500/10 text-green-500"
                                    : isWrong
                                    ? "border-red-500 bg-red-500/10 text-red-500"
                                    : isSelected
                                    ? "border-primary bg-primary/10 text-foreground"
                                    : "border-border hover:border-primary/50 text-muted-foreground"
                                }`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {!quizSubmitted ? (
                    <Button
                      onClick={handleQuizSubmit}
                      size="lg"
                      className="w-full mt-6"
                      disabled={quizAnswers.length !== courseContent.quiz.length}
                    >
                      Submit Answers
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        if (courseCompleted) {
                          navigate("/learn");
                        } else {
                          setQuizSubmitted(false);
                          setQuizAnswers([]);
                          setShowQuiz(false);
                          setCurrentSection(0);
                          setCompletedSections([]);
                        }
                      }}
                      size="lg"
                      className="w-full mt-6"
                    >
                      {courseCompleted ? "Continue Learning" : "Review Material"}
                    </Button>
                  )}
                </motion.div>
              )}

              {/* Empty Quiz State */}
              {showQuiz && courseContent.quiz.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-foreground mb-2">Section Complete!</h2>
                  <p className="text-muted-foreground mb-6">
                    Quiz coming soon. You've earned your credits!
                  </p>
                  <Button onClick={() => setCourseCompleted(true)}>
                    Complete Course
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default CoursePage;
