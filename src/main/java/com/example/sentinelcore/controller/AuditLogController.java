package com.example.sentinelcore.controller;

import com.example.sentinelcore.dto.AuditLogRequest;
import com.example.sentinelcore.entity.AuditLog;
import com.example.sentinelcore.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Read + append only - there is intentionally no PUT/DELETE for audit logs.
@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
@CrossOrigin
public class AuditLogController {

    private final AuditLogService service;

    @PostMapping
    public ResponseEntity<AuditLog> create(@RequestBody AuditLogRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.create(request));
    }

    @GetMapping
    public List<AuditLog> getAll() {
        return service.getAll();
    }

    @GetMapping("/user/{username}")
    public List<AuditLog> getByUsername(@PathVariable String username) {
        return service.getByUsername(username);
    }
}
