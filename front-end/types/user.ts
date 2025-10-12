export interface User {
  id: number;
  user_id: number;
  email: string;
  username: string;
  full_name?: string;
  name?: string;
  roles?: string[] | null;
  permissions?: Record<string, string[]>;
  email_verified?: boolean;
  status?: string;
  enabled?: boolean;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
  is_onboarded: boolean;
  avatar?: string;
  // Profile fields
  english_level?: string;
  learning_goals?: string;
  preferred_accent?: string;
  daily_study_goal?: number;
  notification_enabled?: boolean;
  privacy_level?: string;
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
