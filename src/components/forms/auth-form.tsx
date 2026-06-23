"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AnalyticsEvents } from "@/lib/tracking";

export function AuthForm() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      await AnalyticsEvents.login();
      toast.success("Welcome back!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Sign in failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email" className="text-white/90">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          className="h-12 rounded-2xl border-white/10 bg-white/10 text-white placeholder:text-white/40"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password" className="text-white/90">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          className="h-12 rounded-2xl border-white/10 bg-white/10 text-white placeholder:text-white/40"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button
        type="submit"
        className="mt-2 h-14 w-full rounded-2xl bg-white text-base font-semibold text-[#172554] hover:bg-white/90"
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign in"}
      </Button>
      <p className="pt-2 text-center text-[13px] leading-relaxed text-white/50">
        Access is by invitation only. Contact your administrator for credentials.
      </p>
    </form>
  );
}
