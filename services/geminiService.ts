import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ArticleData, Source } from "../types";

// Helper to check window.aistudio for API key selection (Required for Nano Banana Pro/Image models)
export const checkApiKey = async (): Promise<boolean> => {
  if (typeof window !== 'undefined' && (window as any).aistudio) {
    return await (window as any).aistudio.hasSelectedApiKey();
  }
  // Fallback to process.env for development or if window.aistudio isn't present (though required for specific models)
  return !!process.env.API_KEY;
};

export const openApiKeySelection = async (): Promise<void> => {
  if (typeof window !== 'undefined' && (window as any).aistudio) {
    await (window as any).aistudio.openSelectKey();
  }
};

const getClient = (): GoogleGenAI => {
  // Must create new instance to grab the latest selected key
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateNewsArticle = async (topic: string): Promise<ArticleData> => {
  const ai = getClient();
  
  const prompt = `
    You are a senior investigative journalist for "The Insight Times", a prestigious newspaper similar to the New York Times.
    
    Your assignment is to write a feature story about: "${topic}".
    
    Use the Google Search tool to research the latest information about this topic from the last 12 months.
    
    After gathering information, write a journalistic piece.
    
    CRITICAL: Return the response strictly as a JSON object. Do not include Markdown formatting like \`\`\`json at the start or end. just the raw JSON string.
    
    The JSON structure must be:
    {
      "headline": "A catchy, NYT-style headline",
      "subheadline": "A descriptive subhead",
      "author": "A fictional journalist name",
      "location": "City, Country (relevant to story)",
      "date": "Current date formatted like 'October 24, 2023'",
      "paragraphs": ["Paragraph 1...", "Paragraph 2...", "Paragraph 3..."],
      "imagePrompt": "A highly detailed, photorealistic visual description of a scene representing the story, suitable for an AI image generator. Do not include text in the image."
    }
  `;

  try {
    // 1. Text Generation with Search Grounding
    // Using gemini-2.5-flash for speed and tool capability
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // Note: responseMimeType is NOT allowed with googleSearch, so we must parse manually
      },
    });

    // Extract Grounding Metadata (Sources)
    const sources: Source[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach(chunk => {
        if (chunk.web?.uri && chunk.web?.title) {
          sources.push({
            title: chunk.web.title,
            uri: chunk.web.uri
          });
        }
      });
    }

    // Parse JSON from text
    let text = response.text || '';
    // Clean up markdown code blocks if present despite instructions
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const data = JSON.parse(text);

    return {
      ...data,
      sources: sources.length > 0 ? sources : [],
    };

  } catch (error) {
    console.error("Error generating article:", error);
    throw new Error("Failed to investigate the story.");
  }
};

export const generateNewsImage = async (prompt: string): Promise<string> => {
  const ai = getClient();
  
  try {
    // Using Nano Banana Pro (gemini-3-pro-image-preview) as requested
    // Upgrading quality to 2K/4K is possible with this model
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "2K"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Error generating image:", error);
    // Return a placeholder if generation fails
    return `https://picsum.photos/1600/900?grayscale&blur=2`; 
  }
};
