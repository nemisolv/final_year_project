"use client";

import Image from "next/image";
import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";
import { Testimonial } from "@/types/testimonial";
  interface TestimonialsProps {
  testimonials: Testimonial[];
}

export function Testimonials({ testimonials }: TestimonialsProps) {





  // const testimonials = [
  //   {
  //     name: "Nguyễn Minh Anh",
  //     role: "Sinh viên Đại học",
  //     avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
  //     content: "EnglishMaster đã giúp tôi cải thiện tiếng Anh một cách đáng kể. Phương pháp học với AI rất thú vị và hiệu quả. Tôi đã tăng từ 5.0 lên 7.5 IELTS chỉ sau 3 tháng!",
  //     rating: 5
  //   },
  //   {
  //     name: "Trần Văn Nam",
  //     role: "Nhân viên văn phòng",
  //     avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  //     content: "Tôi rất bận rộn với công việc nhưng EnglishMaster cho phép tôi học mọi lúc mọi nơi. Tính năng phát âm chuẩn giúp tôi tự tin hơn khi giao tiếp với khách hàng quốc tế.",
  //     rating: 5
  //   },
  //   {
  //     name: "Lê Thị Hương",
  //     role: "Giáo viên",
  //     avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
  //     content: "Là giáo viên, tôi đánh giá cao chất lượng nội dung và phương pháp giảng dạy của EnglishMaster. Học viên của tôi cũng rất thích sử dụng nền tảng này.",
  //     rating: 5
  //   },
  //   {
  //     name: "Phạm Đức Thành",
  //     role: "Doanh nhân",
  //     avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  //     content: "Tôi cần tiếng Anh để mở rộng kinh doanh. EnglishMaster giúp tôi học từ vựng chuyên ngành và kỹ năng thuyết trình. Rất hài lòng với kết quả!",
  //     rating: 5
  //   },
  //   {
  //     name: "Hoàng Thị Mai",
  //     role: "Du học sinh",
  //     avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
  //     content: "Chuẩn bị đi du học, tôi cần cải thiện tiếng Anh nhanh chóng. EnglishMaster với AI cá nhân hóa đã giúp tôi đạt được mục tiêu trong thời gian ngắn nhất.",
  //     rating: 5
  //   },
  //   {
  //     name: "Vũ Minh Tuấn",
  //     role: "Lập trình viên",
  //     avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
  //     content: "Là dev, tôi cần tiếng Anh để đọc tài liệu và giao tiếp với team quốc tế. EnglishMaster giúp tôi học tiếng Anh kỹ thuật một cách hiệu quả và thú vị.",
  //     rating: 5
  //   }
  // ];

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
         {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              className="bg-card rounded-xl p-6 shadow hover:shadow-lg transition-shadow duration-300 flex flex-col"
              variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
              whileHover={{ y: -2 }}
            >
              <div className="flex-grow">
                <div className="mb-4">
                  <Quote className="h-8 w-8 text-primary" />
                </div>
                <div className="flex items-center space-x-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-foreground/80 leading-relaxed mb-6">
                  {testimonial.content}
                </p>
              </div>
              <div className="flex items-center space-x-3 mt-auto">
                {testimonial.authorAvatarUrl ? (
                   <Image
                      src={testimonial.authorAvatarUrl}
                      alt={testimonial.authorName}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center font-bold">
                    {testimonial.authorName.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-foreground">
                    {testimonial.authorName}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.authorTitle}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        
      </div>
    </section>
  );
}
