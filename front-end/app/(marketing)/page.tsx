import { Header } from "./header";
import { Hero } from "../../components/hero";
import { Features } from "../../components/features";
import { Testimonials } from "../../components/testimonials";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <Features />
      <Testimonials />
    </main>
  );
}
