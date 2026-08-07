
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CrewManagerPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/main-dashboard/site-supervisor/dashboard");
  }, [router]);

  return null;
}