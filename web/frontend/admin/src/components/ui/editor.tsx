'use client';

import EditorJS, { OutputData } from '@editorjs/editorjs';
import { useEffect, useRef } from 'react';

interface EditorProps {
  data?: OutputData;
  onChange: (data: OutputData) => void;
  placeholder?: string;
  minHeight?: number;
}

export default function Editor({
  data,
  onChange,
  placeholder = 'Start typing...',
  minHeight = 20,
}: EditorProps) {
  const ejInstance = useRef<EditorJS | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitializing = useRef(false);

  useEffect(() => {
    if (ejInstance.current === null && containerRef.current && !isInitializing.current) {
      isInitializing.current = true;
      initEditor();
    }

    return () => {
      if (ejInstance.current) {
        ejInstance.current.destroy();
        ejInstance.current = null;
      }
      isInitializing.current = false;
    };
  }, []);

  const initEditor = async () => {
    // Capture the current container to use throughout the async process
    const container = containerRef.current;
    if (!container) return;

    try {
      // Import tools dynamically to avoid SSR issues
      const [Paragraph, ImageTool] = await Promise.all([
        import('@editorjs/paragraph').then((m) => m.default),
        import('@editorjs/image').then((m) => m.default),
      ]);

      // SAFETY CHECK: After async imports, check if:
      // 1. The component is still mounting (ejInstance.current is still null)
      // 2. The container is still the same/exists
      // 3. isInitializing is still true (meaning cleanup hasn't run)
      if (ejInstance.current || !containerRef.current || !isInitializing.current) {
        return;
      }

      const editor = new EditorJS({
        holder: container,
        data: data,
        placeholder: placeholder,
        minHeight: minHeight,
        tools: {
          paragraph: {
            class: Paragraph as any,
            inlineToolbar: true,
          },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                uploadByFile: async (file: File) => {
                  const formData = new FormData();
                  formData.append('image', file);

                  try {
                    const response = await fetch(
                      `${process.env.NEXT_PUBLIC_API_URL}/upload/image`,
                      {
                        method: 'POST',
                        body: formData,
                      }
                    );

                    if (!response.ok) {
                      throw new Error(`Upload failed with status ${response.status}`);
                    }

                    const result = await response.json();
                    return result;
                  } catch (error) {
                    console.error('Editor.js Image Upload Error:', error);
                    return {
                      success: 0,
                      message: error instanceof Error ? error.message : 'Upload failed',
                    };
                  }
                },
              },
            },
          },
        },
        onChange: async () => {
          // Verify instance still exists before saving
          if (ejInstance.current) {
            const savedData = await ejInstance.current.save();
            onChange(savedData);
          }
        },
      });

      ejInstance.current = editor;
    } catch (error) {
      console.error('Failed to initialize Editor.js:', error);
      isInitializing.current = false;
    }
  };

  return <div ref={containerRef} className="prose prose-sm max-w-none editorjs-container" />;
}
