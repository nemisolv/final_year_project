"use client";

import Image from "next/image";
import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

export function Testimonials() {
  const testimonials = [
    {
      name: "Nguyễn Minh Anh",
      role: "Sinh viên Đại học",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      content: "EnglishMaster đã giúp tôi cải thiện tiếng Anh một cách đáng kể. Phương pháp học với AI rất thú vị và hiệu quả. Tôi đã tăng từ 5.0 lên 7.5 IELTS chỉ sau 3 tháng!",
      rating: 5
    },
    {
      name: "Trần Văn Nam",
      role: "Nhân viên văn phòng",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      content: "Tôi rất bận rộn với công việc nhưng EnglishMaster cho phép tôi học mọi lúc mọi nơi. Tính năng phát âm chuẩn giúp tôi tự tin hơn khi giao tiếp với khách hàng quốc tế.",
      rating: 5
    },
    {
      name: "Lê Thị Hương",
      role: "Giáo viên",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      content: "Là giáo viên, tôi đánh giá cao chất lượng nội dung và phương pháp giảng dạy của EnglishMaster. Học viên của tôi cũng rất thích sử dụng nền tảng này.",
      rating: 5
    },
    {
      name: "Phạm Đức Thành",
      role: "Doanh nhân",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      content: "Tôi cần tiếng Anh để mở rộng kinh doanh. EnglishMaster giúp tôi học từ vựng chuyên ngành và kỹ năng thuyết trình. Rất hài lòng với kết quả!",
      rating: 5
    },
    {
      name: "Hoàng Thị Mai",
      role: "Du học sinh",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      content: "Chuẩn bị đi du học, tôi cần cải thiện tiếng Anh nhanh chóng. EnglishMaster với AI cá nhân hóa đã giúp tôi đạt được mục tiêu trong thời gian ngắn nhất.",
      rating: 5
    },
    {
      name: "Vũ Minh Tuấn",
      role: "Lập trình viên",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      content: "Là dev, tôi cần tiếng Anh để đọc tài liệu và giao tiếp với team quốc tế. EnglishMaster giúp tôi học tiếng Anh kỹ thuật một cách hiệu quả và thú vị.",
      rating: 5
    }
  ];

  return (
    <section id= "feedback" className="py-20 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Học viên nói gì về chúng tôi?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Hàng nghìn học viên đã tin tưởng và đạt được mục tiêu tiếng Anh với EnglishMaster
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}>
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-card rounded-xl p-6 shadow hover:shadow-lg transition-shadow duration-300"
              variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
              whileHover={{ y: -2 }}
            >
              {/* Quote Icon */}
              <div className="mb-4">
                <Quote className="h-8 w-8 text-primary" />
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground/80 leading-relaxed mb-6">
                {testimonial.content}
              </p>

              {/* Author */}
              <div className="flex items-center space-x-3">
                <Image
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-foreground">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <motion.div className="rounded-2xl p-8 lg:p-12 border bg-card/50 backdrop-blur" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
              Sẵn sàng bắt đầu hành trình học tiếng Anh?
            </h3>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Tham gia cùng hàng nghìn học viên đã thành công với EnglishMaster. 
              Miễn phí 7 ngày đầu tiên!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/auth/signup" className="inline-flex">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="bg-primary text-primary-foreground px-7 py-3 rounded-lg text-base lg:text-lg font-semibold transition-colors duration-200 shadow">
                  Bắt đầu miễn phí ngay
                </motion.button>
              </a>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="border border-border text-foreground px-7 py-3 rounded-lg text-base lg:text-lg font-semibold hover:bg-accent transition-colors duration-200">
                Xem demo
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
