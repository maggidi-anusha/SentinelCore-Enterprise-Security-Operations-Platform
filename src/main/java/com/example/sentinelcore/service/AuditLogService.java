package com.example.sentinelcore.service;

import com.example.sentinelcore.dto.AuditLogRequest;
import com.example.sentinelcore.entity.AuditLog;
import com.example.sentinelcore.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository repository;

    // Records an action for the currently logged-in user (from the JWT).
    public AuditLog record(String action, String resource, String details) {
        return recordAs(currentUsername(), action, resource, details);
    }

    // Records an action for an explicit username - used for login attempts,
    // where no authenticated user exists yet.
    public AuditLog recordAs(String username, String action, String resource, String details) {

        AuditLog log = AuditLog.builder()
                .username(username != null ? username : "anonymous")
                .action(action)
                .resource(resource)
                .ipAddress(currentIpAddress())
                .details(details != null && details.length() > 2000 ? details.substring(0, 2000) : details)
                .build();

        return repository.save(log);
    }

    public AuditLog create(AuditLogRequest request) {
        return record(request.getAction(), request.getResource(), request.getDetails());
    }

    public List<AuditLog> getAll() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    public List<AuditLog> getByUsername(String username) {
        return repository.findByUsernameOrderByCreatedAtDesc(username);
    }

    private String currentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.isAuthenticated() ? auth.getName() : null;
    }

    private String currentIpAddress() {
        if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attrs) {
            return attrs.getRequest().getRemoteAddr();
        }
        return null;
    }
}
