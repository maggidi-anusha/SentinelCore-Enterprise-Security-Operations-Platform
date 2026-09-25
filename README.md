# SentinelCore: Cloud Security Monitoring System with Incident Management Assistance

## Overview

SentinelCore is a cloud security monitoring system with incident
management assistance. It provides infrastructure monitoring, security
management, vulnerability management, and audit and compliance capabilities.

## Objectives

- Infrastructure monitoring
- Security management
- Vulnerability and risk assessment
- Audit and compliance
- Alert management
- Authentication and authorization

## Technology Stack

### Backend
- Java 21
- Spring Boot 4.x
- Maven
- Spring Data JPA
- Spring Security
- JWT authentication
- Lombok

### Database
- PostgreSQL

### Frontend
- React 19
- Vite
- Axios
- Recharts

### Integrations
- Gmail SMTP (email alerts)
- Twilio (SMS alerts)

### Development Tools
- IntelliJ IDEA
- Visual Studio Code
- Postman
- Git/GitHub

### Deployment
- Docker
- Netlify
- Render
- Neon PostgreSQL
- AWS EC2 + RDS (backup)

## Project Architecture

The application follows a layered architecture with
domain, event, data, security, and infrastructure concerns.

## Milestones

### Milestone 1 – Infrastructure Monitoring
- Asset management
- CPU monitoring
- Memory monitoring
- Disk monitoring
- Network monitoring
- Health monitoring
- Dashboard with charts

### Milestone 2 – Security Management
- Authentication
- Authorization
- Alert management
- Resolution workflow
- Incident management
- Email and SMS notifications

### Milestone 3 – Vulnerability Management
- Vulnerability tracking
- Risk assessment

### Milestone 4 – Audit and Compliance
- Audit logging
- Compliance monitoring

## Deployment

- Frontend: Netlify
- Backend: Render (Docker web service, deployed automatically from the `main` branch)
- Database: Neon PostgreSQL
- AWS EC2 + RDS: previous deployment, stopped and kept as a backup

Netlify forwards `/api/*` requests to the Render backend
(see `sentinelcore-frontend/public/_redirects`).

The backend is configured through environment variables in Render:
`SPRING_DATASOURCE_URL`, `DB_USERNAME`, `DB_PASSWORD`, the mail and
Twilio settings, `SPRING_JPA_SHOW_SQL=false` and `TZ=Asia/Kolkata`.

Render's free plan sleeps after a period without traffic, so the
first request after inactivity may take longer while the service starts.

Demo data can be loaded with `scripts/demo-data/seed-demo-data.ps1`
(add `-Target neon` for the Neon database).
