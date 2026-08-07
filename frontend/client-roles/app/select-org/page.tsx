"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { useMemberships } from "@/lib/hooks/useMemberships";
import { orgService } from "@/lib/services";
import { Building2, ChevronRight, Loader2, AlertCircle } from "lucide-react";

export default function SelectOrgPage() {
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sessionIncomplete, setSessionIncomplete] = useState(false);
  const router = useRouter();

  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const { memberships, loading: hydrating } = useMemberships();

  const orgs = memberships.map((m) => ({
    org: m.org,
    org_slug: m.org_slug,
    is_admin: m.is_admin,
  }));

  // Auth guard + fallback for empty store
  useEffect(() => {
    if (hydrating) return;
    if (!user) {
      router.replace("/signin");
      return;
    }

    if (memberships.length === 0) {
      const refresh = async () => {
        setRefreshing(true);
        try {
          const res = await orgService.listOrgs();
          const raw = res.data;
          const list: { uuid: string; name: string; slug: string }[] = Array.isArray(raw)
            ? raw
            : (raw?.results ?? []);

          if (list.length === 0) {
            // Genuine no-org state â€” fall through to "No Organizations Found" UI
            return;
          }
          // Store is stale: user has orgs on the backend but no role data locally.
          // Force re-authentication so login repopulates the store with complete data.
          setSessionIncomplete(true);
        } catch {
          // Non-fatal â€” fall through to empty state
        } finally {
          setRefreshing(false);
        }
      };
      refresh();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrating, user]);

  // Prefetch destination pages whenever memberships change
  useEffect(() => {
    memberships.forEach((m) => {
      const dest = `/${m.org_slug}/projects`;
      router.prefetch(dest);
    });
  }, [memberships, router]);

  const handleSelectOrg = (orgSlug: string) => {
    setSelectedOrg(orgSlug);
    const org = orgs.find((o) => o.org_slug === orgSlug);
    const dest = `/${orgSlug}/projects`;
    router.prefetch(dest);
    router.replace(dest);
  };

  if (hydrating || (memberships.length === 0 && refreshing)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#021422] mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (sessionIncomplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm px-6">
          <AlertCircle size={48} className="text-amber-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Session Incomplete</h2>
          <p className="text-sm text-gray-500 mb-6">
            Your session data is incomplete. Please sign in again to continue.
          </p>
          <button
            onClick={() => { clearAuth(); router.replace("/signin?reason=session"); }}
            className="bg-[#021422] text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-[#0F181F] transition"
          >
            Sign In Again
          </button>
        </div>
      </div>
    );
  }

  if (orgs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm px-6">
          <Building2 size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">No Organizations Found</h2>
          <p className="text-sm text-gray-500 mb-6">
            Your account isn&apos;t linked to any organization yet. Contact your administrator for an invite.
          </p>
          <button
            onClick={() => { clearAuth(); router.replace("/signin"); }}
            className="text-sm font-semibold text-[#021422] underline hover:text-[#0F181F]"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 md:px-16 py-12">
        <div className="max-w-lg w-full">
          <div className="flex md:hidden flex-col items-center justify-center mb-8">
            <img src="/images/logo.png" alt="Site Supervise" className="w-16 h-16 mb-4" />
            <h1 className="text-2xl text-[#021422] font-extrabold text-center">SITE SUPERVISE</h1>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <Building2 size={28} className="text-[#021422]" />
            <h2 className="text-xl font-bold text-[#021422]">Select Organization</h2>
          </div>

          <p className="text-sm text-gray-500 mb-8">
            Choose an organization to access its projects and dashboard.
          </p>

          <div className="space-y-3">
            {orgs.map((org) => (
              <button
                key={org.org_slug}
                onClick={() => handleSelectOrg(org.org_slug)}
                disabled={selectedOrg === org.org_slug}
                className="w-full p-4 border border-gray-200 rounded-xl hover:border-[#021422] hover:bg-gray-50 transition flex items-center justify-between group disabled:opacity-50"
              >
                <div className="text-left">
                  <p className="font-semibold text-gray-900">{org.org}</p>
                  <p className="text-sm text-gray-500">
                    {org.is_admin ? "Administrator" : "Member"}
                  </p>
                </div>
                <ChevronRight
                  size={20}
                  className="text-gray-400 group-hover:text-[#021422] transition"
                />
              </button>
            ))}
          </div>

          <p className="text-xs text-gray-400 text-center mt-8">
            Logged in as: <span className="font-medium">{user?.email}</span>
          </p>
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
            Select an organization to access your projects.
          </p>
        </div>
      </div>
    </div>
  );
}
