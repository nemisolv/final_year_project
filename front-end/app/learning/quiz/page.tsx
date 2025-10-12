"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Trophy,
  CheckCircle,
  XCircle,
  RotateCcw,
  ChevronRight,
  Timer,
  Target,
} from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
}

interface QuizResult {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
}

const SAMPLE_QUESTIONS: Question[] = [
  {
    id: "1",
    question: "Which sentence is grammatically correct?",
    options: [
      "She don't like coffee.",
      "She doesn't likes coffee.",
      "She doesn't like coffee.",
      "She not like coffee.",
    ],
    correctAnswer: 2,
    explanation: "Use 'doesn't' (does not) with third-person singular subjects, followed by the base form of the verb.",
    category: "Grammar",
  },
  {
    id: "2",
    question: "Choose the correct word: 'I have been living here _____ five years.'",
    options: ["since", "for", "from", "during"],
    correctAnswer: 1,
    explanation: "'For' is used with a period of time, while 'since' is used with a specific point in time.",
    category: "Prepositions",
  },
  {
    id: "3",
    question: "What is the past participle of 'break'?",
    options: ["breaked", "broke", "broken", "breaking"],
    correctAnswer: 2,
    explanation: "'Broken' is the past participle of 'break'. The verb forms are: break (present), broke (past), broken (past participle).",
    category: "Irregular Verbs",
  },
  {
    id: "4",
    question: "Which sentence uses the present perfect correctly?",
    options: [
      "I have saw that movie.",
      "I have seen that movie.",
      "I have see that movie.",
      "I has seen that movie.",
    ],
    correctAnswer: 1,
    explanation: "Present perfect uses 'have/has + past participle'. The past participle of 'see' is 'seen'.",
    category: "Verb Tenses",
  },
  {
    id: "5",
    question: "Complete the sentence: 'If I _____ rich, I would travel the world.'",
    options: ["am", "was", "were", "will be"],
    correctAnswer: 2,
    explanation: "Second conditional uses 'were' for all subjects, even 'I' and singular subjects.",
    category: "Conditionals",
  },
];

export default function QuizPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  const currentQuestion = SAMPLE_QUESTIONS[currentQuestionIndex];
  const totalQuestions = SAMPLE_QUESTIONS.length;

  const handleAnswerSelect = (answerIndex: number) => {
    if (!showExplanation) {
      setSelectedAnswer(answerIndex);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) {
      toast.error("Please select an answer");
      return;
    }

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const newResult: QuizResult = {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect,
    };

    setResults([...results, newResult]);
    setShowExplanation(true);

    if (isCorrect) {
      toast.success("Correct! Well done!");
    } else {
      toast.error("Incorrect. Check the explanation below.");
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Quiz completed
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      setQuizCompleted(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setResults([]);
    setShowExplanation(false);
    setQuizCompleted(false);
    setElapsedTime(0);
  };

  const correctAnswers = results.filter((r) => r.isCorrect).length;
  const score = Math.round((correctAnswers / totalQuestions) * 100);

  if (quizCompleted) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <Trophy className="h-12 w-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl">Quiz Completed!</CardTitle>
            <CardDescription>Here are your results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score */}
            <div className="text-center">
              <div className="text-6xl font-bold text-primary mb-2">{score}%</div>
              <p className="text-muted-foreground">
                {correctAnswers} out of {totalQuestions} correct
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-green-500" />
                  <span className="font-semibold">Accuracy</span>
                </div>
                <p className="text-2xl font-bold">{score}%</p>
              </div>
              <div className="bg-secondary rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Timer className="h-5 w-5 text-blue-500" />
                  <span className="font-semibold">Time</span>
                </div>
                <p className="text-2xl font-bold">{Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}</p>
              </div>
            </div>

            {/* Performance Message */}
            <div className="bg-secondary rounded-lg p-4">
              <p className="text-center font-medium">
                {score >= 80
                  ? "Excellent work! You have a strong understanding of the material."
                  : score >= 60
                  ? "Good job! Keep practicing to improve further."
                  : "Keep practicing! Review the explanations and try again."}
              </p>
            </div>

            {/* Detailed Results */}
            <div className="space-y-2">
              <h3 className="font-semibold mb-3">Question Results:</h3>
              {SAMPLE_QUESTIONS.map((question, index) => {
                const result = results[index];
                return (
                  <div
                    key={question.id}
                    className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {result.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium">Question {index + 1}</p>
                        <p className="text-sm text-muted-foreground">{question.category}</p>
                      </div>
                    </div>
                    <span className={result.isCorrect ? "text-green-500" : "text-red-500"}>
                      {result.isCorrect ? "Correct" : "Incorrect"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={handleRestartQuiz} className="flex-1">
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake Quiz
              </Button>
              <Button variant="outline" className="flex-1">
                Review Answers
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">English Quiz</h1>
        <p className="text-muted-foreground">Test your English knowledge with practice questions</p>
      </div>

      {/* Progress */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary rounded-full h-2 transition-all"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              {currentQuestion.category}
            </span>
            {results.length > 0 && (
              <span className="text-sm text-muted-foreground">
                Score: {correctAnswers}/{results.length}
              </span>
            )}
          </div>
          <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Options */}
          <RadioGroup
            value={selectedAnswer?.toString()}
            onValueChange={(value) => handleAnswerSelect(parseInt(value))}
          >
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQuestion.correctAnswer;
                const showCorrectAnswer = showExplanation && isCorrect;
                const showIncorrectAnswer = showExplanation && isSelected && !isCorrect;

                return (
                  <label
                    key={index}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      showCorrectAnswer
                        ? "border-green-500 bg-green-50 dark:bg-green-950"
                        : showIncorrectAnswer
                        ? "border-red-500 bg-red-50 dark:bg-red-950"
                        : isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    } ${showExplanation ? "cursor-not-allowed" : ""}`}
                  >
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} disabled={showExplanation} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                    {showCorrectAnswer && <CheckCircle className="h-5 w-5 text-green-500" />}
                    {showIncorrectAnswer && <XCircle className="h-5 w-5 text-red-500" />}
                  </label>
                );
              })}
            </div>
          </RadioGroup>

          {/* Explanation */}
          {showExplanation && (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Explanation
              </h4>
              <p className="text-sm">{currentQuestion.explanation}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {!showExplanation ? (
              <Button onClick={handleSubmitAnswer} className="flex-1" disabled={selectedAnswer === null}>
                Submit Answer
              </Button>
            ) : (
              <Button onClick={handleNextQuestion} className="flex-1">
                {currentQuestionIndex < totalQuestions - 1 ? (
                  <>
                    Next Question
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    View Results
                    <Trophy className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
