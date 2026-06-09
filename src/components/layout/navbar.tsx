"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LogOut, ChevronDown, User, ShieldCheck, Bell } from "lucide-react";
import { type Session } from "next-auth";

interface NavbarProps {
  user: Session["user"];
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const isAdmin = user?.role === "ADMIN";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900/30 px-6">
      {/* Page title — could be dynamic via context */}
      <div className="flex items-center gap-2">
        <div className="h-1 w-1 rounded-full bg-emerald-400" />
        <span className="text-xs text-slate-500">System operational</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Alert bell */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/50 text-slate-400 transition-colors hover:border-slate-600 hover:text-slate-200">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            7
          </span>
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 rounded-xl border border-slate-700 bg-slate-800/50 px-3 py-2 transition-all hover:border-slate-600"
          >
            {/* Avatar */}
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white ${
              isAdmin
                ? "bg-gradient-to-br from-blue-500 to-violet-600"
                : "bg-gradient-to-br from-violet-500 to-fuchsia-600"
            }`}>
              {initials}
            </div>

            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-200 leading-none">
                {user?.name?.split(" ")[0] ?? "User"}
              </p>
              <p className="mt-0.5 text-[10px] text-slate-500">{user?.email}</p>
            </div>

            <ChevronDown
              className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-xl">
                {/* User info */}
                <div className="border-b border-slate-700 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-200">{user?.name}</p>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                  <div className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    isAdmin
                      ? "bg-blue-500/15 text-blue-300"
                      : "bg-violet-500/15 text-violet-300"
                  }`}>
                    {isAdmin ? <ShieldCheck className="h-3 w-3" /> : <User className="h-3 w-3" />}
                    {user?.role}
                  </div>
                </div>

                {/* Menu items */}
                <div className="p-1.5">
                  <button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                  >
                    <LogOut className="h-4 w-4" />
                    {isSigningOut ? "Signing out…" : "Sign out"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
