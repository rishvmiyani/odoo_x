"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Truck, Loader2 } from "lucide-react";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast }    from "sonner";

const LoginSchema = z.object({
  email:    z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading,    setIsLoading]    = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } =
    useForm<LoginFormData>({ resolver: zodResolver(LoginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email, password: data.password, redirect: false,
      });
      if (result?.error) { toast.error("Invalid email or password"); return; }
      toast.success("Welcome back!");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Service unavailable. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm px-4">
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-slate-900 mb-4">
          <Truck className="h-6 w-6 text-blue-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">FleetFlow AI</h1>
        <p className="text-sm text-gray-500 mt-1">Fleet & Logistics Management System</p>
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Sign in to your account</CardTitle>
          <CardDescription className="text-xs">Enter your credentials to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium">Email address</Label>
              <Input id="email" type="email" placeholder="you@fleetflow.com"
                autoComplete="email" className="h-9 text-sm" {...register("email")} />
              {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"}
                  placeholder="Enter your password" autoComplete="current-password"
                  className="h-9 text-sm pr-10" {...register("password")} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" checked={watch("remember")}
                  onCheckedChange={(v) => setValue("remember", !!v)} />
                <label htmlFor="remember" className="text-xs text-gray-600 cursor-pointer">Remember me</label>
              </div>
              <button type="button" className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                onClick={() => toast.info("Contact your administrator to reset your password.")}>
                Forgot password?
              </button>
            </div>

            <Button type="submit" className="w-full h-9 text-sm bg-slate-900 hover:bg-slate-800" disabled={isLoading}>
              {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Signing in...</> : "Sign in"}
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-2">Demo credentials</p>
            <div className="grid grid-cols-2 gap-1.5 text-xs text-gray-500">
              {[
                ["Fleet Manager",    "manager@fleetflow.com"],
                ["Dispatcher",       "dispatch@fleetflow.com"],
                ["Safety Officer",   "safety@fleetflow.com"],
                ["Financial Analyst","finance@fleetflow.com"],
              ].map(([role, email]) => (
                <button key={email} type="button"
                  onClick={() => { (document.getElementById("email") as HTMLInputElement).value = email; }}
                  className="text-left px-2 py-1 rounded bg-gray-50 hover:bg-gray-100 transition-colors">
                  <span className="block font-medium text-gray-700">{role}</span>
                  <span className="block truncate">{email}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-center text-gray-400 mt-2">Password: FleetFlow@2025</p>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-gray-400 mt-6">FleetFlow AI v1.0 — Odoo Hackathon 2026</p>
    </div>
  );
}
