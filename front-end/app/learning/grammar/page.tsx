"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, ChevronRight, CheckCircle, Clock, Star } from "lucide-react";
import { toast } from "sonner";

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

  const filteredTopics = GRAMMAR_TOPICS.filter((topic) => {
    const matchesSearch =
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === "All" || topic.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const handleStartLesson = (topicId: string) => {
    // TODO: Navigate to lesson detail page
    toast.info("Lesson detail page will be implemented");
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
  );
}
