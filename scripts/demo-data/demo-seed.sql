-- =====================================================================
-- SentinelCore - DEMO SEED DATA
-- =====================================================================
-- Adds a coherent demo dataset (assets, alerts, incidents,
-- vulnerabilities, compliance checks, audit logs) spread over the last
-- 14 days so the dashboard charts have something meaningful to show.
--
-- SAFETY
--   * Aborts unless connected to database "sentinelcore_db" on a loopback
--     address, or run through seed-demo-data.ps1 -Target neon.
--   * INSERT only - never updates or deletes existing rows.
--   * Idempotent: if the demo marker asset already exists, nothing is
--     inserted, so running it twice never creates duplicates.
--   * Runs as one transaction - either everything is inserted or nothing.
--
-- WHY SQL AND NOT THE REST API / SERVICES
--   * Entities set createdAt/discoveredAt/checkedAt = now() in @PrePersist
--     and AuditLog is @Immutable, so backdated history can't be created
--     through JPA without changing application code.
--   * AlertService.createAlert() sends real email + SMS for HIGH/CRITICAL.
--
-- CONSISTENCY WITH THE APPLICATION
--   * Enum values match the entity enums / DB check constraints.
--   * Asset status matches HealthMonitorService rules (runs every 60s):
--     CPU >= 90 -> CRITICAL, memory >= 80 -> WARNING, else ONLINE.
--     Every CRITICAL/WARNING demo asset already has an OPEN alert, so the
--     monitor will NOT auto-create one (which would send email/SMS).
--   * Audit rows use the exact action names and detail formats written by
--     AuthService, IncidentService, VulnerabilityService and
--     ComplianceController, and only reference users that exist
--     (admin, user) or failed-login usernames.
--   * Demo audit rows use IPs from 10.10.0.0/16 (office LAN) and
--     203.0.113.0/24 (documentation range) so demo-reset.sql can find them.
--
-- Run with:  scripts\demo-data\seed-demo-data.ps1
-- =====================================================================

\set ON_ERROR_STOP on

BEGIN;

-- Timestamp helper: N days ago at a given local time of day.
CREATE FUNCTION pg_temp.demo_at(days_ago int, hhmm text)
RETURNS timestamp LANGUAGE sql AS $$
    SELECT date_trunc('day', LOCALTIMESTAMP) - make_interval(days => days_ago) + hhmm::time
$$;

DO $seed$
DECLARE
    -- assets
    a_web      bigint;
    a_apigw    bigint;
    a_dbp      bigint;
    a_dbr      bigint;
    a_fw       bigint;
    a_vpn      bigint;
    a_k8s      bigint;
    a_ws       bigint;
    -- incidents
    i_ddos     bigint;
    i_ssh      bigint;
    i_log4j    bigint;
    i_openssh  bigint;
    i_backup   bigint;
    i_egress   bigint;
    -- vulnerabilities
    v_log4j    bigint;
    t          timestamp;
    admin_ip   constant text := '10.10.4.21';
    viewer_ip  constant text := '10.10.7.35';
    attacker   constant text := '203.0.113.45';
BEGIN
    -- ---------------- SAFETY CHECKS ----------------
    IF current_database() <> 'sentinelcore_db' THEN
        RAISE EXCEPTION 'Refusing to seed: connected to "%", expected local sentinelcore_db', current_database();
    END IF;

    IF inet_server_addr() IS NOT NULL
       AND NOT (inet_server_addr() << inet '127.0.0.0/8' OR inet_server_addr() = inet '::1')
       AND current_setting('sentinelcore.seed_target', true) IS DISTINCT FROM 'neon' THEN
        RAISE EXCEPTION 'Refusing to seed: server address % is not local', inet_server_addr();
    END IF;

    IF EXISTS (SELECT 1 FROM assets WHERE asset_name = 'prod-api-gw-01' AND ip_address = '10.10.1.20') THEN
        RAISE NOTICE 'Demo data already present - nothing inserted.';
        RETURN;
    END IF;

    -- =================================================================
    -- ASSETS (8)  - created_at is UTC, matching AssetService
    -- =================================================================
    INSERT INTO assets (asset_name, asset_type, ip_address, location, address,
                        cpu_usage, memory_usage, disk_usage, network_usage, status, created_at)
    VALUES ('prod-web-01', 'SERVER', '10.10.1.11', 'Mumbai DC-1', 'Rack A2, AWS ap-south-1a',
            46.0, 61.0, 58.0, 37.0, 'ONLINE', (now() AT TIME ZONE 'UTC') - interval '30 days')
    RETURNING id INTO a_web;

    INSERT INTO assets (asset_name, asset_type, ip_address, location, address,
                        cpu_usage, memory_usage, disk_usage, network_usage, status, created_at)
    VALUES ('prod-api-gw-01', 'SERVER', '10.10.1.20', 'Mumbai DC-1', 'Rack A3, AWS ap-south-1a',
            93.0, 71.0, 44.0, 88.0, 'CRITICAL', (now() AT TIME ZONE 'UTC') - interval '30 days')
    RETURNING id INTO a_apigw;

    INSERT INTO assets (asset_name, asset_type, ip_address, location, address,
                        cpu_usage, memory_usage, disk_usage, network_usage, status, created_at)
    VALUES ('prod-db-primary', 'DATABASE', '10.10.2.10', 'Mumbai DC-1', 'Rack C1, AWS ap-south-1b',
            64.0, 86.0, 72.0, 41.0, 'WARNING', (now() AT TIME ZONE 'UTC') - interval '29 days')
    RETURNING id INTO a_dbp;

    INSERT INTO assets (asset_name, asset_type, ip_address, location, address,
                        cpu_usage, memory_usage, disk_usage, network_usage, status, created_at)
    VALUES ('prod-db-replica', 'DATABASE', '10.10.2.11', 'Hyderabad DC-2', 'Rack D4, Hyderabad colocation',
            31.0, 58.0, 70.0, 22.0, 'ONLINE', (now() AT TIME ZONE 'UTC') - interval '29 days')
    RETURNING id INTO a_dbr;

    INSERT INTO assets (asset_name, asset_type, ip_address, location, address,
                        cpu_usage, memory_usage, disk_usage, network_usage, status, created_at)
    VALUES ('core-fw-01', 'NETWORK', '10.10.0.1', 'Mumbai DC-1', 'Network core, Mumbai DC-1',
            24.0, 37.0, 18.0, 63.0, 'ONLINE', (now() AT TIME ZONE 'UTC') - interval '35 days')
    RETURNING id INTO a_fw;

    INSERT INTO assets (asset_name, asset_type, ip_address, location, address,
                        cpu_usage, memory_usage, disk_usage, network_usage, status, created_at)
    VALUES ('vpn-gw-01', 'NETWORK', '10.10.0.5', 'Mumbai DC-1', 'DMZ, Mumbai DC-1',
            52.0, 44.0, 21.0, 57.0, 'ONLINE', (now() AT TIME ZONE 'UTC') - interval '35 days')
    RETURNING id INTO a_vpn;

    INSERT INTO assets (asset_name, asset_type, ip_address, location, address,
                        cpu_usage, memory_usage, disk_usage, network_usage, status, created_at)
    VALUES ('k8s-worker-03', 'SERVER', '10.10.3.13', 'Hyderabad DC-2', 'EKS node group, ap-south-2',
            78.0, 74.0, 66.0, 49.0, 'ONLINE', (now() AT TIME ZONE 'UTC') - interval '21 days')
    RETURNING id INTO a_k8s;

    INSERT INTO assets (asset_name, asset_type, ip_address, location, address,
                        cpu_usage, memory_usage, disk_usage, network_usage, status, created_at)
    VALUES ('soc-ws-04', 'WORKSTATION', '10.10.7.104', 'Hyderabad SOC', 'SOC floor 3, desk 4',
            19.0, 47.0, 39.0, 12.0, 'ONLINE', (now() AT TIME ZONE 'UTC') - interval '60 days')
    RETURNING id INTO a_ws;

    -- =================================================================
    -- ALERTS (21) - spread over the last 14 days, local time like
    -- AlertService (LocalDateTime.now()). Older ones are resolved.
    -- =================================================================
    INSERT INTO alerts (asset_id, severity, status, message, created_at, resolved_at) VALUES
    (a_web,   'LOW',      'RESOLVED',     'TLS certificate for admin portal expires in 14 days',
              pg_temp.demo_at(13, '09:40'), pg_temp.demo_at(10, '11:15')),
    (a_vpn,   'HIGH',     'RESOLVED',     'Multiple failed SSH logins from 203.0.113.45',
              pg_temp.demo_at(12, '02:14'), pg_temp.demo_at(12, '06:05')),
    (a_vpn,   'MEDIUM',   'RESOLVED',     'VPN login from unusual geography for user finance.ops',
              pg_temp.demo_at(12, '02:31'), pg_temp.demo_at(12, '07:20')),
    (a_dbp,   'MEDIUM',   'RESOLVED',     'Memory usage high: 82.0%',
              pg_temp.demo_at(11, '14:02'), pg_temp.demo_at(11, '16:45')),
    (a_fw,    'HIGH',     'RESOLVED',     'Port scan detected from 198.51.100.23',
              pg_temp.demo_at(10, '23:18'), pg_temp.demo_at(10, '23:59')),
    (a_fw,    'MEDIUM',   'RESOLVED',     'Excessive denied connections from 198.51.100.23',
              pg_temp.demo_at(10, '23:26'), pg_temp.demo_at(10, '23:59')),
    (a_k8s,   'MEDIUM',   'RESOLVED',     'Memory usage high: 81.0%',
              pg_temp.demo_at(9, '10:12'), pg_temp.demo_at(9, '14:30')),
    (a_dbr,   'LOW',      'RESOLVED',     'Replication lag above 30 seconds',
              pg_temp.demo_at(8, '03:47'), pg_temp.demo_at(8, '04:40')),
    (a_web,   'CRITICAL', 'RESOLVED',     'WAF blocked JNDI lookup payload matching Log4Shell signature',
              pg_temp.demo_at(7, '16:22'), pg_temp.demo_at(6, '12:10')),
    (a_web,   'HIGH',     'RESOLVED',     'Spike in HTTP 5xx responses on /api/checkout',
              pg_temp.demo_at(7, '16:35'), pg_temp.demo_at(7, '18:50')),
    (a_ws,    'LOW',      'RESOLVED',     'Endpoint antivirus signatures older than 7 days',
              pg_temp.demo_at(6, '09:05'), pg_temp.demo_at(5, '10:00')),
    (a_vpn,   'HIGH',     'ACKNOWLEDGED', 'OpenSSH 8.9 detected - vulnerable to CVE-2024-6387',
              pg_temp.demo_at(5, '11:30'), NULL),
    (a_fw,    'MEDIUM',   'RESOLVED',     'Firewall rule change outside maintenance window',
              pg_temp.demo_at(4, '19:42'), pg_temp.demo_at(4, '22:15')),
    (a_k8s,   'HIGH',     'ACKNOWLEDGED', 'Image scan flagged backdoored xz-utils 5.6.1 (CVE-2024-3094)',
              pg_temp.demo_at(3, '13:08'), NULL),
    (a_dbp,   'HIGH',     'ACKNOWLEDGED', 'Nightly backup job failed: disk quota exceeded',
              pg_temp.demo_at(2, '02:05'), NULL),
    (a_dbp,   'MEDIUM',   'OPEN',         'Memory usage high: 86.0%',
              pg_temp.demo_at(2, '02:40'), NULL),
    (a_apigw, 'HIGH',     'RESOLVED',     'Network throughput above 85% of link capacity',
              LOCALTIMESTAMP(0) - interval '28 hours', LOCALTIMESTAMP(0) - interval '25 hours'),
    (a_apigw, 'CRITICAL', 'OPEN',         'CPU usage critical: 93.0%',
              LOCALTIMESTAMP(0) - interval '20 hours', NULL),
    (a_apigw, 'HIGH',     'OPEN',         'HTTP/2 stream reset rate anomaly - possible Rapid Reset attack',
              LOCALTIMESTAMP(0) - interval '19 hours 40 minutes', NULL),
    (a_web,   'LOW',      'OPEN',         'Log volume on /var/log 40% above 7-day baseline',
              LOCALTIMESTAMP(0) - interval '6 hours', NULL),
    (a_ws,    'HIGH',     'OPEN',         'Outbound connection to known malicious IP 192.0.2.77',
              LOCALTIMESTAMP(0) - interval '3 hours', NULL);

    -- =================================================================
    -- LOGINS (audit) - story: brute force on day -12, normal admin use
    -- =================================================================
    INSERT INTO audit_logs (username, action, resource, ip_address, details, created_at) VALUES
    ('root',  'LOGIN_FAILED', 'AUTHENTICATION', attacker, 'Invalid username or password', pg_temp.demo_at(12, '02:09')),
    ('admin', 'LOGIN_FAILED', 'AUTHENTICATION', attacker, 'Invalid username or password', pg_temp.demo_at(12, '02:10')),
    ('admin', 'LOGIN',        'AUTHENTICATION', admin_ip, 'Successful login',             pg_temp.demo_at(12, '08:55')),
    ('user',  'LOGIN',        'AUTHENTICATION', viewer_ip,'Successful login',             pg_temp.demo_at(4, '10:02')),
    ('admin', 'LOGIN',        'AUTHENTICATION', admin_ip, 'Successful login',             LOCALTIMESTAMP(0) - interval '21 hours');

    -- =================================================================
    -- INCIDENTS (6) + their audit trail
    -- Lifecycle mirrors IncidentService: create (OPEN) -> assign
    -- (IN_PROGRESS) -> updateStatus. resolved_at is only set when the
    -- status is changed to RESOLVED, exactly like the service.
    -- =================================================================

    -- 1. SSH brute force - resolved
    t := pg_temp.demo_at(12, '09:05');
    INSERT INTO incidents (title, description, severity, status, assigned_to,
                           created_at, updated_at, resolved_at, sla_due_at)
    VALUES ('SSH brute-force attempts against vpn-gw-01',
            'Over 400 failed SSH logins from 203.0.113.45 between 02:00 and 02:30, including attempts on root and admin. Source IP blocked at core-fw-01; no successful logins found.',
            'HIGH', 'RESOLVED', 'admin',
            t, pg_temp.demo_at(11, '18:30'), pg_temp.demo_at(11, '18:30'), t + interval '24 hours')
    RETURNING id INTO i_ssh;

    INSERT INTO audit_logs (username, action, resource, ip_address, details, created_at) VALUES
    ('admin', 'INCIDENT_CREATED', 'INCIDENT', admin_ip,
        format('Incident #%s (HIGH): SSH brute-force attempts against vpn-gw-01', i_ssh), t),
    ('admin', 'INCIDENT_ASSIGNED', 'INCIDENT', admin_ip,
        format('Incident #%s assigned to admin', i_ssh), t + interval '4 minutes'),
    ('admin', 'INCIDENT_STATUS_CHANGED', 'INCIDENT', admin_ip,
        format('Incident #%s: IN_PROGRESS -> RESOLVED', i_ssh), pg_temp.demo_at(11, '18:30'));

    -- 2. Log4Shell attempt - closed (closed directly, so no resolved_at)
    t := pg_temp.demo_at(7, '16:40');
    INSERT INTO incidents (title, description, severity, status, assigned_to,
                           created_at, updated_at, resolved_at, sla_due_at)
    VALUES ('Log4Shell exploitation attempt blocked at WAF',
            'JNDI lookup payloads targeting prod-web-01. WAF blocked all requests; log4j upgraded to 2.17.1 on prod-web-01 as a precaution (CVE-2021-44228).',
            'CRITICAL', 'CLOSED', 'admin',
            t, pg_temp.demo_at(6, '12:20'), NULL, t + interval '4 hours')
    RETURNING id INTO i_log4j;

    INSERT INTO audit_logs (username, action, resource, ip_address, details, created_at) VALUES
    ('admin', 'INCIDENT_CREATED', 'INCIDENT', admin_ip,
        format('Incident #%s (CRITICAL): Log4Shell exploitation attempt blocked at WAF', i_log4j), t),
    ('admin', 'INCIDENT_ASSIGNED', 'INCIDENT', admin_ip,
        format('Incident #%s assigned to admin', i_log4j), t + interval '2 minutes'),
    ('admin', 'INCIDENT_STATUS_CHANGED', 'INCIDENT', admin_ip,
        format('Incident #%s: IN_PROGRESS -> CLOSED', i_log4j), pg_temp.demo_at(6, '12:20'));

    -- 3. Unpatched OpenSSH - in progress, within SLA
    t := pg_temp.demo_at(5, '11:45');
    INSERT INTO incidents (title, description, severity, status, assigned_to,
                           created_at, updated_at, resolved_at, sla_due_at)
    VALUES ('Unpatched OpenSSH (CVE-2024-6387) on vpn-gw-01',
            'Vulnerability scan found OpenSSH 8.9 on the internet-facing VPN gateway. Upgrade to 9.8p1 scheduled for the next maintenance window; LoginGraceTime set to 0 as interim mitigation.',
            'HIGH', 'IN_PROGRESS', 'admin',
            t, t + interval '10 minutes', NULL, pg_temp.demo_at(0, '00:00') + interval '2 days')
    RETURNING id INTO i_openssh;

    INSERT INTO audit_logs (username, action, resource, ip_address, details, created_at) VALUES
    ('admin', 'INCIDENT_CREATED', 'INCIDENT', admin_ip,
        format('Incident #%s (HIGH): Unpatched OpenSSH (CVE-2024-6387) on vpn-gw-01', i_openssh), t),
    ('admin', 'INCIDENT_ASSIGNED', 'INCIDENT', admin_ip,
        format('Incident #%s assigned to admin', i_openssh), t + interval '10 minutes');

    -- 4. Backup failure / memory pressure - open, unassigned
    t := pg_temp.demo_at(2, '03:00');
    INSERT INTO incidents (title, description, severity, status, assigned_to,
                           created_at, updated_at, resolved_at, sla_due_at)
    VALUES ('Memory pressure on prod-db-primary after failed backup job',
            'Nightly backup failed with disk quota exceeded; memory usage has stayed above 80% since. Needs DBA review of backup retention and buffer settings.',
            'MEDIUM', 'OPEN', NULL,
            t, t, NULL, t + interval '3 days')
    RETURNING id INTO i_backup;

    INSERT INTO audit_logs (username, action, resource, ip_address, details, created_at) VALUES
    ('admin', 'INCIDENT_CREATED', 'INCIDENT', admin_ip,
        format('Incident #%s (MEDIUM): Memory pressure on prod-db-primary after failed backup job', i_backup), t);

    -- 5. Possible L7 DDoS - critical, in progress, PAST SLA
    t := LOCALTIMESTAMP(0) - interval '19 hours 30 minutes';
    INSERT INTO incidents (title, description, severity, status, assigned_to,
                           created_at, updated_at, resolved_at, sla_due_at)
    VALUES ('CPU exhaustion on prod-api-gw-01 - possible L7 DDoS',
            'CPU above 90% with an abnormal HTTP/2 stream reset rate, consistent with an HTTP/2 Rapid Reset attack (CVE-2023-44487). Rate limiting enabled; nginx upgrade pending.',
            'CRITICAL', 'IN_PROGRESS', 'admin',
            t, t + interval '6 minutes', NULL, t + interval '4 hours')
    RETURNING id INTO i_ddos;

    INSERT INTO audit_logs (username, action, resource, ip_address, details, created_at) VALUES
    ('admin', 'INCIDENT_CREATED', 'INCIDENT', admin_ip,
        format('Incident #%s (CRITICAL): CPU exhaustion on prod-api-gw-01 - possible L7 DDoS', i_ddos), t),
    ('admin', 'INCIDENT_ASSIGNED', 'INCIDENT', admin_ip,
        format('Incident #%s assigned to admin', i_ddos), t + interval '6 minutes');

    -- 6. Suspicious egress from SOC workstation - open, unassigned
    t := LOCALTIMESTAMP(0) - interval '2 hours 45 minutes';
    INSERT INTO incidents (title, description, severity, status, assigned_to,
                           created_at, updated_at, resolved_at, sla_due_at)
    VALUES ('Suspicious outbound traffic from soc-ws-04',
            'Workstation contacted 192.0.2.77, listed on a threat-intel blocklist. Host to be isolated and triaged.',
            'HIGH', 'OPEN', NULL,
            t, t, NULL, t + interval '8 hours')
    RETURNING id INTO i_egress;

    INSERT INTO audit_logs (username, action, resource, ip_address, details, created_at) VALUES
    ('admin', 'INCIDENT_CREATED', 'INCIDENT', admin_ip,
        format('Incident #%s (HIGH): Suspicious outbound traffic from soc-ws-04', i_egress), t);

    -- =================================================================
    -- VULNERABILITIES (6) - real CVEs with their published CVSS scores
    -- affected_system = demo asset name. Only Log4Shell is patched.
    -- =================================================================
    INSERT INTO vulnerabilities (cve_id, title, affected_system, severity, risk_score,
                                 description, patch_version, patch_status, discovered_at, patched_at)
    VALUES ('CVE-2021-44228', 'Apache Log4j2 JNDI remote code execution (Log4Shell)', 'prod-web-01',
            'CRITICAL', 10.0,
            'Log4j2 JNDI features do not protect against attacker-controlled LDAP endpoints, allowing remote code execution via crafted log messages.',
            '2.17.1', 'PATCHED', pg_temp.demo_at(9, '15:10'), pg_temp.demo_at(6, '11:55'))
    RETURNING id INTO v_log4j;

    INSERT INTO vulnerabilities (cve_id, title, affected_system, severity, risk_score,
                                 description, patch_version, patch_status, discovered_at, patched_at) VALUES
    ('CVE-2024-6387', 'OpenSSH signal handler race condition (regreSSHion)', 'vpn-gw-01',
        'HIGH', 8.1,
        'Race condition in sshd SIGALRM handler allows unauthenticated remote code execution as root on glibc-based Linux.',
        'OpenSSH 9.8p1', 'OPEN', pg_temp.demo_at(5, '11:25'), NULL),
    ('CVE-2023-44487', 'HTTP/2 Rapid Reset denial of service', 'prod-api-gw-01',
        'HIGH', 7.5,
        'HTTP/2 request cancellation can reset many streams quickly, exhausting server resources.',
        'nginx 1.25.3', 'OPEN', pg_temp.demo_at(1, '09:30'), NULL),
    ('CVE-2024-3094', 'Backdoor in xz-utils liblzma 5.6.0/5.6.1', 'k8s-worker-03',
        'CRITICAL', 10.0,
        'Malicious code in upstream xz tarballs modifies liblzma and can compromise sshd authentication.',
        'xz-utils 5.4.6', 'OPEN', pg_temp.demo_at(3, '13:00'), NULL),
    ('CVE-2023-4863', 'libwebp heap buffer overflow', 'soc-ws-04',
        'HIGH', 8.8,
        'Heap buffer overflow in libwebp allows a remote attacker to write out of bounds via a crafted WebP image.',
        'Chrome 116.0.5845.187', 'OPEN', pg_temp.demo_at(6, '09:20'), NULL),
    ('CVE-2023-48795', 'SSH prefix truncation attack (Terrapin)', 'core-fw-01',
        'MEDIUM', 5.9,
        'Man-in-the-middle can drop messages at the start of the SSH secure channel, downgrading connection security.',
        'OpenSSH 9.6', 'OPEN', pg_temp.demo_at(10, '10:40'), NULL);

    INSERT INTO audit_logs (username, action, resource, ip_address, details, created_at) VALUES
    ('admin', 'VULNERABILITY_REPORTED', 'VULNERABILITY', admin_ip, 'CVE-2023-48795 on core-fw-01 (MEDIUM)',     pg_temp.demo_at(10, '10:40')),
    ('admin', 'VULNERABILITY_REPORTED', 'VULNERABILITY', admin_ip, 'CVE-2021-44228 on prod-web-01 (CRITICAL)',  pg_temp.demo_at(9, '15:10')),
    ('admin', 'VULNERABILITY_REPORTED', 'VULNERABILITY', admin_ip, 'CVE-2023-4863 on soc-ws-04 (HIGH)',         pg_temp.demo_at(6, '09:20')),
    ('admin', 'VULNERABILITY_PATCHED',  'VULNERABILITY', admin_ip, 'CVE-2021-44228 marked as patched',          pg_temp.demo_at(6, '11:55')),
    ('admin', 'VULNERABILITY_REPORTED', 'VULNERABILITY', admin_ip, 'CVE-2024-6387 on vpn-gw-01 (HIGH)',         pg_temp.demo_at(5, '11:25')),
    ('admin', 'VULNERABILITY_REPORTED', 'VULNERABILITY', admin_ip, 'CVE-2024-3094 on k8s-worker-03 (CRITICAL)', pg_temp.demo_at(3, '13:00')),
    ('admin', 'VULNERABILITY_REPORTED', 'VULNERABILITY', admin_ip, 'CVE-2023-44487 on prod-api-gw-01 (HIGH)',   pg_temp.demo_at(1, '09:30'));

    -- =================================================================
    -- COMPLIANCE CHECKS (6) + audit - 3 compliant, 2 failed, 1 pending
    -- =================================================================
    INSERT INTO compliance_checks (framework, control_id, control_name, status, remarks, checked_at) VALUES
    ('PCI DSS',   '8.4.2', 'MFA for all non-console access into the CDE', 'COMPLIANT',
        'MFA enforced on VPN and admin portal; verified login logs for 30 days.', pg_temp.demo_at(13, '11:00')),
    ('SOC 2',     'CC6.1', 'Logical access security controls', 'COMPLIANT',
        'RBAC enforced via ADMIN/OPERATOR/VIEWER roles; JWT expiry and refresh verified.', pg_temp.demo_at(11, '15:30')),
    ('SOC 2',     'CC7.2', 'Monitoring of system components for anomalies', 'NON_COMPLIANT',
        'Firewall log retention is 30 days on core-fw-01; policy requires 90 days.', pg_temp.demo_at(9, '12:15')),
    ('ISO 27001', 'A.5.24', 'Incident management planning and preparation', 'COMPLIANT',
        'Incident workflow with SLA tracking in place; runbook reviewed.', pg_temp.demo_at(8, '16:00')),
    ('ISO 27001', 'A.8.8', 'Management of technical vulnerabilities', 'REVIEW_REQUIRED',
        'Patch timeline evidence pending from infrastructure team.', pg_temp.demo_at(4, '14:20')),
    ('PCI DSS',   '6.3.3', 'Critical security patches installed within one month of release', 'NON_COMPLIANT',
        'CVE-2024-3094 (k8s-worker-03) and CVE-2024-6387 (vpn-gw-01) still unpatched.', pg_temp.demo_at(2, '17:45'));

    INSERT INTO audit_logs (username, action, resource, ip_address, details, created_at) VALUES
    ('admin', 'COMPLIANCE_CHECK_RECORDED', 'COMPLIANCE', admin_ip, 'PCI DSS 8.4.2 = COMPLIANT',          pg_temp.demo_at(13, '11:00')),
    ('admin', 'COMPLIANCE_CHECK_RECORDED', 'COMPLIANCE', admin_ip, 'SOC 2 CC6.1 = COMPLIANT',            pg_temp.demo_at(11, '15:30')),
    ('admin', 'COMPLIANCE_CHECK_RECORDED', 'COMPLIANCE', admin_ip, 'SOC 2 CC7.2 = NON_COMPLIANT',        pg_temp.demo_at(9, '12:15')),
    ('admin', 'COMPLIANCE_CHECK_RECORDED', 'COMPLIANCE', admin_ip, 'ISO 27001 A.5.24 = COMPLIANT',       pg_temp.demo_at(8, '16:00')),
    ('admin', 'COMPLIANCE_CHECK_RECORDED', 'COMPLIANCE', admin_ip, 'ISO 27001 A.8.8 = REVIEW_REQUIRED',  pg_temp.demo_at(4, '14:20')),
    ('admin', 'COMPLIANCE_CHECK_RECORDED', 'COMPLIANCE', admin_ip, 'PCI DSS 6.3.3 = NON_COMPLIANT',      pg_temp.demo_at(2, '17:45'));

    RAISE NOTICE 'Demo data inserted: 8 assets, 21 alerts, 6 incidents, 6 vulnerabilities, 6 compliance checks, 30 audit logs.';
END
$seed$;

COMMIT;
