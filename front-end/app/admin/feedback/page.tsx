'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Search,
  MessageCircle,
  CheckCircle,
  Clock,
  X,
  Send,
  Trash2,
  Eye,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';

interface Feedback {
  id: string;
  username: string;
  email: string;
  type: 'bug' | 'feature' | 'content' | 'general';
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'resolved' | 'closed';
  subject: string;
  message: string;
  createdAt: string;
  rating?: number;
  response?: string;
  respondedBy?: string;
  respondedAt?: string;
}

const MOCK_FEEDBACK: Feedback[] = [
  {
    id: '1',
    username: 'john_doe',
    email: 'john@example.com',
    type: 'bug',
    priority: 'high',
    status: 'pending',
    subject: 'Quiz not loading properly',
    message: 'When I try to start the grammar quiz, the page keeps loading indefinitely.',
    createdAt: '2025-01-08',
    rating: 4,
  },
  {
    id: '2',
    username: 'jane_smith',
    email: 'jane@example.com',
    type: 'feature',
    priority: 'medium',
    status: 'in-progress',
    subject: 'Add more pronunciation exercises',
    message: 'It would be great to have more variety in pronunciation practice scenarios.',
    createdAt: '2025-01-07',
    rating: 5,
  },
  {
    id: '3',
    username: 'bob_wilson',
    email: 'bob@example.com',
    type: 'content',
    priority: 'low',
    status: 'resolved',
    subject: 'Grammar explanation unclear',
    message: 'The explanation for modal verbs lesson is confusing. Could you make it simpler?',
    createdAt: '2025-01-05',
    rating: 3,
    response: 'Thank you for your feedback. We have updated the modal verbs lesson with clearer explanations and examples.',
    respondedBy: 'admin@example.com',
    respondedAt: '2025-01-06',
  },
];

export default function FeedbackManagementPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(MOCK_FEEDBACK);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [responseText, setResponseText] = useState('');
  const [deleteFeedbackId, setDeleteFeedbackId] = useState<string | null>(null);

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const matchesSearch =
      feedback.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || feedback.type === filterType;
    const matchesStatus = filterStatus === 'all' || feedback.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || feedback.priority === filterPriority;
    return matchesSearch && matchesType && matchesStatus && matchesPriority;
  });

  const stats = {
    total: feedbacks.length,
    pending: feedbacks.filter((f) => f.status === 'pending').length,
    inProgress: feedbacks.filter((f) => f.status === 'in-progress').length,
    resolved: feedbacks.filter((f) => f.status === 'resolved').length,
  };

  const handleRespond = () => {
    if (!selectedFeedback || !responseText.trim()) {
      toast.error('Please enter a response');
      return;
    }

    setFeedbacks(
      feedbacks.map((f) =>
        f.id === selectedFeedback.id
          ? {
              ...f,
              status: 'resolved' as const,
              response: responseText,
              respondedBy: 'admin@example.com',
              respondedAt: new Date().toISOString().split('T')[0],
            }
          : f
      )
    );

    toast.success('Response sent successfully');
    setSelectedFeedback(null);
    setResponseText('');
  };

  const handleUpdateStatus = (id: string, status: Feedback['status']) => {
    setFeedbacks(
      feedbacks.map((f) => (f.id === id ? { ...f, status } : f))
    );
    toast.success(`Feedback marked as ${status}`);
  };

  const handleDelete = () => {
    if (!deleteFeedbackId) return;
    setFeedbacks(feedbacks.filter((f) => f.id !== deleteFeedbackId));
    setDeleteFeedbackId(null);
    toast.success('Feedback deleted');
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      bug: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      feature: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      content: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      general: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    };
    return colors[type as keyof typeof colors];
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return colors[priority as keyof typeof colors];
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      closed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    };
    return colors[status as keyof typeof colors];
  };

  if (selectedFeedback) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Button variant="outline" onClick={() => setSelectedFeedback(null)} className="mb-6">
          ← Back to all feedback
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{selectedFeedback.subject}</CardTitle>
                <CardDescription className="mt-2">
                  From {selectedFeedback.username} ({selectedFeedback.email})
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge className={getTypeBadge(selectedFeedback.type)}>{selectedFeedback.type}</Badge>
                <Badge className={getPriorityBadge(selectedFeedback.priority)}>{selectedFeedback.priority}</Badge>
                <Badge className={getStatusBadge(selectedFeedback.status)}>{selectedFeedback.status}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Rating */}
            {selectedFeedback.rating && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Rating:</span>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < selectedFeedback.rating!
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Message */}
            <div className="bg-secondary p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Message:</h4>
              <p className="text-sm">{selectedFeedback.message}</p>
              <p className="text-xs text-muted-foreground mt-2">Submitted on {selectedFeedback.createdAt}</p>
            </div>

            {/* Existing Response */}
            {selectedFeedback.response && (
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Admin Response:
                </h4>
                <p className="text-sm mb-2">{selectedFeedback.response}</p>
                <p className="text-xs text-muted-foreground">
                  Responded by {selectedFeedback.respondedBy} on {selectedFeedback.respondedAt}
                </p>
              </div>
            )}

            {/* Response Form */}
            {selectedFeedback.status !== 'resolved' && selectedFeedback.status !== 'closed' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Response:</label>
                  <Textarea
                    placeholder="Enter your response..."
                    rows={5}
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleRespond} className="flex-1">
                    <Send className="h-4 w-4 mr-2" />
                    Send Response & Mark Resolved
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateStatus(selectedFeedback.id, 'in-progress')}
                  >
                    Mark In Progress
                  </Button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              {selectedFeedback.status === 'resolved' && (
                <Button
                  variant="outline"
                  onClick={() => handleUpdateStatus(selectedFeedback.id, 'closed')}
                >
                  Close Feedback
                </Button>
              )}
              <Button
                variant="destructive"
                onClick={() => setDeleteFeedbackId(selectedFeedback.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
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
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold">{stats.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Feedback Management</CardTitle>
          <CardDescription>Review and respond to user feedback and reports</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search feedback..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="content">Content Feedback</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Feedback Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedbacks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No feedback found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFeedbacks.map((feedback) => (
                    <TableRow key={feedback.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{feedback.username}</p>
                          <p className="text-sm text-muted-foreground">{feedback.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{feedback.subject}</TableCell>
                      <TableCell>
                        <Badge className={getTypeBadge(feedback.type)}>{feedback.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityBadge(feedback.priority)}>{feedback.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(feedback.status)}>{feedback.status}</Badge>
                      </TableCell>
                      <TableCell>{feedback.createdAt}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedFeedback(feedback)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteFeedbackId(feedback.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteFeedbackId} onOpenChange={() => setDeleteFeedbackId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Feedback</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this feedback? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
