"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LogIn, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { loginSchema, type LoginInput } from "@/validations/auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setAuthError("Invalid email or password. Please try again.");
        return;
      }

      toast.success("Welcome back!", "Signed in successfully.");
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setAuthError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Demo credential fill
  const fillDemo = (role: "admin" | "staff") => {
    const creds = {
      admin: { email: "admin@healthcare.com", password: "Admin@123" },
      staff: { email: "staff@healthcare.com", password: "Staff@123" },
    };
    setValue("email", creds[role].email);
    setValue("password", creds[role].password);
  };

  return (
    <div className="glass rounded-2xl p-8 shadow-2xl animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Welcome back</h2>
        <p className="mt-1 text-sm text-slate-400">
          Sign in to your HealthInventory account
        </p>
      </div>

      {/* Auth error */}
      {authError && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <p className="text-sm text-red-300">{authError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@hospital.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <button
              type="button"
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
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
              Signing in…
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              Sign in
            </>
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 border-t border-slate-700" />
        <span className="text-xs text-slate-500">or try a demo account</span>
        <div className="flex-1 border-t border-slate-700" />
      </div>

      {/* Demo accounts */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => fillDemo("admin")}
          className="group flex flex-col items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 p-3 text-center transition-all hover:border-blue-500/50 hover:bg-blue-500/5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30 transition-colors">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-200">Admin</p>
            <p className="text-[10px] text-slate-500">Full access</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => fillDemo("staff")}
          className="group flex flex-col items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 p-3 text-center transition-all hover:border-violet-500/50 hover:bg-violet-500/5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/20 text-violet-400 group-hover:bg-violet-500/30 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-200">Staff</p>
            <p className="text-[10px] text-slate-500">Limited access</p>
          </div>
        </button>
      </div>

      {/* Register link */}
      <p className="mt-6 text-center text-sm text-slate-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
