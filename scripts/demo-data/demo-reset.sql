-- =====================================================================
-- SentinelCore - REMOVE DEMO DATA
-- =====================================================================
-- Deletes ONLY the rows created by demo-seed.sql, matched on their exact
-- demo identifiers. Your own assets, alerts, incidents, etc. are never
-- touched. Use it to refresh the demo (reset, then seed again) so the
-- timestamps are relative to today again.
--
-- Aborts unless connected to sentinelcore_db on loopback, or run through
-- seed-demo-data.ps1 -Target neon.
-- Run with:  scripts\demo-data\seed-demo-data.ps1 -Reset
-- =====================================================================

\set ON_ERROR_STOP on

BEGIN;

DO $reset$
DECLARE
    n int;
BEGIN
    IF current_database() <> 'sentinelcore_db' THEN
        RAISE EXCEPTION 'Refusing to reset: connected to "%", expected local sentinelcore_db', current_database();
    END IF;

    IF inet_server_addr() IS NOT NULL
       AND NOT (inet_server_addr() << inet '127.0.0.0/8' OR inet_server_addr() = inet '::1')
       AND current_setting('sentinelcore.seed_target', true) IS DISTINCT FROM 'neon' THEN
        RAISE EXCEPTION 'Refusing to reset: server address % is not local', inet_server_addr();
    END IF;

    CREATE TEMP TABLE demo_assets ON COMMIT DROP AS
    SELECT id FROM assets
    WHERE (asset_name, ip_address) IN (
        ('prod-web-01', '10.10.1.11'), ('prod-api-gw-01', '10.10.1.20'),
        ('prod-db-primary', '10.10.2.10'), ('prod-db-replica', '10.10.2.11'),
        ('core-fw-01', '10.10.0.1'), ('vpn-gw-01', '10.10.0.5'),
        ('k8s-worker-03', '10.10.3.13'), ('soc-ws-04', '10.10.7.104'));

    -- Alerts on demo assets (includes any the health monitor raised for them)
    DELETE FROM alerts WHERE asset_id IN (SELECT id FROM demo_assets);
    GET DIAGNOSTICS n = ROW_COUNT; RAISE NOTICE 'alerts removed: %', n;

    DELETE FROM assets WHERE id IN (SELECT id FROM demo_assets);
    GET DIAGNOSTICS n = ROW_COUNT; RAISE NOTICE 'assets removed: %', n;

    DELETE FROM incidents WHERE title IN (
        'SSH brute-force attempts against vpn-gw-01',
        'Log4Shell exploitation attempt blocked at WAF',
        'Unpatched OpenSSH (CVE-2024-6387) on vpn-gw-01',
        'Memory pressure on prod-db-primary after failed backup job',
        'CPU exhaustion on prod-api-gw-01 - possible L7 DDoS',
        'Suspicious outbound traffic from soc-ws-04');
    GET DIAGNOSTICS n = ROW_COUNT; RAISE NOTICE 'incidents removed: %', n;

    DELETE FROM vulnerabilities WHERE (cve_id, affected_system) IN (
        ('CVE-2021-44228', 'prod-web-01'), ('CVE-2024-6387', 'vpn-gw-01'),
        ('CVE-2023-44487', 'prod-api-gw-01'), ('CVE-2024-3094', 'k8s-worker-03'),
        ('CVE-2023-4863', 'soc-ws-04'), ('CVE-2023-48795', 'core-fw-01'));
    GET DIAGNOSTICS n = ROW_COUNT; RAISE NOTICE 'vulnerabilities removed: %', n;

    DELETE FROM compliance_checks WHERE (framework, control_id, remarks) IN (
        ('PCI DSS', '8.4.2', 'MFA enforced on VPN and admin portal; verified login logs for 30 days.'),
        ('SOC 2', 'CC6.1', 'RBAC enforced via ADMIN/OPERATOR/VIEWER roles; JWT expiry and refresh verified.'),
        ('SOC 2', 'CC7.2', 'Firewall log retention is 30 days on core-fw-01; policy requires 90 days.'),
        ('ISO 27001', 'A.5.24', 'Incident workflow with SLA tracking in place; runbook reviewed.'),
        ('ISO 27001', 'A.8.8', 'Patch timeline evidence pending from infrastructure team.'),
        ('PCI DSS', '6.3.3', 'CVE-2024-3094 (k8s-worker-03) and CVE-2024-6387 (vpn-gw-01) still unpatched.'));
    GET DIAGNOSTICS n = ROW_COUNT; RAISE NOTICE 'compliance checks removed: %', n;

    -- Demo audit rows are the only ones with these IPs; real requests to
    -- the local backend come from 127.0.0.1 / ::1.
    DELETE FROM audit_logs
    WHERE ip_address IN ('10.10.4.21', '10.10.7.35', '203.0.113.45');
    GET DIAGNOSTICS n = ROW_COUNT; RAISE NOTICE 'audit logs removed: %', n;
END
$reset$;

COMMIT;
