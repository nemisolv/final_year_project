'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { courseService } from '@/services/courseService';
import { Course, Lesson, LessonType, LessonRequest } from '@/types/course';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Loader2,
  GripVertical,
  Home,
  ChevronRight,
  Video,
  Music,
  FileText,
  Gamepad2,
  HelpCircle,
  ClipboardList,
  Filter,
  X,
} from 'lucide-react';

// Lesson Type Icons and Colors
const LESSON_TYPE_CONFIG = {
  [LessonType.VIDEO]: {
    icon: Video,
    label: 'Video',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  },
  [LessonType.AUDIO]: {
    icon: Music,
    label: 'Audio',
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  },
  [LessonType.TEXT]: {
    icon: FileText,
    label: 'Text',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  },
  [LessonType.INTERACTIVE]: {
    icon: Gamepad2,
    label: 'Interactive',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
  [LessonType.QUIZ]: {
    icon: HelpCircle,
    label: 'Quiz',
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  },
  [LessonType.EXERCISE]: {
    icon: ClipboardList,
    label: 'Exercise',
    className: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  },
};

export default function LessonsManagementPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = parseInt(params.courseId as string);

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingLesson, setIsCreatingLesson] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [deleteLessonId, setDeleteLessonId] = useState<number | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  // Form state for creating lesson
  const [newLesson, setNewLesson] = useState<LessonRequest>({
    title: '',
    description: '',
    content: '',
    videoUrl: '',
    audioUrl: '',
    transcript: '',
    duration: 0,
    lessonType: LessonType.VIDEO,
    sortOrder: 0,
    isPublished: false,
    isPreview: false,
  });

  useEffect(() => {
    loadCourse();
    loadLessons();
  }, [courseId]);

  useEffect(() => {
    filterLessons();
  }, [lessons, selectedTypeFilter]);

  const loadCourse = async () => {
    try {
      const data = await courseService.getCourseById(courseId);
      setCourse(data);
    } catch (error: any) {
      console.error('Failed to load course:', error);
      toast.error('Không thể tải thông tin khóa học');
      router.push('/admin/courses');
    }
  };

  const loadLessons = async () => {
    try {
      setIsLoading(true);
      const data = await courseService.getCourseLessons(courseId);
      // Sort by sortOrder
      const sortedLessons = data.sort((a, b) => a.sortOrder - b.sortOrder);
      setLessons(sortedLessons);
    } catch (error: any) {
      console.error('Failed to load lessons:', error);
      toast.error('Không thể tải danh sách bài học');
    } finally {
      setIsLoading(false);
    }
  };

  const filterLessons = () => {
    if (selectedTypeFilter === 'all') {
      setFilteredLessons(lessons);
    } else {
      setFilteredLessons(lessons.filter(lesson => lesson.lessonType === selectedTypeFilter));
    }
  };

  const handleCreateLesson = async () => {
    if (!newLesson.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài học');
      return;
    }

    try {
      setIsCreatingLesson(true);
      // Set sortOrder to be the last
      const lessonData = {
        ...newLesson,
        sortOrder: lessons.length,
      };

      await courseService.createLesson(courseId, lessonData);
      toast.success('Tạo bài học thành công');
      setShowCreateDialog(false);
      resetForm();
      await loadLessons();
    } catch (error: any) {
      console.error('Failed to create lesson:', error);
      toast.error(error.response?.data?.message || 'Không thể tạo bài học');
    } finally {
      setIsCreatingLesson(false);
    }
  };

  const handleDeleteLesson = async () => {
    if (!deleteLessonId) return;

    try {
      setIsDeleting(true);
      await courseService.deleteLesson(courseId, deleteLessonId);
      toast.success('Đã xóa bài học thành công');
      setDeleteLessonId(null);
      await loadLessons();
    } catch (error: any) {
      console.error('Failed to delete lesson:', error);
      toast.error(error.response?.data?.message || 'Không thể xóa bài học');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePublished = async (lesson: Lesson) => {
    try {
      const updatedLesson: LessonRequest = {
        title: lesson.title,
        description: lesson.description,
        content: lesson.content,
        videoUrl: lesson.videoUrl,
        audioUrl: lesson.audioUrl,
        transcript: lesson.transcript,
        duration: lesson.duration,
        lessonType: lesson.lessonType,
        sortOrder: lesson.sortOrder,
        isPublished: !lesson.isPublished,
        isPreview: lesson.isPreview,
      };

      await courseService.updateLesson(courseId, lesson.id, updatedLesson);
      toast.success(`Đã ${!lesson.isPublished ? 'xuất bản' : 'gỡ xuất bản'} bài học`);
      await loadLessons();
    } catch (error: any) {
      console.error('Failed to toggle published:', error);
      toast.error('Không thể cập nhật trạng thái xuất bản');
    }
  };

  const handleTogglePreview = async (lesson: Lesson) => {
    try {
      const updatedLesson: LessonRequest = {
        title: lesson.title,
        description: lesson.description,
        content: lesson.content,
        videoUrl: lesson.videoUrl,
        audioUrl: lesson.audioUrl,
        transcript: lesson.transcript,
        duration: lesson.duration,
        lessonType: lesson.lessonType,
        sortOrder: lesson.sortOrder,
        isPublished: lesson.isPublished,
        isPreview: !lesson.isPreview,
      };

      await courseService.updateLesson(courseId, lesson.id, updatedLesson);
      toast.success(`Đã ${!lesson.isPreview ? 'cho phép' : 'hủy'} xem trước`);
      await loadLessons();
    } catch (error: any) {
      console.error('Failed to toggle preview:', error);
      toast.error('Không thể cập nhật trạng thái xem trước');
    }
  };

  const handleDragStart = (lessonId: number) => {
    setDraggedItem(lessonId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (targetLessonId: number) => {
    if (draggedItem === null || draggedItem === targetLessonId) return;

    const draggedLesson = filteredLessons.find(l => l.id === draggedItem);
    const targetLesson = filteredLessons.find(l => l.id === targetLessonId);

    if (!draggedLesson || !targetLesson) return;

    try {
      // Update sortOrder for both lessons
      const draggedUpdate: LessonRequest = {
        title: draggedLesson.title,
        description: draggedLesson.description,
        content: draggedLesson.content,
        videoUrl: draggedLesson.videoUrl,
        audioUrl: draggedLesson.audioUrl,
        transcript: draggedLesson.transcript,
        duration: draggedLesson.duration,
        lessonType: draggedLesson.lessonType,
        sortOrder: targetLesson.sortOrder,
        isPublished: draggedLesson.isPublished,
        isPreview: draggedLesson.isPreview,
      };

      const targetUpdate: LessonRequest = {
        title: targetLesson.title,
        description: targetLesson.description,
        content: targetLesson.content,
        videoUrl: targetLesson.videoUrl,
        audioUrl: targetLesson.audioUrl,
        transcript: targetLesson.transcript,
        duration: targetLesson.duration,
        lessonType: targetLesson.lessonType,
        sortOrder: draggedLesson.sortOrder,
        isPublished: targetLesson.isPublished,
        isPreview: targetLesson.isPreview,
      };

      await courseService.updateLesson(courseId, draggedLesson.id, draggedUpdate);
      await courseService.updateLesson(courseId, targetLesson.id, targetUpdate);

      toast.success('Đã cập nhật thứ tự bài học');
      await loadLessons();
    } catch (error: any) {
      console.error('Failed to reorder lessons:', error);
      toast.error('Không thể sắp xếp lại bài học');
    } finally {
      setDraggedItem(null);
    }
  };

  const resetForm = () => {
    setNewLesson({
      title: '',
      description: '',
      content: '',
      videoUrl: '',
      audioUrl: '',
      transcript: '',
      duration: 0,
      lessonType: LessonType.VIDEO,
      sortOrder: 0,
      isPublished: false,
      isPreview: false,
    });
  };

  const getLessonTypeBadge = (type: LessonType) => {
    const config = LESSON_TYPE_CONFIG[type];
    const Icon = config.icon;

    return (
      <Badge className={`${config.className} border-transparent flex items-center gap-1 w-fit`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const hasActiveFilters = selectedTypeFilter !== 'all';

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Home className="h-4 w-4" />
        <ChevronRight className="h-4 w-4" />
        <button
          onClick={() => router.push('/admin/courses')}
          className="hover:text-foreground transition-colors"
        >
          Courses
        </button>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">{course.title}</span>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">Lessons</span>
      </div>

      {/* Course Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{course.title}</CardTitle>
              {course.description && (
                <CardDescription className="text-base">
                  {course.description}
                </CardDescription>
              )}
              <div className="flex items-center gap-4 mt-4">
                <div className="text-sm">
                  <span className="text-muted-foreground">Total Lessons:</span>
                  <span className="font-semibold ml-2">{lessons.length}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Published:</span>
                  <span className="font-semibold ml-2">
                    {lessons.filter(l => l.isPublished).length}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Preview Available:</span>
                  <span className="font-semibold ml-2">
                    {lessons.filter(l => l.isPreview).length}
                  </span>
                </div>
              </div>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Tạo bài học mới
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Lessons Management Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Quản lý bài học</CardTitle>
            <div className="flex items-center gap-4">
              {/* Filter by Type */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedTypeFilter} onValueChange={setSelectedTypeFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Tất cả loại bài học" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả loại bài học</SelectItem>
                    <SelectItem value={LessonType.VIDEO}>Video</SelectItem>
                    <SelectItem value={LessonType.AUDIO}>Audio</SelectItem>
                    <SelectItem value={LessonType.TEXT}>Text</SelectItem>
                    <SelectItem value={LessonType.INTERACTIVE}>Interactive</SelectItem>
                    <SelectItem value={LessonType.QUIZ}>Quiz</SelectItem>
                    <SelectItem value={LessonType.EXERCISE}>Exercise</SelectItem>
                  </SelectContent>
                </Select>
                {hasActiveFilters && (
                  <Button
                    onClick={() => setSelectedTypeFilter('all')}
                    variant="outline"
                    size="sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredLessons.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Chưa có bài học nào</h3>
              <p className="text-muted-foreground mb-4">
                Bắt đầu tạo bài học đầu tiên cho khóa học này
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Tạo bài học đầu tiên
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Thứ tự</TableHead>
                    <TableHead className="w-[35%]">Tiêu đề</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Thời lượng</TableHead>
                    <TableHead className="text-center">Xuất bản</TableHead>
                    <TableHead className="text-center">Xem trước</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLessons.map((lesson) => (
                    <TableRow
                      key={lesson.id}
                      draggable
                      onDragStart={() => handleDragStart(lesson.id)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(lesson.id)}
                      className={`cursor-move ${draggedItem === lesson.id ? 'opacity-50' : ''}`}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{lesson.sortOrder + 1}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{lesson.title}</span>
                          {lesson.description && (
                            <span className="text-sm text-muted-foreground line-clamp-1 mt-1">
                              {lesson.description}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getLessonTypeBadge(lesson.lessonType)}</TableCell>
                      <TableCell>
                        {lesson.duration ? (
                          <span className="text-sm">{lesson.duration} phút</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={lesson.isPublished}
                          onCheckedChange={() => handleTogglePublished(lesson)}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={lesson.isPreview}
                          onCheckedChange={() => handleTogglePreview(lesson)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(`/courses/${course.slug}/lessons/${lesson.slug}`)
                            }
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(`/admin/courses/${courseId}/lessons/${lesson.id}/edit`)
                            }
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4 text-orange-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteLessonId(lesson.id)}
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Lesson Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tạo bài học mới</DialogTitle>
            <DialogDescription>
              Điền thông tin để tạo bài học mới cho khóa học
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Tiêu đề <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={newLesson.title}
                onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                placeholder="Nhập tiêu đề bài học"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={newLesson.description}
                onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                placeholder="Nhập mô tả bài học"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lessonType">Loại bài học</Label>
                <Select
                  value={newLesson.lessonType}
                  onValueChange={(value) =>
                    setNewLesson({ ...newLesson, lessonType: value as LessonType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={LessonType.VIDEO}>Video</SelectItem>
                    <SelectItem value={LessonType.AUDIO}>Audio</SelectItem>
                    <SelectItem value={LessonType.TEXT}>Text</SelectItem>
                    <SelectItem value={LessonType.INTERACTIVE}>Interactive</SelectItem>
                    <SelectItem value={LessonType.QUIZ}>Quiz</SelectItem>
                    <SelectItem value={LessonType.EXERCISE}>Exercise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Thời lượng (phút)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="0"
                  value={newLesson.duration || ''}
                  onChange={(e) =>
                    setNewLesson({ ...newLesson, duration: parseInt(e.target.value) || 0 })
                  }
                  placeholder="0"
                />
              </div>
            </div>

            {newLesson.lessonType === LessonType.VIDEO && (
              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input
                  id="videoUrl"
                  value={newLesson.videoUrl}
                  onChange={(e) => setNewLesson({ ...newLesson, videoUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            )}

            {newLesson.lessonType === LessonType.AUDIO && (
              <div className="space-y-2">
                <Label htmlFor="audioUrl">Audio URL</Label>
                <Input
                  id="audioUrl"
                  value={newLesson.audioUrl}
                  onChange={(e) => setNewLesson({ ...newLesson, audioUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="content">Nội dung</Label>
              <Textarea
                id="content"
                value={newLesson.content}
                onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })}
                placeholder="Nhập nội dung bài học"
                rows={5}
              />
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isPublished"
                  checked={newLesson.isPublished}
                  onCheckedChange={(checked) =>
                    setNewLesson({ ...newLesson, isPublished: checked as boolean })
                  }
                />
                <Label htmlFor="isPublished" className="cursor-pointer">
                  Xuất bản ngay
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="isPreview"
                  checked={newLesson.isPreview}
                  onCheckedChange={(checked) =>
                    setNewLesson({ ...newLesson, isPreview: checked as boolean })
                  }
                />
                <Label htmlFor="isPreview" className="cursor-pointer">
                  Cho phép xem trước
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                resetForm();
              }}
              disabled={isCreatingLesson}
            >
              Hủy
            </Button>
            <Button onClick={handleCreateLesson} disabled={isCreatingLesson}>
              {isCreatingLesson ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                'Tạo bài học'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteLessonId} onOpenChange={() => setDeleteLessonId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa bài học</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bài học này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLesson}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                'Xóa bài học'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
