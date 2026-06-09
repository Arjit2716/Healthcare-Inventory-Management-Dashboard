"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, UserPlus, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { registerSchema, type RegisterInput } from "@/validations/auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const ROLES = [
  {
    value: "STAFF",
    label: "Staff",
    description: "Record stock movements, view inventory",
    color: "violet",
  },
  {
    value: "ADMIN",
    label: "Admin",
    description: "Full access — manage all data and users",
    color: "blue",
  },
] as const;

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 8,           label: "At least 8 characters" },
  { test: (p: string) => /[A-Z]/.test(p),         label: "One uppercase letter" },
  { test: (p: string) => /[0-9]/.test(p),         label: "One number" },
  { test: (p: string) => /[^A-Za-z0-9]/.test(p), label: "One special character" },
];

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<"ADMIN" | "STAFF">("STAFF");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", role: "STAFF" },
  });

  const password = watch("password", "");

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error || "Registration failed. Please try again.");
        return;
      }

      toast.success("Account created!", "Please sign in with your credentials.");
      router.push("/login");
    } catch {
      setServerError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-8 shadow-2xl animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Create account</h2>
        <p className="mt-1 text-sm text-slate-400">
          Join HealthInventory — get started in seconds
        </p>
      </div>

      {/* Server error */}
      {serverError && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <p className="text-sm text-red-300">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Full Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Dr. Jane Smith"
            autoComplete="name"
            error={errors.name?.message}
            {...register("name")}
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@hospital.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
        </div>

        {/* Role selector */}
        <div className="space-y-1.5">
          <Label>Role</Label>
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map((role) => {
              const isActive = selectedRole === role.value;
              const colorMap = {
                blue:   { ring: "border-blue-500/60 bg-blue-500/10",   dot: "bg-blue-400",   text: "text-blue-300" },
                violet: { ring: "border-violet-500/60 bg-violet-500/10", dot: "bg-violet-400", text: "text-violet-300" },
              };
              const colors = colorMap[role.color];
              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => {
                    setSelectedRole(role.value);
                    setValue("role", role.value, { shouldValidate: true });
                  }}
                  className={`relative flex flex-col gap-1 rounded-xl border p-3 text-left transition-all ${
                    isActive
                      ? colors.ring
                      : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                  }`}
                >
                  {isActive && (
                    <span className={`absolute right-2 top-2 h-2 w-2 rounded-full ${colors.dot}`} />
                  )}
                  <span className={`text-sm font-semibold ${isActive ? colors.text : "text-slate-300"}`}>
                    {role.label}
                  </span>
                  <span className="text-[10px] text-slate-500">{role.description}</span>
                </button>
              );
            })}
          </div>
          {errors.role && (
            <p className="text-xs text-red-400">{errors.role.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              autoComplete="new-password"
              error={errors.password?.message}
              className="pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Password strength rules */}
          {password.length > 0 && (
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {PASSWORD_RULES.map((rule) => {
                const passed = rule.test(password);
                return (
                  <div key={rule.label} className="flex items-center gap-1.5">
                    <CheckCircle2
                      className={`h-3 w-3 shrink-0 transition-colors ${
                        passed ? "text-emerald-400" : "text-slate-600"
                      }`}
                    />
                    <span
                      className={`text-[10px] transition-colors ${
                        passed ? "text-emerald-400" : "text-slate-500"
                      }`}
                    >
                      {rule.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="Repeat your password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              className="pr-10"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account…
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Create account
            </>
          )}
        </Button>
      </form>

      {/* Login link */}
      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
