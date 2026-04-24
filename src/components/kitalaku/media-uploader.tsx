'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

export function MediaUploader({ draftId }: { draftId: Id<'contentDrafts'> | null }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const generateUploadUrl = useMutation(api.media.generateUploadUrl);
  const saveMediaAsset = useMutation(api.media.saveMediaAsset);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check 100MB limit
      if (file.size > 100 * 1024 * 1024) {
        setError('File exceeds 100MB limit.');
        setSelectedFile(null);
        return;
      }
      setError(null);
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    if (!draftId) {
      setError('Please save the draft first before uploading media.');
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      // 1. Get a short-lived upload URL
      const postUrl = await generateUploadUrl();

      // 2. POST the file to the URL using XMLHttpRequest for progress
      const storageId = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', postUrl);
        xhr.setRequestHeader('Content-Type', selectedFile.type);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            setProgress(Math.round(percentComplete));
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response.storageId);
            } catch (e) {
              reject(new Error('Failed to parse upload response'));
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(selectedFile);
      });

      // 3. Save the newly allocated storage id to the database
      await saveMediaAsset({
        storageId: storageId as Id<'_storage'>,
        size: selectedFile.size,
        contentType: selectedFile.type,
        draftId,
      });

      setSelectedFile(null);
      setProgress(100);
      setTimeout(() => setProgress(0), 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mt-4 rounded-xl border border-[var(--slate-150)] bg-white p-4">
      <h4 className="text-sm font-semibold text-[var(--slate-900)]">Media Assets</h4>
      <p className="mt-1 text-xs text-[var(--slate-500)]">Attach images or videos (Max 100MB)</p>

      <div className="mt-3 flex items-center gap-3">
        <input
          type="file"
          onChange={handleFileChange}
          disabled={isUploading || !draftId}
          accept="image/*,video/mp4,video/quicktime"
          className="text-sm file:mr-4 file:rounded-full file:border-0 file:bg-[var(--purple-soft)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[var(--slate-900)] hover:file:bg-[rgba(124,58,237,0.15)] disabled:opacity-50"
        />
        <button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="rounded-xl bg-[var(--slate-900)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {isUploading && (
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--slate-150)]">
          <div
            className="h-full bg-[linear-gradient(90deg,#8b5cf6,#10b981)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
