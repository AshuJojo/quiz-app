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

  useEffect(() => {
    if (ejInstance.current === null && containerRef.current) {
      initEditor();
    }

    return () => {
      if (ejInstance.current) {
        ejInstance.current.destroy();
        ejInstance.current = null;
      }
    };
  }, []);

  const initEditor = async () => {
    // Import tools dynamically to avoid SSR issues
    const Paragraph = (await import('@editorjs/paragraph')).default;
    const ImageTool = (await import('@editorjs/image')).default;

    const editor = new EditorJS({
      holder: containerRef.current!,
      data: data,
      placeholder: placeholder,
      minHeight: minHeight,
      tools: {
        paragraph: {
          class: Paragraph,
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
                  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/image`, {
                    method: 'POST',
                    body: formData,
                  });

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
        const savedData = await editor.save();
        onChange(savedData);
      },
    });

    ejInstance.current = editor;
  };

  return <div ref={containerRef} className="prose prose-sm max-w-none editorjs-container" />;
}
