"use client";

import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useCallback, useRef, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { AppShell } from "@/src/components/kitalaku/app-shell";
import { GlassPanel } from "@/src/components/kitalaku/primitives";
import { IconWand } from "@/src/components/kitalaku/icons";

export default function PlannerPage() {
  const [brief, setBrief] = useState("");
  const [tone, setTone] = useState("Professional & Confident");
  const [isLoading, setIsLoading] = useState(false);
  const [errorToast, setErrorToast] = useState("");
  const [activeDraftId, setActiveDraftId] = useState<any>(null);

  const generateDraftAction = useAction(api.ai.generateDraft);
  const createDraftMutation = useMutation(api.content.createDraft);
  const updateDraftCaptionMutation = useMutation(api.content.updateDraftCaption);

  const handleContentUpdate = useCallback(
    (html: string) => {
      if (!activeDraftId) return;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(async () => {
        try {
          await updateDraftCaptionMutation({
            id: activeDraftId as any,
            caption: html,
          });
        } catch (e) {
          console.error("Auto-save failed", e);
        }
      }, 3000);
    },
    [activeDraftId, updateDraftCaptionMutation]
  );

  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Generated caption will appear here...</p>",
    onUpdate: ({ editor }) => {
      handleContentUpdate(editor.getHTML());
    },
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleGenerate = async () => {
    if (!brief.trim()) {
      setErrorToast("Brief cannot be empty.");
      return;
    }
    setErrorToast("");
    setIsLoading(true);

    try {
      const response = await generateDraftAction({
        targetAudience: brief,
        niche: "General", // Hardcoded for demo if not split in UI
        tone,
      });

      const { title, caption } = response as { title?: string; caption?: string };

      if (editor && caption) {
        const formattedContent = `<h3>${title || "Draft Title"}</h3><p>${caption.replace(
          /\n/g,
          "<br/>"
        )}</p>`;
        editor.commands.setContent(formattedContent);
        
        // Create initial draft
        const draftId = await createDraftMutation({
          title: title || "AI Draft",
          caption: formattedContent,
          targetAudience: brief,
          niche: "General",
          tone,
        });

        setActiveDraftId(draftId);
      }
    } catch (e) {
      console.error(e);
      setErrorToast("Failed to generate draft. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell active="AI Planner">
      <div id="planner" className="space-y-5 p-4 md:p-8">
        {errorToast && (
          <div className="rounded-lg bg-red-100 p-4 text-red-800">
            {errorToast}
          </div>
        )}

        <GlassPanel className="relative overflow-hidden p-6 shadow-md md:p-8 bg-white">
          <div className="relative z-10">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-purple-100 p-2 text-purple-900">
                <IconWand />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  AI PLANNER
                </p>
                <h2 className="mt-4 text-4xl font-bold text-gray-900">
                  Create new content draft.
                </h2>
                <p className="mt-2 max-w-3xl text-gray-600">
                  Fill out the brief, select your tone, and generate a caption
                  to edit before submitting for review.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div>
                <label className="text-sm font-medium text-gray-900">
                  Target audience & business topic
                </label>
                <textarea
                  rows={4}
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  placeholder="E.g. Premium brand founders, urban Gen Z..."
                  className="mt-2 w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-100"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900">
                  Tone of voice
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-100"
                >
                  <option>Refined & Warm</option>
                  <option>Professional & Confident</option>
                  <option>Playful & Conversational</option>
                  <option>Minimal & Elegant</option>
                </select>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 flex-wrap rounded-2xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="animate-pulse">Generating...</span>
                ) : (
                  <>
                    <IconWand />
                    <span>Generate draft</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setBrief("")}
                className="rounded-2xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="p-6 md:p-8 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Rich Text Editor</h3>
            {activeDraftId && (
              <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 flex rounded">
                Auto-saving enabled
              </span>
            )}
          </div>
          
          <div className="rounded-xl border border-gray-200 bg-white p-4 min-h-[200px] prose prose-sm sm:prose-base max-w-none focus:outline-none">
            <EditorContent editor={editor} className="outline-none" />
          </div>
        </GlassPanel>
      </div>
    </AppShell>
  );
}
