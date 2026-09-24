package com.example.sentinelcore.dto;

import com.example.sentinelcore.entity.Incident;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class IncidentRequest {

    private String title;
    private String description;
    private Incident.Severity severity;
    private String assignedTo;
    private LocalDateTime slaDueAt;
}
