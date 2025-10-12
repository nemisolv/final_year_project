'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  TrendingUp,
  TrendingDown,
  Clock,
  Award,
  Target,
  Eye,
  Download,
  Filter,
} from 'lucide-react';

interface UserProgress {
  id: string;
  username: string;
  email: string;
  totalTime: number; // minutes
  completedLessons: number;
  totalActivities: number;
  averageScore: number;
  currentStreak: number;
  lastActive: string;
  level: string;
  progress: number; // percentage
  trend: 'up' | 'down' | 'stable';
}

const MOCK_USER_PROGRESS: UserProgress[] = [
  {
    id: '1',
    username: 'john_doe',
    email: 'john@example.com',
    totalTime: 450,
    completedLessons: 35,
    totalActivities: 82,
    averageScore: 87,
    currentStreak: 12,
    lastActive: '2025-01-08',
    level: 'Intermediate',
    progress: 65,
    trend: 'up',
  },
  {
    id: '2',
    username: 'jane_smith',
    email: 'jane@example.com',
    totalTime: 320,
    completedLessons: 28,
    totalActivities: 64,
    averageScore: 92,
    currentStreak: 8,
    lastActive: '2025-01-07',
    level: 'Beginner',
    progress: 78,
    trend: 'up',
  },
  {
    id: '3',
    username: 'bob_wilson',
    email: 'bob@example.com',
    totalTime: 180,
    completedLessons: 15,
    totalActivities: 32,
    averageScore: 68,
    currentStreak: 3,
    lastActive: '2025-01-05',
    level: 'Beginner',
    progress: 42,
    trend: 'down',
  },
  {
    id: '4',
    username: 'alice_johnson',
    email: 'alice@example.com',
    totalTime: 680,
    completedLessons: 52,
    totalActivities: 125,
    averageScore: 95,
    currentStreak: 25,
    lastActive: '2025-01-08',
    level: 'Advanced',
    progress: 88,
    trend: 'up',
  },
];

export default function UserProgressDashboard() {
  const [users, setUsers] = useState<UserProgress[]>(MOCK_USER_PROGRESS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('lastActive');
  const [selectedUser, setSelectedUser] = useState<UserProgress | null>(null);

  const filteredUsers = users
    .filter((user) => {
      const matchesSearch =
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLevel = filterLevel === 'all' || user.level === filterLevel;
      return matchesSearch && matchesLevel;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'totalTime':
          return b.totalTime - a.totalTime;
        case 'averageScore':
          return b.averageScore - a.averageScore;
        case 'completedLessons':
          return b.completedLessons - a.completedLessons;
        case 'currentStreak':
          return b.currentStreak - a.currentStreak;
        default:
          return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
      }
    });

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter((u) => {
      const lastActive = new Date(u.lastActive);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return lastActive >= weekAgo;
    }).length,
    avgCompletionRate: Math.round(
      users.reduce((sum, u) => sum + u.progress, 0) / users.length
    ),
    avgScore: Math.round(
      users.reduce((sum, u) => sum + u.averageScore, 0) / users.length
    ),
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getLevelBadge = (level: string) => {
    const colors = {
      Beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      Intermediate: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      Advanced: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    };
    return colors[level as keyof typeof colors];
  };

  const exportToCSV = () => {
    const headers = ['Username', 'Email', 'Total Time (min)', 'Completed Lessons', 'Average Score', 'Streak', 'Last Active'];
    const rows = filteredUsers.map(u => [
      u.username,
      u.email,
      u.totalTime,
      u.completedLessons,
      u.averageScore,
      u.currentStreak,
      u.lastActive,
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-progress-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (selectedUser) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <Button variant="outline" onClick={() => setSelectedUser(null)} className="mb-6">
          ← Back to all users
        </Button>

        <div className="grid gap-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{selectedUser.username}</CardTitle>
                  <CardDescription>{selectedUser.email}</CardDescription>
                </div>
                <Badge className={getLevelBadge(selectedUser.level)}>{selectedUser.level}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{selectedUser.totalTime}m</div>
                  <p className="text-sm text-muted-foreground">Total Time</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{selectedUser.completedLessons}</div>
                  <p className="text-sm text-muted-foreground">Lessons</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{selectedUser.averageScore}%</div>
                  <p className="text-sm text-muted-foreground">Avg Score</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{selectedUser.currentStreak}</div>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Progress</CardTitle>
              <CardDescription>Overall completion: {selectedUser.progress}%</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="w-full bg-secondary rounded-full h-4">
                  <div
                    className="bg-primary rounded-full h-4 transition-all"
                    style={{ width: `${selectedUser.progress}%` }}
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-secondary p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Grammar</span>
                      <span className="text-sm text-muted-foreground">75%</span>
                    </div>
                    <div className="w-full bg-background rounded-full h-2">
                      <div className="bg-purple-500 rounded-full h-2" style={{ width: '75%' }} />
                    </div>
                  </div>
                  <div className="bg-secondary p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Vocabulary</span>
                      <span className="text-sm text-muted-foreground">82%</span>
                    </div>
                    <div className="w-full bg-background rounded-full h-2">
                      <div className="bg-blue-500 rounded-full h-2" style={{ width: '82%' }} />
                    </div>
                  </div>
                  <div className="bg-secondary p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Speaking</span>
                      <span className="text-sm text-muted-foreground">68%</span>
                    </div>
                    <div className="w-full bg-background rounded-full h-2">
                      <div className="bg-green-500 rounded-full h-2" style={{ width: '68%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { activity: 'Completed Grammar Quiz - Present Perfect', score: 92, date: '2025-01-08' },
                  { activity: 'Pronunciation Practice - Restaurant Scenario', score: 85, date: '2025-01-07' },
                  { activity: 'Vocabulary Lesson - Business English', score: 88, date: '2025-01-06' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{item.activity}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                    <Badge variant="outline">{item.score}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active (7d)</p>
                <p className="text-2xl font-bold">{stats.activeUsers}</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Completion</p>
                <p className="text-2xl font-bold">{stats.avgCompletionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold">{stats.avgScore}%</p>
              </div>
              <Award className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">User Progress Monitoring</CardTitle>
              <CardDescription>Track and analyze student learning progress</CardDescription>
            </div>
            <Button onClick={exportToCSV} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by username or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lastActive">Last Active</SelectItem>
                  <SelectItem value="totalTime">Total Time</SelectItem>
                  <SelectItem value="averageScore">Average Score</SelectItem>
                  <SelectItem value="completedLessons">Completed Lessons</SelectItem>
                  <SelectItem value="currentStreak">Current Streak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* User Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Lessons</TableHead>
                  <TableHead>Avg Score</TableHead>
                  <TableHead>Streak</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Trend</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.username}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getLevelBadge(user.level)}>{user.level}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{user.progress}%</p>
                          <div className="w-20 bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary rounded-full h-2"
                              style={{ width: `${user.progress}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.totalTime}m</TableCell>
                      <TableCell>{user.completedLessons}</TableCell>
                      <TableCell>{user.averageScore}%</TableCell>
                      <TableCell>{user.currentStreak}d</TableCell>
                      <TableCell>{user.lastActive}</TableCell>
                      <TableCell>{getTrendIcon(user.trend)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedUser(user)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
