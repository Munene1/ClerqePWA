import { API_BASE_URL } from "../config/env";
import { WS_BASE_URL } from "../config/env";

export type LiveTranscriptEvent =
  | { type: "transcript.ready"; model: string }
  | { type: "transcript.partial"; item_id?: string; delta: string }
  | { type: "transcript.final"; item_id?: string; transcript: string }
  | { type: "transcript.error"; message: string };

export function liveTranscriptionUrl(): string {
  return `${WS_BASE_URL}/voice/live`;
}

function extensionForMimeType(mimeType: string): string {
  const normalized = mimeType.toLowerCase();
  if (normalized.includes("mp4")) return "mp4";
  if (normalized.includes("mpeg")) return "mp3";
  if (normalized.includes("ogg")) return "ogg";
  if (normalized.includes("wav")) return "wav";
  return "webm";
}

export async function transcribeVoice(token: string, audio: Blob): Promise<{ status: string; transcript?: string; message?: string }> {
  const form = new FormData();
  form.append("audio", audio, `clerqe-voice.${extensionForMimeType(audio.type || "audio/webm")}`);
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(`${API_BASE_URL}/voice/transcribe`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(String(data.detail || data.message || "Could not transcribe audio."));
    }
    if (data.status !== "ok" || !String(data.transcript || "").trim()) {
      throw new Error(String(data.message || "No speech was detected."));
    }
    return data;
  } finally {
    window.clearTimeout(timeout);
  }
}
