import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
  LabelList,
} from "recharts";
import {
  Server,
  ShieldAlert,
  Siren,
  Bug,
  ClipboardCheck,
  RefreshCw,
} from "lucide-react";

import { getAssets } from "../api/assetApi";
import { getAlerts } from "../api/alertApi";
import {
  getIncidents,
  getVulnerabilities,
  getComplianceChecks,
} from "../api/securityOpsApi";

// ------------------------------------------------------------------
// COLOURS
// Severity palette validated for colour-blind separation (all checks
// pass on a white surface). Always shown with a text label.
// ------------------------------------------------------------------

const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const SEVERITY_COLORS = {
  LOW: "#2a78d6",
  MEDIUM: "#e0a800",
  HIGH: "#e8590c",
  CRITICAL: "#a4161a",
};

const ASSET_STATUS = [
  { key: "ONLINE", label: "Online", color: "#0ca30c" },
  { key: "WARNING", label: "Warning", color: "#fab219" },
  { key: "CRITICAL", label: "Critical", color: "#d03b3b" },
  { key: "OFFLINE", label: "Offline", color: "#98a2b3" },
];

const RESOURCE_SERIES = [
  { key: "cpu", label: "CPU", color: "#2a78d6" },
  { key: "memory", label: "Memory", color: "#eb6834" },
  { key: "disk", label: "Disk", color: "#1baf7a" },
  { key: "network", label: "Network", color: "#eda100" },
];

// Same thresholds HealthMonitorService / the Assets page use
const USAGE_WARNING = 80;
const USAGE_CRITICAL = 90;

const ASSET_TYPES = ["SERVER", "DATABASE", "NETWORK", "WORKSTATION"];

const INK = {
  primary: "#172033",
  secondary: "#536174",
  muted: "#8a95a5",
  grid: "#edf1f6",
  axis: "#d8e1ec",
};

const AXIS_TICK = { fill: INK.muted, fontSize: 11 };

const REFRESH_INTERVAL_MS = 60_000;
const TREND_DAYS = 14;

const title = (s) => (s ? s.charAt(0) + s.slice(1).toLowerCase().replace("_", " ") : "");

// ------------------------------------------------------------------
// DATA LOADING
// Each source loads independently - an OPERATOR can't read assets or
// alerts, so those panels degrade instead of breaking the whole page.
// ------------------------------------------------------------------

const SOURCES = {
  assets: getAssets,
  alerts: getAlerts,
  incidents: getIncidents,
  vulnerabilities: getVulnerabilities,
  compliance: getComplianceChecks,
};

async function loadAll() {
  const keys = Object.keys(SOURCES);
  const results = await Promise.allSettled(keys.map((k) => SOURCES[k]()));

  return Object.fromEntries(
    results.map((r, i) => [
      keys[i],
      r.status === "fulfilled"
        ? { ok: true, data: r.value.data ?? [] }
        : { ok: false, data: [], forbidden: r.reason?.response?.status === 403 },
    ])
  );
}

// ------------------------------------------------------------------
// DERIVED DATA
// ------------------------------------------------------------------

const dayKey = (date) => date.toLocaleDateString("en-CA"); // YYYY-MM-DD, local time

function buildAlertTrend(alerts) {
  const days = [];
  const today = new Date();

  for (let i = TREND_DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push({
      key: dayKey(d),
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0,
    });
  }

  const byKey = Object.fromEntries(days.map((d) => [d.key, d]));

  alerts.forEach((a) => {
    if (!a.createdAt) return;
    const bucket = byKey[dayKey(new Date(a.createdAt))];
    if (bucket && SEVERITIES.includes(a.severity)) bucket[a.severity] += 1;
  });

  return days;
}

const peakUsage = (a) => Math.max(a.cpu, a.memory, a.disk, a.network);

function toUsageRow(a) {
  return {
    id: a.id,
    name: a.assetName,
    type: a.assetType,
    location: a.location,
    status: a.status || "ONLINE",
    cpu: Math.round(a.cpuUsage ?? 0),
    memory: Math.round(a.memoryUsage ?? 0),
    disk: Math.round(a.diskUsage ?? 0),
    network: Math.round(a.networkUsage ?? 0),
  };
}

function buildResourceUsage(assets, limit) {
  return assets
    .map(toUsageRow)
    .sort((a, b) => peakUsage(b) - peakUsage(a))
    .slice(0, limit);
}

function buildFleetUtilization(assets) {
  const rows = assets.map(toUsageRow);

  return RESOURCE_SERIES.map((s) => {
    const peak = rows.reduce((best, r) => (!best || r[s.key] > best[s.key] ? r : best), null);
    const avg = rows.length ? rows.reduce((sum, r) => sum + r[s.key], 0) / rows.length : 0;
    const hot = rows.filter((r) => r[s.key] >= USAGE_WARNING).length;

    return { ...s, avg: Math.round(avg), peak, hot };
  });
}

// Existing data has free-text types like "Network device" - fold them
// into the four types the Register Asset form offers.
function normaliseType(raw) {
  const upper = (raw || "").toUpperCase();
  return ASSET_TYPES.find((t) => upper.includes(t)) || "OTHER";
}

function countBy(items, keyFn) {
  const counts = {};
  items.forEach((item) => {
    const key = keyFn(item);
    counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

const usageLevel = (value) =>
  value >= USAGE_CRITICAL ? "critical" : value >= USAGE_WARNING ? "warning" : "normal";

function buildCompliance(checks) {
  const byFramework = {};

  checks.forEach((c) => {
    const f = (byFramework[c.framework] ??= { framework: c.framework, total: 0, compliant: 0 });
    f.total += 1;
    if (c.status === "COMPLIANT") f.compliant += 1;
  });

  return Object.values(byFramework)
    .map((f) => ({ ...f, score: Math.round((f.compliant / f.total) * 100) }))
    .sort((a, b) => a.score - b.score);
}

function buildActivity(alerts, incidents) {
  const items = [
    ...alerts.map((a) => ({
      id: `alert-${a.id}`,
      kind: "Alert",
      text: a.message,
      meta: a.assetName,
      severity: a.severity,
      at: a.createdAt,
      to: "/alerts",
    })),
    ...incidents.map((i) => ({
      id: `incident-${i.id}`,
      kind: "Incident",
      text: i.title,
      meta: title(i.status),
      severity: i.severity,
      at: i.createdAt,
      to: "/incidents",
    })),
  ];

  return items
    .filter((i) => i.at)
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 7);
}

function timeAgo(value) {
  const seconds = Math.max(0, (Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// ------------------------------------------------------------------
// SMALL BUILDING BLOCKS
// ------------------------------------------------------------------

// Stacked column segment: 2px surface gap between segments, 4px rounded
// top only on the topmost non-zero segment of each day.
function stackedSegment(seriesKey) {
  return function Segment(props) {
    const { x, y, width, height, fill, payload } = props;
    if (!height || height <= 0) return null;

    const topKey = [...SEVERITIES].reverse().find((k) => payload[k] > 0);
    const isTop = topKey === seriesKey;
    const gap = isTop ? 0 : 2;
    const h = Math.max(height - gap, 1);
    const top = y + gap;
    const r = isTop ? Math.min(4, width / 2, h) : 0;

    const path = `M${x},${top + h} L${x},${top + r} Q${x},${top} ${x + r},${top}
      L${x + width - r},${top} Q${x + width},${top} ${x + width},${top + r}
      L${x + width},${top + h} Z`;

    return <path d={path} fill={fill} />;
  };
}

function ChartTooltip({ active, payload, label, unit = "", showTotal = false }) {
  if (!active || !payload?.length) return null;

  const rows = payload.filter((p) => p.value !== undefined);
  const total = rows.reduce((s, p) => s + (Number(p.value) || 0), 0);

  return (
    <div className="dash-tooltip">
      {label && <div className="dash-tooltip-title">{label}</div>}
      {[...rows].reverse().map((p) => (
        <div key={p.dataKey ?? p.name} className="dash-tooltip-row">
          <span
            className="dash-swatch"
            style={{ background: p.payload?.fill || p.payload?.color || p.color }}
          />
          <span className="dash-tooltip-name">{p.name}</span>
          <span className="dash-tooltip-value">
            {p.value}
            {unit}
          </span>
        </div>
      ))}
      {showTotal && (
        <div className="dash-tooltip-row dash-tooltip-total">
          <span className="dash-tooltip-name">Total</span>
          <span className="dash-tooltip-value">{total}</span>
        </div>
      )}
    </div>
  );
}

function Legend({ items }) {
  return (
    <div className="dash-legend">
      {items.map((i) => (
        <span key={i.label} className="dash-legend-item">
          <span className="dash-swatch" style={{ background: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}

function Panel({ title: panelTitle, subtitle, action, source, empty, emptyText, children }) {
  let body = children;

  if (source && !source.ok) {
    body = (
      <div className="dash-panel-empty">
        {source.forbidden ? "Not available for your role." : "Couldn't load this data."}
      </div>
    );
  } else if (empty) {
    body = <div className="dash-panel-empty">{emptyText}</div>;
  }

  return (
    <section className="dash-panel">
      <div className="dash-panel-header">
        <div>
          <div className="panel-title">{panelTitle}</div>
          {subtitle && <div className="panel-subtitle">{subtitle}</div>}
        </div>
        {action}
      </div>
      {body}
    </section>
  );
}

function KpiCard({ icon: Icon, label, value, meta, tone, to }) {
  return (
    <Link to={to} className="dash-kpi">
      <div className="dash-kpi-top">
        <span className="metric-label">{label}</span>
        <span className={`dash-kpi-icon ${tone ? `dash-kpi-icon-${tone}` : ""}`}>
          <Icon size={17} />
        </span>
      </div>
      <div className="dash-kpi-value">{value}</div>
      <div className={`dash-kpi-meta ${tone === "danger" ? "dash-kpi-meta-danger" : ""}`}>
        {meta}
      </div>
    </Link>
  );
}

// Thin meter: fill colour carries the threshold level, track is a light
// step of the same hue so the state reads across the whole bar.
function UsageMeter({ value, compact = false }) {
  const level = usageLevel(value);

  return (
    <div className={`dash-meter dash-meter-${level} ${compact ? "dash-meter-compact" : ""}`}>
      <div className="dash-meter-track">
        <div className="dash-meter-fill" style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      {compact && <span className="dash-meter-value">{value}%</span>}
    </div>
  );
}

// Single-series horizontal bar chart for simple "count by category" data.
function CountBarChart({ data, labelWidth = 90 }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(150, data.length * 38 + 10)}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
        <XAxis type="number" allowDecimals={false} hide />
        <YAxis
          type="category"
          dataKey="name"
          width={labelWidth}
          tick={{ ...AXIS_TICK, fill: INK.secondary }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip cursor={{ fill: "rgba(23, 105, 224, 0.06)" }} content={<ChartTooltip />} />
        <Bar
          dataKey="value"
          name="Assets"
          fill="#2a78d6"
          maxBarSize={18}
          radius={[0, 4, 4, 0]}
          isAnimationActive={false}
        >
          <LabelList
            dataKey="value"
            position="right"
            style={{ fill: INK.primary, fontSize: 11, fontWeight: 650 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ------------------------------------------------------------------
// PAGE
// ------------------------------------------------------------------

function Dashboard() {
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setRefreshing(true);

    try {
      setData(await loadAll());
      setLastUpdated(new Date());
    } finally {
      inFlight.current = false;
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  if (!data) {
    return (
      <div className="assets-loading-card">
        <div className="assets-loading-spinner"></div>
        Loading security overview...
      </div>
    );
  }

  const { assets, alerts, incidents, vulnerabilities, compliance } = data;

  // ---------- KPIs ----------
  const onlineAssets = assets.data.filter((a) => (a.status || "ONLINE") === "ONLINE").length;
  const openAlerts = alerts.data.filter((a) => a.status !== "RESOLVED");
  const criticalAlerts = openAlerts.filter((a) => a.severity === "CRITICAL").length;
  const activeIncidents = incidents.data.filter(
    (i) => i.status === "OPEN" || i.status === "IN_PROGRESS"
  );
  const overdueIncidents = activeIncidents.filter(
    (i) => i.slaDueAt && new Date(i.slaDueAt) < new Date()
  ).length;
  const openVulns = vulnerabilities.data.filter((v) => v.patchStatus !== "PATCHED");
  const urgentVulns = openVulns.filter(
    (v) => v.severity === "CRITICAL" || v.severity === "HIGH"
  ).length;
  const compliant = compliance.data.filter((c) => c.status === "COMPLIANT").length;
  const complianceScore = compliance.data.length
    ? Math.round((compliant / compliance.data.length) * 100)
    : null;

  const na = "—";

  // ---------- chart data ----------
  const alertTrend = buildAlertTrend(alerts.data);
  const alertsInRange = alertTrend.reduce(
    (s, d) => s + SEVERITIES.reduce((t, k) => t + d[k], 0),
    0
  );

  const statusCounts = ASSET_STATUS.map((s) => ({
    ...s,
    value: assets.data.filter((a) => (a.status || "ONLINE") === s.key).length,
  }));

  const resourceUsage = buildResourceUsage(assets.data, 8);
  const resourceMatrix = buildResourceUsage(assets.data, 10);
  const fleet = buildFleetUtilization(assets.data);
  const assetsByType = countBy(assets.data, (a) => title(normaliseType(a.assetType)));
  const assetsByLocation = countBy(assets.data, (a) => a.location?.trim() || "Unspecified").slice(0, 6);
  const complianceByFramework = buildCompliance(compliance.data);

  const vulnsBySeverity = [...SEVERITIES].reverse().map((s) => ({
    name: title(s),
    value: openVulns.filter((v) => v.severity === s).length,
    fill: SEVERITY_COLORS[s],
  }));

  const incidentStatus = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((s) => ({
    name: title(s),
    value: incidents.data.filter((i) => i.status === s).length,
  }));

  const activity = buildActivity(alerts.data, incidents.data);

  return (
    <div className="dash">
      {/* HEADER */}
      <div className="dash-header">
        <div>
          <h1 className="assets-page-title">Security Overview</h1>
          <p className="assets-page-description">
            Infrastructure health, threats and compliance posture at a glance.
          </p>
        </div>

        <div className="dash-header-actions">
          {lastUpdated && (
            <span className="dash-updated">
              <span className={`dash-live-dot ${refreshing ? "dash-live-dot-busy" : ""}`} />
              Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            type="button"
            className="secondary-button dash-refresh"
            onClick={refresh}
            disabled={refreshing}
          >
            <RefreshCw size={14} className={refreshing ? "dash-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI ROW */}
      <div className="dash-kpi-grid">
        <KpiCard
          icon={Server}
          label="Assets online"
          to="/assets"
          value={assets.ok ? `${onlineAssets}/${assets.data.length}` : na}
          meta={
            !assets.ok
              ? "Not available"
              : assets.data.length
              ? `${Math.round((onlineAssets / assets.data.length) * 100)}% availability`
              : "No assets registered"
          }
          tone={assets.ok && onlineAssets < assets.data.length ? "warning" : undefined}
        />
        <KpiCard
          icon={ShieldAlert}
          label="Open alerts"
          to="/alerts"
          value={alerts.ok ? openAlerts.length : na}
          meta={alerts.ok ? `${criticalAlerts} critical` : "Not available"}
          tone={criticalAlerts > 0 ? "danger" : undefined}
        />
        <KpiCard
          icon={Siren}
          label="Active incidents"
          to="/incidents"
          value={incidents.ok ? activeIncidents.length : na}
          meta={incidents.ok ? `${overdueIncidents} past SLA` : "Not available"}
          tone={overdueIncidents > 0 ? "danger" : undefined}
        />
        <KpiCard
          icon={Bug}
          label="Open vulnerabilities"
          to="/vulnerabilities"
          value={vulnerabilities.ok ? openVulns.length : na}
          meta={vulnerabilities.ok ? `${urgentVulns} critical or high` : "Not available"}
          tone={urgentVulns > 0 ? "danger" : undefined}
        />
        <KpiCard
          icon={ClipboardCheck}
          label="Compliance score"
          to="/compliance"
          value={complianceScore != null ? `${complianceScore}%` : na}
          meta={
            !compliance.ok
              ? "Not available"
              : compliance.data.length
              ? `${compliant} of ${compliance.data.length} controls passing`
              : "No checks recorded"
          }
          tone={complianceScore != null && complianceScore < 80 ? "warning" : undefined}
        />
      </div>

      {/* THREAT ACTIVITY */}
      <div className="dash-section-title">
        Threat activity
      </div>

      <div className="dash-grid dash-grid-wide">
        <Panel
          title="Alerts over time"
          subtitle={`Last ${TREND_DAYS} days by severity · ${alertsInRange} total`}
          source={alerts}
          action={
            <Legend items={SEVERITIES.map((s) => ({ label: title(s), color: SEVERITY_COLORS[s] }))} />
          }
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={alertTrend} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={INK.grid} />
              <XAxis
                dataKey="label"
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={{ stroke: INK.axis }}
                interval="preserveStartEnd"
                minTickGap={16}
              />
              <YAxis allowDecimals={false} tick={AXIS_TICK} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: "rgba(23, 105, 224, 0.06)" }}
                content={<ChartTooltip showTotal />}
              />
              {SEVERITIES.map((s) => (
                <Bar
                  key={s}
                  dataKey={s}
                  name={title(s)}
                  stackId="alerts"
                  fill={SEVERITY_COLORS[s]}
                  maxBarSize={24}
                  shape={stackedSegment(s)}
                  isAnimationActive={false}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel
          title="Recent activity"
          subtitle="Latest alerts and incidents"
          empty={activity.length === 0}
          emptyText="No recent activity."
        >
          <ul className="dash-activity">
            {activity.map((item) => (
              <li key={item.id}>
                <Link to={item.to} className="dash-activity-item">
                  <span
                    className="dash-activity-dot"
                    style={{ background: SEVERITY_COLORS[item.severity] || INK.muted }}
                  />
                  <div className="dash-activity-body">
                    <div className="dash-activity-text">{item.text}</div>
                    <div className="dash-activity-meta">
                      {item.kind} · {title(item.severity)}
                      {item.meta ? ` · ${item.meta}` : ""}
                    </div>
                  </div>
                  <span className="dash-activity-time">{timeAgo(item.at)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* INFRASTRUCTURE SECTION - built from asset data */}
      <div className="dash-section-title">
        Infrastructure
        <span>{assets.ok ? `${assets.data.length} monitored assets` : ""}</span>
      </div>

      <div className="dash-grid dash-grid-thirds">
        <Panel
          title="Fleet utilization"
          subtitle="Average across all assets"
          source={assets}
          empty={assets.data.length === 0}
          emptyText="No assets registered yet."
        >
          <ul className="dash-fleet">
            {fleet.map((m) => (
              <li key={m.key}>
                <div className="dash-fleet-head">
                  <span className="dash-fleet-label">{m.label}</span>
                  <span className="dash-fleet-avg">{m.avg}%</span>
                </div>
                <UsageMeter value={m.avg} />
                <div className="dash-fleet-meta">
                  Peak {m.peak ? `${m.peak[m.key]}% · ${m.peak.name}` : "—"}
                  {m.hot > 0 && (
                    <span className="dash-fleet-hot">
                      {m.hot} above {USAGE_WARNING}%
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Assets by type"
          subtitle="Registered infrastructure mix"
          source={assets}
          empty={assets.data.length === 0}
          emptyText="No assets registered yet."
        >
          <CountBarChart data={assetsByType} />
        </Panel>

        <Panel
          title="Assets by location"
          subtitle="Where monitored assets run"
          source={assets}
          empty={assets.data.length === 0}
          emptyText="No assets registered yet."
        >
          <CountBarChart data={assetsByLocation} labelWidth={110} />
        </Panel>
      </div>

      <div className="dash-grid dash-grid-wide">
        <Panel
          title="Resource utilization"
          subtitle="Busiest assets · dashed line marks the 80% alert threshold"
          source={assets}
          empty={resourceUsage.length === 0}
          emptyText="No assets registered yet."
          action={<Legend items={RESOURCE_SERIES} />}
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={resourceUsage}
              margin={{ top: 8, right: 4, left: -18, bottom: 0 }}
              barGap={2}
            >
              <CartesianGrid vertical={false} stroke={INK.grid} />
              <XAxis
                dataKey="name"
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={{ stroke: INK.axis }}
                interval={0}
                tickFormatter={(v) => (v?.length > 12 ? `${v.slice(0, 11)}…` : v)}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(23, 105, 224, 0.06)" }}
                content={<ChartTooltip unit="%" />}
              />
              <ReferenceLine y={80} stroke="#d03b3b" strokeDasharray="4 4" strokeWidth={1} />
              {RESOURCE_SERIES.map((s) => (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  name={s.label}
                  fill={s.color}
                  maxBarSize={14}
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={false}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel
          title="Asset health"
          subtitle="Current status of monitored assets"
          source={assets}
          empty={assets.data.length === 0}
          emptyText="No assets registered yet."
        >
          <div className="dash-donut">
            <div className="dash-donut-chart">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={statusCounts.filter((s) => s.value > 0)}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={58}
                    outerRadius={80}
                    stroke="#ffffff"
                    strokeWidth={2}
                    startAngle={90}
                    endAngle={-270}
                    isAnimationActive={false}
                  >
                    {statusCounts
                      .filter((s) => s.value > 0)
                      .map((s) => (
                        <Cell key={s.key} fill={s.color} />
                      ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="dash-donut-center">
                <strong>{assets.data.length}</strong>
                <span>assets</span>
              </div>
            </div>

            <ul className="dash-status-list">
              {statusCounts.map((s) => (
                <li key={s.key}>
                  <span className="dash-swatch" style={{ background: s.color }} />
                  <span className="dash-status-name">{s.label}</span>
                  <span className="dash-status-count">{s.value}</span>
                  <span className="dash-status-pct">
                    {assets.data.length ? Math.round((s.value / assets.data.length) * 100) : 0}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>
      </div>

      {/* ASSET RESOURCE MATRIX */}
      <div className="dash-grid">
        <Panel
          title="Asset resource matrix"
          subtitle={`Top ${resourceMatrix.length} assets by peak usage · amber ≥ ${USAGE_WARNING}%, red ≥ ${USAGE_CRITICAL}%`}
          source={assets}
          empty={resourceMatrix.length === 0}
          emptyText="No assets registered yet."
          action={
            <Link to="/assets" className="view-link">
              View all assets →
            </Link>
          }
        >
          <div className="dash-matrix-scroll">
            <table className="assets-table dash-matrix">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Location</th>
                  {RESOURCE_SERIES.map((s) => (
                    <th key={s.key}>{s.label}</th>
                  ))}
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {resourceMatrix.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <Link to={`/assets/${row.id}`} className="asset-name-cell">
                        <div className="asset-icon">
                          {row.name?.charAt(0)?.toUpperCase() || "A"}
                        </div>
                        <div>
                          <strong>{row.name}</strong>
                          <span>{title(normaliseType(row.type))}</span>
                        </div>
                      </Link>
                    </td>
                    <td>{row.location || "—"}</td>
                    {RESOURCE_SERIES.map((s) => (
                      <td key={s.key}>
                        <UsageMeter value={row[s.key]} compact />
                      </td>
                    ))}
                    <td>
                      <span className={`status-badge status-${row.status.toLowerCase()}`}>
                        <span className="status-badge-dot"></span>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      {/* RISK & COMPLIANCE */}
      <div className="dash-section-title">
        Risk &amp; compliance
      </div>

      <div className="dash-grid dash-grid-thirds">
        <Panel
          title="Open vulnerabilities"
          subtitle="Unpatched, by severity"
          source={vulnerabilities}
        >
          <ResponsiveContainer width="100%" height={190}>
            <BarChart
              data={vulnsBySeverity}
              layout="vertical"
              margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
            >
              <XAxis type="number" allowDecimals={false} hide />
              <YAxis
                type="category"
                dataKey="name"
                width={64}
                tick={{ ...AXIS_TICK, fill: INK.secondary }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip cursor={{ fill: "rgba(23, 105, 224, 0.06)" }} content={<ChartTooltip />} />
              <Bar
                dataKey="value"
                name="Open"
                maxBarSize={18}
                radius={[0, 4, 4, 0]}
                isAnimationActive={false}
              >
                {vulnsBySeverity.map((v) => (
                  <Cell key={v.name} fill={v.fill} />
                ))}
                <LabelList
                  dataKey="value"
                  position="right"
                  style={{ fill: INK.primary, fontSize: 11, fontWeight: 650 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Incident pipeline" subtitle="All incidents by status" source={incidents}>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart
              data={incidentStatus}
              layout="vertical"
              margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
            >
              <XAxis type="number" allowDecimals={false} hide />
              <YAxis
                type="category"
                dataKey="name"
                width={78}
                tick={{ ...AXIS_TICK, fill: INK.secondary }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip cursor={{ fill: "rgba(23, 105, 224, 0.06)" }} content={<ChartTooltip />} />
              <Bar
                dataKey="value"
                name="Incidents"
                fill="#2a78d6"
                maxBarSize={18}
                radius={[0, 4, 4, 0]}
                isAnimationActive={false}
              >
                <LabelList
                  dataKey="value"
                  position="right"
                  style={{ fill: INK.primary, fontSize: 11, fontWeight: 650 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel
          title="Compliance by framework"
          subtitle="Share of controls passing"
          source={compliance}
          empty={complianceByFramework.length === 0}
          emptyText="No compliance checks recorded yet."
        >
          <ResponsiveContainer
            width="100%"
            height={Math.max(120, complianceByFramework.length * 44 + 20)}
          >
            <BarChart
              data={complianceByFramework}
              layout="vertical"
              margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
            >
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis
                type="category"
                dataKey="framework"
                width={86}
                tick={{ ...AXIS_TICK, fill: INK.secondary }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(23, 105, 224, 0.06)" }}
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <div className="dash-tooltip">
                      <div className="dash-tooltip-title">{payload[0].payload.framework}</div>
                      <div className="dash-tooltip-row">
                        <span className="dash-tooltip-name">Controls passing</span>
                        <span className="dash-tooltip-value">
                          {payload[0].payload.compliant} / {payload[0].payload.total}
                        </span>
                      </div>
                    </div>
                  ) : null
                }
              />
              <Bar
                dataKey="score"
                fill="#2a78d6"
                maxBarSize={18}
                radius={[0, 4, 4, 0]}
                background={{ fill: "#eef3fa", radius: 4 }}
                isAnimationActive={false}
              >
                <LabelList
                  dataKey="score"
                  position="right"
                  formatter={(v) => `${v}%`}
                  style={{ fill: INK.primary, fontSize: 11, fontWeight: 650 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  );
}

export default Dashboard;
