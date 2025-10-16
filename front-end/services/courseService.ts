import { apiClient } from "@/lib/api";
import { Course, CourseRequest, CourseFilters, Lesson, LessonRequest, LessonFilters, Category } from "@/types/course";
import { PagedResponse, ApiResponse } from "@/types";

// Course APIs
export const courseService = {
  // Get all courses with filters and pagination
  getAllCourses: async (filters: CourseFilters = {}): Promise<PagedResponse<Course>> => {
    const params = new URLSearchParams();

    if (filters.categoryId) params.append("categoryId", filters.categoryId.toString());
    if (filters.difficultyLevel) params.append("difficultyLevel", filters.difficultyLevel);
    if (filters.isPublished !== undefined) params.append("isPublished", filters.isPublished.toString());
    if (filters.isPremium !== undefined) params.append("isPremium", filters.isPremium.toString());
    if (filters.search) params.append("search", filters.search);
    if (filters.page !== undefined) params.append("page", filters.page.toString());
    if (filters.limit !== undefined) params.append("limit", filters.limit.toString());
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortDir) params.append("sortDir", filters.sortDir);

    const response = await apiClient.get<ApiResponse<PagedResponse<Course>>>(`/api/v1/courses?${params.toString()}`);
    return response.data.data;
  },

  // Get course by ID
  getCourseById: async (id: number): Promise<Course> => {
    const response = await apiClient.get<ApiResponse<Course>>(`/api/v1/courses/${id}`);
    return response.data.data;
  },

  // Get course by slug
  getCourseBySlug: async (slug: string): Promise<Course> => {
    const response = await apiClient.get<ApiResponse<Course>>(`/api/v1/courses/slug/${slug}`);
    return response.data.data;
  },

  // Create new course
  createCourse: async (courseData: CourseRequest): Promise<Course> => {
    const response = await apiClient.post<ApiResponse<Course>>("/api/v1/courses", courseData);
    return response.data.data;
  },

  // Update course
  updateCourse: async (id: number, courseData: CourseRequest): Promise<Course> => {
    const response = await apiClient.put<ApiResponse<Course>>(`/api/v1/courses/${id}`, courseData);
    return response.data.data;
  },

  // Delete course
  deleteCourse: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/courses/${id}`);
  },

  // Get lessons for a course
  getCourseLessons: async (courseId: number, filters: LessonFilters = {}): Promise<Lesson[]> => {
    const params = new URLSearchParams();

    if (filters.lessonType) params.append("lessonType", filters.lessonType);
    if (filters.isPublished !== undefined) params.append("isPublished", filters.isPublished.toString());

    const response = await apiClient.get<ApiResponse<Lesson[]>>(`/api/v1/courses/${courseId}/lessons?${params.toString()}`);
    return response.data.data;
  },

  // Get specific lesson
  getLessonById: async (courseId: number, lessonId: number): Promise<Lesson> => {
    const response = await apiClient.get<ApiResponse<Lesson>>(`/api/v1/courses/${courseId}/lessons/${lessonId}`);
    return response.data.data;
  },

  // Get lesson by slug
  getLessonBySlug: async (courseId: number, slug: string): Promise<Lesson> => {
    const response = await apiClient.get<ApiResponse<Lesson>>(`/api/v1/courses/${courseId}/lessons/slug/${slug}`);
    return response.data.data;
  },

  // Create lesson
  createLesson: async (courseId: number, lessonData: LessonRequest): Promise<Lesson> => {
    const response = await apiClient.post<ApiResponse<Lesson>>(`/api/v1/courses/${courseId}/lessons`, lessonData);
    return response.data.data;
  },

  // Update lesson
  updateLesson: async (courseId: number, lessonId: number, lessonData: LessonRequest): Promise<Lesson> => {
    const response = await apiClient.put<ApiResponse<Lesson>>(`/api/v1/courses/${courseId}/lessons/${lessonId}`, lessonData);
    return response.data.data;
  },

  // Delete lesson
  deleteLesson: async (courseId: number, lessonId: number): Promise<void> => {
    await apiClient.delete(`/api/v1/courses/${courseId}/lessons/${lessonId}`);
  },
};

// Category APIs (if you want to manage categories separately)
export const categoryService = {
  getAllCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<ApiResponse<Category[]>>("/api/v1/categories");
    return response.data.data;
  },

  getActiveCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<ApiResponse<Category[]>>("/api/v1/categories/active");
    return response.data.data;
  },

  getCategoryById: async (id: number): Promise<Category> => {
    const response = await apiClient.get<ApiResponse<Category>>(`/api/v1/categories/${id}`);
    return response.data.data;
  },
};
