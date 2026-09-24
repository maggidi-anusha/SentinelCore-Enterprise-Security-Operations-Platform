package com.example.sentinelcore.controller;

import com.example.sentinelcore.dto.IncidentRequest;
import com.example.sentinelcore.entity.Incident;
import com.example.sentinelcore.service.IncidentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
@CrossOrigin
public class IncidentController {

    private final IncidentService service;

    @PostMapping
    public ResponseEntity<Incident> create(@RequestBody IncidentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.create(request));
    }

    @GetMapping
    public List<Incident> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Incident getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PutMapping("/{id}/assign")
    public Incident assign(
            @PathVariable Long id,
            @RequestParam String user) {
        return service.assign(id, user);
    }

    @PutMapping("/{id}/status")
    public Incident updateStatus(
            @PathVariable Long id,
            @RequestParam Incident.IncidentStatus status) {
        return service.updateStatus(id, status);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
