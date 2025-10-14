// User entity with camelCase fields
export interface User {
  id: number;
  userId: number;
  email: string;
  username: string;
  name: string;
  roles: string[];
  permissions: Record<string, string[]>;
  emailVerified: boolean;
  lastLoginAt: string;
  createdAt: string;
  updatedAt?: string;
  isOnboarded: boolean;
  avatarUrl: string;
  // Profile fields
  englishLevel?: string;
  learningGoals?: string;
  preferredAccent?: string;
  dailyStudyGoal?: number;
  notificationEnabled?: boolean;
  privacyLevel?: string;
  dob?: string;
}

// User Onboarding Data
export interface UserOnboardingData {
  dob: string | null;
  dailyStudyGoalInMinutes: number;
  shortIntroduction: string;
  englishLevel: string;
  learningGoals: string;
}

// User Create Request
export interface UserCreateData {
  email: string;
  password: string;
  name: string;
  roles: string[];
}

// User Update Request
export interface UserUpdateData {
  name?: string;
  username?: string;
  avatarUrl?: string;
  englishLevel?: string;
  learningGoals?: string;
  preferredAccent?: string;
  dailyStudyGoal?: number;
  notificationEnabled?: boolean;
  privacyLevel?: string;
  dob?: string;
}
