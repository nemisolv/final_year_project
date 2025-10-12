"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { ArrowRight, ArrowLeft, Gift, GraduationCap, Languages, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";

const steps = [
  {
    key: "welcome",
    title: "Chào mừng bạn đến với EnglishMaster",
    description:
      "Chúng tôi muốn hiểu bạn hơn để cá nhân hóa lộ trình học. Việc trả lời vài câu hỏi sau giúp nội dung phù hợp với mục tiêu của bạn.",
    illustration: "/globe.svg",
  },
  {
    key: "profile",
    title: "Thông tin cơ bản",
    description: "Những thông tin này giúp chúng tôi gợi ý nội dung phù hợp với độ tuổi và mốc phát triển ngôn ngữ.",
    illustration: "/window.svg",
  },
  {
    key: "level",
    title: "Trình độ hiện tại",
    description: "Xác định mức độ để hệ thống đề xuất bài học vừa sức, tránh quá khó hoặc quá dễ.",
    illustration: "/file.svg",
  },
  {
    key: "goals",
    title: "Mục tiêu học tập",
    description: "Mục tiêu rõ ràng giúp bạn duy trì động lực và chúng tôi theo dõi tiến độ hiệu quả.",
    illustration: "/next.svg",
  },
  {
    key: "finish",
    title: "Hoàn tất thiết lập",
    description: "Tuyệt vời! Chúng tôi đã sẵn sàng đồng hành cùng bạn trên hành trình chinh phục tiếng Anh.",
    illustration: "/vercel.svg",
  },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [birthday, setBirthday] = useState<Date | undefined>();
  const [level, setLevel] = useState<string>("");
  const [purpose, setPurpose] = useState<string>("");
  const [timePerDay, setTimePerDay] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const next = () => setCurrent((c) => Math.min(c + 1, steps.length - 1));
  const prev = () => setCurrent((c) => Math.max(c - 1, 0));

  const handleFinish = async () => {
    setIsSubmitting(true);

    try {
      // Map level to backend enum
      const levelMap: Record<string, string> = {
        "Beginner (A1)": "BEGINNER",
        "Elementary (A2)": "ELEMENTARY",
        "Intermediate (B1)": "INTERMEDIATE",
        "Upper-Intermediate (B2)": "UPPER_INTERMEDIATE",
        "Advanced (C1+)": "ADVANCED"
      };

      await apiClient.submitOnboarding({
        dob: birthday ? format(birthday, "yyyy-MM-dd") : null,
        daily_study_goal_in_minutes: parseInt(timePerDay) || 30,
        short_introduction: notes || "",
        english_level: levelMap[level] || "BEGINNER",
        learning_goals: purpose || ""
      });

      toast.success("Thiết lập hoàn tất! Bắt đầu hành trình học nào.");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Onboarding failed:", error);
      const errorMessage = error.response?.data?.message || "Không thể hoàn tất thiết lập";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="w-full max-w-3xl">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
            <Sparkles className="w-4 h-4" />
            Onboarding • Bước {current + 1}/{steps.length}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border bg-card/50 backdrop-blur">
          <div className="grid md:grid-cols-2">
            <div className="p-6 md:p-8">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={steps[current].key}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">{steps[current].title}</h2>
                    <p className="text-muted-foreground">{steps[current].description}</p>
                  </div>

                  {steps[current].key === "welcome" && (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Đây là cuộc khảo sát siêu nhanh giúp hệ thống hiểu bạn hơn. Bạn có thể thay đổi thông tin bất kỳ lúc nào trong cài đặt.
                      </p>
                      <div className="flex gap-2">
                        <Button onClick={next}>
                          Bắt đầu ngay
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button variant="outline" onClick={() => (window.location.href = "/dashboard")}>Để sau</Button>
                      </div>
                    </div>
                  )}

                  {steps[current].key === "profile" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Ngày sinh</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start">
                              {birthday ? format(birthday, "PPP", { locale: vi }) : "Chọn ngày sinh"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="p-0">
                            <Calendar mode="single" selected={birthday} onSelect={setBirthday} initialFocus />
                          </PopoverContent>
                        </Popover>
                        <p className="text-xs text-muted-foreground">Ngày sinh giúp cá nhân hoá bài học và lộ trình theo độ tuổi.</p>
                      </div>

                      <div className="space-y-2">
                        <Label>Thời gian học mỗi ngày</Label>
                        <Select value={timePerDay} onValueChange={setTimePerDay}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn khoảng thời gian" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10 phút</SelectItem>
                            <SelectItem value="20">20 phút</SelectItem>
                            <SelectItem value="30">30 phút</SelectItem>
                            <SelectItem value="45">45 phút</SelectItem>
                            <SelectItem value="60">60 phút</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">Thời gian học giúp đề xuất lịch học phù hợp để duy trì thói quen.</p>
                      </div>

                      <div className="space-y-2">
                        <Label>Giới thiệu ngắn</Label>
                        <Textarea placeholder="Một chút về bạn..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                        <p className="text-xs text-muted-foreground">Chia sẻ ngắn giúp chúng tôi biết bạn quan tâm điều gì khi học.</p>
                      </div>

                      <div className="flex justify-between">
                        <Button variant="outline" onClick={prev}>
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Quay lại
                        </Button>
                        <Button onClick={next}>
                          Tiếp tục
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {steps[current].key === "level" && (
                    <div className="space-y-4">
                      <Label>Chọn trình độ hiện tại</Label>
                      <RadioGroup value={level} onValueChange={setLevel} className="grid grid-cols-1 gap-3">
                        {["Beginner (A1)", "Elementary (A2)", "Intermediate (B1)", "Upper-Intermediate (B2)", "Advanced (C1+)"]
                          .map((l) => (
                            <label key={l} className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-accent">
                              <RadioGroupItem value={l} id={l} />
                              <span>{l}</span>
                            </label>
                          ))}
                      </RadioGroup>
                      <p className="text-xs text-muted-foreground">Trình độ giúp thiết lập độ khó phù hợp để bạn tiến bộ đều đặn.</p>

                      <div className="flex justify-between">
                        <Button variant="outline" onClick={prev}>
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Quay lại
                        </Button>
                        <Button onClick={next} disabled={!level}>
                          Tiếp tục
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {steps[current].key === "goals" && (
                    <div className="space-y-4">
                      <Label>Mục tiêu chính của bạn</Label>
                      <Select value={purpose} onValueChange={setPurpose}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn mục tiêu" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="communication">Giao tiếp công việc/hằng ngày</SelectItem>
                          <SelectItem value="exam">Thi chứng chỉ (IELTS, TOEIC...)</SelectItem>
                          <SelectItem value="study">Du học/Học tập</SelectItem>
                          <SelectItem value="travel">Du lịch</SelectItem>
                          <SelectItem value="other">Khác</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Mục tiêu định hướng lộ trình và nội dung luyện tập phù hợp.</p>

                      <div className="flex justify-between">
                        <Button variant="outline" onClick={prev}>
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Quay lại
                        </Button>
                        <Button onClick={next} disabled={!purpose}>
                          Tiếp tục
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {steps[current].key === "finish" && (
                    <div className="space-y-4">
                      <div className="rounded-lg border p-4 bg-background">
                        <p className="text-sm text-muted-foreground">Tóm tắt nhanh</p>
                        <ul className="mt-2 text-sm">
                          <li>• Ngày sinh: {birthday ? format(birthday, "PPP", { locale: vi }) : "Chưa đặt"}</li>
                          <li>• Thời gian mỗi ngày: {timePerDay || "Chưa chọn"} phút</li>
                          <li>• Trình độ: {level || "Chưa chọn"}</li>
                          <li>• Mục tiêu: {purpose || "Chưa chọn"}</li>
                        </ul>
                      </div>

                      <div className="flex justify-between">
                        <Button variant="outline" onClick={prev} disabled={isSubmitting}>
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Quay lại
                        </Button>
                        <Button onClick={handleFinish} disabled={isSubmitting}>
                          {isSubmitting ? "Đang xử lý..." : "Hoàn tất"}
                          {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="relative hidden md:block p-6 md:p-8 bg-gradient-to-b from-primary/10 to-secondary/10">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={steps[current].illustration}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full flex items-center justify-center"
                >
                  <Image src={steps[current].illustration} alt="illustration" width={320} height={320} className="drop-shadow-xl" />
                </motion.div>
              </AnimatePresence>

              <div className="absolute bottom-4 left-0 right-0 px-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  <span>Hệ thống sẽ cá nhân hoá lộ trình dựa trên thông tin bạn cung cấp.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
