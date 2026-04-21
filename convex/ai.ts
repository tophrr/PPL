import { action, query } from "./_generated/server";
import { v } from "convex/values";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_KEY || "",
});

export const generateDraft = action({
  args: {
    targetAudience: v.string(),
    niche: v.string(),
    tone: v.string(),
  },
  handler: async (ctx, args) => {
    // TODO: Verify quota before using the AI.
    if (!process.env.GEMINI_KEY) {
      throw new Error("GEMINI_KEY is missing from the environment");
    }
    
    // We fetch the current user's agency token quota here using a query inside the action 
    // For now we'll mock that user has quota in this demo action block

    const prompt = `
      Create a creative social media post draft for the following parameters:
      - Niche/Industry: ${args.niche}
      - Target Audience: ${args.targetAudience}
      - Tone: ${args.tone}
      
      Respond with exactly this JSON format:
      {
        "title": "A short engaging title",
        "caption": "The main body of the post. Can include hashtags, rich formatting hints, etc."
      }
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });

      let jsonResp = response.text || "{}";
      // Sanitize standard code block ticks from JSON
      if (jsonResp.startsWith("\`\`\`json")) {
        jsonResp = jsonResp.replace(/\`\`\`json\n?/, "").replace(/\n?\`\`\`$/, "");
      } else if (jsonResp.startsWith("\`\`\`")) {
        jsonResp = jsonResp.replace(/\`\`\`\n?/, "").replace(/\n?\`\`\`$/, "");
      }

      return JSON.parse(jsonResp);
    } catch (e) {
      console.error(e);
      throw new Error("Failed to generate content from AI Provider");
    }
  },
});