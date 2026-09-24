package com.example.sentinelcore.service;

import com.example.sentinelcore.dto.IncidentRequest;
import com.example.sentinelcore.entity.Incident;
import com.example.sentinelcore.repository.IncidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IncidentService {

    private final IncidentRepository repository;
    private final AuditLogService auditLogService;

    public Incident create(IncidentRequest request) {

        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Incident title is required");
        }

        Incident incident = Incident.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .severity(request.getSeverity())
                .assignedTo(request.getAssignedTo())
                .slaDueAt(request.getSlaDueAt())
                .status(Incident.IncidentStatus.OPEN)
                .build();

        Incident saved = repository.save(incident);

        auditLogService.record("INCIDENT_CREATED", "INCIDENT",
                "Incident #" + saved.getId() + " (" + saved.getSeverity() + "): " + saved.getTitle());

        return saved;
    }

    public List<Incident> getAll() {
        return repository.findAll();
    }

    public Incident getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Incident not found with id: " + id));
    }

    public Incident assign(Long id, String user) {
        Incident incident = getById(id);
        incident.setAssignedTo(user);
        incident.setStatus(Incident.IncidentStatus.IN_PROGRESS);

        Incident saved = repository.save(incident);

        auditLogService.record("INCIDENT_ASSIGNED", "INCIDENT",
                "Incident #" + id + " assigned to " + user);

        return saved;
    }

    public Incident updateStatus(Long id, Incident.IncidentStatus status) {
        Incident incident = getById(id);
        Incident.IncidentStatus previous = incident.getStatus();
        incident.setStatus(status);

        if (status == Incident.IncidentStatus.RESOLVED) {
            incident.setResolvedAt(LocalDateTime.now());
        }

        Incident saved = repository.save(incident);

        auditLogService.record("INCIDENT_STATUS_CHANGED", "INCIDENT",
                "Incident #" + id + ": " + previous + " -> " + status);

        return saved;
    }

    public void delete(Long id) {
        Incident incident = getById(id);
        repository.delete(incident);

        auditLogService.record("INCIDENT_DELETED", "INCIDENT",
                "Incident #" + id + " deleted: " + incident.getTitle());
    }
}
