"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Circle,
  Lock,
  Star,
  Trophy,
  Target,
  BookOpen,
  ChevronRight,
  Calendar,
} from "lucide-react";

interface LearningModule {
  id: string;
  title: string;
  description: string;
  status: "completed" | "in-progress" | "locked";
  progress: number;
  estimatedTime: string;
  lessons: number;
  points: number;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  level: string;
  modules: LearningModule[];
  totalProgress: number;
  completedModules: number;
  totalModules: number;
}

const LEARNING_PATHS: LearningPath[] = [
  {
    id: "1",
    title: "English Foundations",
    description: "Master the basics of English grammar, vocabulary, and pronunciation",
    level: "Beginner",
    totalProgress: 45,
    completedModules: 3,
    totalModules: 8,
    modules: [
      {
        id: "1-1",
        title: "English Alphabet & Pronunciation",
        description: "Learn the English alphabet and basic pronunciation rules",
        status: "completed",
        progress: 100,
        estimatedTime: "2 hours",
        lessons: 5,
        points: 100,
      },
      {
        id: "1-2",
        title: "Basic Grammar - Present Simple",
        description: "Learn to form and use present simple tense",
        status: "completed",
        progress: 100,
        estimatedTime: "3 hours",
        lessons: 8,
        points: 150,
      },
      {
        id: "1-3",
        title: "Essential Vocabulary - Daily Life",
        description: "Learn common words and phrases for everyday situations",
        status: "completed",
        progress: 100,
        estimatedTime: "4 hours",
        lessons: 10,
        points: 200,
      },
      {
        id: "1-4",
        title: "Past Simple Tense",
        description: "Master past simple tense with regular and irregular verbs",
        status: "in-progress",
        progress: 60,
        estimatedTime: "3 hours",
        lessons: 7,
        points: 150,
      },
      {
        id: "1-5",
        title: "Question Formation",
        description: "Learn to ask and answer different types of questions",
        status: "locked",
        progress: 0,
        estimatedTime: "2 hours",
        lessons: 6,
        points: 120,
      },
      {
        id: "1-6",
        title: "Common Phrases & Expressions",
        description: "Learn useful phrases for conversations",
        status: "locked",
        progress: 0,
        estimatedTime: "3 hours",
        lessons: 9,
        points: 180,
      },
      {
        id: "1-7",
        title: "Listening Comprehension Basics",
        description: "Practice understanding simple English conversations",
        status: "locked",
        progress: 0,
        estimatedTime: "4 hours",
        lessons: 12,
        points: 200,
      },
      {
        id: "1-8",
        title: "Speaking Practice - Introductions",
        description: "Practice introducing yourself and others",
        status: "locked",
        progress: 0,
        estimatedTime: "2 hours",
        lessons: 5,
        points: 100,
      },
    ],
  },
  {
    id: "2",
    title: "Intermediate Fluency",
    description: "Develop fluency in speaking and understanding complex grammar",
    level: "Intermediate",
    totalProgress: 15,
    completedModules: 1,
    totalModules: 10,
    modules: [
      {
        id: "2-1",
        title: "Present Perfect Tense",
        description: "Master the present perfect tense and its uses",
        status: "completed",
        progress: 100,
        estimatedTime: "4 hours",
        lessons: 10,
        points: 250,
      },
      {
        id: "2-2",
        title: "Modal Verbs",
        description: "Learn about can, could, should, would, must, and their usage",
        status: "in-progress",
        progress: 50,
        estimatedTime: "5 hours",
        lessons: 12,
        points: 300,
      },
      {
        id: "2-3",
        title: "Conditional Sentences",
        description: "Master zero, first, second, and third conditionals",
        status: "locked",
        progress: 0,
        estimatedTime: "6 hours",
        lessons: 15,
        points: 350,
      },
      // ... more modules
    ],
  },
  {
    id: "3",
    title: "Business English",
    description: "Professional English for workplace communication",
    level: "Advanced",
    totalProgress: 0,
    completedModules: 0,
    totalModules: 8,
    modules: [
      {
        id: "3-1",
        title: "Business Email Writing",
        description: "Learn to write professional emails",
        status: "locked",
        progress: 0,
        estimatedTime: "3 hours",
        lessons: 8,
        points: 200,
      },
      // ... more modules
    ],
  },
];

export default function LearningPathPage() {
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "in-progress":
        return <Circle className="h-5 w-5 text-blue-500 fill-blue-500" />;
      case "locked":
        return <Lock className="h-5 w-5 text-gray-400" />;
      default:
        return null;
    }
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

  if (selectedPath) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <Button variant="outline" onClick={() => setSelectedPath(null)} className="mb-6">
          ← Back to all paths
        </Button>

        {/* Path Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Badge className={`${getLevelColor(selectedPath.level)} mb-2`}>
                  {selectedPath.level}
                </Badge>
                <CardTitle className="text-2xl mb-2">{selectedPath.title}</CardTitle>
                <CardDescription>{selectedPath.description}</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">
                  {selectedPath.totalProgress}%
                </div>
                <p className="text-sm text-muted-foreground">Complete</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="w-full bg-secondary rounded-full h-3">
                <div
                  className="bg-primary rounded-full h-3 transition-all"
                  style={{ width: `${selectedPath.totalProgress}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-1">
                    <Target className="h-4 w-4" />
                    <span>Progress</span>
                  </div>
                  <p className="text-xl font-bold">
                    {selectedPath.completedModules}/{selectedPath.totalModules}
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-1">
                    <Trophy className="h-4 w-4" />
                    <span>Points Earned</span>
                  </div>
                  <p className="text-xl font-bold">
                    {selectedPath.modules
                      .filter((m) => m.status === "completed")
                      .reduce((sum, m) => sum + m.points, 0)}
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4" />
                    <span>Est. Time Left</span>
                  </div>
                  <p className="text-xl font-bold">
                    {selectedPath.modules
                      .filter((m) => m.status !== "completed")
                      .reduce((sum, m) => sum + parseInt(m.estimatedTime), 0)}h
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modules List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Learning Modules</h2>
          {selectedPath.modules.map((module, index) => (
            <Card
              key={module.id}
              className={`${
                module.status === "locked"
                  ? "opacity-60"
                  : "hover:shadow-md transition-shadow cursor-pointer"
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-bold text-primary">{index + 1}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusIcon(module.status)}
                          <h3 className="font-semibold">{module.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">{module.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{module.points} pts</span>
                        </div>
                      </div>
                    </div>

                    {module.status !== "locked" && module.progress > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Progress</span>
                          <span className="text-xs font-medium">{module.progress}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className={`rounded-full h-2 ${
                              module.status === "completed" ? "bg-green-500" : "bg-blue-500"
                            }`}
                            style={{ width: `${module.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{module.lessons} lessons</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{module.estimatedTime}</span>
                        </div>
                      </div>
                      {module.status !== "locked" && (
                        <Button size="sm" variant={module.status === "completed" ? "outline" : "default"}>
                          {module.status === "completed" ? "Review" : "Continue"}
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Learning Paths</h1>
        <p className="text-muted-foreground">
          Follow structured learning paths to achieve your English goals
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {LEARNING_PATHS.map((path) => (
          <Card
            key={path.id}
            className="hover:shadow-lg transition-all cursor-pointer"
            onClick={() => setSelectedPath(path)}
          >
            <CardHeader>
              <Badge className={`${getLevelColor(path.level)} w-fit mb-2`}>{path.level}</Badge>
              <CardTitle className="text-xl">{path.title}</CardTitle>
              <CardDescription>{path.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{path.totalProgress}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all"
                    style={{ width: `${path.totalProgress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Target className="h-4 w-4" />
                  <span>
                    {path.completedModules}/{path.totalModules} modules
                  </span>
                </div>
                <Button size="sm" variant="ghost">
                  View Path
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommendations */}
      <Card className="mt-8 bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Recommended Next Path
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            Based on your current progress in "English Foundations", we recommend continuing with
            "Intermediate Fluency" once you complete 80% of your current path.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
