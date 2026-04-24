'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useCallback, useRef } from 'react';
import debounce from 'lodash.debounce';

export function RichTextEditor({
  value,
  onChange,
  onAutoSave,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  onAutoSave?: (value: string) => void;
  disabled?: boolean;
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
      if (currentContent === '<p></p>' || value !== currentContent) {
        editor.commands.setContent(value);
      }
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div
      className={`rounded-xl border border-[var(--slate-150)] bg-white/75 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <div className="flex flex-wrap gap-2 border-b border-[var(--slate-150)] p-2 bg-white/50 rounded-t-xl">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded text-sm font-medium ${editor.isActive('bold') ? 'bg-[var(--slate-200)]' : 'hover:bg-[var(--slate-100)]'}`}
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded text-sm font-medium ${editor.isActive('italic') ? 'bg-[var(--slate-200)]' : 'hover:bg-[var(--slate-100)]'}`}
        >
          Italic
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 rounded text-sm font-medium ${editor.isActive('bulletList') ? 'bg-[var(--slate-200)]' : 'hover:bg-[var(--slate-100)]'}`}
        >
          Bullet List
        </button>
      </div>
      <div className="p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
