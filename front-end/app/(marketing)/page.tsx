import { Header } from "./header";
import { Hero } from "../../components/hero";
import { Testimonials } from "../../components/testimonials";
import { apiClient } from "@/lib/api"; // Import apiClient của bạn

// Biến component thành một async function để có thể fetch dữ liệu trên server
export default async function Home() {
  // Gọi API để lấy dữ liệu testimonials ngay trên server
  const testimonials = await apiClient.getFeaturedTestimonials();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <Features />
      {/* Truyền dữ liệu đã fetch được xuống component Testimonials */}
      <Testimonials testimonials={testimonials} />
    </main>
  );
}