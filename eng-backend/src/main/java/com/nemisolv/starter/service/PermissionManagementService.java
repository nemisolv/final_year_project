package com.nemisolv.starter.service;

import com.nemisolv.starter.entity.Permission;
import com.nemisolv.starter.exception.ConflictException;
import com.nemisolv.starter.exception.ResourceNotFoundException;
import com.nemisolv.starter.payload.admin.permission.*;
import com.nemisolv.starter.repository.PermissionRepository;
import com.nemisolv.starter.repository.RolePermissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PermissionManagementService {

    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;

    @Transactional(readOnly = true)
    public List<PermissionResponse> getAllPermissions() {
        List<Permission> permissions = permissionRepository.findAll();
        return permissions.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PermissionResponse getPermissionById(Long id) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permission not found: " + id));
        return toResponse(permission);
    }

    @Transactional(readOnly = true)
    public List<PermissionResponse> getPermissionsByResourceType(String resourceType) {
        List<Permission> permissions = permissionRepository.findByResourceType(resourceType);
        return permissions.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public PermissionResponse createPermission(PermissionCreateRequest request) {
        if (permissionRepository.existsByName(request.getName())) {
            throw new ConflictException("Permission already exists: " + request.getName());
        }

        if (permissionRepository.existsByResourceTypeAndAction(
                request.getResourceType(), request.getAction())) {
            throw new ConflictException("Permission already exists for resource: " +
                    request.getResourceType() + " and action: " + request.getAction());
        }

        Permission permission = new Permission();
        permission.setName(request.getName().toUpperCase());
        permission.setDisplayName(request.getDisplayName());
        permission.setResourceType(request.getResourceType().toUpperCase());
        permission.setAction(request.getAction().toUpperCase());
        permission.setCreatedAt(LocalDateTime.now());

        Permission saved = permissionRepository.save(permission);
        return toResponse(saved);
    }

    @Transactional
    public PermissionResponse updatePermission(Long id, PermissionUpdateRequest request) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permission not found: " + id));

        if (request.getDisplayName() != null) {
            permission.setDisplayName(request.getDisplayName());
        }

        Permission updated = permissionRepository.save(permission);
        return toResponse(updated);
    }

    @Transactional
    public void deletePermission(Long id) {
        if (!permissionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Permission not found: " + id);
        }

        Long roleCount = rolePermissionRepository.countByPermissionId(id);
        if (roleCount > 0) {
            throw new ConflictException("Cannot delete permission. It is used by " + roleCount + " role(s)");
        }

        permissionRepository.deleteById(id);
    }

    private PermissionResponse toResponse(Permission p) {
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
