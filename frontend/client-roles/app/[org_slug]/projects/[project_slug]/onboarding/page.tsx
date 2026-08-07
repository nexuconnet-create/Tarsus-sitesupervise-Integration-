"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMemberships } from "@/lib/hooks/useMemberships";
import { getProjectDashboardRoute } from "@/lib/urlUtils";
import { getSafetyFlowKey } from "@/lib/authUtils";
import { useAuthStore } from "@/lib/stores/authStore";
import SafetyFlow from "@/components/onboarding/SafetyFlow";
import {
  Search, BarChart2, DollarSign, Clock, CheckCircle, Activity,
  Command, Users, LayoutDashboard, Building2, UserCircle, Briefcase
} from 'lucide-react';

interface OnboardingPageProps {
  params: Promise<{ org_slug: string; project_slug: string }>;
}

export default function OnboardingPage({ params }: OnboardingPageProps) {
  const { org_slug, project_slug } = use(params);
  const router = useRouter();
  const { getProject, loading } = useMemberships();
  const user = useAuthStore((s) => s.user);
  const project = getProject(org_slug, project_slug);
  const [showSafetyFlow, setShowSafetyFlow] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // Client Type Selector State
  const [activeClientType, setActiveClientType] = useState<string>('Private-Individual');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!user?.uuid) return;

    // Automatically skip safety flow for testing the client dashboard
    const roleRoute = getProjectDashboardRoute(project?.role || "");
    if (roleRoute === "client") {
      setHasCompletedOnboarding(true);
      return;
    }

    const key = getSafetyFlowKey(user.uuid, org_slug, project_slug);
    const completed = localStorage.getItem(key) === "true";

    setHasCompletedOnboarding(completed);
    if (!completed) {
      setShowSafetyFlow(true);
    }
  }, [user, org_slug, project_slug, project?.role]);

  // Search Keyboard Shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSafetyComplete = () => {
    if (user?.uuid) {
      const key = getSafetyFlowKey(user.uuid, org_slug, project_slug);
      localStorage.setItem(key, "true");
    }
    setHasCompletedOnboarding(true);
    setShowSafetyFlow(false);

    // If not a client, just route them automatically. If a client, they'll see the selector.
    const route = getProjectDashboardRoute(project?.role || "");
    if (route !== "client") {
      if (route) {
        router.push(`/${org_slug}/projects/${project_slug}/${route}`);
      } else {
        router.push(`/${org_slug}/projects/${project_slug}/site-supervisor`);
      }
    }
  };

  const handleClose = () => {
    router.push(`/${org_slug}/projects/${project_slug}`);
  };

  const handleProceed = () => {
    const route = getProjectDashboardRoute(project?.role || "");
    const query = `?clientType=${encodeURIComponent(activeClientType)}`;
    if (route === "client") {
      let actualRoute = "client";
      if (activeClientType === 'Private-Individual') actualRoute = 'private-individual';
      else if (activeClientType === 'Government Agency') actualRoute = 'government-agencies';
      else if (activeClientType === 'Executive Developer') actualRoute = 'executive-developers';
      router.push(`/${org_slug}/projects/${project_slug}/${actualRoute}${query}`);
    } else if (route) {
      router.push(`/${org_slug}/projects/${project_slug}/${route}${query}`);
    } else {
      router.push(`/${org_slug}/projects/${project_slug}/site-supervisor${query}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-[#021422] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (showSafetyFlow && !hasCompletedOnboarding) {
    return (
      <SafetyFlow
        onComplete={handleSafetyComplete}
        onClose={handleClose}
        projectSlug={project_slug}
        roleId={project?.role || ""}
      />
    );
  }

  const roleRoute = getProjectDashboardRoute(project?.role || "");
  const isClientFlow = roleRoute === "client";

  if (isClientFlow && hasCompletedOnboarding) {
    // Render the RBAC Client Type Selector
    const clientTypes = [
      { id: 'Client', label: 'Client', icon: Users },
      { id: 'Private-Individual', label: 'Private-Individual', icon: UserCircle },
      { id: 'Government Agency', label: 'Government Agency', icon: Building2 },
      { id: 'Executive Developer', label: 'Executive Developer', icon: Briefcase },
    ];

    return (
      <div className="min-h-screen bg-[#E3E3E3] text-slate-900 overflow-y-auto pb-12 font-sans w-full">
        {/* Header Area */}
        <div className="bg-white border-b border-slate-200 px-8 py-5 sticky top-0 z-20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-sm font-bold text-[#021422] flex items-center gap-2 uppercase tracking-wide">
              SITESUPERVISE — CLIENT DASHBOARD
            </h1>
            <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
              <span>Welcome, <strong className="text-slate-800">{user?.first_name || 'Client'}</strong></span>
              <span>•</span>
              <span className="font-semibold text-slate-700">{project?.name || project_slug || 'Lagos 12-Storey Mixed-Use Development'}</span>
              <span>•</span>
              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                3 Updates
              </span>
              <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                5 Notifs
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-8 space-y-8">

          {/* CLIENT TYPE SELECTOR */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-[#021422] text-white p-4 flex items-center gap-2">
              <UserCircle size={16} className="text-blue-400" />
              <h2 className="text-sm font-bold">Client Type Selector</h2>
            </div>

            <div className="p-6 flex flex-wrap items-center gap-4">
              <div className="flex-1 bg-slate-50 p-1.5 rounded-xl border border-slate-200 flex flex-wrap items-center gap-2">
                {clientTypes.map((type) => {
                  const isActive = activeClientType === type.id;
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setActiveClientType(type.id)}
                      className={`
                        flex-1 min-w-[200px] flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold transition-all
                        ${isActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}
                      `}
                    >
                      <Icon size={18} />
                      {type.label}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleProceed}
                className="px-6 py-4 bg-[#0B1120] hover:bg-slate-800 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-md"
              >
                Continue to Dashboard →
              </button>
            </div>
          </section>

          {/* GLOBAL SEARCH BAR */}
          <section>
            <div
              onClick={() => setIsSearchOpen(true)}
              className="relative group cursor-pointer w-full bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-500 transition-colors shadow-sm overflow-hidden"
            >
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                readOnly
                className="block w-full pl-16 pr-24 py-5 bg-transparent border-none text-lg text-slate-800 placeholder-slate-400 focus:outline-none cursor-pointer font-medium"
                placeholder="Search for projects, documents, progress updates, reports..."
              />
              <div className="absolute inset-y-0 right-0 pr-6 flex items-center pointer-events-none">
                <kbd className="inline-flex items-center border-2 border-slate-200 rounded-lg px-3 py-1 text-sm font-sans font-bold text-slate-400 bg-slate-50">
                  <Command size={14} className="mr-1.5" /> K
                </kbd>
              </div>
            </div>
          </section>

          {/* QUICK METRICS CARDS */}
          <section>
            <div className="bg-[#021422] text-white p-3 flex items-center gap-2 rounded-t-xl mb-3">
              <BarChart2 size={16} className="text-blue-400" />
              <h2 className="text-sm font-bold">Quick Metrics ({activeClientType})</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div
                className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                onClick={handleProceed}
              >
                <div className="flex items-center gap-2 text-slate-500 mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider">PROJECT PROGRESS</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full mb-3 overflow-hidden">
                  <div className="h-full bg-blue-500 w-[45.2%] rounded-full group-hover:bg-blue-600 transition-colors"></div>
                </div>
                <div className="text-xl font-bold text-[#021422]">45.2%</div>
              </div>

              <div
                className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                onClick={handleProceed}
              >
                <div className="flex items-center gap-2 text-slate-500 mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider">BUDGET (68% USED)</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full mb-3 overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[68%] rounded-full group-hover:bg-emerald-600 transition-colors"></div>
                </div>
                <div className="text-lg font-bold text-[#021422] truncate">₦1.2B<span className="text-sm text-slate-400 font-semibold">/1.8B</span></div>
              </div>

              <div
                className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                onClick={handleProceed}
              >
                <div className="flex items-center gap-2 text-slate-500 mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider">PROGRESS COMPLETE</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full mb-3 overflow-hidden">
                  <div className="h-full bg-indigo-500 w-[45.2%] rounded-full group-hover:bg-indigo-600 transition-colors"></div>
                </div>
                <div className="text-xl font-bold text-[#021422]">45.2%</div>
              </div>

              <div
                className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                onClick={handleProceed}
              >
                <div className="flex items-center gap-2 text-slate-500 mb-4">

                  <span className="text-xs font-bold uppercase tracking-wider">DEADLINE</span>
                </div>
                <div className="text-lg font-bold text-amber-600 mb-1 flex items-center gap-1.5">
                  45 DAYS LEFT
                </div>
                <div className="text-sm font-semibold text-slate-500">08/15/27</div>
              </div>

              <div
                className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                onClick={handleProceed}
              >
                <div className="flex items-center gap-2 text-slate-500 mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider">TASKS COMPLETE</span>
                </div>
                <div className="text-xl font-bold text-[#021422] mb-1">82<span className="text-sm text-slate-400 font-semibold">/156</span></div>
                <div className="text-sm font-bold text-teal-600">52.6%</div>
              </div>

              <div
                className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                onClick={handleProceed}
              >
                <div className="flex items-center gap-2 text-slate-500 mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider">TEAM ACTIVE</span>
                </div>
                <div className="text-xl font-bold text-[#021422] mb-1">24<span className="text-sm text-slate-400 font-semibold">/28</span></div>
                <div className="text-sm font-bold text-purple-600">85.7%</div>
              </div>
            </div>
          </section>

          {/* PROJECT HEALTH SCORECARD */}
          <section>
            <div className="bg-[#021422] rounded-2xl shadow-xl overflow-hidden text-white flex flex-col md:flex-row items-stretch cursor-pointer hover:shadow-2xl transition-all" onClick={handleProceed}>
              <div className="p-6 md:p-8 flex items-center justify-center bg-blue-600 flex-shrink-0 md:w-64">
                <div className="text-center">
                  <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-2">OVERALL HEALTH SCORE</p>
                  <div className="text-5xl font-black text-white tracking-tighter">
                    82<span className="text-2xl text-blue-200">/100</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 p-6 md:p-8 flex items-center bg-gradient-to-r from-[#021422] to-[#0B1E2E]">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
                  <div className="flex flex-col items-center justify-center text-center p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 mb-3 shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">SCHEDULE</p>
                    <p className="text-2xl font-bold text-emerald-400">76%</p>
                  </div>
                  <div className="flex flex-col items-center justify-center text-center p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 mb-3 shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">BUDGET</p>
                    <p className="text-2xl font-bold text-emerald-400">88%</p>
                  </div>
                  <div className="flex flex-col items-center justify-center text-center p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 mb-3 shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">QUALITY</p>
                    <p className="text-2xl font-bold text-emerald-400">92%</p>
                  </div>
                  <div className="flex flex-col items-center justify-center text-center p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="w-3 h-3 rounded-full bg-amber-400 mb-3 shadow-[0_0_10px_rgba(251,191,36,0.8)]"></div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">SAFETY</p>
                    <p className="text-2xl font-bold text-amber-400">78%</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Search Overlay Placeholder */}
        {isSearchOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-start justify-center pt-[10vh]" onClick={() => setIsSearchOpen(false)}>
            <div
              className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center border-b border-slate-100 p-6">
                <Search className="w-6 h-6 text-slate-400 mr-4" />
                <input
                  autoFocus
                  type="text"
                  className="w-full text-xl outline-none text-slate-800 placeholder-slate-400 font-medium bg-transparent"
                  placeholder="Search projects, reports, documents, updates..."
                />
                <kbd className="hidden md:inline-flex items-center border-2 border-slate-200 rounded-lg px-3 py-1.5 text-sm font-sans font-bold text-slate-400 bg-slate-50 ml-4">
                  ESC
                </kbd>
              </div>
              <div className="p-6 bg-slate-50">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">Suggestions</p>
                <div className="space-y-1.5">
                  {['Latest Progress Report', 'Phase 2 Timeline', 'Substructure Contract'].map((item, idx) => (
                    <button key={idx} className="w-full flex items-center px-4 py-3 hover:bg-white hover:shadow-md rounded-xl text-sm font-bold text-slate-700 transition-all border border-transparent hover:border-slate-200">
                      <Command className="w-4 h-4 mr-3 text-slate-400" />
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Fallback for non-client roles
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome to {project?.name || project_slug}
        </h1>
        <p className="text-gray-600 mb-6">
          Your role is <span className="font-semibold">{project?.role}</span>
        </p>

        {hasCompletedOnboarding ? (
          <button
            onClick={handleProceed}
            className="w-full bg-[#021422] text-white py-3 rounded-xl font-semibold hover:bg-[#0F181F] transition"
          >
            Proceed to Dashboard
          </button>
        ) : (
          <button
            onClick={() => setShowSafetyFlow(true)}
            className="w-full bg-[#021422] text-white py-3 rounded-xl font-semibold hover:bg-[#0F181F] transition"
          >
            Complete Safety Onboarding
          </button>
        )}
      </div>
    </div>
  );
}
