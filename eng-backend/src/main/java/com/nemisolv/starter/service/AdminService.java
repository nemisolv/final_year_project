package com.nemisolv.starter.service;

import com.nemisolv.starter.enums.UserStatus;
import com.nemisolv.starter.exception.ResourceNotFoundException;
import com.nemisolv.starter.payload.admin.AdminUserRequest;
import com.nemisolv.starter.payload.admin.AdminUserResponse;
import com.nemisolv.starter.repository.AdminUserRepository;
import com.nemisolv.starter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {
    private final AdminUserRepository adminUserRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public Page<AdminUserResponse> getAllUsers(Pageable pageable) {
        List<AdminUserResponse> users = adminUserRepository.findAllUsers(pageable);
        long total = adminUserRepository.countAllUsers();
        return new PageImpl<>(users, pageable, total);
    }

    public AdminUserResponse getUserById(String id) {
        return adminUserRepository.findUserById(Integer.parseInt(id))
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @Transactional
    public AdminUserResponse createUser(AdminUserRequest request) {
        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        Integer userId = adminUserRepository.createUser(
                request.getEmail(),
                request.getUsername(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName(),
                request.getPhoneNumber()
        );

        // Assign roles if provided
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            adminUserRepository.assignRolesToUser(userId, request.getRoles());
        }

        return getUserById(String.valueOf(userId));
    }

    @Transactional
    public AdminUserResponse updateUser(String id, AdminUserRequest request) {
        Integer userId = Integer.parseInt(id);

        // Check if user exists
        getUserById(id);

        adminUserRepository.updateUser(
                userId,
                request.getEmail(),
                request.getUsername(),
                request.getFullName(),
                request.getPhoneNumber()
        );

        // Update roles if provided
        if (request.getRoles() != null) {
            adminUserRepository.updateUserRoles(userId, request.getRoles());
        }

        return getUserById(id);
    }

    @Transactional
    public void deleteUser(String id) {
        Integer userId = Integer.parseInt(id);

        // Check if user exists
        getUserById(id);

        adminUserRepository.deleteUser(userId);
    }

    @Transactional
    public AdminUserResponse toggleUserStatus(String id, boolean enabled) {
        Integer userId = Integer.parseInt(id);

        // Check if user exists
        getUserById(id);

        UserStatus newStatus = enabled ? UserStatus.ACTIVE : UserStatus.INACTIVE;
        adminUserRepository.updateUserStatus(userId, newStatus);

        return getUserById(id);
    }
}
