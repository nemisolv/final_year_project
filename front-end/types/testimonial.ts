// types/testimonial.ts
export interface Testimonial {
  id: number;
  content: string;
  rating: number;
  authorName: string;
  authorTitle: string;
  authorAvatarUrl?: string; // Dữ liệu này có thể là null
  // Thêm các trường khác nếu cần
}