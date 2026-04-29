'use node';

import { v } from 'convex/values';
import { action } from './_generated/server';
import { internal } from './_generated/api';
import { GoogleGenAI } from '@google/genai';

export const generateDraft = action({
  args: {
    brief: v.string(),
    tone: v.string(),
    platform: v.string(), // Added platform
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    // 1. Check AI quota via an internal query
    const hasQuota = await ctx.runQuery(internal.users.checkQuota, {
      tokenIdentifier: identity.tokenIdentifier,
    });

    if (!hasQuota) {
      throw new Error('AI Token quota exhausted for this agency.');
    }

    // 2. Call Gemini API
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    const prompt = `You are an expert social media copywriter. 
Create a ${args.platform} caption based on this brief: "${args.brief}".
The tone of voice should be: ${args.tone}.

Return ONLY the caption text, without any introductory or conversational text.`;

    try {
      // We will implement the 20-second timeout on the frontend, but we can also set an abort controller here if needed.
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      // Using the Google GenAI SDK v0.1.2 syntax
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash',
        contents: prompt,
      });

      clearTimeout(timeoutId);

      const generatedText = response.text || '';

      // 3. Deduct Quota
      await ctx.runMutation(internal.users.deductQuota, {
        tokenIdentifier: identity.tokenIdentifier,
        amount: 1, // Simplified quota: 1 generation = 1 token
      });

      return generatedText;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('AI generation timed out after 20 seconds.');
      }
      console.error('Gemini API Error:', error);
      throw new Error('Failed to generate content due to API error or rate limits.');
    }
  },
});
