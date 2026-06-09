"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: { value: number; label: string };
  variant: "blue" | "amber" | "red" | "emerald" | "violet";
  progress?: number;
  className?: string;
  delay?: string;
}

const VARIANTS = {
  blue: {
    bg:        "bg-gradient-to-br from-blue-600/20 to-blue-500/5",
    border:    "border-blue-500/15",
    iconBg:    "bg-blue-500/20",
    iconColor: "text-blue-400",
    valueCls:  "text-blue-50",
    progFill:  "bg-gradient-to-r from-blue-600 to-blue-400",
    trendPos:  "text-blue-300",
    glow:      "shadow-blue-500/10",
    dot:       "bg-blue-500",
  },
  amber: {
    bg:        "bg-gradient-to-br from-amber-600/20 to-amber-500/5",
    border:    "border-amber-500/15",
    iconBg:    "bg-amber-500/20",
    iconColor: "text-amber-400",
    valueCls:  "text-amber-50",
    progFill:  "bg-gradient-to-r from-amber-600 to-amber-400",
    trendPos:  "text-amber-300",
    glow:      "shadow-amber-500/10",
    dot:       "bg-amber-500",
  },
  red: {
    bg:        "bg-gradient-to-br from-red-600/20 to-red-500/5",
    border:    "border-red-500/15",
    iconBg:    "bg-red-500/20",
    iconColor: "text-red-400",
    valueCls:  "text-red-50",
    progFill:  "bg-gradient-to-r from-red-600 to-red-400",
    trendPos:  "text-red-300",
    glow:      "shadow-red-500/10",
    dot:       "bg-red-500",
  },
  emerald: {
    bg:        "bg-gradient-to-br from-emerald-600/20 to-emerald-500/5",
    border:    "border-emerald-500/15",
    iconBg:    "bg-emerald-500/20",
    iconColor: "text-emerald-400",
    valueCls:  "text-emerald-50",
    progFill:  "bg-gradient-to-r from-emerald-600 to-emerald-400",
    trendPos:  "text-emerald-300",
    glow:      "shadow-emerald-500/10",
    dot:       "bg-emerald-500",
  },
  violet: {
    bg:        "bg-gradient-to-br from-violet-600/20 to-violet-500/5",
    border:    "border-violet-500/15",
    iconBg:    "bg-violet-500/20",
    iconColor: "text-violet-400",
    valueCls:  "text-violet-50",
    progFill:  "bg-gradient-to-r from-violet-600 to-violet-400",
    trendPos:  "text-violet-300",
    glow:      "shadow-violet-500/10",
    dot:       "bg-violet-500",
  },
};

export function StatCard({
  title, value, subtitle, icon: Icon,
  trend, variant, progress, className, delay,
}: StatCardProps) {
  const v = VARIANTS[variant];
  const isPositiveTrend = (trend?.value ?? 0) > 0;
  const TrendIcon = isPositiveTrend ? TrendingUp : (trend?.value ?? 0) < 0 ? TrendingDown : Minus;

  return (
    <div
      className={cn(
        "stat-card glass-card rounded-2xl border p-5 opacity-0 animate-fade-in-up",
        v.bg, v.border,
        `shadow-xl ${v.glow}`,
        delay,
        className
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", v.iconBg)}>
          <Icon className={cn("h-5 w-5", v.iconColor)} />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
            isPositiveTrend
              ? "bg-emerald-500/10 text-emerald-400"
              : trend.value < 0
              ? "bg-red-500/10 text-red-400"
              : "bg-slate-500/10 text-slate-400"
          )}>
            <TrendIcon className="h-3 w-3" />
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
        <p className={cn("mt-1 text-3xl font-bold tracking-tight", v.valueCls)}>
          {value}
        </p>
        {subtitle && (
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        )}
        {trend && (
          <p className="mt-1 text-xs text-slate-500">{trend.label}</p>
        )}
      </div>

      {/* Progress bar */}
      {progress !== undefined && (
        <div className="mt-4">
          <div className="progress-bar">
            <div
              className={cn("progress-fill", v.progFill)}
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
          <p className="mt-1.5 text-right text-[10px] text-slate-600">{progress}% capacity</p>
        </div>
      )}

      {/* Decorative orb */}
      <div className={cn(
        "absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl opacity-20",
        v.dot
      )} />
    </div>
  );
}
