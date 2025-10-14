export interface UserListItem {
  id: number;
  username: string;
  email: string;
  name: string;
  status: string;
  emailVerified: boolean;
  provider: string;
  roleNames: string[];
  roleCount: number;
  lastLoginAt: string | null;
  createdAt: string;
  isOnboarded: boolean;
  totalXp: number | null;
}

export interface UserDetail {
  id: number;
  username: string;
  email: string;
  name: string;
  status: string;
  emailVerified: boolean;
  provider: string;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string | null;
  roles: UserRole[];
  profile: UserProfile | null;
  stats: UserStats | null;
}

export interface UserRole {
  id: number;
  name: string;
  displayName: string;
  description: string | null;
  createdAt: string;
}

export interface UserProfile {
  englishLevel: string | null;
  learningGoals: string | null;
  preferredAccent: string | null;
  dailyStudyGoal: number | null;
  timezone: string | null;
  notificationEnabled: boolean;
  privacyLevel: string | null;
  bio: string | null;
  isOnboarded: boolean;
}

export interface UserStats {
  totalXp: number;
  currentLevel: number;
  lessonsCompleted: number;
  exercisesCompleted: number;
  currentStreakDays: number;
  longestStreakDays: number;
}

export interface UserCreateData {
  username: string;
  email: string;
  password: string;
  name: string;
  roleIds?: number[];
  status?: string;
  emailVerified?: boolean;
}

export interface UserUpdateData {
  username?: string;
  email?: string;
  password?: string;
  name?: string;
  status?: string;
  emailVerified?: boolean;
  roleIds?: number[];
}

export interface AssignRolesData {
  roleIds: number[];
  replace?: boolean;
}
