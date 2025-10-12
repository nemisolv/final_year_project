'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { courseService, categoryService } from '@/services/courseService';
import { Course, DifficultyLevel, Category } from '@/types/course';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Filter,
  X,
} from 'lucide-react';

export default function CoursesManagementPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedPublished, setSelectedPublished] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);
  const [deleteCourseId, setDeleteCourseId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadCourses();
  }, [currentPage, selectedCategory, selectedDifficulty, selectedPublished]);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (error: any) {
      console.error('Failed to load categories:', error);
      toast.error('Không thể tải danh sách danh mục');
    }
  };

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      const filters: any = {
        page: currentPage,
        size: pageSize,
        sortBy: 'createdAt',
        sortDir: 'DESC' as const,
      };

      if (searchQuery) {
        filters.search = searchQuery;
      }

      if (selectedCategory !== 'all') {
        filters.categoryId = parseInt(selectedCategory);
      }

      if (selectedDifficulty !== 'all') {
        filters.difficultyLevel = selectedDifficulty as DifficultyLevel;
      }

      if (selectedPublished !== 'all') {
        filters.isPublished = selectedPublished === 'published';
      }

      const response = await courseService.getAllCourses(filters);
      setCourses(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error: any) {
      console.error('Failed to load courses:', error);
      toast.error('Không thể tải danh sách khóa học');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(0);
    loadCourses();
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedDifficulty('all');
    setSelectedPublished('all');
    setCurrentPage(0);
  };

  const handleDeleteCourse = async () => {
    if (!deleteCourseId) return;

    try {
      setIsDeleting(true);
      await courseService.deleteCourse(deleteCourseId);
      toast.success('Đã xóa khóa học thành công');
      setDeleteCourseId(null);
      await loadCourses();
    } catch (error: any) {
      console.error('Failed to delete course:', error);
      toast.error(error.response?.data?.message || 'Không thể xóa khóa học');
    } finally {
      setIsDeleting(false);
    }
  };

  const getDifficultyBadge = (level: DifficultyLevel) => {
    const badges: Record<DifficultyLevel, { label: string; className: string }> = {
      [DifficultyLevel.BEGINNER]: {
        label: 'Beginner',
        className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      },
      [DifficultyLevel.ELEMENTARY]: {
        label: 'Elementary',
        className: 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-300',
      },
      [DifficultyLevel.INTERMEDIATE]: {
        label: 'Intermediate',
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      },
      [DifficultyLevel.UPPER_INTERMEDIATE]: {
        label: 'Upper Int.',
        className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      },
      [DifficultyLevel.ADVANCED]: {
        label: 'Advanced',
        className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      },
      [DifficultyLevel.PROFICIENT]: {
        label: 'Proficient',
        className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      },
    };

    const badge = badges[level];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  const hasActiveFilters = selectedCategory !== 'all' || selectedDifficulty !== 'all' || selectedPublished !== 'all' || searchQuery !== '';

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Quản lý khóa học</CardTitle>
              <CardDescription>
                Quản lý tất cả khóa học trong hệ thống ({totalElements} khóa học)
              </CardDescription>
            </div>
            <Button onClick={() => router.push('/admin/courses/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Tạo khóa học mới
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tiêu đề khóa học..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} variant="secondary">
                <Search className="mr-2 h-4 w-4" />
                Tìm kiếm
              </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả danh mục</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả độ khó" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả độ khó</SelectItem>
                    <SelectItem value={DifficultyLevel.BEGINNER}>Beginner</SelectItem>
                    <SelectItem value={DifficultyLevel.ELEMENTARY}>Elementary</SelectItem>
                    <SelectItem value={DifficultyLevel.INTERMEDIATE}>Intermediate</SelectItem>
                    <SelectItem value={DifficultyLevel.UPPER_INTERMEDIATE}>Upper Intermediate</SelectItem>
                    <SelectItem value={DifficultyLevel.ADVANCED}>Advanced</SelectItem>
                    <SelectItem value={DifficultyLevel.PROFICIENT}>Proficient</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Select value={selectedPublished} onValueChange={setSelectedPublished}>
                  <SelectTrigger>
                    <SelectValue placeholder="Trạng thái xuất bản" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="published">Đã xuất bản</SelectItem>
                    <SelectItem value="draft">Bản nháp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <Button onClick={handleResetFilters} variant="outline">
                  <X className="mr-2 h-4 w-4" />
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">Tiêu đề</TableHead>
                      <TableHead>Danh mục</TableHead>
                      <TableHead>Độ khó</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Premium</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Không tìm thấy khóa học nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      courses.map(course => (
                        <TableRow key={course.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{course.title}</span>
                              {course.description && (
                                <span className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                  {course.description}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {course.categoryName ? (
                              <Badge variant="secondary">{course.categoryName}</Badge>
                            ) : (
                              <span className="text-sm text-muted-foreground">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>{getDifficultyBadge(course.difficultyLevel)}</TableCell>
                          <TableCell>
                            {course.isPublished ? (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-transparent">
                                Đã xuất bản
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground">
                                Bản nháp
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {course.isPremium ? (
                              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 border-transparent">
                                Premium
                              </Badge>
                            ) : (
                              <Badge variant="outline">Miễn phí</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/courses/${course.slug}`)}
                                title="Xem chi tiết"
                              >
                                <Eye className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/admin/courses/${course.id}/edit`)}
                                title="Chỉnh sửa"
                              >
                                <Edit className="h-4 w-4 text-orange-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteCourseId(course.id)}
                                title="Xóa"
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Trang {currentPage + 1} / {totalPages} - Tổng {totalElements} khóa học
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                      disabled={currentPage === 0}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Trước
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i;
                        } else if (currentPage < 3) {
                          pageNum = i;
                        } else if (currentPage > totalPages - 4) {
                          pageNum = totalPages - 5 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum + 1}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                      disabled={currentPage === totalPages - 1}
                    >
                      Sau
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteCourseId} onOpenChange={() => setDeleteCourseId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa khóa học</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa khóa học này? Tất cả các bài học và dữ liệu liên quan sẽ bị xóa.
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCourse}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                'Xóa khóa học'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
