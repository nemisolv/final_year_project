"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Search, ChevronRight, CheckCircle, Clock, Star, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { grammarService, type GrammarCheckResponse } from "@/services/grammar.service";

interface GrammarTopic {
  id: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  duration: string;
  lessons: number;
  completed: boolean;
  progress: number;
}

const GRAMMAR_TOPICS: GrammarTopic[] = [
  {
    id: "1",
    title: "Present Simple Tense",
    level: "Beginner",
    description: "Learn the basics of present simple tense, including affirmative, negative, and question forms.",
    duration: "30 min",
    lessons: 5,
    completed: false,
    progress: 0,
  },
  {
    id: "2",
    title: "Past Simple Tense",
    level: "Beginner",
    description: "Master the past simple tense with regular and irregular verbs.",
    duration: "35 min",
    lessons: 6,
    completed: false,
    progress: 0,
  },
  {
    id: "3",
    title: "Present Continuous",
    level: "Beginner",
    description: "Understand when and how to use present continuous tense.",
    duration: "25 min",
    lessons: 4,
    completed: true,
    progress: 100,
  },
  {
    id: "4",
    title: "Modal Verbs",
    level: "Intermediate",
    description: "Learn about modal verbs: can, could, should, would, must, and their usage.",
    duration: "45 min",
    lessons: 7,
    completed: false,
    progress: 30,
  },
  {
    id: "5",
    title: "Conditional Sentences",
    level: "Intermediate",
    description: "Master zero, first, second, and third conditional sentences.",
    duration: "50 min",
    lessons: 8,
    completed: false,
    progress: 0,
  },
  {
    id: "6",
    title: "Passive Voice",
    level: "Intermediate",
    description: "Understand how to form and use passive voice in different tenses.",
    duration: "40 min",
    lessons: 6,
    completed: false,
    progress: 60,
  },
  {
    id: "7",
    title: "Reported Speech",
    level: "Advanced",
    description: "Learn how to report what someone else has said in various contexts.",
    duration: "55 min",
    lessons: 9,
    completed: false,
    progress: 0,
  },
  {
    id: "8",
    title: "Subjunctive Mood",
    level: "Advanced",
    description: "Master the subjunctive mood for hypothetical and formal situations.",
    duration: "60 min",
    lessons: 10,
    completed: false,
    progress: 0,
  },
];

export default function GrammarPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("All");

  // Grammar Checker State
  const [inputText, setInputText] = useState("");
  const [checkResult, setCheckResult] = useState<GrammarCheckResponse | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const filteredTopics = GRAMMAR_TOPICS.filter((topic) => {
    const matchesSearch =
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === "All" || topic.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const handleStartLesson = (_topicId: string) => {
    // TODO: Navigate to lesson detail page
    toast.info("Lesson detail page will be implemented");
  };

  const handleCheckGrammar = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter some text to check");
      return;
    }

    setIsChecking(true);
    try {
      const result = await grammarService.check(inputText);
      setCheckResult(result);
      if (result.errors.length === 0) {
        toast.success("Great! No grammar errors found.");
      } else {
        toast.info(`Found ${result.errors.length} grammar issue${result.errors.length > 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error("Grammar check error:", error);
      toast.error("Failed to check grammar. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  const highlightErrors = (text: string, errors: GrammarCheckResponse['errors']) => {
    if (!errors || errors.length === 0) return [];

    const parts: { text: string; isError: boolean; error?: typeof errors[0] }[] = [];
    let lastIndex = 0;

    // Sort errors by offset
    const sortedErrors = [...errors].sort((a, b) => a.offset - b.offset);

    sortedErrors.forEach((error) => {
      // Add text before error
      if (error.offset > lastIndex) {
        parts.push({ text: text.slice(lastIndex, error.offset), isError: false });
      }

      // Add error text
      parts.push({
        text: text.slice(error.offset, error.offset + error.errorLength),
        isError: true,
        error,
      });

      lastIndex = error.offset + error.errorLength;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({ text: text.slice(lastIndex), isError: false });
    }

    return parts;
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Intermediate":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Advanced":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const stats = {
    total: GRAMMAR_TOPICS.length,
    completed: GRAMMAR_TOPICS.filter((t) => t.completed).length,
    inProgress: GRAMMAR_TOPICS.filter((t) => t.progress > 0 && !t.completed).length,
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Grammar Learning</h1>
        <p className="text-muted-foreground">
          Master English grammar with comprehensive lessons and exercises
        </p>
      </div>

      <Tabs defaultValue="checker" className="mb-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="checker">
            <Sparkles className="h-4 w-4 mr-2" />
            Grammar Checker
          </TabsTrigger>
          <TabsTrigger value="lessons">
            <BookOpen className="h-4 w-4 mr-2" />
            Grammar Lessons
          </TabsTrigger>
        </TabsList>

        {/* Grammar Checker Tab */}
        <TabsContent value="checker">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle>Check Your Grammar</CardTitle>
                <CardDescription>
                  Enter your text below and get instant grammar feedback powered by AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Type or paste your text here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[300px] resize-none"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleCheckGrammar}
                    disabled={isChecking || !inputText.trim()}
                    className="flex-1"
                  >
                    {isChecking ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Check Grammar
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setInputText("");
                      setCheckResult(null);
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card>
              <CardHeader>
                <CardTitle>Results</CardTitle>
                <CardDescription>
                  {checkResult
                    ? `Found ${checkResult.errors.length} issue${checkResult.errors.length !== 1 ? 's' : ''}`
                    : "Results will appear here"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!checkResult ? (
                  <div className="flex items-center justify-center min-h-[300px] text-muted-foreground">
                    <div className="text-center">
                      <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Enter text and click &quot;Check Grammar&quot; to get started</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Original Text with Highlights */}
                    {checkResult.errors.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Original Text:</h4>
                        <div className="p-4 bg-muted rounded-lg text-sm leading-relaxed">
                          {highlightErrors(checkResult.originalText, checkResult.errors).map((part, idx) =>
                            part.isError ? (
                              <span
                                key={idx}
                                className="bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-100 px-1 rounded cursor-help"
                                title={part.error?.message}
                              >
                                {part.text}
                              </span>
                            ) : (
                              <span key={idx}>{part.text}</span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Corrected Text */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Corrected Text:
                      </h4>
                      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg text-sm leading-relaxed">
                        {checkResult.correctedText}
                      </div>
                    </div>

                    {/* Error Details */}
                    {checkResult.errors.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Issues Found:</h4>
                        <div className="space-y-3">
                          {checkResult.errors.map((error, idx) => (
                            <div key={idx} className="p-3 bg-muted rounded-lg space-y-1">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">
                                    &quot;{checkResult.originalText.slice(error.offset, error.offset + error.errorLength)}&quot;
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">{error.message}</p>
                                  {error.suggestions.length > 0 && (
                                    <div className="mt-2">
                                      <p className="text-xs font-medium mb-1">Suggestions:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {error.suggestions.slice(0, 3).map((suggestion, sidx) => (
                                          <span
                                            key={sidx}
                                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded text-xs"
                                          >
                                            {suggestion}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Grammar Lessons Tab */}
        <TabsContent value="lessons">
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Topics</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold">{stats.completed}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">In Progress</p>
                      <p className="text-2xl font-bold">{stats.inProgress}</p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search grammar topics..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    {["All", "Beginner", "Intermediate", "Advanced"].map((level) => (
                      <Button
                        key={level}
                        variant={selectedLevel === level ? "default" : "outline"}
                        onClick={() => setSelectedLevel(level)}
                        size="sm"
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Topics Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {filteredTopics.length === 0 ? (
                <Card className="col-span-2">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No grammar topics found</p>
                  </CardContent>
                </Card>
              ) : (
                filteredTopics.map((topic) => (
                  <Card key={topic.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(topic.level)}`}>
                              {topic.level}
                            </span>
                            {topic.completed && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          <CardTitle className="text-xl">{topic.title}</CardTitle>
                        </div>
                      </div>
                      <CardDescription className="mt-2">{topic.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Progress Bar */}
                        {topic.progress > 0 && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{topic.progress}%</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2">
                              <div
                                className="bg-primary rounded-full h-2 transition-all"
                                style={{ width: `${topic.progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Meta Info */}
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{topic.duration}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              <span>{topic.lessons} lessons</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Button */}
                        <Button
                          onClick={() => handleStartLesson(topic.id)}
                          className="w-full"
                          variant={topic.completed ? "outline" : "default"}
                        >
                          {topic.completed ? (
                            <>
                              <Star className="h-4 w-4 mr-2" />
                              Review
                            </>
                          ) : topic.progress > 0 ? (
                            <>
                              Continue Learning
                              <ChevronRight className="h-4 w-4 ml-2" />
                            </>
                          ) : (
                            <>
                              Start Learning
                              <ChevronRight className="h-4 w-4 ml-2" />
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
