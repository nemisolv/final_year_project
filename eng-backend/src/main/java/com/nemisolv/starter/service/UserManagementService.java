package com.nemisolv.starter.service;

import com.nemisolv.starter.entity.Role;
import com.nemisolv.starter.entity.User;
import com.nemisolv.starter.enums.UserStatus;
import com.nemisolv.starter.exception.ConflictException;
import com.nemisolv.starter.exception.ResourceNotFoundException;
import com.nemisolv.starter.payload.PagedResponse;
import com.nemisolv.starter.payload.admin.user.*;
import com.nemisolv.starter.payload.admin.role.RoleResponse;
import com.nemisolv.starter.repository.UserManagementViewRepository;
import com.nemisolv.starter.repository.UserRepository;
import com.nemisolv.starter.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.nemisolv.starter.pagination.Page;
import com.nemisolv.starter.pagination.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service quản lý User (CRUD operations)
 * Chỉ dành cho ADMIN
 *
 * @author nemisolv
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserManagementService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserManagementViewRepository userManagementViewRepository;

    /**
     * Lấy danh sách tất cả users với phân trang - sử dụng view + cache
     *
     * @param pageable Thông tin phân trang (page, size, sort)
     * @return PagedResponse chứa danh sách UserListResponse
     */
    @Transactional(readOnly = true)
    public PagedResponse<UserListResponse> getAllUsers(Pageable pageable) {
        log.debug("Fetching all users with pagination: {}", pageable);

        // Lấy users từ cached view repository - trả về AdminUserResponse
        com.nemisolv.starter.pagination.Page<com.nemisolv.starter.payload.admin.AdminUserResponse> adminUsers =
            userManagementViewRepository.findAll(pageable);

        // Convert AdminUserResponse sang UserListResponse
        List<UserListResponse> responses = adminUsers.getContent().stream()
                .map(this::fromAdminToListResponse)
                .collect(Collectors.toList());

        int totalPages = adminUsers.getTotalPages();
        boolean isLast = adminUsers.isLast();

        return PagedResponse.<UserListResponse>builder()
                .content(responses)
                .page(pageable.getPage() + 1)  // Convert from 0-indexed to 1-indexed for API
                .limit(pageable.getSize())
                .totalElements(adminUsers.getTotalElements())
                .totalPages(totalPages)
                .isLast(isLast)
                .build();
    }

    /**
     * Tìm kiếm users theo keyword (username, email, name) - sử dụng cached search
     *
     * @param keyword Từ khóa tìm kiếm
     * @param pageable Thông tin phân trang
     * @return PagedResponse chứa kết quả tìm kiếm
     */
    @Transactional(readOnly = true)
    public PagedResponse<UserListResponse> searchUsers(String keyword, Pageable pageable) {
        log.debug("Searching users with keyword: {}", keyword);

        // Sử dụng cached search từ view repository
        com.nemisolv.starter.pagination.Page<com.nemisolv.starter.payload.admin.AdminUserResponse> adminUsers =
            userManagementViewRepository.searchUsers(keyword, pageable);

        List<UserListResponse> responses = adminUsers.getContent().stream()
                .map(this::fromAdminToListResponse)
                .collect(Collectors.toList());

        return PagedResponse.<UserListResponse>builder()
                .content(responses)
                .page(pageable.getPage() + 1)  // Convert from 0-indexed to 1-indexed for API
                .limit(pageable.getSize())
                .totalElements(adminUsers.getTotalElements())
                .totalPages(adminUsers.getTotalPages())
                .isLast(adminUsers.isLast())
                .build();
    }

    /**
     * Lấy chi tiết user theo ID
     *
     * @param id User ID
     * @return UserDetailResponse chứa đầy đủ thông tin
     * @throws ResourceNotFoundException nếu user không tồn tại
     */
    @Transactional(readOnly = true)
    public UserDetailResponse getUserById(Long id) {
        log.debug("Fetching user detail for ID: {}", id);

        User user = userRepository.findById(id.intValue())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với ID: " + id));

        return toDetailResponse(user);
    }

    /**
     * Tạo user mới
     *
     * @param request UserCreateRequest
     * @return UserDetailResponse của user vừa tạo
     * @throws ConflictException nếu username hoặc email đã tồn tại
     */
    @Transactional
    public UserDetailResponse createUser(UserCreateRequest request) {
        log.info("Creating new user with username: {}", request.getUsername());

        // Kiểm tra username đã tồn tại
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ConflictException("Username đã tồn tại: " + request.getUsername());
        }

        // Kiểm tra email đã tồn tại
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email đã tồn tại: " + request.getEmail());
        }

        // Tạo user entity
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .hashedPassword(passwordEncoder.encode(request.getPassword()))
                .status(request.getStatus() != null ?
                        UserStatus.valueOf(request.getStatus()) : UserStatus.ACTIVE)
                .emailVerified(request.getEmailVerified() != null ?
                        request.getEmailVerified() : false)
                .build();

        // Gán roles
        if (request.getRoleIds() != null && !request.getRoleIds().isEmpty()) {
            Set<Role> roles = roleRepository.findByIdIn(request.getRoleIds());
            if (roles.size() != request.getRoleIds().size()) {
                throw new ResourceNotFoundException("Một hoặc nhiều role không tồn tại");
            }
            user.setRoles(roles);
        } else {
            // Gán role USER mặc định
            Role userRole = roleRepository.findByName("USER")
                    .orElseThrow(() -> new ResourceNotFoundException("Role USER mặc định không tồn tại"));
            user.setRoles(Set.of(userRole));
        }

        // Lưu user
        User savedUser = userRepository.save(user);

        // Lưu roles vào user_roles table
        if (!savedUser.getRoles().isEmpty()) {
            userRepository.saveUserRoles(savedUser.getId(), savedUser.getRoles());
        }

        // Evict cache sau khi tạo user
        userManagementViewRepository.evictUserCache();

        log.info("Created user successfully with ID: {}", savedUser.getId());

        return toDetailResponse(savedUser);
    }

    /**
     * Cập nhật thông tin user
     *
     * @param id User ID
     * @param request UserUpdateRequest
     * @return UserDetailResponse đã cập nhật
     * @throws ResourceNotFoundException nếu user không tồn tại
     * @throws ConflictException nếu username/email mới đã tồn tại
     */
    @Transactional
    public UserDetailResponse updateUser(Long id, UserUpdateRequest request) {
        log.info("Updating user with ID: {}", id);

        User user = userRepository.findById(id.intValue())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với ID: " + id));

        // Update username (nếu có và khác với hiện tại)
        if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new ConflictException("Username đã tồn tại: " + request.getUsername());
            }
            user.setUsername(request.getUsername());
        }

        // Update email (nếu có và khác với hiện tại)
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new ConflictException("Email đã tồn tại: " + request.getEmail());
            }
            user.setEmail(request.getEmail());
        }

        // Update password (nếu có)
        if (request.getPassword() != null) {
            user.setHashedPassword(passwordEncoder.encode(request.getPassword()));
        }

        // Update status (nếu có)
        if (request.getStatus() != null) {
            user.setStatus(UserStatus.valueOf(request.getStatus()));
        }

        // Update email verified (nếu có)
        if (request.getEmailVerified() != null) {
            user.setEmailVerified(request.getEmailVerified());
        }

        // Update roles (nếu có)
        if (request.getRoleIds() != null) {
            Set<Role> newRoles = roleRepository.findByIdIn(request.getRoleIds());
            if (newRoles.size() != request.getRoleIds().size()) {
                throw new ResourceNotFoundException("Một hoặc nhiều role không tồn tại");
            }
            user.setRoles(newRoles);
        }

        User updatedUser = userRepository.save(user);

        // Update roles nếu có
        if (request.getRoleIds() != null && !updatedUser.getRoles().isEmpty()) {
            userRepository.saveUserRoles(updatedUser.getId(), updatedUser.getRoles());
        }

        // Evict cache sau khi update
        userManagementViewRepository.evictUserCache(id.intValue());
        userManagementViewRepository.evictUserCache();

        log.info("Updated user successfully with ID: {}", id);

        return toDetailResponse(updatedUser);
    }

    /**
     * Xóa user
     *
     * @param id User ID
     * @throws ResourceNotFoundException nếu user không tồn tại
     */
    @Transactional
    public void deleteUser(Long id) {
        log.info("Deleting user with ID: {}", id);

        if (!userRepository.existsById(id.intValue())) {
            throw new ResourceNotFoundException("Không tìm thấy user với ID: " + id);
        }

        // CASCADE delete sẽ tự động xóa profile, stats, roles relationship
        userRepository.deleteById(id.intValue());

        // Evict cache sau khi delete
        userManagementViewRepository.evictUserCache(id.intValue());
        userManagementViewRepository.evictUserCache();

        log.info("Deleted user successfully with ID: {}", id);
    }

    /**
     * Gán roles cho user
     *
     * @param userId User ID
     * @param request AssignRolesRequest
     * @return UserDetailResponse đã cập nhật roles
     */
    @Transactional
    public UserDetailResponse assignRoles(Long userId, AssignRolesRequest request) {
        log.info("Assigning roles to user ID: {}", userId);

        User user = userRepository.findById(userId.intValue())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với ID: " + userId));

        Set<Role> rolesToAssign = roleRepository.findByIdIn(request.getRoleIds());
        if (rolesToAssign.size() != request.getRoleIds().size()) {
            throw new ResourceNotFoundException("Một hoặc nhiều role không tồn tại");
        }

        if (request.getReplace()) {
            // Replace toàn bộ roles
            user.setRoles(rolesToAssign);
        } else {
            // Thêm vào roles hiện tại
            user.getRoles().addAll(rolesToAssign);
        }

        User updatedUser = userRepository.save(user);

        // Update roles trong database
        userRepository.saveUserRoles(updatedUser.getId(), updatedUser.getRoles());

        // Evict cache
        userManagementViewRepository.evictUserCache(userId.intValue());
        userManagementViewRepository.evictUserCache();

        log.info("Assigned {} roles to user ID: {}", rolesToAssign.size(), userId);

        return toDetailResponse(updatedUser);
    }

    /**
     * Xóa roles khỏi user
     *
     * @param userId User ID
     * @param roleIds Set of role IDs to remove
     * @return UserDetailResponse đã cập nhật
     */
    @Transactional
    public UserDetailResponse removeRoles(Long userId, Set<Long> roleIds) {
        log.info("Removing roles from user ID: {}", userId);

        User user = userRepository.findById(userId.intValue())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với ID: " + userId));

        user.getRoles().removeIf(role -> roleIds.contains(role.getId()));

        // Đảm bảo user luôn có ít nhất 1 role
        if (user.getRoles().isEmpty()) {
            Role userRole = roleRepository.findByName("USER")
                    .orElseThrow(() -> new ResourceNotFoundException("Role USER mặc định không tồn tại"));
            user.setRoles(Set.of(userRole));
        }

        User updatedUser = userRepository.save(user);

        // Update roles trong database
        userRepository.saveUserRoles(updatedUser.getId(), updatedUser.getRoles());

        // Evict cache
        userManagementViewRepository.evictUserCache(userId.intValue());
        userManagementViewRepository.evictUserCache();

        log.info("Removed roles from user ID: {}", userId);

        return toDetailResponse(updatedUser);
    }

    /**
     * Kích hoạt user (status = ACTIVE)
     *
     * @param id User ID
     * @return UserDetailResponse
     */
    @Transactional
    public UserDetailResponse activateUser(Long id) {
        log.info("Activating user ID: {}", id);

        User user = userRepository.findById(id.intValue())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với ID: " + id));

        user.setStatus(UserStatus.ACTIVE);
        User updatedUser = userRepository.save(user);

        // Evict cache
        userManagementViewRepository.evictUserCache(id.intValue());
        userManagementViewRepository.evictUserCache();

        log.info("Activated user ID: {}", id);

        return toDetailResponse(updatedUser);
    }

    /**
     * Vô hiệu hóa user (status = INACTIVE)
     *
     * @param id User ID
     * @return UserDetailResponse
     */
    @Transactional
    public UserDetailResponse deactivateUser(Long id) {
        log.info("Deactivating user ID: {}", id);

        User user = userRepository.findById(id.intValue())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với ID: " + id));

        user.setStatus(UserStatus.INACTIVE);
        User updatedUser = userRepository.save(user);

        // Evict cache
        userManagementViewRepository.evictUserCache(id.intValue());
        userManagementViewRepository.evictUserCache();

        log.info("Deactivated user ID: {}", id);

        return toDetailResponse(updatedUser);
    }

    // ============= Private Helper Methods =============

    /**
     * Convert AdminUserResponse sang UserListResponse
     */
    private UserListResponse fromAdminToListResponse(com.nemisolv.starter.payload.admin.AdminUserResponse admin) {
        return UserListResponse.builder()
                .id(Long.parseLong(admin.getId()))
                .username(admin.getUsername())
                .email(admin.getEmail())
                .status(admin.getStatus())
                .emailVerified(admin.isEmailVerified())
                .provider(admin.getStatus()) // TODO: Add provider to AdminUserResponse if needed
                .roleNames(admin.getRoles() != null ?
                    admin.getRoles().stream().collect(Collectors.toSet()) : Set.of())
                .roleCount(admin.getRoles() != null ? admin.getRoles().size() : 0)
                .lastLoginAt(admin.getLastLogin())
                .createdAt(admin.getCreatedAt())
                .isOnboarded(admin.isOnboarded())
                .totalXp(null) // TODO: Add to view if needed
                .build();
    }

    /**
     * Convert User entity sang UserListResponse
     */
    private UserListResponse toListResponse(User user) {
        return UserListResponse.builder()
                .id(user.getId().longValue())
                .username(user.getUsername())
                .email(user.getEmail())
                .status(user.getStatus().name())
                .emailVerified(user.isEmailVerified())
                .provider(user.getAuthProvider().name())
                .roleNames(user.getRoles().stream()
                        .map(Role::getName)
                        .collect(Collectors.toSet()))
                .roleCount(user.getRoles().size())
                .lastLoginAt(user.getLastLogin())
                .createdAt(null) // TODO: Add createdAt to User entity
                .isOnboarded(user.isOnboarded())
                .totalXp(null) // TODO: Load from UserStats if needed
                .build();
    }

    /**
     * Convert User entity sang UserDetailResponse
     */
    private UserDetailResponse toDetailResponse(User user) {
        // TODO: Load profile and stats
        return UserDetailResponse.builder()
                .id(user.getId().longValue())
                .username(user.getUsername())
                .email(user.getEmail())
                .status(user.getStatus().name())
                .emailVerified(user.isEmailVerified())
                .provider(user.getAuthProvider().name())
                .lastLoginAt(user.getLastLogin())
                .roles(user.getRoles().stream()
                        .map(this::toRoleResponse)
                        .collect(Collectors.toSet()))
                .build();
    }

    /**
     * Convert Role entity sang RoleResponse
     */
    private RoleResponse toRoleResponse(Role role) {
        return RoleResponse.builder()
                .id(role.getId())
                .name(role.getName())
                .displayName(role.getDescription())
                .description(role.getDescription())
                .createdAt(role.getCreatedAt())
                .build();
    }
}
