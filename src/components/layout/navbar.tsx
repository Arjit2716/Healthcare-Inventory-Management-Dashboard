"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  LogOut, ChevronDown, ShieldCheck, User, Bell,
  Search, Settings, Moon, Sun,
} from "lucide-react";
import { type Session } from "next-auth";
import { cn } from "@/lib/utils";

interface NavbarProps { user: Session["user"]; }

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === "ADMIN";

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-white/[0.05] bg-slate-900/40 px-6 backdrop-blur-xl">
      {/* ── Search ── */}
      <div className={cn(
        "flex flex-1 max-w-sm items-center gap-2.5 rounded-xl border px-3 py-2 transition-all duration-300",
        searchFocused
          ? "border-blue-500/50 bg-blue-500/5 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
          : "border-white/[0.06] bg-slate-800/40 hover:border-white/10"
      )}>
        <Search className={cn("h-4 w-4 shrink-0 transition-colors", searchFocused ? "text-blue-400" : "text-slate-500")} />
        <input
          type="text"
          placeholder="Search products, suppliers…"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="w-full bg-transparent text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none"
        />
        <kbd className="hidden shrink-0 rounded-md border border-white/[0.06] bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-600 sm:block">
          ⌘K
        </kbd>
      </div>

      <div className="flex items-center gap-2">
        {/* ── Status dot ── */}
        <div className="hidden items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
          <span className="text-xs text-emerald-400">All systems operational</span>
        </div>

        {/* ── Bell ── */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-slate-800/50 text-slate-400 transition-all hover:border-white/10 hover:bg-slate-700/50 hover:text-slate-200">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-slate-900">
            7
          </span>
        </button>

        {/* ── Settings ── */}
        <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-slate-800/50 text-slate-400 transition-all hover:border-white/10 hover:bg-slate-700/50 hover:text-slate-200">
          <Settings className="h-4 w-4" />
        </button>

        {/* ── User Menu ── */}
        <div className="relative" ref={dropRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={cn(
              "flex items-center gap-2.5 rounded-xl border px-3 py-2 transition-all duration-200",
              dropdownOpen
                ? "border-blue-500/30 bg-blue-500/5"
                : "border-white/[0.06] bg-slate-800/50 hover:border-white/10"
            )}
          >
            {/* Avatar */}
            <div className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold text-white",
              isAdmin
                ? "bg-gradient-to-br from-blue-500 to-violet-600 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                : "bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-[0_0_8px_rgba(167,139,250,0.5)]"
            )}>
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-200 leading-none">
                {user?.name?.split(" ")[0] ?? "User"}
              </p>
              <p className="mt-0.5 text-[10px] text-slate-500">{user?.role}</p>
            </div>
            <ChevronDown className={cn(
              "h-3.5 w-3.5 text-slate-400 transition-transform duration-200",
              dropdownOpen ? "rotate-180" : ""
            )} />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-800/95 shadow-2xl backdrop-blur-xl">
              {/* User info */}
              <div className="border-b border-white/[0.06] px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white",
                    isAdmin
                      ? "bg-gradient-to-br from-blue-500 to-violet-600"
                      : "bg-gradient-to-br from-violet-500 to-fuchsia-600"
                  )}>
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-100 truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                </div>
                <div className={cn(
                  "mt-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium",
                  isAdmin
                    ? "border-blue-500/20 bg-blue-500/10 text-blue-300"
                    : "border-violet-500/20 bg-violet-500/10 text-violet-300"
                )}>
                  {isAdmin ? <ShieldCheck className="h-3 w-3" /> : <User className="h-3 w-3" />}
                  {isAdmin ? "Administrator" : "Staff Member"}
                </div>
              </div>

              {/* Actions */}
              <div className="p-2">
                <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-400 transition-all hover:bg-slate-700/60 hover:text-slate-200">
                  <Settings className="h-4 w-4" />
                  Account settings
                </button>
                <div className="my-1 border-t border-white/[0.06]" />
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-red-400 transition-all hover:bg-red-500/10 hover:text-red-300"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
