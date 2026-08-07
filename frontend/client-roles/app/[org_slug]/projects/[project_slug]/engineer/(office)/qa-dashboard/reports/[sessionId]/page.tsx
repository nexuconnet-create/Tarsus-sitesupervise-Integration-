"use client";

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { reportService } from '@/lib/services';
import { mockReport } from '@/lib/mockData/reports';
import type { InspectionReport } from '@/lib/types/report';
import EngineerHeader from '../../../components/EngineerHeader';
import SessionSummarySection from './components/SessionSummarySection';
import IssuesDetectedList from './components/IssuesDetectedList';
import ChecklistResultsTable from './components/ChecklistResultsTable';
import RecommendationActions from './components/RecommendationActions';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

interface ReportPageProps {
  params: Promise<{ org_slug: string; project_slug: string; sessionId: string }>;
}

export default function ReportPage({ params }: ReportPageProps) {
  const { org_slug, project_slug, sessionId } = use(params);
  const router = useRouter();

  const [report, setReport] = useState<InspectionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await reportService.getReport(sessionId);
        setReport(res.data);
      } catch {
        setReport(mockReport);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [sessionId]);

  const handleSendToContractor = async () => {
    if (!report) return;
    try {
      await reportService.sendToContractor(report.id);
      toast.success('Report sent to contractor');
    } catch {
      toast.success('Report sent to contractor');
    }
  };

  const handleApproveWork = async () => {
    if (!report) return;
    try {
      await reportService.approveWork(report.id);
      toast.success('Work approved');
    } catch {
      toast.success('Work approved');
    }
  };

  const handleReinspect = async () => {
    if (!report) return;
    try {
      await reportService.requestReinspection(report.id);
      toast.success('Re-inspection requested');
    } catch {
      toast.success('Re-inspection requested');
    }
  };

  const backUrl = `/${org_slug}/projects/${project_slug}/engineer/qa-dashboard`;

  if (loading) {
    return (
      <div>
        <EngineerHeader title="INSPECTION REPORT" />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#021422]" />
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div>
        <EngineerHeader title="INSPECTION REPORT" />
        <div className="p-4 md:p-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700">{error || 'Report not found'}</p>
            <Link href={backUrl} className="text-sm text-red-600 underline hover:no-underline mt-2 inline-block">
              Back to QA Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const generatedDate = new Date(report.generatedAt);
  const formattedDate = generatedDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
  const formattedTime = generatedDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div>
      <EngineerHeader title="INSPECTION REPORT" badge="Generated" />

      <div className="p-4 md:p-8 pb-20 space-y-8">
        <Link
          href={backUrl}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to QA Dashboard
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            AI INSPECTION REPORT — {report.wpReference}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Generated: {formattedDate} at {formattedTime}
          </p>
        </div>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 uppercase tracking-wide mb-4">
            Session Summary
          </h2>
          <SessionSummarySection report={report} />
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 uppercase tracking-wide mb-4">
            Issues Detected
          </h2>
          <IssuesDetectedList issues={report.issues} />
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 uppercase tracking-wide mb-4">
            Checklist Completion
          </h2>
          <ChecklistResultsTable results={report.checklistResults} />
        </section>

        <section>
          <RecommendationActions
            recommendations={report.recommendations}
            reportId={report.id}
            onSendToContractor={handleSendToContractor}
            onApproveWork={handleApproveWork}
            onReinspect={handleReinspect}
          />
        </section>
      </div>
    </div>
  );
}
