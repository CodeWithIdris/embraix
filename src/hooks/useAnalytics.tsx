import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type AnalyticsEventType =
  | "page_view"
  | "product_view"
  | "product_compare"
  | "report_download"
  | "service_request"
  | "consultation_request"
  | "ai_query"
  | "search"
  | "story_view"
  | "article_view"
  | "research_view";

export interface TrackEventParams {
  eventType: AnalyticsEventType;
  resourceId?: string;
  resourceType?: string;
  metadata?: Record<string, unknown>;
}

/** Fire-and-forget analytics tracker. Never throws. */
export const trackEvent = async (params: TrackEventParams, userId?: string) => {
  try {
    await (supabase as any).from("analytics_events").insert({
      event_type: params.eventType,
      user_id: userId || null,
      resource_id: params.resourceId || null,
      resource_type: params.resourceType || null,
      metadata: params.metadata || {},
    });
  } catch {
    // Silently fail – analytics should never block UX
  }
};

export const useAnalytics = () => {
  const { user } = useAuth();

  const track = useCallback(
    (params: TrackEventParams) => {
      trackEvent(params, user?.id);
    },
    [user?.id]
  );

  return { track };
};
