"use client";

import {
  Brain,
  Headphones,
  Users,
  Trophy,
  Clock,
  Smartphone,
  BookOpen,
  MessageCircle,
  Zap,
  BookCopy
} from "lucide-react";
import { motion } from "framer-motion";
import { PlatformStats } from "@/lib/api";

// Hàm để định dạng số lớn (10482 -> 10K+)
const formatStatValue = (value: number) => {
  if (value >= 10000) {
    return `${Math.floor(value / 1000)}K+`;
  }
  if (value >= 1000) {
     return `${(value / 1000).toFixed(1)}K+`.replace('.0', '');
  }
  return `${value}+`;
};

// Đổi tên và export component
export function Features({ statsData }: { statsData: PlatformStats }) {
  const features = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: "AI Thông minh",
      description: "AI cá nhân hoá lộ trình dựa trên trình độ và mục tiêu của bạn.",
      color: "bg-primary/10 text-primary"
    },
    {
      icon: <Headphones className="h-6 w-6" />,
      title: "Phát âm chuẩn",
      description: "Luyện phát âm với công nghệ nhận diện giọng nói tiên tiến.",
      color: "bg-primary/10 text-primary"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Cộng đồng học tập",
      description: "Kết nối với hàng nghìn học viên khác và luyện tập cùng nhau.",
      color: "bg-primary/10 text-primary"
    },
    {
      icon: <Trophy className="h-6 w-6" />,
      title: "Gamification",
      description: "Học thông qua trò chơi, thử thách và hệ thống điểm thưởng.",
      color: "bg-primary/10 text-primary"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Linh hoạt thời gian",
      description: "Học mọi lúc, mọi nơi với lịch trình cá nhân hóa.",
      color: "bg-primary/10 text-primary"
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "Đa nền tảng",
      description: "Truy cập trên web, mobile app với đồng bộ dữ liệu.",
      color: "bg-primary/10 text-primary"
    }
  ];

  const stats = [
    { icon: <BookOpen className="h-8 w-8 text-primary" />, value: formatStatValue(statsData.lessonCount), label: "Bài học" },
    { icon: <Users className="h-8 w-8 text-primary" />, value: formatStatValue(statsData.userCount), label: "Học viên" },
    { icon: <BookCopy className="h-8 w-8 text-primary" />, value: formatStatValue(statsData.courseCount), label: "Khóa học" },
    { icon: <Zap className="h-8 w-8 text-primary" />, value: statsData.supportHours, label: "Hỗ trợ" }
  ];

  return (
    <section id="features" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Tại sao chọn EnglishMaster?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Chúng tôi kết hợp công nghệ AI tiên tiến với phương pháp học tập hiệu quả
            để mang đến trải nghiệm học tiếng Anh tốt nhất.
          </p>
        </motion.div>

        <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-20" initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}>
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group p-6 rounded-xl border bg-card/50 backdrop-blur hover:bg-card transition-all duration-300"
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
              whileHover={{ y: -2 }}
            >
              <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div className="rounded-2xl p-8 lg:p-12 border bg-card" initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
          <div className="text-center mb-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
              Thành tựu của chúng tôi
            </h3>
            <p className="text-muted-foreground text-lg">
              Hàng nghìn học viên đã tin tưởng và thành công với EnglishMaster
            </p>
          </div>
          
          <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-8" initial="hidden" whileInView="show" viewport={{ once: true }} variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}>
            {stats.map((stat, index) => (
              <motion.div key={index} className="text-center" variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}