'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Plus,
  Edit,
  Trash2,
  Search,
  BookOpen,
  Eye,
  Save,
  X,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface LearningContent {
  id: string;
  title: string;
  type: 'grammar' | 'vocabulary' | 'quiz' | 'lesson';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'draft' | 'published' | 'archived';
  lessons: number;
  createdAt: string;
  updatedAt: string;
}

const MOCK_CONTENT: LearningContent[] = [
  {
    id: '1',
    title: 'Present Simple Tense',
    type: 'grammar',
    level: 'Beginner',
    status: 'published',
    lessons: 5,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-05',
  },
  {
    id: '2',
    title: 'Daily Vocabulary - Food & Drink',
    type: 'vocabulary',
    level: 'Beginner',
    status: 'published',
    lessons: 8,
    createdAt: '2025-01-02',
    updatedAt: '2025-01-06',
  },
  {
    id: '3',
    title: 'Modal Verbs Quiz',
    type: 'quiz',
    level: 'Intermediate',
    status: 'draft',
    lessons: 1,
    createdAt: '2025-01-03',
    updatedAt: '2025-01-07',
  },
  {
    id: '4',
    title: 'Business English - Email Writing',
    type: 'lesson',
    level: 'Advanced',
    status: 'published',
    lessons: 10,
    createdAt: '2025-01-04',
    updatedAt: '2025-01-08',
  },
];

export default function ContentManagementPage() {
  const [contents, setContents] = useState<LearningContent[]>(MOCK_CONTENT);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [editingContent, setEditingContent] = useState<LearningContent | null>(null);
  const [deleteContentId, setDeleteContentId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    type: 'grammar' as const,
    level: 'Beginner' as const,
    status: 'draft' as const,
    description: '',
    duration: '',
  });

  const filteredContents = contents.filter((content) => {
    const matchesSearch = content.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || content.type === filterType;
    const matchesLevel = filterLevel === 'all' || content.level === filterLevel;
    const matchesStatus = filterStatus === 'all' || content.status === filterStatus;
    return matchesSearch && matchesType && matchesLevel && matchesStatus;
  });

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({
      title: '',
      type: 'grammar',
      level: 'Beginner',
      status: 'draft',
      description: '',
      duration: '',
    });
  };

  const handleEdit = (content: LearningContent) => {
    setEditingContent(content);
    setFormData({
      title: content.title,
      type: content.type,
      level: content.level,
      status: content.status,
      description: '',
      duration: '',
    });
  };

  const handleSave = () => {
    if (!formData.title) {
      toast.error('Please enter a title');
      return;
    }

    if (editingContent) {
      // Update existing content
      setContents(
        contents.map((c) =>
          c.id === editingContent.id
            ? {
                ...c,
                ...formData,
                updatedAt: new Date().toISOString().split('T')[0],
              }
            : c
        )
      );
      toast.success('Content updated successfully');
    } else {
      // Create new content
      const newContent: LearningContent = {
        id: Date.now().toString(),
        ...formData,
        lessons: 0,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      setContents([newContent, ...contents]);
      toast.success('Content created successfully');
    }

    setIsCreating(false);
    setEditingContent(null);
  };

  const handleDelete = () => {
    if (!deleteContentId) return;
    setContents(contents.filter((c) => c.id !== deleteContentId));
    setDeleteContentId(null);
    toast.success('Content deleted successfully');
  };

  const handlePublish = (id: string) => {
    setContents(
      contents.map((c) =>
        c.id === id
          ? {
              ...c,
              status: 'published' as const,
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : c
      )
    );
    toast.success('Content published successfully');
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      grammar: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      vocabulary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      quiz: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      lesson: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    };
    return colors[type as keyof typeof colors] || colors.lesson;
  };

  const getLevelBadge = (level: string) => {
    const colors = {
      Beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      Intermediate: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      Advanced: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    };
    return colors[level as keyof typeof colors] || colors.Beginner;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      published: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      archived: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  if (isCreating || editingContent) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{editingContent ? 'Edit Content' : 'Create New Content'}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => { setIsCreating(false); setEditingContent(null); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter content title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grammar">Grammar</SelectItem>
                    <SelectItem value="vocabulary">Vocabulary</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="lesson">Lesson</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Level *</Label>
                <Select
                  value={formData.level}
                  onValueChange={(value: any) => setFormData({ ...formData, level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter content description"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Estimated Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="e.g., 30"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={() => { setIsCreating(false); setEditingContent(null); }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Content Management</CardTitle>
              <CardDescription>
                Manage learning content, lessons, and quizzes
              </CardDescription>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create Content
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search content..."
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
                  <SelectItem value="grammar">Grammar</SelectItem>
                  <SelectItem value="vocabulary">Vocabulary</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="lesson">Lesson</SelectItem>
                </SelectContent>
              </Select>

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

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Content Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Lessons</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No content found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContents.map((content) => (
                    <TableRow key={content.id}>
                      <TableCell className="font-medium">{content.title}</TableCell>
                      <TableCell>
                        <Badge className={getTypeBadge(content.type)}>{content.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getLevelBadge(content.level)}>{content.level}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(content.status)}>{content.status}</Badge>
                      </TableCell>
                      <TableCell>{content.lessons}</TableCell>
                      <TableCell>{content.updatedAt}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(content)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          {content.status === 'draft' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePublish(content.id)}
                            >
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteContentId(content.id)}
                          >
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteContentId} onOpenChange={() => setDeleteContentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Content</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this content? This action cannot be undone.
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
