"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { useAuth } from "@/hooks/use-auth";
import { apiClient, UserDashboardStats } from "@/lib/api";
import { useEffect, useState } from "react";
import {
  MessageSquare,
  Video,
  BookOpen,
  ClipboardList,
  TrendingUp,
  Target,
  Clock,
  Award,
  ChevronRight,
  Loader2,
  Users,
  Map,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [dashboardStats, setDashboardStats] = useState<UserDashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardStats = async () => {
      if (!user) return;

      try {
        setStatsLoading(true);
        const stats = await apiClient.getDashboardStats();
        if (isMounted) {
          setDashboardStats(stats);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        if (isMounted) {
          setStatsLoading(false);
        }
      }
    };

    fetchDashboardStats();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const learningFeatures = [
    {
      title: "AI Chat",
      description: "Practice conversation with AI tutor 1:1",
      icon: MessageSquare,
      href: "/learning/chat",
      color: "bg-blue-500",
      stats: "Practice anytime",
    },
    {
      title: "Conversations",
      description: "Practice real-life scenarios with AI",
      icon: Users,
      href: "/learning/conversation",
      color: "bg-cyan-500",
      stats: "6 scenarios available",
    },
    {
      title: "Pronunciation",
      description: "Improve pronunciation with video assessment",
      icon: Video,
      href: "/learning/pronunciation",
      color: "bg-green-500",
      stats: "AI-powered feedback",
    },
    {
      title: "Grammar",
      description: "Master English grammar rules and patterns",
      icon: BookOpen,
      href: "/learning/grammar",
      color: "bg-purple-500",
      stats: "8 topics available",
    },
    {
      title: "Quiz",
      description: "Test your knowledge with practice questions",
      icon: ClipboardList,
      href: "/learning/quiz",
      color: "bg-orange-500",
      stats: "Track your progress",
    },
    {
      title: "Learning Path",
      description: "Follow structured learning paths",
      icon: Map,
      href: "/learning/path",
      color: "bg-pink-500",
      stats: "3 paths available",
    },
    {
      title: "My Progress",
      description: "Track your learning with detailed charts",
      icon: TrendingUp,
      href: "/learning/progress",
      color: "bg-indigo-500",
      stats: "View analytics",
    },
  ];

  const stats = statsLoading || !dashboardStats ? [
    {
      label: "Study Streak",
      value: "...",
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      label: "Daily Goal",
      value: "...",
      icon: Target,
      color: "text-blue-500",
    },
    {
      label: "Time Today",
      value: "...",
      icon: Clock,
      color: "text-purple-500",
    },
    {
      label: "Total Points",
      value: "...",
      icon: Award,
      color: "text-orange-500",
    },
  ] : [
    {
      label: "Study Streak",
      value: `${dashboardStats.currentStreakDays} ${dashboardStats.currentStreakDays === 1 ? 'day' : 'days'}`,
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      label: "Daily Goal",
      value: `${dashboardStats.dailyStudyGoalMinutes} min`,
      icon: Target,
      color: "text-blue-500",
    },
    {
      label: "Time Today",
      value: `${dashboardStats.minutesStudiedToday} min`,
      icon: Clock,
      color: "text-purple-500",
    },
    {
      label: "Total Points",
      value: dashboardStats.totalXp.toString(),
      icon: Award,
      color: "text-orange-500",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <DashboardHeader />
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {user?.username || user?.name || "Learner"}! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Ready to continue your English learning journey?
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Learning Features */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Learning Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => router.push(feature.href)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`${feature.color} p-3 rounded-lg text-white`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-xl mb-1">{feature.title}</CardTitle>
                          <CardDescription>{feature.description}</CardDescription>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{feature.stats}</span>
                      <Button size="sm" variant="ghost">
                        Start Learning
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Activity / Recommendations */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Continue Learning</CardTitle>
              <CardDescription>Pick up where you left off</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium text-sm">Modal Verbs</p>
                    <p className="text-xs text-muted-foreground">30% complete</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => router.push("/learning/grammar")}>
                  Continue
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div className="flex items-center gap-3">
                  <Video className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium text-sm">Pronunciation Practice</p>
                    <p className="text-xs text-muted-foreground">Last session: 2 days ago</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => router.push("/learning/pronunciation")}>
                  Practice
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommended for You</CardTitle>
              <CardDescription>Based on your learning goals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-sm">Daily Conversation</p>
                    <p className="text-xs text-muted-foreground">Practice speaking</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => router.push("/learning/chat")}>
                  Start
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div className="flex items-center gap-3">
                  <ClipboardList className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium text-sm">Grammar Quiz</p>
                    <p className="text-xs text-muted-foreground">Test your knowledge</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => router.push("/learning/quiz")}>
                  Take Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
