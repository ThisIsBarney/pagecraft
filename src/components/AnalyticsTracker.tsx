"use client";

import { useEffect } from "react";

interface AnalyticsTrackerProps {
  pageId: string;
  domain?: string;
}

export function AnalyticsTracker({ pageId, domain }: AnalyticsTrackerProps) {
  useEffect(() => {
    // 发送页面访问统计
    const trackView = async () => {
      try {
        await fetch("/api/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pageId,
            domain,
            referrer: document.referrer || undefined,
            userAgent: navigator.userAgent,
          }),
        });
      } catch {
        // 静默失败，不影响用户体验
      }
    };

    trackView();
  }, [pageId, domain]);

  return null;
}
