package com.example.sentinelcore.controller;

import com.example.sentinelcore.entity.ComplianceCheck;
import com.example.sentinelcore.repository.ComplianceRepository;
import com.example.sentinelcore.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/compliance")
@RequiredArgsConstructor
@CrossOrigin
public class ComplianceController {

    private final ComplianceRepository repository;
    private final AuditLogService auditLogService;

    @PostMapping
    public ResponseEntity<ComplianceCheck> create(@RequestBody ComplianceCheck check) {
        // Server-controlled fields - never trust these from the request body
        check.setId(null);
        check.setCheckedAt(null);

        ComplianceCheck saved = repository.save(check);

        auditLogService.record("COMPLIANCE_CHECK_RECORDED", "COMPLIANCE",
                saved.getFramework() + " " + saved.getControlId() + " = " + saved.getStatus());

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping
    public List<ComplianceCheck> getAll() {
        return repository.findAll();
    }

    @GetMapping("/framework/{framework}")
    public List<ComplianceCheck> byFramework(@PathVariable String framework) {
        return repository.findByFramework(framework);
    }
}
