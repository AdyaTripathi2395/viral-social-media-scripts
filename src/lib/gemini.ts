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
  niche: string, 
  audience: string, 
  onCamera: string,
  contentFormat: string,
  goal: string,
  userKey?: string
): Promise<ContentIdea[]> {
  console.log('Generating ideas for:', { niche, audience, onCamera, contentFormat, goal });
  const ai = getAI(userKey);
  const prompt = `Output JSON only. Ideas for niche ${niche}, audience ${audience}, on-camera style ${onCamera}, format ${contentFormat}, goal ${goal}. Generate 2 ideas. { "ideas": [{"label": "", "title": "", "description": ""}] }`;

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
  format: string,
  onCamera: string,
  userKey?: string
): Promise<ScriptSuite> {
  console.log('Generating scripts for:', { ideaTitle, format, onCamera });
  const ai = getAI(userKey);
  
  let structurePrompt = '';
  if (format === 'Carousel') {
    structurePrompt = `Each script must be structured with:
    1. hook: Cover slide (Slide 1) headline + visual instructions.
    2. meat: An array of 5-7 strings, each representing a slide breakdown (Slides 2 to 6/7).
    3. visuals: General visual style and layout instructions for the carousel.
    4. cta: Final slide (Slide 7 or 8) closing line.
    5. caption: A ready-to-use social media caption (150-200 chars).
    6. hashtags: An array of top 5 relevant hashtags.`;
  } else if (format === 'Static Post') {
    structurePrompt = `Each script must be structured with:
    1. hook: The headline for the image.
    2. meat: An array with 1 string containing the full social media caption.
    3. visuals: Detailed Photo Composition Idea.
    4. cta: A high-converting closing line.
    5. caption: A ready-to-use social media caption (150-200 chars).
    6. hashtags: An array of top 5 relevant hashtags.`;
  } else {
    structurePrompt = `Each script must be structured with:
    1. hook: Visual + Audio instructions to stop the scroll.
    2. meat: An array of 3-4 core bullet points of the message.
    3. visuals: Suggestions for B-roll or movement.
    4. cta: A high-converting closing line.
    5. caption: A ready-to-use social media caption (150-200 chars).
    6. hashtags: An array of top 5 relevant hashtags.`;
  }

  const prompt = `Develop 3 distinct scripts (standard, storyteller, and viral) for the content idea titled "${ideaTitle}" with description "${ideaDescription}". 
  The format is ${format} and the on-camera style is ${onCamera}. 

  ${structurePrompt}

  Output scripts in JSON.`;

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
