export interface User {
  id: number;
  user_id: number;
  email: string;
  username: string;
  fullName?: string;
  name?: string;
  roles?: string[] | null;
  permissions?: Record<string, string[]>;
  emailVerified?: boolean;
  status?: string;
  enabled?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  isOnboarded: boolean;
  avatar?: string;
  // Profile fields
  englishLevel?: string;
  learningGoals?: string;
  preferredAccent?: string;
  dailyStudyGoal?: number;
  notificationEnabled?: boolean;
  privacyLevel?: string;
  dob?: string;
  onboarded?: boolean;
}

export interface UserOnboardingData {
  dob: string | null;
  daily_study_goal_in_minutes: number;
  short_introduction: string;
  english_level: string;
  learning_goals: string;
}

export interface UserCreateData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  roles: string[];
}
