"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  BookOpen,
  Tag,
  DollarSign,
  Eye,
  Clock,
  Target,
  FileText,
  Image as ImageIcon,
  List,
  Plus,
  X,
  ChevronLeft,
  Save,
  Loader2,
  Link2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

import { courseService, categoryService } from "@/services/courseService";
import { DifficultyLevel, Category, CourseRequest } from "@/types/course";

interface FormData {
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  categoryId: number | null;
  difficultyLevel: DifficultyLevel;
  estimatedDuration: number | null;
  prerequisites: string[];
  learningObjectives: string[];
  tags: string[];
  isPublished: boolean;
  isPremium: boolean;
  price: number | null;
}

interface FormErrors {
  title?: string;
  slug?: string;
  categoryId?: string;
  difficultyLevel?: string;
  price?: string;
  general?: string;
}

const DIFFICULTY_LEVELS = [
  { value: DifficultyLevel.BEGINNER, label: "Beginner", description: "Người mới bắt đầu" },
  { value: DifficultyLevel.ELEMENTARY, label: "Elementary", description: "Sơ cấp" },
  { value: DifficultyLevel.INTERMEDIATE, label: "Intermediate", description: "Trung cấp" },
  { value: DifficultyLevel.UPPER_INTERMEDIATE, label: "Upper Intermediate", description: "Trung cấp cao" },
  { value: DifficultyLevel.ADVANCED, label: "Advanced", description: "Nâng cao" },
  { value: DifficultyLevel.PROFICIENT, label: "Proficient", description: "Thành thạo" },
];

export default function AdminCreateCoursePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseIdParam = searchParams.get("id");
  const isEditMode = !!courseIdParam;

  // State
  const [loading, setLoading] = useState(false);
  const [loadingCourse, setLoadingCourse] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [createdCourseId, setCreatedCourseId] = useState<number | null>(null);

  // Form data
  const [formData, setFormData] = useState<FormData>({
    title: "",
    slug: "",
    description: "",
    thumbnail: "",
    categoryId: null,
    difficultyLevel: DifficultyLevel.BEGINNER,
    estimatedDuration: null,
    prerequisites: [],
    learningObjectives: [],
    tags: [],
    isPublished: false,
    isPremium: false,
    price: null,
  });

  // Errors
  const [errors, setErrors] = useState<FormErrors>({});

  // Tag input state
  const [tagInput, setTagInput] = useState("");

  // Auto-generate slug
  const [autoSlug, setAutoSlug] = useState(true);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoryService.getActiveCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
        toast.error("Không thể tải danh mục");
      }
    };

    loadCategories();
  }, []);

  // Load course data if in edit mode
  useEffect(() => {
    if (isEditMode && courseIdParam) {
      const loadCourse = async () => {
        setLoadingCourse(true);
        try {
          const course = await courseService.getCourseById(parseInt(courseIdParam));
          setFormData({
            title: course.title,
            slug: course.slug,
            description: course.description || "",
            thumbnail: course.thumbnail || "",
            categoryId: course.categoryId || null,
            difficultyLevel: course.difficultyLevel,
            estimatedDuration: course.estimatedDuration || null,
            prerequisites: course.prerequisites || [],
            learningObjectives: course.learningObjectives || [],
            tags: course.tags || [],
            isPublished: course.isPublished,
            isPremium: course.isPremium,
            price: course.price || null,
          });
          setAutoSlug(false);
        } catch (error) {
          console.error("Failed to load course:", error);
          toast.error("Không thể tải thông tin khóa học");
          router.push("/admin/courses");
        } finally {
          setLoadingCourse(false);
        }
      };

      loadCourse();
    }
  }, [isEditMode, courseIdParam, router]);

  // Auto-generate slug from title
  useEffect(() => {
    if (autoSlug && formData.title && !isEditMode) {
      const generatedSlug = formData.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.title, autoSlug, isEditMode]);

  // Form handlers
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof FormErrors];
        return newErrors;
      });
    }
  };

  const handleSlugChange = (value: string) => {
    setAutoSlug(false);
    handleInputChange("slug", value);
  };

  // Array field handlers
  const addArrayItem = (field: "prerequisites" | "learningObjectives") => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const updateArrayItem = (field: "prerequisites" | "learningObjectives", index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const removeArrayItem = (field: "prerequisites" | "learningObjectives", index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  // Tag handlers
  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Tiêu đề là bắt buộc";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Slug là bắt buộc";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = "Slug chỉ được chứa chữ thường, số và dấu gạch ngang";
    }

    if (!formData.difficultyLevel) {
      newErrors.difficultyLevel = "Vui lòng chọn trình độ";
    }

    if (formData.isPremium && (!formData.price || formData.price <= 0)) {
      newErrors.price = "Giá phải lớn hơn 0 đối với khóa học premium";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Prepare request data
      const requestData: CourseRequest = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || undefined,
        thumbnail: formData.thumbnail.trim() || undefined,
        categoryId: formData.categoryId || undefined,
        difficultyLevel: formData.difficultyLevel,
        estimatedDuration: formData.estimatedDuration || undefined,
        prerequisites: formData.prerequisites.filter(p => p.trim()).length > 0
          ? formData.prerequisites.filter(p => p.trim())
          : undefined,
        learningObjectives: formData.learningObjectives.filter(o => o.trim()).length > 0
          ? formData.learningObjectives.filter(o => o.trim())
          : undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        isPublished: formData.isPublished,
        isPremium: formData.isPremium,
        price: formData.isPremium && formData.price ? formData.price : undefined,
      };

      let course;
      if (isEditMode && courseIdParam) {
        course = await courseService.updateCourse(parseInt(courseIdParam), requestData);
        toast.success("Cập nhật khóa học thành công!");
      } else {
        course = await courseService.createCourse(requestData);
        toast.success("Tạo khóa học thành công!");
        setCreatedCourseId(course.id);
      }

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/admin/courses");
      }, 1500);

    } catch (error: any) {
      console.error("Failed to save course:", error);

      const errorMessage = error.response?.data?.message || error.message || "Có lỗi xảy ra";

      if (error.response?.status === 409) {
        setErrors({ slug: "Slug này đã tồn tại" });
        toast.error("Slug này đã được sử dụng");
      } else {
        setErrors({ general: errorMessage });
        toast.error(`Lỗi: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManageLessons = () => {
    if (isEditMode && courseIdParam) {
      router.push(`/admin/courses/${courseIdParam}/lessons`);
    } else if (createdCourseId) {
      router.push(`/admin/courses/${createdCourseId}/lessons`);
    }
  };

  if (loadingCourse) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/admin/courses")}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {isEditMode ? "Chỉnh sửa khóa học" : "Tạo khóa học mới"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isEditMode
                  ? "Cập nhật thông tin khóa học"
                  : "Nhập đầy đủ thông tin để tạo khóa học mới"}
              </p>
            </div>
          </div>
          <nav className="hidden text-sm text-muted-foreground md:block">
            <Link href="/admin" className="hover:text-foreground">
              Admin
            </Link>
            <span className="mx-2">/</span>
            <Link href="/admin/courses" className="hover:text-foreground">
              Khóa học
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">
              {isEditMode ? "Chỉnh sửa" : "Tạo mới"}
            </span>
          </nav>
        </div>

        {/* Success message for created course */}
        {createdCourseId && (
          <Card className="border-green-500 bg-green-50 dark:bg-green-950/20">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />
                <div>
                  <p className="font-medium text-green-900 dark:text-green-100">
                    Khóa học đã được tạo thành công!
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Bạn có thể quản lý bài học hoặc quay lại danh sách khóa học
                  </p>
                </div>
              </div>
              <Button onClick={handleManageLessons} className="gap-2">
                <List className="h-4 w-4" />
                Quản lý Bài học
              </Button>
            </CardContent>
          </Card>
        )}

        {/* General error message */}
        {errors.general && (
          <Card className="border-red-500 bg-red-50 dark:bg-red-950/20">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500" />
              <p className="text-sm text-red-900 dark:text-red-100">{errors.general}</p>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <CardTitle>Thông tin cơ bản</CardTitle>
              </div>
              <CardDescription>
                Tiêu đề, slug, hình ảnh và mô tả khóa học
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title" className="flex items-center gap-1">
                    Tiêu đề <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="VD: IELTS 7.0 Foundation"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500">{errors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug" className="flex items-center gap-1">
                    Slug <span className="text-red-500">*</span>
                    {autoSlug && !isEditMode && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Tự động
                      </Badge>
                    )}
                  </Label>
                  <Input
                    id="slug"
                    placeholder="ielts-7-0-foundation"
                    value={formData.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className={errors.slug ? "border-red-500" : ""}
                  />
                  {errors.slug && (
                    <p className="text-xs text-red-500">{errors.slug}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Slug sẽ được dùng trong URL
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail" className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  URL Hình ảnh thumbnail
                </Label>
                <Input
                  id="thumbnail"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.thumbnail}
                  onChange={(e) => handleInputChange("thumbnail", e.target.value)}
                />
                {formData.thumbnail && (
                  <div className="mt-2">
                    <img
                      src={formData.thumbnail}
                      alt="Preview"
                      className="h-32 w-auto rounded-lg border object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Mô tả
                </Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả chi tiết về khóa học, nội dung và lợi ích..."
                  rows={5}
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Classification */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle>Phân loại</CardTitle>
              </div>
              <CardDescription>
                Danh mục, trình độ và thời lượng học
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="category">Danh mục</Label>
                  <Select
                    value={formData.categoryId?.toString() || ""}
                    onValueChange={(value) =>
                      handleInputChange("categoryId", value ? parseInt(value) : null)
                    }
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty" className="flex items-center gap-1">
                    Trình độ <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.difficultyLevel}
                    onValueChange={(value) =>
                      handleInputChange("difficultyLevel", value as DifficultyLevel)
                    }
                  >
                    <SelectTrigger id="difficulty" className={errors.difficultyLevel ? "border-red-500" : ""}>
                      <SelectValue placeholder="Chọn trình độ" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTY_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{level.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {level.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.difficultyLevel && (
                    <p className="text-xs text-red-500">{errors.difficultyLevel}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Thời lượng (phút)
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    min="0"
                    placeholder="120"
                    value={formData.estimatedDuration || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "estimatedDuration",
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learning Content */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <List className="h-5 w-5 text-primary" />
                <CardTitle>Nội dung học tập</CardTitle>
              </div>
              <CardDescription>
                Yêu cầu tiên quyết và mục tiêu học tập
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Prerequisites */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Yêu cầu tiên quyết</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem("prerequisites")}
                    className="gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Thêm
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.prerequisites.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Chưa có yêu cầu nào. Nhấn "Thêm" để thêm yêu cầu tiên quyết.
                    </p>
                  )}
                  {formData.prerequisites.map((prerequisite, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="VD: Có kiến thức tiếng Anh cơ bản"
                        value={prerequisite}
                        onChange={(e) =>
                          updateArrayItem("prerequisites", index, e.target.value)
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeArrayItem("prerequisites", index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Learning Objectives */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Mục tiêu học tập</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem("learningObjectives")}
                    className="gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Thêm
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.learningObjectives.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Chưa có mục tiêu nào. Nhấn "Thêm" để thêm mục tiêu học tập.
                    </p>
                  )}
                  {formData.learningObjectives.map((objective, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="VD: Đạt 7.0 IELTS Writing"
                        value={objective}
                        onChange={(e) =>
                          updateArrayItem("learningObjectives", index, e.target.value)
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeArrayItem("learningObjectives", index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags & Metadata */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                <CardTitle>Tags & Metadata</CardTitle>
              </div>
              <CardDescription>
                Thẻ tag giúp phân loại và tìm kiếm khóa học
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    placeholder="Nhập tag và nhấn Enter"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTag}
                    className="gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Thêm
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="gap-1 pr-1">
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => removeTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Publishing & Pricing */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <CardTitle>Xuất bản & Giá cả</CardTitle>
              </div>
              <CardDescription>
                Cài đặt trạng thái xuất bản và giá khóa học
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 rounded-lg border p-4">
                  <Checkbox
                    id="isPublished"
                    checked={formData.isPublished}
                    onCheckedChange={(checked) =>
                      handleInputChange("isPublished", checked === true)
                    }
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="isPublished"
                      className="flex items-center gap-2 font-medium cursor-pointer"
                    >
                      <Eye className="h-4 w-4" />
                      Xuất bản khóa học
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Khóa học sẽ hiển thị công khai trên website
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 rounded-lg border p-4">
                  <Checkbox
                    id="isPremium"
                    checked={formData.isPremium}
                    onCheckedChange={(checked) =>
                      handleInputChange("isPremium", checked === true)
                    }
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="isPremium"
                      className="flex items-center gap-2 font-medium cursor-pointer"
                    >
                      <DollarSign className="h-4 w-4" />
                      Khóa học Premium
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Người dùng cần thanh toán để truy cập
                    </p>
                  </div>
                </div>
              </div>

              {formData.isPremium && (
                <div className="space-y-2 rounded-lg border bg-muted/50 p-4">
                  <Label htmlFor="price" className="flex items-center gap-1">
                    Giá khóa học (VNĐ) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="500000"
                    value={formData.price || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "price",
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    className={errors.price ? "border-red-500" : ""}
                  />
                  {errors.price && (
                    <p className="text-xs text-red-500">{errors.price}</p>
                  )}
                  {formData.price && formData.price > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Giá hiển thị: {formData.price.toLocaleString("vi-VN")} VNĐ
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/50 p-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/courses")}
                disabled={loading}
              >
                Hủy
              </Button>
              {isEditMode && courseIdParam && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleManageLessons}
                  disabled={loading}
                  className="gap-2"
                >
                  <List className="h-4 w-4" />
                  Quản lý Bài học
                </Button>
              )}
            </div>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isEditMode ? "Đang cập nhật..." : "Đang tạo..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEditMode ? "Cập nhật khóa học" : "Tạo khóa học"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
