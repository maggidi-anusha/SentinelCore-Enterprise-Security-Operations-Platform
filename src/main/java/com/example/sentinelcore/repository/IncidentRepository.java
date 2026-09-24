package com.example.sentinelcore.repository;

import com.example.sentinelcore.entity.Incident;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IncidentRepository extends JpaRepository<Incident, Long> {

    List<Incident> findByStatus(Incident.IncidentStatus status);

    List<Incident> findBySeverity(Incident.Severity severity);

    List<Incident> findByAssignedTo(String assignedTo);
}
