import { GoogleGenAI, Type } from "@google/genai";

export interface ContentIdea {
  label: string;
  title: string;
  description: string;
}

export interface ScriptContent {
  hook: string;
  meat: string[];
  visuals: string;
  cta: string;
  caption: string;
  hashtags: string[];
}

export interface ScriptSuite {
  standard: ScriptContent;
  storyteller: ScriptContent;
  viral: ScriptContent;
}

const getAI = (userKey?: string) => {
  const key = userKey || process.env.GEMINI_API_KEY || (import.meta as any).env.VITE_GEMINI_API_KEY || '';
  if (!key) {
    console.warn('No Gemini API key found. API calls will likely fail.');
  }
  return new GoogleGenAI({ apiKey: key });
};

export async function generateContentIdeas(
  platform: string, 
  topic: string, 
  goal: string,
  tone: string,
  length: string,
  userKey?: string
): Promise<ContentIdea[]> {
  console.log('Generating ideas for:', { platform, topic, goal, tone, length });
  const ai = getAI(userKey);
  const prompt = `Output JSON only. Create 2 distinct content ideas/angles for the following setup:
  Platform: ${platform}
  Topic: ${topic}
  Goal/CTA: ${goal}
  Tone: ${tone}
  Length: ${length}

  Output JSON matching the schema precisely.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a content strategist. Always output valid JSON strictly matching the provided schema.",
        temperature: 0.7,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ideas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ["label", "title", "description"],
              },
            },
          },
          required: ["ideas"],
        },
      },
    });

    console.log('Gemini response for ideas:', response);
    const text = response.text || '';
    if (!text) throw new Error('Empty response from AI');
    const parsed = JSON.parse(text);
    return parsed.ideas || [];
  } catch (error) {
    console.error('Error generating content ideas:', error);
    throw error;
  }
}

export async function generateScripts(
  ideaTitle: string, 
  ideaDescription: string, 
  platform: string,
  topic: string,
  goal: string,
  tone: string,
  length: string,
  userKey?: string
): Promise<ScriptSuite> {
  console.log('Generating scripts for:', { ideaTitle, platform, topic, goal, tone, length });
  const ai = getAI(userKey);
  
  const prompt = `Write a ${length} script for ${platform} about ${topic} based on the idea "${ideaTitle}".
  Description: ${ideaDescription}

  The creator's style is ${tone}.
  The hook should be platform-native and stop the scroll in the first 3 seconds.
  Include visual cues throughout the script (describe the B-roll or movement). DO NOT use brackets or parentheses to enclose visual cues.
  End with a CTA that drives the audience to ${goal}.
  
  Do not use generic AI opener phrases like "Are you tired of..." or "In today's video..."
  Sound like a real person, not a content template.

  Output 3 versions of this script:
  1. standard: A balanced, reliable version.
  2. storyteller: A narrative-driven, personal version.
  3. viral: An high-energy, algorithm-optimized version.

  Output in JSON.`;

  try {
    const scriptSchema = {
      type: Type.OBJECT,
      properties: {
        hook: { type: Type.STRING },
        meat: { 
          type: Type.ARRAY,
          items: { type: Type.STRING },
          minItems: 1,
          maxItems: 8
        },
        visuals: { type: Type.STRING },
        cta: { type: Type.STRING },
        caption: { type: Type.STRING },
        hashtags: { 
          type: Type.ARRAY,
          items: { type: Type.STRING },
          minItems: 5,
          maxItems: 5
        },
      },
      required: ["hook", "meat", "visuals", "cta", "caption", "hashtags"],
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional script writer. Output a JSON object with 'standard', 'storyteller', and 'viral' keys containing structured script data.",
        temperature: 0.8,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            standard: scriptSchema,
            storyteller: scriptSchema,
            viral: scriptSchema,
          },
          required: ["standard", "storyteller", "viral"],
        },
      },
    });

    console.log('Gemini response for scripts:', response);
    const text = response.text || '';
    if (!text) throw new Error('Empty response from AI');
    return JSON.parse(text);
  } catch (error) {
    console.error('Error generating scripts:', error);
    throw error;
  }
}
