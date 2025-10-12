"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, Bell, Mail, SlidersHorizontal, User, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

type SettingsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type TabKey = "profile" | "preferences" | "notifications" | "integrations";

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("profile");

  // Demo local states
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState<Date | undefined>(undefined);
  const [level, setLevel] = useState("intermediate");
  const [studyGoal, setStudyGoal] = useState("fluency");
  const [notifEmail, setNotifEmail] = useState("all");
  const [notifPush, setNotifPush] = useState("important");
  const [gmailConnected, setGmailConnected] = useState(false);

  function handleSave() {
    onOpenChange(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5" />
            Cài đặt
          </AlertDialogTitle>
          <AlertDialogDescription>
            Tuỳ chỉnh hồ sơ, sở thích học tập, thông báo và tích hợp.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <nav className="md:col-span-1">
            <ul className="space-y-2">
              <li>
                <button
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md border",
                    activeTab === "profile" ? "bg-accent border-border" : "hover:bg-accent/50"
                  )}
                  onClick={() => setActiveTab("profile")}
                >
                  <span className="inline-flex items-center gap-2"><User className="h-4 w-4" /> Hồ sơ</span>
                </button>
              </li>
              <li>
                <button
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md border",
                    activeTab === "preferences" ? "bg-accent border-border" : "hover:bg-accent/50"
                  )}
                  onClick={() => setActiveTab("preferences")}
                >
                  <span className="inline-flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" /> Sở thích</span>
                </button>
              </li>
              <li>
                <button
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md border",
                    activeTab === "notifications" ? "bg-accent border-border" : "hover:bg-accent/50"
                  )}
                  onClick={() => setActiveTab("notifications")}
                >
                  <span className="inline-flex items-center gap-2"><Bell className="h-4 w-4" /> Thông báo</span>
                </button>
              </li>
              <li>
                <button
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md border",
                    activeTab === "integrations" ? "bg-accent border-border" : "hover:bg-accent/50"
                  )}
                  onClick={() => setActiveTab("integrations")}
                >
                  <span className="inline-flex items-center gap-2"><Mail className="h-4 w-4" /> Tích hợp</span>
                </button>
              </li>
            </ul>
          </nav>

          <div className="md:col-span-3 space-y-6">
            {activeTab === "profile" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <Label htmlFor="displayName">Tên hiển thị</Label>
                  <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Ví dụ: Minh Anh" />
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <Label>Ngày sinh</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dob ? format(dob, "dd/MM/yyyy") : "Chọn ngày"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" align="start">
                      <Calendar mode="single" selected={dob} onSelect={setDob} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}

            {activeTab === "preferences" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <Label>Mục tiêu học</Label>
                  <Select value={studyGoal} onValueChange={setStudyGoal}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn mục tiêu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fluency">Giao tiếp lưu loát</SelectItem>
                      <SelectItem value="ielts">Luyện thi IELTS</SelectItem>
                      <SelectItem value="toeic">Luyện thi TOEIC</SelectItem>
                      <SelectItem value="business">Tiếng Anh công việc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <Label>Trình độ hiện tại</Label>
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trình độ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div>
                  <Label className="mb-2 block">Email</Label>
                  <RadioGroup value={notifEmail} onValueChange={setNotifEmail} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id="email_all" value="all" />
                      <Label htmlFor="email_all">Tất cả thông báo</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id="email_important" value="important" />
                      <Label htmlFor="email_important">Chỉ quan trọng</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id="email_none" value="none" />
                      <Label htmlFor="email_none">Tắt</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label className="mb-2 block">Push</Label>
                  <RadioGroup value={notifPush} onValueChange={setNotifPush} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id="push_all" value="all" />
                      <Label htmlFor="push_all">Tất cả thông báo</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id="push_important" value="important" />
                      <Label htmlFor="push_important">Chỉ quan trọng</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id="push_none" value="none" />
                      <Label htmlFor="push_none">Tắt</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {activeTab === "integrations" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Kết nối Gmail</p>
                      <p className="text-sm text-muted-foreground">Đồng bộ thông báo và lịch học qua Gmail</p>
                    </div>
                  </div>
                  {gmailConnected ? (
                    <div className="inline-flex items-center gap-2 text-green-600"><CheckCircle2 className="h-4 w-4" /> Đã kết nối</div>
                  ) : (
                    <Button onClick={() => setGmailConnected(true)}>Kết nối</Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <Button onClick={handleSave}>Lưu</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}


