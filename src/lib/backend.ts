
import { ScriptContent } from "./gemini";

export interface LogPayload {
  id: string;
  email: string;
  niche: string;
  audience: string;
  format: string;
  goal: string;
  selectedIdea: string;
  feedback?: number;
  scripts?: {
    standard: ScriptContent;
    storyteller: ScriptContent;
    viral: ScriptContent;
  };
}

export async function logToGoogleSheets(payload: LogPayload) {
  const backendUrl = (import.meta as any).env.VITE_BACKEND_URL;
  if (!backendUrl) {
    console.error("VITE_BACKEND_URL not configured. Ensure it's in your Secrets with the VITE_ prefix. Data not logged to Sheets.");
    return;
  }

  try {
    const response = await fetch(backendUrl, {
      method: "POST",
      mode: "no-cors", // Required for some Apps Script deployments
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
      }),
    });
    return response;
  } catch (error) {
    console.error("Failed to log to Google Sheets:", error);
  }
}
