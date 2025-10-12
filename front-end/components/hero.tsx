"use client";

import Image from "next/image";
import { Play, ArrowRight, Star, Users, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { InteractiveQuizCard } from "@/components/marketing/interactive-quiz-card";
import { Routes } from "@/config";

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden py-24 bg-background">
      {/* subtle grid + radial glow */}
      <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_65%)]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:28px_28px] opacity-[0.35] dark:opacity-[0.2]" />
        <div className="absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            className="space-y-8"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={{
              hidden: { opacity: 0, y: 24 },
              show: {
                opacity: 1,
                y: 0,
                transition: { staggerChildren: 0.08, duration: 0.5 },
              },
            }}
          >
            <motion.div
              className="space-y-6"
              variants={{
                hidden: { opacity: 0, y: 16 },
                show: { opacity: 1, y: 0 },
              }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
                <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                Nền tảng học tiếng Anh hiện đại
              </div>
              <motion.h1
                className="text-4xl lg:text-6xl font-bold tracking-tight leading-tight"
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  show: { opacity: 1, y: 0 },
                }}
              >
                Học tiếng Anh hiện đại
                <span className="block text-muted-foreground font-medium">
                  tối giản, hiệu quả, cá nhân hoá
                </span>
              </motion.h1>
              <motion.p
                className="text-lg lg:text-xl text-muted-foreground leading-relaxed"
                variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
              >
                Khám phá phương pháp học tiếng Anh mới với AI, bài tập tương tác
                và cộng đồng học tập sôi động. Bắt đầu hành trình chinh phục
                tiếng Anh ngay hôm nay!
              </motion.p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              variants={{
                hidden: { opacity: 0, y: 12 },
                show: { opacity: 1, y: 0 },
              }}
            >
              <a href={Routes.SignUp} className="inline-flex">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-primary text-primary-foreground px-7 py-3 rounded-lg text-base lg:text-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow"
                >
                  <span>Bắt đầu miễn phí</span>
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
              </a>
              {/* <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="border border-border text-foreground px-7 py-3 rounded-lg text-base lg:text-lg font-semibold hover:bg-accent transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Play className="h-5 w-5" />
                <span>Xem demo</span>
              </motion.button> */}
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-3 gap-8 pt-10"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.06 } },
              }}
            >
              <motion.div
                className="text-center"
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  show: { opacity: 1, y: 0 },
                }}
              >
                <div className="flex items-center justify-center space-x-1 text-yellow-500 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">4.9/5 đánh giá</p>
              </motion.div>
              <motion.div
                className="text-center"
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  show: { opacity: 1, y: 0 },
                }}
              >
                <div className="flex items-center justify-center space-x-2 text-primary mb-2">
                  <Users className="h-5 w-5" />
                  <span className="text-2xl font-bold">10K+</span>
                </div>
                <p className="text-sm text-muted-foreground">Học viên</p>
              </motion.div>
              <motion.div
                className="text-center"
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  show: { opacity: 1, y: 0 },
                }}
              >
                <div className="flex items-center justify-center space-x-2 text-green-600 mb-2">
                  <BookOpen className="h-5 w-5" />
                  <span className="text-2xl font-bold">500+</span>
                </div>
                <p className="text-sm text-muted-foreground">Bài học</p>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Column - Visual */}
          <InteractiveQuizCard />
        </div>
      </div>
    </section>
  );
}
