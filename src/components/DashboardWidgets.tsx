"use client";
import { useEffect, useState } from "react";

/* ------------------------------------------------------------------ */
/* Animated Radial Gauge — replaces a flat "X%" stat with a filling ring */
/* ------------------------------------------------------------------ */
export function RadialGauge({
  value,
  size = 128,
  strokeWidth = 10,
  label,
  sublabel,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  sublabel?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setProgress(clamped), 150);
    return () => clearTimeout(t);
  }, [clamped]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  const color = clamped >= 70 ? "#16A34A" : clamped >= 40 ? "#D97706" : "#EF4444";

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} className="-rotate-90 shrink-0">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          className="stroke-slate-200 dark:stroke-slate-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.6s ease" }}
        />
      </svg>
      <div className="absolute" style={{ width: size, textAlign: "center" }} />
      <div className="flex flex-col">
        <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">{Math.round(clamped)}%</p>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">{label}</p>
        {sublabel && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{sublabel}</p>}
      </div>
    </div>
  );
}

/* Positioned-overlay variant: number sits centered inside the ring itself */
export function RadialGaugeCentered({
  value,
  size = 140,
  strokeWidth = 12,
  label,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  label: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setProgress(clamped), 150);
    return () => clearTimeout(t);
  }, [clamped]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  const color = clamped >= 70 ? "#16A34A" : clamped >= 40 ? "#D97706" : "#EF4444";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} fill="none" className="stroke-slate-200 dark:stroke-slate-700" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} fill="none"
          stroke={color} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{Math.round(clamped)}%</p>
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">{label}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Skill Radar Chart — shows strength across threat categories at a glance */
/* ------------------------------------------------------------------ */
export interface RadarAxis {
  label: string;
  value: number; // 0-100
  icon?: string; // font-awesome class
}

export function SkillRadar({ axes, size = 280 }: { axes: RadarAxis[]; size?: number }) {
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 150);
    return () => clearTimeout(t);
  }, []);

  const center = size / 2;
  const maxRadius = size / 2 - 44; // leave room for labels
  const n = axes.length;
  const angleFor = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

  const pointAt = (i: number, r: number) => {
    const a = angleFor(i);
    return { x: center + r * Math.cos(a), y: center + r * Math.sin(a) };
  };

  const ringLevels = [0.25, 0.5, 0.75, 1];

  const dataPoints = axes.map((ax, i) => pointAt(i, (Math.max(0, Math.min(100, ax.value)) / 100) * maxRadius));
  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto overflow-visible">
      {/* background rings */}
      {ringLevels.map((lvl, li) => {
        const pts = axes.map((_, i) => pointAt(i, lvl * maxRadius));
        return (
          <polygon
            key={li}
            points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            className="stroke-slate-200 dark:stroke-slate-700"
            strokeWidth={1}
          />
        );
      })}
      {/* axis lines */}
      {axes.map((_, i) => {
        const p = pointAt(i, maxRadius);
        return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} className="stroke-slate-200 dark:stroke-slate-700" strokeWidth={1} />;
      })}
      {/* data polygon */}
      <polygon
        points={dataPolygon}
        fill="#2563EB"
        fillOpacity={0.18}
        stroke="#2563EB"
        strokeWidth={2}
        style={{
          transformOrigin: `${center}px ${center}px`,
          transform: animate ? "scale(1)" : "scale(0)",
          transition: "transform 0.9s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      />
      {dataPoints.map((p, i) => (
        <circle
          key={i} cx={p.x} cy={p.y} r={3.5} fill="#2563EB"
          style={{
            transformOrigin: `${center}px ${center}px`,
            transform: animate ? "scale(1)" : "scale(0)",
            transition: `transform 0.5s ease ${0.5 + i * 0.06}s`,
          }}
        />
      ))}
      {/* labels */}
      {axes.map((ax, i) => {
        const p = pointAt(i, maxRadius + 26);
        return (
          <text
            key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
            className="fill-slate-500 dark:fill-slate-400 text-[10px] font-bold uppercase"
          >
            {ax.label}
          </text>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Streak Card */
/* ------------------------------------------------------------------ */
export function StreakCard({ streak }: { streak: number }) {
  const active = streak > 0;
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 card-shadow flex items-center gap-4">
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0 ${
          active ? "bg-orange-100 dark:bg-orange-500/10 text-orange-500" : "bg-slate-100 dark:bg-slate-700 text-slate-400"
        }`}
      >
        <i className={`fas fa-fire ${active ? "animate-pulse" : ""}`}></i>
      </div>
      <div>
        <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">{streak}</p>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
          Day{streak === 1 ? "" : "s"} Streak
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
          {active ? "Keep it going — train today." : "Complete a scenario to start a streak."}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tier Badge — visual identity per level, shown next to username/level */
/* ------------------------------------------------------------------ */
const TIERS = [
  { max: 1, name: "Cyber Beginner", icon: "fa-seedling", color: "text-slate-500", bg: "bg-slate-100 dark:bg-slate-700" },
  { max: 2, name: "Cyber Aware", icon: "fa-eye", color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-500/10" },
  { max: 3, name: "Security Defender", icon: "fa-shield-halved", color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-500/10" },
  { max: 4, name: "Cyber Guardian", icon: "fa-shield-cat", color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-500/10" },
  { max: Infinity, name: "Cyber Expert", icon: "fa-crown", color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-500/10" },
];

export function getTier(level: number) {
  return TIERS.find((t) => level <= t.max) || TIERS[TIERS.length - 1];
}

export function TierBadge({ level, size = "md" }: { level: number; size?: "sm" | "md" }) {
  const tier = getTier(level);
  const dims = size === "sm" ? "w-8 h-8 text-sm" : "w-11 h-11 text-lg";
  return (
    <div className={`${dims} rounded-full ${tier.bg} ${tier.color} flex items-center justify-center shrink-0`} title={tier.name}>
      <i className={`fas ${tier.icon}`}></i>
    </div>
  );
}
