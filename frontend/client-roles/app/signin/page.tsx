"use client";
import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authService } from "@/lib/services";
import { useMutation } from "@tanstack/react-query";
import type { ApiMembership } from "@/lib/services/auth";
import { useAuthStore, type OrganizationMembership } from "@/lib/stores/authStore";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowLeft, ShieldCheck } from "lucide-react";
import { pendingEmail, invitedEmail } from "@/lib/utils/authStorage";

const ADMIN_ROUTE_PATTERN = /^\/[^/]+\/admin/;
const authRoutes = ["/signin", "/register", "/admin-register", "/forgot-password", "/two-factor", "/accept-invite", "/first-login"];

function safeRedirect(value: string | null): string | null {
  if (!value) return null;
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//")) return null;
  if (value.indexOf(":") !== -1 && value.indexOf(":") < value.indexOf("/", 1)) return null;
  if (authRoutes.some((r) => value.startsWith(r))) return null;
  return value;
}

function SignInContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState(() => {
    const prefill = invitedEmail.get();
    if (prefill) {
      invitedEmail.clear();
      return { email: prefill, password: "" };
    }
    return { email: "", password: "" };
  });
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const [success, setSuccess] = useState(() => {
    if (searchParams.get("invited") === "true") return "Account created successfully! Please sign in.";
    if (searchParams.get("reason") === "session") return "Your session data is incomplete. Please sign in again to continue.";
    return "";
  });
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const storeUser = useAuthStore((s) => s.user);
  const storeMemberships = useAuthStore((s) => s.memberships);

  useEffect(() => {
    if (storeUser) {
      if (storeUser.must_change_password) {
        router.replace("/first-login");
        return;
      }
      const isAdminUser = storeMemberships.some((m) => m.is_admin);
      if (isAdminUser) {
        const redirectTarget = safeRedirect(searchParams.get("redirect"));
        // Admins only follow a redirect that points into the admin area;
        // any other stale redirect is ignored so they always land on the admin dashboard.
        if (redirectTarget && ADMIN_ROUTE_PATTERN.test(redirectTarget)) {
          router.replace(redirectTarget);
          return;
        }
        const firstAdminOrg = storeMemberships.find((m) => m.is_admin);
        if (firstAdminOrg) {
          router.replace(`/${firstAdminOrg.org_slug}/admin`);
          return;
        }
        router.replace("/select-org");
        return;
      }
      const redirectTarget = safeRedirect(searchParams.get("redirect"));
      if (redirectTarget && !ADMIN_ROUTE_PATTERN.test(redirectTarget)) {
        router.replace(redirectTarget);
        return;
      }
      router.replace("/select-org");
    }
  }, [router, searchParams, storeUser, storeMemberships]);

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),
    onSuccess: (response, variables) => {
      const responseData = response.data?.data || response.data;
      const userData = responseData?.user;
      const accessToken = responseData?.access_token || responseData?.access;
      const refreshToken = responseData?.refresh_token || responseData?.refresh;

      if (accessToken && refreshToken) {
        // Map API shape { name, slug } â†’ internal shape { org, org_slug }
        const memberships: OrganizationMembership[] = (userData?.memberships ?? []).map(
          (m: ApiMembership) => ({
            org: m.name,
            org_slug: m.slug,
            is_admin: m.is_admin,
            projects: m.projects ?? [],
          })
        );

        setAuth(accessToken, refreshToken, {
          email: userData.email,
          name: userData.name,
          uuid: userData.uuid,
          must_change_password: userData?.must_change_password ?? false,
          safety_onboarding_completed: responseData?.safety_onboarding_completed ?? false,
        }, memberships);
      } else if (responseData?.requires_otp || responseData?.message?.includes("OTP")) {
        pendingEmail.set(variables.email);
        router.replace("/two-factor");
      } else {
        setError("Login successful but no authentication tokens received");
      }
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { errors?: Record<string, unknown> | string; message?: string; error?: string } } };
      let errorMessage = "Login failed";
      if (axiosErr.response?.data) {
        const errorData = axiosErr.response.data;
        if (typeof errorData.errors === "string") {
          errorMessage = errorData.errors;
        } else if (errorData.errors && typeof errorData.errors === "object") {
          const errors = errorData.errors as Record<string, unknown>;
          if (errors.error) {
            errorMessage = errors.error as string;
          } else if (errors.email) {
            errorMessage = Array.isArray(errors.email) ? errors.email[0] as string : errors.email as string;
          } else if (errors.password) {
            errorMessage = Array.isArray(errors.password) ? errors.password[0] as string : errors.password as string;
          } else {
            const firstError = Object.values(errors)[0];
            errorMessage = Array.isArray(firstError) ? firstError[0] as string : firstError as string;
          }
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if ((err as Error).message) {
        errorMessage = (err as Error).message;
      }
      setError(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.password || formData.password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    setError("");
    setPasswordError("");

    loginMutation.mutate({ email: formData.email, password: formData.password });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 md:px-16 py-12">
        <div className="max-w-lg w-full">
          {/* Mobile logo */}
          <div className="flex md:hidden flex-col items-center justify-center mb-8">
            <img
              src="/images/logo.png"
              alt="Site Supervise"
              className="w-16 h-16 mb-4"
            />
            <h1 className="text-2xl text-[#021422] font-extrabold text-center">
              SITE SUPERVISE
            </h1>
          </div>

          {/* Desktop top right link */}
          <div className="hidden md:flex items-center justify-between mb-8">
            <button
              type="button"
              onClick={() => router.back()}
              className="p-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 hover:text-[#021422] transition"
              aria-label="Go back"
            >
              <ArrowLeft size={18} />
            </button>
          </div>

          <h2 className="text-2xl font-bold mb-2 text-[#021422]">
            Sign In to Your Construction Dashboard
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            Access your account and manage your construction activities with the
            right tools for your role.
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email */}
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full border border-gray-300 rounded-full px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required
            />

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  setPasswordError("");
                }}
                className="w-full border border-gray-300 rounded-full px-6 py-4 pr-14 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm font-bold underline text-[#021422] hover:text-[#0F181F] transition"
              >
                Forget Password?
              </Link>
            </div>

            {passwordError && (
              <p className="text-red-500 text-sm text-center">
                {passwordError}
              </p>
            )}
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            {success && (
              <p className="text-green-600 text-sm text-center bg-green-50 py-2 px-4 rounded-lg">
                {success}
              </p>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-[#021422] text-white py-4 rounded-full font-semibold hover:bg-[#0F181F] transition disabled:opacity-50 text-sm"
            >
              {loginMutation.isPending ? "Signing In..." : "Login"}
            </button>

            {/* Emergency Access Button */}
            <button
              type="button"
              className="w-full bg-red-600 text-white py-4 rounded-full font-semibold hover:bg-red-700 transition text-sm"
            >
              Emergency Access
            </button>
          </form>

          {/* Mobile only links */}
          <div className="md:hidden flex flex-col items-center gap-4 mt-8">
            <Link
              href="/forgot-password"
              className="text-sm font-bold underline text-[#021422]"
            >
              Forgot Password?
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Don&apos;t have an account?
              </span>
              <a
                href="/register"
                className="text-sm font-bold text-[#021422] underline"
              >
                Register
              </a>
            </div>
            <a
              href="/vendor-signin"
              className="text-sm text-gray-500 underline"
            >
              Vendor Sign In
            </a>
            <a
              href="/admin-register"
              className="flex items-center justify-center gap-2 text-sm text-[#021422] font-semibold mt-4"
            >
              <ShieldCheck size={16} />
              Register as Admin
            </a>
          </div>
        </div>
      </div>

      {/* Right side - Image Panel */}
      <div
        className="hidden md:flex flex-1 bg-cover bg-center relative items-center justify-center text-white"
        style={{
          backgroundImage:
            "url('https://res.cloudinary.com/depeqzb6z/image/upload/v1763210704/site_revqzy.png')",
        }}
      >
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="relative text-center px-6 flex flex-col justify-center h-full py-12">
          <div className="flex-1 flex flex-col justify-center">
            <img
              src="/images/white_logo.svg"
              alt="Site Supervise"
              className="mx-auto mb-6 w-28 h-auto"
            />
            <h1 className="text-4xl font-extrabold mb-4">SITE SUPERVISE</h1>
          </div>
          <p className="text-xl max-w-lg mx-auto mt-auto font-semibold">
            Manage, monitor, and analyze every construction project — all from
            one platform.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#021422] border-t-transparent rounded-full" />
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
