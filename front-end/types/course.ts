export enum DifficultyLevel {
  BEGINNER = "BEGINNER",
  ELEMENTARY = "ELEMENTARY",
  INTERMEDIATE = "INTERMEDIATE",
  UPPER_INTERMEDIATE = "UPPER_INTERMEDIATE",
  ADVANCED = "ADVANCED",
  PROFICIENT = "PROFICIENT",
}

export enum LessonType {
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
  TEXT = "TEXT",
  INTERACTIVE = "INTERACTIVE",
  QUIZ = "QUIZ",
  EXERCISE = "EXERCISE",
}

export interface Course {
  id: number;
  categoryId?: number;
  categoryName?: string;
  categorySlug?: string;
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  difficultyLevel: DifficultyLevel;
  estimatedDuration?: number;
  totalLessons?: number;
  totalExercises?: number;
  prerequisites?: string[];
  learningObjectives?: string[];
  tags?: string[];
  isPublished: boolean;
  isPremium: boolean;
  price?: number;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseRequest {
  title: string;
  slug?: string;
  description?: string;
  thumbnail?: string;
  categoryId?: number;
  difficultyLevel: DifficultyLevel;
  estimatedDuration?: number;
  prerequisites?: string[];
  learningObjectives?: string[];
  tags?: string[];
  isPublished?: boolean;
  isPremium?: boolean;
  price?: number;
}

export interface Lesson {
  id: number;
  courseId: number;
  courseTitle?: string;
  courseSlug?: string;
  title: string;
  slug: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  audioUrl?: string;
  transcript?: string;
  duration?: number;
  lessonType: LessonType;
  sortOrder: number;
  isPublished: boolean;
  isPreview: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LessonRequest {
  title: string;
  slug?: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  audioUrl?: string;
  transcript?: string;
  duration?: number;
  lessonType: LessonType;
  sortOrder?: number;
  isPublished?: boolean;
  isPreview?: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "ASC" | "DESC";
}

export interface CourseFilters extends PaginationParams {
  categoryId?: number;
  difficultyLevel?: DifficultyLevel;
  isPublished?: boolean;
  isPremium?: boolean;
  search?: string;
}

export interface LessonFilters {
  lessonType?: LessonType;
  isPublished?: boolean;
}
