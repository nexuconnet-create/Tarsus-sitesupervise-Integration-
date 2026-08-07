"use client";

import { useEffect } from "react";
import { clearAuthTokens } from "@/lib/authUtils";
import { useRouter, usePathname } from "next/navigation";

const DEFAULT_TIMEOUT_MS = 15 * 60 * 1000;

const AUTH_PATHS = ["/signin", "/reset-password", "/verify", "/two-factor"];

export default function useInactivityTimeout(timeoutMs?: number) {
  const router = useRouter();
  const pathname = usePathname();
  const timeout = timeoutMs ?? DEFAULT_TIMEOUT_MS;

  useEffect(() => {
    if (AUTH_PATHS.includes(pathname)) return;

    let timer: ReturnType<typeof setTimeout>;

    const handleActivity = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        clearAuthTokens();
        router.push(`/signin?redirect=${encodeURIComponent(pathname)}`);
      }, timeout);
    };

    const events = ["mousemove", "keydown", "scroll", "click", "touchstart"];
    events.forEach((event) => window.addEventListener(event, handleActivity));

    handleActivity();

    return () => {
      clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, handleActivity));
    };
  }, [pathname, timeout, router]);
}

