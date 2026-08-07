"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { use, useState, useCallback } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useProjectUuid } from "@/lib/hooks/useProjectUuid";
import { trimbleBimService } from "@/lib/services/trimbleBimService";
import { arSessionService } from "@/lib/services/arSessionService";
import { engineerKeys } from "@/lib/queryKeys";
import type { BimFile, BimFileFormat } from "@/lib/types/bimFile";
import EngineerHeader from "../components/EngineerHeader";
import BimFileUploader from "./components/BimFileUploader";
import UploadStatusBar from "./components/UploadStatusBar";
import BimFileList from "./components/BimFileList";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

interface BimFilesPageProps {
  params: Promise<{ org_slug: string; project_slug: string }>;
}

export default function BimFilesPage({ params }: BimFilesPageProps) {
  const { org_slug, project_slug } = use(params);
  const { data: projectUuid } = useProjectUuid(org_slug, project_slug);
  const qc = useQueryClient();

  const [cursor, setCursor] = useState<number | null>(null);
  const [extraFiles, setExtraFiles] = useState<BimFile[]>([]); // load-more pages beyond page 1
  const [loadingMore, setLoadingMore] = useState(false);
  const [pollingIds, setPollingIds] = useState<
    { uuid: string; filename: string }[]
  >([]);
  const [uploading, setUploading] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [uploadPct, setUploadPct] = useState(0);

  // ── Queries ────────────────────────────────────────────────────────────────

  const { data: filesData, isLoading } = useQuery({
    queryKey: engineerKeys.bimFiles(projectUuid),
    queryFn: async () => {
      const res = await trimbleBimService.listBimFiles(projectUuid);
      // Reset load-more pages whenever page 1 is (re)fetched
      setExtraFiles([]);
      setCursor(res.data.next_cursor);
      return res.data;
    },
    enabled: !!projectUuid,
  });

  const { data: arSessionsData } = useQuery({
    queryKey: engineerKeys.arSessions(projectUuid),
    queryFn: () =>
      arSessionService.getSessions(projectUuid).then((res) => {
        const sessions = res.data?.results || [];
        return sessions.map((s: { id: number; name: string }) => ({
          id: s.id,
          name: s.name,
        }));
      }),
    enabled: !!projectUuid,
  });
  const arSessions = arSessionsData ?? [];

  // ── Upload: direct-to-Azure (SAS) with a multipart fallback for dev ─────────

  const multipartFallback = async (
    file: File,
    format?: BimFileFormat,
    arSessionId?: number,
  ): Promise<BimFile> => {
    const formData = new FormData();
    formData.append("file", file);
    if (arSessionId) formData.append("ar_session", String(arSessionId));
    if (format) formData.append("file_format", format);
    const res = await trimbleBimService.uploadBimFile(projectUuid, formData);
    return res.data;
  };

  const handleUpload = async (
    file: File,
    format?: BimFileFormat,
    arSessionId?: number,
  ) => {
    if (!projectUuid) {
      toast.error("No project selected");
      return;
    }

    setUploading(true);
    setUploadName(file.name);
    setUploadPct(0);

    try {
      let bimFile: BimFile;
      try {
        // 1) get a pre-signed SAS URL (+ a pending BimFile)
        const sasRes = await trimbleBimService.requestUploadSas(projectUuid, {
          filename: file.name,
          file_size: file.size,
        });
        const { upload_url, upload_headers, ...pending } = sasRes.data;
        // 2) upload straight to Azure with progress
        await trimbleBimService.uploadToAzure(
          upload_url,
          file,
          upload_headers,
          setUploadPct,
        );
        // 3) finalize → backend verifies the blob and fires conversion
        const finalRes = await trimbleBimService.finalizeUpload(pending.uuid);
        bimFile = finalRes.data;
      } catch (err: any) {
        // Dev / no-Azure: fall back to the multipart endpoint.
        if (
          err?.response?.status === 409 &&
          err?.response?.data?.error === "azure_not_configured"
        ) {
          bimFile = await multipartFallback(file, format, arSessionId);
        } else {
          throw err;
        }
      }

      setExtraFiles((prev) => [bimFile, ...prev]);
      setPollingIds((prev) => [
        ...prev,
        { uuid: bimFile.uuid, filename: bimFile.filename },
      ]);
      toast.success("Upload complete — converting for headset…");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.error ||
          err?.response?.data?.detail ||
          err?.message ||
          "Upload failed",
      );
    } finally {
      setUploading(false);
      setUploadName("");
      setUploadPct(0);
    }
  };

  const handlePollComplete = useCallback(
    (bimFileUuid: string) => {
      setPollingIds((prev) => prev.filter((p) => p.uuid !== bimFileUuid));
      // Invalidate so the list refreshes with the final processed file
      qc.invalidateQueries({ queryKey: engineerKeys.bimFiles(projectUuid) });
    },
    [projectUuid, qc],
  );

  const handleLoadMore = async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await trimbleBimService.listBimFiles(projectUuid, cursor);
      setExtraFiles((prev) => [...prev, ...res.data.files]);
      setCursor(res.data.next_cursor);
    } catch {
      // silent fail
    } finally {
      setLoadingMore(false);
    }
  };

  const handleRetry = (file: BimFile) => {
    setExtraFiles((prev) => prev.filter((f) => f.id !== file.id));
  };

  // Page 1 comes from the query cache; load-more and optimistic uploads accumulate in extraFiles
  const files = [...(filesData?.files ?? []), ...extraFiles];

  const backUrl = `/${org_slug}/projects/${project_slug}/engineer/qa-dashboard`;

  return (
    <div>
      <EngineerHeader title="BIM FILE MANAGER" badge="Trimble Connect" />

      <div className="p-4 md:p-8 pb-20 space-y-8">
        <Link
          href={backUrl}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to QA Dashboard
        </Link>

        <section>
          <BimFileUploader
            onUpload={handleUpload}
            uploading={uploading}
            arSessions={arSessions}
          />
        </section>

        {uploading && (
          <section>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-800 truncate mr-3">
                  {uploadName}
                </span>
                <span className="text-xs font-semibold text-blue-600">
                  Uploading to storage… {uploadPct}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${uploadPct}%` }}
                />
              </div>
            </div>
          </section>
        )}

        {pollingIds.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-800 uppercase tracking-wide mb-4">
              Converting
            </h2>
            {pollingIds.map((p) => (
              <UploadStatusBar
                key={p.uuid}
                bimFileUuid={p.uuid}
                filename={p.filename}
                onComplete={handlePollComplete}
              />
            ))}
          </section>
        )}

        <section>
          <h2 className="text-lg font-semibold text-gray-800 uppercase tracking-wide mb-4">
            Uploaded Files
          </h2>
          <BimFileList
            files={files}
            loading={isLoading}
            hasMore={cursor !== null}
            onLoadMore={handleLoadMore}
            onRetry={handleRetry}
          />
        </section>
      </div>
    </div>
  );
}
