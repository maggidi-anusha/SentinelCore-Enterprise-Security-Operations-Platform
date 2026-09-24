package com.example.sentinelcore.dto;

import lombok.Data;

// username and ipAddress are intentionally not accepted from the client -
// AuditLogService takes them from the JWT and the HTTP request, so entries
// cannot be written in someone else's name.
@Data
public class AuditLogRequest {

    private String action;
    private String resource;
    private String details;
}
