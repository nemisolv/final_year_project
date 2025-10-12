package com.nemisolv.starter.service;

import com.nemisolv.starter.entity.User;
import com.nemisolv.starter.payload.ChangePasswordRequest;
import com.nemisolv.starter.payload.profile.CreateUserProfileRequest;
import com.nemisolv.starter.payload.profile.UserOnboardingRequest;
import com.nemisolv.starter.payload.profile.UserProfileUpdateRequest;
import com.nemisolv.starter.payload.response.FullInfoProfile;
import com.nemisolv.starter.repository.EnrollmentRepository;
import com.nemisolv.starter.repository.LearningStreakRepository;
import com.nemisolv.starter.repository.UserProfileRepository;
import com.nemisolv.starter.repository.UserRepository;
import com.nemisolv.starter.repository.UserStatsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepo;
    private final UserProfileRepository userProfileRepo;
    private final UserStatsRepository userStatsRepo;
    private final LearningStreakRepository learningStreakRepo;
    private final EnrollmentRepository enrollmentRepo;
    

    public void changePassword(ChangePasswordRequest passwordRequest, User user) {
         if(!passwordEncoder.matches(passwordRequest.getOldPassword(),user.getHashedPassword())) {
             throw new IllegalStateException("Wrong password");
         }

         if(!passwordRequest.getNewPassword().equals(passwordRequest.getConfirmationPassword())) {
             throw new IllegalStateException("Passwords are not the same");
         }

         user.setHashedPassword(passwordEncoder.encode(passwordRequest.getNewPassword()));
//            userRepo.save(user);
//         userRepo.save(user);
    }


    public Optional<User> findByEmail(String email) {
        return userRepo.findByEmail(email);
    }


    @Transactional
    public void onboarding(Integer userId, UserOnboardingRequest request) {
        // Update user profile with onboarding data
        userProfileRepo.onboarding(userId, request);

        // Check if user has any course enrollments
        boolean hasEnrollments = enrollmentRepo.hasAnyEnrollments(userId.longValue());

        // Only create user_stats and initialize streak if user has taken courses
        if (hasEnrollments) {
            // Check if user_stats already exists
            Optional<com.nemisolv.starter.entity.UserStats> existingStats =
                userStatsRepo.findByUserId(userId.longValue());

            if (existingStats.isEmpty()) {
                // Create user_stats with initial streak of 1
                userStatsRepo.createUserStats(userId.longValue());

                // Create initial learning streak entry for today
                learningStreakRepo.createInitialStreak(userId.longValue());
            }
        }
    }


    public void createUserProfile(CreateUserProfileRequest request) {
        userProfileRepo.createUserProfile(request);
    }


    public FullInfoProfile getFullProfile(Integer userId) {
        return userProfileRepo.getFullProfile(userId);
    }

    public FullInfoProfile updateCurrentUserProfile(Integer userId, UserProfileUpdateRequest request) {
        userProfileRepo.updateUserProfile(userId, request);
        return userProfileRepo.getFullProfile(userId);
    }
}
