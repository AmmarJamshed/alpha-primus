export type ActivityEventType =
  | "page_view"
  | "search"
  | "provider_view"
  | "retreat_view"
  | "event_view"
  | "category_click"
  | "save"
  | "guide_open";

export type SupportLevel =
  | "thriving"
  | "steady"
  | "needs_support"
  | "check_in_recommended";

export type RecommendationItemType =
  | "provider"
  | "retreat"
  | "event"
  | "category"
  | "action";

export interface ActivityEventInput {
  event_type: ActivityEventType;
  entity_type?: string;
  entity_id?: string;
  entity_slug?: string;
  metadata?: Record<string, unknown>;
}

export interface WellnessCheckinInput {
  mood_score: number;
  stress_level: number;
  challenges?: string[];
  notes?: string;
}

export interface AiRecommendationItem {
  type: RecommendationItemType;
  title: string;
  reason: string;
  slug?: string;
  href?: string;
  category?: string;
}

export interface AiRecommendationResult {
  support_level: SupportLevel;
  progress_summary: string;
  encouragement: string;
  wellness_tip: string;
  recommendations: AiRecommendationItem[];
}

export interface ActivityEventRow {
  id: string;
  event_type: string;
  entity_type: string | null;
  entity_id: string | null;
  entity_slug: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface WellnessCheckinRow {
  mood_score: number;
  stress_level: number;
  challenges: string[] | null;
  notes: string | null;
  created_at: string;
}

export const WELLNESS_CHALLENGES = [
  { id: "anxiety", label: "Anxiety or worry" },
  { id: "burnout", label: "Burnout or exhaustion" },
  { id: "depression", label: "Low mood" },
  { id: "relationship", label: "Relationship stress" },
  { id: "grief", label: "Grief or loss" },
  { id: "career", label: "Career uncertainty" },
  { id: "loneliness", label: "Loneliness" },
  { id: "trauma", label: "Trauma or past experiences" },
] as const;
