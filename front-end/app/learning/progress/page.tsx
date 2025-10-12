"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Award,
  Target,
  Clock,
  Flame,
  BookOpen,
  MessageSquare,
  Video,
  ClipboardList,
  ChevronRight,
} from "lucide-react";

interface ActivityData {
  date: string;
  minutes: number;
  activities: number;
}

interface SkillProgress {
  skill: string;
  level: number;
  maxLevel: number;
  progress: number;
  color: string;
}

export default function ProgressPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("week");

  // Mock data for weekly activity
  const weeklyActivity: ActivityData[] = [
    { date: "Mon", minutes: 45, activities: 5 },
    { date: "Tue", minutes: 30, activities: 3 },
    { date: "Wed", minutes: 60, activities: 7 },
    { date: "Thu", minutes: 20, activities: 2 },
    { date: "Fri", minutes: 50, activities: 6 },
    { date: "Sat", minutes: 75, activities: 8 },
    { date: "Sun", minutes: 40, activities: 4 },
  ];

  const skillsProgress: SkillProgress[] = [
    { skill: "Grammar", level: 3, maxLevel: 5, progress: 65, color: "bg-purple-500" },
    { skill: "Vocabulary", level: 2, maxLevel: 5, progress: 45, color: "bg-blue-500" },
    { skill: "Speaking", level: 2, maxLevel: 5, progress: 40, color: "bg-green-500" },
    { skill: "Listening", level: 3, maxLevel: 5, progress: 60, color: "bg-orange-500" },
    { skill: "Reading", level: 3, maxLevel: 5, progress: 70, color: "bg-pink-500" },
    { skill: "Writing", level: 2, maxLevel: 5, progress: 35, color: "bg-cyan-500" },
  ];

  const recentActivities = [
    {
      icon: MessageSquare,
      title: "AI Chat Practice",
      description: "Completed conversation about daily routines",
      time: "2 hours ago",
      points: 50,
      color: "text-blue-500",
    },
    {
      icon: ClipboardList,
      title: "Grammar Quiz",
      description: "Scored 85% on Present Perfect quiz",
      time: "5 hours ago",
      points: 85,
      color: "text-purple-500",
    },
    {
      icon: Video,
      title: "Pronunciation Practice",
      description: "Practiced 'Restaurant' scenario",
      time: "1 day ago",
      points: 75,
      color: "text-green-500",
    },
    {
      icon: BookOpen,
      title: "Grammar Lesson",
      description: "Completed Modal Verbs - Lesson 3",
      time: "2 days ago",
      points: 60,
      color: "text-orange-500",
    },
  ];

  const achievements = [
    { title: "7-Day Streak", icon: Flame, unlocked: true, date: "Today" },
    { title: "100 Points", icon: Award, unlocked: true, date: "3 days ago" },
    { title: "First Quiz", icon: Target, unlocked: true, date: "1 week ago" },
    { title: "30-Day Streak", icon: Calendar, unlocked: false, date: "Locked" },
  ];

  const stats = {
    totalTime: 320,
    totalActivities: 35,
    currentStreak: 7,
    totalPoints: 1250,
    completedLessons: 24,
    averageScore: 82,
  };

  const maxMinutes = Math.max(...weeklyActivity.map((d) => d.minutes));

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Progress</h1>
        <p className="text-muted-foreground">
          Track your learning journey and celebrate your achievements
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Clock className="h-6 w-6 text-blue-500 mb-2" />
              <p className="text-xs text-muted-foreground">Total Time</p>
              <p className="text-2xl font-bold">{stats.totalTime}m</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Flame className="h-6 w-6 text-orange-500 mb-2" />
              <p className="text-xs text-muted-foreground">Streak</p>
              <p className="text-2xl font-bold">{stats.currentStreak}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Award className="h-6 w-6 text-yellow-500 mb-2" />
              <p className="text-xs text-muted-foreground">Points</p>
              <p className="text-2xl font-bold">{stats.totalPoints}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <BookOpen className="h-6 w-6 text-purple-500 mb-2" />
              <p className="text-xs text-muted-foreground">Lessons</p>
              <p className="text-2xl font-bold">{stats.completedLessons}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Target className="h-6 w-6 text-green-500 mb-2" />
              <p className="text-xs text-muted-foreground">Activities</p>
              <p className="text-2xl font-bold">{stats.totalActivities}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <TrendingUp className="h-6 w-6 text-pink-500 mb-2" />
              <p className="text-xs text-muted-foreground">Avg Score</p>
              <p className="text-2xl font-bold">{stats.averageScore}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Activity Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Study Activity</CardTitle>
                <CardDescription>Your learning time this week</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectedPeriod === "week" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPeriod("week")}
                >
                  Week
                </Button>
                <Button
                  variant={selectedPeriod === "month" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPeriod("month")}
                >
                  Month
                </Button>
                <Button
                  variant={selectedPeriod === "year" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPeriod("year")}
                >
                  Year
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Simple Bar Chart */}
              <div className="flex items-end justify-between gap-2 h-48">
                {weeklyActivity.map((day, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex items-end justify-center h-40">
                      <div
                        className="w-full bg-primary rounded-t-lg hover:bg-primary/80 transition-all cursor-pointer group relative"
                        style={{ height: `${(day.minutes / maxMinutes) * 100}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {day.minutes} min
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">{day.date}</span>
                  </div>
                ))}
              </div>

              {/* Stats Summary */}
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">+15% from last week</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  Total: {weeklyActivity.reduce((sum, d) => sum + d.minutes, 0)} minutes
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
            <CardDescription>Your badges and milestones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    achievement.unlocked ? "bg-secondary" : "bg-secondary/50 opacity-50"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      achievement.unlocked
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{achievement.title}</p>
                    <p className="text-xs text-muted-foreground">{achievement.date}</p>
                  </div>
                  {achievement.unlocked && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      Unlocked
                    </Badge>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Skills Progress */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Skills Breakdown</CardTitle>
          <CardDescription>Your progress in each skill area</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skillsProgress.map((skill, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{skill.skill}</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: skill.maxLevel }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-6 h-6 rounded-sm flex items-center justify-center text-xs font-bold ${
                          i < skill.level
                            ? `${skill.color} text-white`
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress to Level {skill.level + 1}</span>
                    <span className="font-medium">{skill.progress}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className={`${skill.color} rounded-full h-2 transition-all`}
                      style={{ width: `${skill.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest learning sessions</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-full bg-background flex items-center justify-center ${activity.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm font-medium mb-1">
                      <Award className="h-4 w-4 text-yellow-500" />
                      <span>+{activity.points}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
