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

    const geminiModel = process.env.GEMINI_MODEL;
    if (!geminiModel) {
      throw new Error('Missing GEMINI_MODEL environment variable.');
    }

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
      // Enforce a 20-second server-side timeout and provide clearer errors.
      const aiCall = ai.models.generateContent({
        model: geminiModel,
        contents: prompt,
      });

      let timeoutId: NodeJS.Timeout | null = null;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error('AI generation timed out after 20 seconds.')),
          20000,
        );
      });

      const response: any = await Promise.race([aiCall, timeoutPromise]);
      if (timeoutId) clearTimeout(timeoutId);

      // Robustly extract text from different possible SDK shapes
      let generatedText = '';
      if (response == null) {
        generatedText = '';
      } else if (typeof response === 'string') {
        generatedText = response;
      } else if (typeof response.text === 'string' && response.text.trim()) {
        generatedText = response.text;
      } else if (typeof response.output === 'string' && response.output.trim()) {
        generatedText = response.output;
      } else if (Array.isArray(response.candidates) && response.candidates.length) {
        const first = response.candidates[0];
        generatedText =
          (first.display && String(first.display)) ||
          (first.text && String(first.text)) ||
          (first.output && JSON.stringify(first.output)) ||
          '';
      } else {
        try {
          generatedText = JSON.stringify(response);
        } catch (e) {
          generatedText = '';
        }
      }

      if (!generatedText || !generatedText.trim()) {
        console.error('Gemini API returned empty response:', response);
        throw new Error('AI returned an empty response. Please try again.');
      }

      // 3. Deduct Quota only after a successful generation
      await ctx.runMutation(internal.users.deductQuota, {
        tokenIdentifier: identity.tokenIdentifier,
        amount: 1, // Simplified quota: 1 generation = 1 token
      });

      return generatedText;
    } catch (error: any) {
      const msg = (error && error.message) || String(error);
      if (msg.includes('timed out')) {
        throw new Error('AI generation timed out after 20 seconds.');
      }
      console.error('Gemini API Error:', error);
      throw new Error(`Failed to generate content: ${msg}`);
    }
  },
});
