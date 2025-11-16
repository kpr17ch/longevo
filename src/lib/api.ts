import type { OnboardingData } from "./onboarding-schema";
import type { HabitPlan } from "./tracking-types";

export interface BackendResponse {
  interventionName: string | null;
  responseText: string;
  plan?: HabitPlan;
}

export interface ApiInput {
  age?: number;
  sex?: "male" | "female" | "other";
  height_cm?: number;
  weight_kg?: number;
  sleep_hours_per_night?: number;
  movement_days_per_week?: number;
  work_activity_level?: string;
  stress_level_1_to_10?: number;
  lab_pdf?: {
    filename: string;
    mime_type: string;
    base64: string;
  };
  userInput?: string;
  pastMessages?: Array<{ role: string; content: string }>;
  bloodData?: Record<string, number>;
  userProfile?: Record<string, any>;
}

export interface DailyTask {
  activity: string;
  steps: number;
}

export interface Challenge {
  intervention_name: string;
  duration_days: number;
  daily_tasks: DailyTask[];
  success_criteria?: string;
  category?: string;
}

export interface ApiResponse {
  output: {
    response: string;
    intervention_name: string | null;
    challenge?: Challenge;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      if (!base64) {
        reject(new Error("Failed to extract base64 from file"));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function buildBackendPayload(
  onboardingData: OnboardingData,
  labFileBase64: string | null,
  labFileName: string | null,
  labFileType?: string
): ApiInput {
  const input: ApiInput = {};

  if (onboardingData.age !== null) {
    input.age = onboardingData.age;
  }

  if (onboardingData.sex !== null) {
    const sexMap: Record<string, "male" | "female" | "other"> = {
      male: "male",
      female: "female",
      other: "other",
      "prefer-not-to-say": "other",
    };
    input.sex = sexMap[onboardingData.sex] || "other";
  }

  if (onboardingData.height !== null) {
    input.height_cm = onboardingData.height;
  }

  if (onboardingData.weight !== null) {
    input.weight_kg = onboardingData.weight;
  }

  if (onboardingData.sleepHours !== null) {
    input.sleep_hours_per_night = onboardingData.sleepHours;
  }

  if (onboardingData.movementDays !== null) {
    input.movement_days_per_week = onboardingData.movementDays;
  }

  if (onboardingData.workActivityLevel !== null) {
    input.work_activity_level = onboardingData.workActivityLevel;
  }

  if (onboardingData.stressLevel !== null) {
    input.stress_level_1_to_10 = onboardingData.stressLevel;
  }

  if (labFileBase64 && labFileName) {
    const mimeType = labFileType || (labFileName.endsWith(".png") ? "image/png" : "application/pdf");
    input.lab_pdf = {
      filename: labFileName,
      mime_type: mimeType,
      base64: labFileBase64,
    };
  }

  input.userInput = "Please analyze my health data and provide personalized recommendations.";

  input.pastMessages = [];

  const bloodData: Record<string, number> = {};
  if (onboardingData.hba1c !== null) bloodData.hba1c = onboardingData.hba1c;
  if (onboardingData.ldl !== null) bloodData.ldl = onboardingData.ldl;
  if (onboardingData.hdl !== null) bloodData.hdl = onboardingData.hdl;
  if (onboardingData.triglycerides !== null)
    bloodData.triglycerides = onboardingData.triglycerides;
  if (onboardingData.crp !== null) bloodData.crp = onboardingData.crp;

  if (Object.keys(bloodData).length > 0) {
    input.bloodData = bloodData;
  }

  return input;
}

export async function executeBiohackerAgent(
  payload: ApiInput
): Promise<BackendResponse> {
  const url = `${API_BASE_URL}/execute`;
  console.log(`[Backend API] Attempting to connect to: ${url}`);
  console.log(`[Backend API] Payload size: ${JSON.stringify(payload).length} bytes`);
  
  try {
    const controller = new AbortController();
    const timeoutMs = 7 * 60 * 1000; // 7 minutes
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    console.log(`[Backend API] Response status: ${response.status} ${response.statusText}`);
    console.log(`[Backend API] Response headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorText = "";
      let errorDetails = "";
      try {
        const errorData = await response.json();
        errorText = errorData.error || "Unknown error";
        errorDetails = errorData.details || "";
        console.error(`[Backend API] Error response:`, errorData);
      } catch (e) {
        try {
          errorText = await response.text();
          console.error(`[Backend API] Error response body (text):`, errorText);
        } catch (e2) {
          console.error(`[Backend API] Failed to read error response:`, e2);
        }
      }
      
      if (response.status === 503 || response.status === 504) {
        const error = new Error(
          response.status === 503 
            ? "Backend is still initializing. Please wait a moment and try again."
            : "Backend request timeout. The server might be overloaded or unreachable."
        );
        console.error(`[Backend API] Service unavailable/timeout:`, error);
        throw error;
      }
      
      if (response.status === 502) {
        const error = new Error(
          `Failed to connect to backend: ${errorDetails || errorText || "Connection failed"}`
        );
        console.error(`[Backend API] Bad gateway:`, {
          status: response.status,
          errorText,
          errorDetails,
          url,
        });
        throw error;
      }
      
      const error = new Error(
        `Backend error (${response.status}): ${errorDetails || errorText || "Unknown error"}`
      );
      console.error(`[Backend API] HTTP error:`, {
        status: response.status,
        statusText: response.statusText,
        errorText,
        errorDetails,
        url,
      });
      throw error;
    }

    let data: ApiResponse;
    try {
      const responseText = await response.text();
      console.log(`[Backend API] Response body length: ${responseText.length} characters`);
      data = JSON.parse(responseText);
      console.log(`[Backend API] Parsed response successfully`);
    } catch (parseError) {
      console.error(`[Backend API] Failed to parse JSON response:`, parseError);
      throw new Error(`Failed to parse backend response as JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
    }

    // Map challenge to HabitPlan if present, otherwise create fallback plan
    let plan: HabitPlan | undefined;
    if (data.output.challenge && data.output.challenge.daily_tasks && data.output.challenge.daily_tasks.length > 0) {
      plan = {
        interventionName: data.output.challenge.intervention_name,
        durationDays: data.output.challenge.duration_days,
        days: data.output.challenge.daily_tasks.map((task, idx) => ({
          dayIndex: idx + 1,
          date: "", // Will be resolved in app-state with start date
          activity: task.activity,
          targetSteps: task.steps,
        })),
        successCriteria: data.output.challenge.success_criteria,
        category: data.output.challenge.category,
      };
    } else {
      // Fallback plan: 10-day walking habit with increasing step goals
      // Day 1 starts at ~9000, each day adds ~500 with realistic variations
      const generateRealisticSteps = (dayIndex: number): number => {
        const baseSteps = 9000 + (dayIndex - 1) * 500;
        const seed = dayIndex * 23 + 17;
        const pseudoRandom = ((seed * 9301 + 49297) % 233280) / 233280;
        const variation = Math.floor((pseudoRandom - 0.5) * 200);
        return Math.max(8000, baseSteps + variation);
      };
      
      const fallbackSteps = Array.from({ length: 10 }, (_, idx) => 
        generateRealisticSteps(idx + 1)
      );
      
      plan = {
        interventionName: data.output.intervention_name || "Daily Walking Habit",
        durationDays: 10,
        days: fallbackSteps.map((steps, idx) => ({
          dayIndex: idx + 1,
          date: "", // Will be resolved in app-state with start date
          activity: `Day ${idx + 1}: Walk ${steps.toLocaleString()} steps today`,
          targetSteps: steps,
        })),
        successCriteria: "Build sustainable walking habits and improve daily movement",
        category: "exercise",
      };
    }

    console.log(`[Backend API] Successfully processed response`);
    return {
      interventionName: data.output.intervention_name || plan?.interventionName || null,
      responseText: data.output.response || "",
      plan,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        console.error(`[Backend API] Request timeout after 7 minutes to ${url}`);
        throw new Error(
          `Request timeout: Backend at ${url} did not respond within 7 minutes. The server might be overloaded or unreachable.`
        );
      }
      
      if (error instanceof TypeError) {
        if (error.message.includes("fetch")) {
          console.error(`[Backend API] Network error:`, {
            message: error.message,
            url,
            stack: error.stack,
          });
          throw new Error(
            `Network error: Failed to connect to backend at ${url}. ` +
            `Possible causes: CORS issue, SSL certificate problem, server unreachable, or network connectivity issue. ` +
            `Original error: ${error.message}`
          );
        }
        if (error.message.includes("Failed to fetch")) {
          console.error(`[Backend API] Fetch failed:`, {
            message: error.message,
            url,
            stack: error.stack,
          });
          throw new Error(
            `Failed to fetch from backend at ${url}. ` +
            `This could be a CORS issue, SSL certificate problem, or the server is not responding. ` +
            `Original error: ${error.message}`
          );
        }
      }
      
      if (error.message.includes("SSL") || error.message.includes("certificate")) {
        console.error(`[Backend API] SSL/Certificate error:`, {
          message: error.message,
          url,
          stack: error.stack,
        });
        throw new Error(
          `SSL/Certificate error connecting to ${url}. ` +
          `The server's SSL certificate might be invalid or self-signed. ` +
          `Original error: ${error.message}`
        );
      }
      
      console.error(`[Backend API] Unknown error:`, {
        name: error.name,
        message: error.message,
        stack: error.stack,
        url,
      });
    } else {
      console.error(`[Backend API] Non-Error object thrown:`, error);
    }
    
    throw error;
  }
}

