const SESSION_KEY = "ap_session_id";

function generateSessionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = generateSessionId();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export async function trackActivity(
  payload: {
    event_type: string;
    entity_type?: string;
    entity_id?: string;
    entity_slug?: string;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  const sessionId = getOrCreateSessionId();
  if (!sessionId) return;

  try {
    await fetch("/api/activity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-ap-session-id": sessionId,
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // Non-blocking analytics
  }
}

export function activityHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-ap-session-id": getOrCreateSessionId(),
  };
}
