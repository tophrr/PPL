'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { marked } from 'marked';
import { useEffect, useCallback, useRef } from 'react';
import debounce from 'lodash.debounce';

export function RichTextEditor({
  value,
  onChange,
  onAutoSave,
  disabled = false,
  onFocus,
  onBlur,
}: {
  value: string;
  onChange: (value: string) => void;
  onAutoSave?: (value: string) => void;
  disabled?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  const debouncedAutoSave = useRef(
    debounce((val: string) => {
      if (onAutoSave) {
        onAutoSave(val);
      }
    }, 3000),
  ).current;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Edit AI draft here...',
      }),
    ],
    content: value,
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      debouncedAutoSave(html);
    },
    onFocus: () => {
      if (onFocus) onFocus();
    },
    onBlur: () => {
      if (onBlur) onBlur();
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose-base focus:outline-none min-h-[12rem] w-full max-w-none text-[var(--slate-700)]',
      },
    },
  });

  // Sync value from props if changed externally (e.g., initial load or AI generation)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      // Small optimization: only replace if different
      // This might reset cursor if updated while typing, so we only do it if the value is vastly different,
      // or we handle it carefully. For now, replacing the whole content is fine for AI generation.
      const currentContent = editor.getHTML();
      // Detect likely markdown: presence of lines starting with -, *, or numbered lists, or markdown headings
      const looksLikeMarkdown = /(^|\n)\s*([-*+]\s+|\d+\.\s+|#{1,6}\s+)/.test(value);
      const parsed = looksLikeMarkdown ? marked.parse(value, { async: false }) : value;
      const contentToSet = typeof parsed === 'string' ? parsed : value;
      if (currentContent === '<p></p>' || contentToSet !== currentContent) {
        editor.commands.setContent(contentToSet);
      }
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-[var(--slate-200)] bg-white/80 shadow-[0_4px_14px_rgba(30,41,59,0.03)] backdrop-blur-md transition-all duration-200 focus-within:border-[var(--purple-border)] focus-within:shadow-[0_0_0_4px_rgba(139,92,246,0.1)] ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <div className="flex flex-wrap gap-1.5 border-b border-[var(--slate-150)] bg-white/60 p-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors duration-200 ${editor.isActive('bold') ? 'bg-[var(--purple-soft)] text-[var(--purple-strong)]' : 'text-[var(--slate-600)] hover:bg-[var(--slate-100)] hover:text-[var(--slate-900)]'}`}
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors duration-200 ${editor.isActive('italic') ? 'bg-[var(--purple-soft)] text-[var(--purple-strong)]' : 'text-[var(--slate-600)] hover:bg-[var(--slate-100)] hover:text-[var(--slate-900)]'}`}
        >
          Italic
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors duration-200 ${editor.isActive('bulletList') ? 'bg-[var(--purple-soft)] text-[var(--purple-strong)]' : 'text-[var(--slate-600)] hover:bg-[var(--slate-100)] hover:text-[var(--slate-900)]'}`}
        >
          Bullet List
        </button>
      </div>
      <div className="p-5">
        <EditorContent
          editor={editor}
          className="[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1"
        />
      </div>
    </div>
  );
}
