package com.nemisolv.starter.service;

import com.nemisolv.starter.entity.Permission;
import com.nemisolv.starter.entity.Role;
import com.nemisolv.starter.exception.ConflictException;
import com.nemisolv.starter.exception.ResourceNotFoundException;
import com.nemisolv.starter.payload.admin.permission.PermissionResponse;
import com.nemisolv.starter.payload.admin.role.*;
import com.nemisolv.starter.repository.PermissionRepository;
import com.nemisolv.starter.repository.RolePermissionRepository;
import com.nemisolv.starter.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoleManagementService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;

    @Transactional(readOnly = true)
    public Page<RoleResponse> getAllRoles(Pageable pageable) {
        Page<Role> roles = roleRepository.findAll(pageable);
        List<RoleResponse> responses = roles.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return new PageImpl<>(responses, pageable, roles.getTotalElements());
    }

    @Transactional(readOnly = true)
    public RoleResponse getRoleById(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + id));
        return toDetailResponse(role);
    }

    @Transactional
    public RoleResponse createRole(RoleCreateRequest request) {
        if (roleRepository.existsByName(request.getName())) {
            throw new ConflictException("Role name already exists: " + request.getName());
        }

        Role role = new Role();
        role.setName(request.getName().toUpperCase());
        role.setDisplayName(request.getDisplayName());
        role.setDescription(request.getDescription());
        role.setCreatedAt(LocalDateTime.now());

        Role savedRole = roleRepository.save(role);

        if (request.getPermissionIds() != null && !request.getPermissionIds().isEmpty()) {
            assignPermissionsToRole(savedRole.getId(), request.getPermissionIds());
        }

        return toDetailResponse(savedRole);
    }

    @Transactional
    public RoleResponse updateRole(Long id, RoleUpdateRequest request) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + id));

        if (request.getName() != null && !request.getName().equals(role.getName())) {
            if (roleRepository.existsByName(request.getName())) {
                throw new ConflictException("Role name already exists: " + request.getName());
            }
            role.setName(request.getName().toUpperCase());
        }

        if (request.getDisplayName() != null) {
            role.setDisplayName(request.getDisplayName());
        }

        if (request.getDescription() != null) {
            role.setDescription(request.getDescription());
        }

        if (request.getPermissionIds() != null) {
            rolePermissionRepository.deleteByRoleId(id);
            assignPermissionsToRole(id, request.getPermissionIds());
        }

        Role updatedRole = roleRepository.save(role);
        return toDetailResponse(updatedRole);
    }

    @Transactional
    public void deleteRole(Long id) {
        if (!roleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Role not found: " + id);
        }

        Role role = roleRepository.findById(id).get();
        if ("ADMIN".equals(role.getName()) || "USER".equals(role.getName())) {
            throw new ConflictException("Cannot delete system role: " + role.getName());
        }

        roleRepository.deleteById(id);
    }

    @Transactional
    public RoleResponse assignPermissions(Long roleId, AssignPermissionsRequest request) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleId));

        if (request.getReplace()) {
            rolePermissionRepository.deleteByRoleId(roleId);
        }

        assignPermissionsToRole(roleId, request.getPermissionIds());

        return toDetailResponse(role);
    }

    @Transactional
    public RoleResponse removePermissions(Long roleId, Set<Long> permissionIds) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleId));

        rolePermissionRepository.deleteByRoleIdAndPermissionIdIn(roleId, permissionIds);

        return toDetailResponse(role);
    }

    @Transactional(readOnly = true)
    public List<PermissionResponse> getRolePermissions(Long roleId) {
        if (!roleRepository.existsById(roleId)) {
            throw new ResourceNotFoundException("Role not found: " + roleId);
        }

        List<Permission> permissions = permissionRepository.findByRoleId(roleId);
        return permissions.stream()
                .map(this::toPermissionResponse)
                .collect(Collectors.toList());
    }

    private void assignPermissionsToRole(Long roleId, Set<Long> permissionIds) {
        List<Permission> permissions = permissionRepository.findByIdIn(permissionIds);
        if (permissions.size() != permissionIds.size()) {
            throw new ResourceNotFoundException("Some permissions not found");
        }

        for (Long permissionId : permissionIds) {
            rolePermissionRepository.insert(roleId, permissionId);
        }
    }

    private RoleResponse toResponse(Role role) {
        Long userCount = roleRepository.countUsersByRoleId(role.getId());
        Integer permCount = rolePermissionRepository.countByRoleId(role.getId());

        return RoleResponse.builder()
                .id(role.getId())
                .name(role.getName())
                .displayName(role.getDisplayName())
                .description(role.getDescription())
                .createdAt(role.getCreatedAt())
                .userCount(userCount)
                .permissionCount(permCount)
                .build();
    }

    private RoleResponse toDetailResponse(Role role) {
        List<Permission> permissions = permissionRepository.findByRoleId(role.getId());
        Long userCount = roleRepository.countUsersByRoleId(role.getId());

        return RoleResponse.builder()
                .id(role.getId())
                .name(role.getName())
                .displayName(role.getDisplayName())
                .description(role.getDescription())
                .createdAt(role.getCreatedAt())
                .permissions(permissions.stream()
                        .map(this::toPermissionResponse)
                        .collect(Collectors.toList()))
                .userCount(userCount)
                .permissionCount(permissions.size())
                .build();
    }

    private PermissionResponse toPermissionResponse(Permission p) {
        Long roleCount = rolePermissionRepository.countByPermissionId(p.getId());

        return PermissionResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .displayName(p.getDisplayName())
                .resourceType(p.getResourceType())
                .action(p.getAction())
                .createdAt(p.getCreatedAt())
                .roleCount(roleCount)
                .deletable(roleCount == 0)
                .build();
    }
}
