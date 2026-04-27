'use client';

import { AlertCircle, CheckCircle, FileJson, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';

export interface ImportStats {
  sections: number;
  questions: number;
}

interface ImportJsonModalProps {
  onImport: (jsonData: any) => Promise<ImportStats>;
  onClose: () => void;
}

const EXAMPLE_JSON = `{
  "description": "optional paper description",
  "duration": 3600,
  "positiveMarks": 4,
  "negativeMarks": 1,
  "sections": [
    {
      "title": "Section Name",
      "questions": [
        {
          "question": "Question text (string or EditorJS object)",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctOptionIndex": 0,
          "explanation": "optional explanation"
        }
      ]
    }
  ]
}`;

function validate(data: any): string | null {
  if (!data || typeof data !== 'object') return 'JSON must be an object.';
  if (!Array.isArray(data.sections) || data.sections.length === 0)
    return 'JSON must have a non-empty "sections" array.';
  for (let i = 0; i < data.sections.length; i++) {
    const s = data.sections[i];
    if (!s.title) return `Section ${i + 1} is missing a "title" field.`;
    if (!Array.isArray(s.questions)) return `Section "${s.title}" is missing a "questions" array.`;
    for (let j = 0; j < s.questions.length; j++) {
      const q = s.questions[j];
      if (!q.question && !q.text)
        return `Section "${s.title}", Question ${j + 1} is missing a "question" field.`;
      if (!Array.isArray(q.options) || q.options.length < 2)
        return `Section "${s.title}", Question ${j + 1} needs at least 2 options.`;
    }
  }
  return null;
}

export default function ImportJsonModal({ onImport, onClose }: ImportJsonModalProps) {
  const [jsonText, setJsonText] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [imported, setImported] = useState<ImportStats | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setJsonText((ev.target?.result as string) ?? '');
      setParseError(null);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    setParseError(null);
    let data: any;
    try {
      data = JSON.parse(jsonText);
    } catch {
      setParseError('Invalid JSON syntax. Please check your input.');
      return;
    }
    const err = validate(data);
    if (err) {
      setParseError(err);
      return;
    }
    setIsImporting(true);
    try {
      const stats = await onImport(data);
      setImported(stats);
    } catch (e: any) {
      setParseError(e?.message || 'Import failed. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest rounded-[2rem] p-8 w-full max-w-2xl shadow-2xl shadow-black/20 animate-in zoom-in-95 duration-300 mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <FileJson size={20} />
            </div>
            <div>
              <h2 className="text-sm font-black text-on-background">Import JSON</h2>
              <p className="text-[10px] text-on-surface-variant/50">
                Paste or upload a JSON file to import sections and questions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-surface-container transition-colors text-on-surface-variant/40 hover:text-on-background"
          >
            <X size={18} />
          </button>
        </div>

        {imported ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CheckCircle size={32} />
            </div>
            <div className="text-center">
              <p className="text-sm font-black text-on-background">Import Successful</p>
              <p className="text-[12px] text-on-surface-variant/60 mt-1">
                {imported.questions} question{imported.questions !== 1 ? 's' : ''} across{' '}
                {imported.sections} section{imported.sections !== 1 ? 's' : ''} added to the
                builder.
              </p>
              <p className="text-[11px] text-on-surface-variant/40 mt-1">
                Remember to save your progress.
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-2 px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Format reference */}
            <details className="mb-4 rounded-2xl bg-surface-container-low overflow-hidden">
              <summary className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50 cursor-pointer select-none hover:text-on-surface-variant transition-colors">
                Expected JSON Format
              </summary>
              <pre className="px-4 pb-4 text-[10px] text-on-surface-variant/60 overflow-auto max-h-48 font-mono leading-relaxed whitespace-pre-wrap">
                {EXAMPLE_JSON}
              </pre>
            </details>

            {/* File upload */}
            <input
              ref={fileRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full mb-3 flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-outline-variant/20 text-on-surface-variant/40 hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all text-[11px] font-black uppercase tracking-widest"
            >
              <Upload size={14} strokeWidth={3} />
              Upload .json file
            </button>

            {/* Textarea */}
            <textarea
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                setParseError(null);
              }}
              placeholder={`{ "sections": [ ... ] }`}
              rows={10}
              className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl p-4 text-[11px] font-mono text-on-background placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all"
            />

            {/* Error */}
            {parseError && (
              <div className="mt-3 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 animate-in fade-in duration-200">
                <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-red-600 font-medium">{parseError}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-outline-variant/20 text-on-surface-variant/60 text-xs font-black uppercase tracking-widest hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!jsonText.trim() || isImporting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest disabled:opacity-40 hover:bg-primary/90 transition-colors"
              >
                {isImporting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FileJson size={14} />
                )}
                {isImporting ? 'Importing...' : 'Import'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
