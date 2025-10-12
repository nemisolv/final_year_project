// components/marketing/interactive-quiz-card.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, RefreshCw, Sparkles, AlertTriangle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { marketingQuizQuestions, Question } from "@/data/random_questions_marketing";
import { Routes } from "@/config";

// --- Component phụ để hiển thị thông điệp lôi kéo ---
const QuizFeedback = ({
  isCorrect,
  difficulty,
  onNextQuestion,
}: {
  isCorrect: boolean;
  difficulty: 'easy' | 'hard';
  onNextQuestion: () => void;
}) => {
  let title = "";
  let message = "";

  // Logic marketing: Hiển thị thông điệp phù hợp
  if (isCorrect && difficulty === 'hard') {
    title = "Xuất sắc!";
    message = "Bạn có nền tảng rất tốt! Hãy khám phá lộ trình học để chinh phục những kiến thức nâng cao hơn nữa.";
  } else if (isCorrect && difficulty === 'easy') {
    title = "Chính xác!";
    message = "Làm tốt lắm! Bạn đã nắm vững kiến thức cơ bản. Cùng xem bạn làm được bao nhiêu câu nữa nhé.";
  } else if (!isCorrect && difficulty === 'easy') {
    title = "Đừng lo lắng!";
    message = "Đây là một lỗi sai rất phổ biến. Hệ thống của chúng tôi sẽ giúp bạn lấp đầy lỗ hổng kiến thức này một cách dễ dàng.";
  } else if (!isCorrect && difficulty === 'hard') {
    title = "Đây là một câu hỏi khó!";
    message = "Đừng nản lòng, đây là kiến thức nâng cao. Tham gia ngay để chinh phục những chủ đề phức tạp nhất!";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 p-4 rounded-lg bg-muted border"
    >
      <div className="flex items-center gap-3">
        {isCorrect ? <Sparkles className="h-6 w-6 text-green-500" /> : <AlertTriangle className="h-6 w-6 text-yellow-500" />}
        <h4 className="font-semibold text-lg">{title}</h4>
      </div>
      <p className="text-muted-foreground text-sm mt-2">{message}</p>
      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <button
          onClick={onNextQuestion}
          className="flex w-full sm:w-auto items-center justify-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-secondary/80 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Thử câu khác
        </button>
        <Link
          href={Routes.Dashboard} // Hướng người dùng đến trang đăng ký ( neu dang ki roi thi chuyen dang trang quan li)
          className="flex w-full sm:w-auto items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Bắt đầu học ngay
        </Link>
      </div>
    </motion.div>
  );
};

// --- Component chính ---
export const InteractiveQuizCard = () => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const loadRandomQuestion = useCallback(() => {
    const availableQuestions = marketingQuizQuestions.filter(
      (q) => q.id !== currentQuestion?.id
    );
    const questionsPool = availableQuestions.length > 0 ? availableQuestions : marketingQuizQuestions;
    const randomIndex = Math.floor(Math.random() * questionsPool.length);
    
    setCurrentQuestion(questionsPool[randomIndex]);
    setHasAnswered(false);
    setSelectedOptionId(null);
  }, [currentQuestion]);

  useEffect(() => {
    if (!currentQuestion) {
      loadRandomQuestion();
    }
  }, [currentQuestion, loadRandomQuestion]);

  const handleAnswerClick = (optionId: string) => {
    if (hasAnswered) return;
    setHasAnswered(true);
    setSelectedOptionId(optionId);
  };
  
  if (!currentQuestion) {
    return <div className="h-[450px] w-full bg-card rounded-2xl flex items-center justify-center">Đang tải câu hỏi...</div>;
  }

  const isCorrect = selectedOptionId === currentQuestion.correctOptionId;

  return (
    <div className="relative">
      {/* Khung bên ngoài, chỉ animate 1 lần duy nhất */}
      <motion.div
        className="relative isolate overflow-hidden rounded-2xl border bg-card p-6 sm:p-8"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Các phần tử tĩnh được giữ nguyên */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Bài học hôm nay</h3>
              <p className="text-sm text-muted-foreground">{currentQuestion.lessonTitle}</p>
            </div>
          </div>
          <div className="hidden sm:block rounded-full border px-3 py-1 text-xs text-muted-foreground">AI Powered</div>
        </div>

        {/* Bọc các phần tử động bằng AnimatePresence để tạo hiệu ứng chuyển cảnh */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id} // Quan trọng: key thay đổi sẽ kích hoạt animation
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Tất cả nội dung động nằm trong div này */}
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <motion.div className="rounded-lg border p-4" whileHover={{ scale: hasAnswered ? 1 : 1.01 }}>
                <p className="text-sm text-muted-foreground mb-2">Câu hỏi</p>
                <p className="font-medium">{currentQuestion.questionText}</p>
              </motion.div>
              <motion.div className="rounded-lg border p-4 hidden sm:flex items-center justify-center">
                <Image src="/globe.svg" alt="Illustration" width={150} height={150} className="mx-auto opacity-90" />
              </motion.div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedOptionId === option.id;
                const isCorrectOption = currentQuestion.correctOptionId === option.id;

                return (
                  <motion.button
                    key={option.id}
                    onClick={() => handleAnswerClick(option.id)}
                    disabled={hasAnswered}
                    whileHover={{ scale: hasAnswered ? 1 : 1.02 }}
                    className={cn(
                      "py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-300 text-left",
                      "bg-muted text-muted-foreground",
                      hasAnswered && isCorrectOption && "bg-green-500/20 text-green-600 border border-green-500/30",
                      hasAnswered && isSelected && !isCorrectOption && "bg-red-500/20 text-red-600 border border-red-500/30",
                      !hasAnswered && "hover:bg-accent"
                    )}
                  >
                    {option.text}
                  </motion.button>
                );
              })}
            </div>
            
            {hasAnswered && (
              <QuizFeedback
                isCorrect={isCorrect}
                difficulty={currentQuestion.difficulty}
                onNextQuestion={loadRandomQuestion}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};