import { Header } from "./header";
import { Hero } from "../../components/hero";
import { Testimonials } from "../../components/testimonials";
import { apiClient } from "@/lib/api";
import { Features } from "../../components/features"; // Import Features

// Biến component thành một async function để có thể fetch dữ liệu trên server
export default async function Home() {
  // Gọi API để lấy dữ liệu testimonials và platform stats ngay trên server
  const testimonials = await apiClient.getFeaturedTestimonials();
  const platformStats = await apiClient.getPlatformStats();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <Features statsData={platformStats} /> {/* Sử dụng Features và truyền props */}
      <Testimonials testimonials={testimonials} />
    </main>
  );
}