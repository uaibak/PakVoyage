'use client';

import { useState } from 'react';

export function OptionSelect({
  value,
  options,
  placeholder,
  onChange,
  required = true,
}: {
  value: string;
  options: string[];
  placeholder: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  const hasCurrentValue = value && !options.includes(value);

  return (
    <select
      required={required}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="rounded-[14px] border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
    >
      <option value="">{placeholder}</option>
      {hasCurrentValue ? <option value={value}>{value}</option> : null}
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

export function TagEditor({
  value,
  placeholder,
  presets = [],
  onChange,
}: {
  value: string;
  placeholder: string;
  presets?: string[];
  onChange: (value: string) => void;
}) {
  const [draft, setDraft] = useState('');
  const items = csvToArray(value);

  const setItems = (nextItems: string[]) => {
    onChange(
      arrayToCsv(
        Array.from(new Set(nextItems.map((item) => item.trim()).filter(Boolean))),
      ),
    );
  };
  const addDraft = () => {
    if (!draft.trim()) return;
    setItems([...items, draft.trim()]);
    setDraft('');
  };

  return (
    <div className="rounded-[14px] border border-slate-200 bg-white p-3">
      <div className="flex gap-2">
        <input
          placeholder={placeholder}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addDraft();
            }
          }}
          className="min-w-0 flex-1 px-2 py-2 text-sm outline-none"
        />
        <button type="button" onClick={addDraft} className="cta-secondary px-4 py-2">
          Add
        </button>
      </div>
      {presets.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setItems([...items, preset])}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700"
            >
              {preset}
            </button>
          ))}
        </div>
      ) : null}
      {items.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setItems(items.filter((current) => current !== item))}
              className="rounded-full bg-[var(--pine)] px-3 py-1.5 text-xs font-semibold text-white"
            >
              {item} x
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ImageUploadField({
  files,
  multiple = false,
  onChange,
}: {
  files: File[];
  multiple?: boolean;
  onChange: (files: File[]) => void;
}) {
  const [inputKey, setInputKey] = useState(0);

  return (
    <div className="rounded-[14px] border border-slate-200 bg-white p-3">
      <input
        key={inputKey}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={(event) => onChange(Array.from(event.target.files ?? []))}
        className="w-full text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700"
      />
      {files.length > 0 ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((file) => (
            <div
              key={`${file.name}-${file.size}`}
              className="overflow-hidden rounded-[14px] border border-slate-200"
            >
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="h-24 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  onChange(files.filter((current) => current !== file));
                  setInputKey((current) => current + 1);
                }}
                className="w-full bg-white px-3 py-2 text-left text-xs font-semibold text-slate-700"
              >
                Remove {file.name}
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ImageUrlPreview({ urls }: { urls: string[] }) {
  if (urls.length === 0) return null;

  return (
    <div className="grid gap-3 rounded-[14px] border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2 lg:grid-cols-4">
      {urls.map((url) => (
        <img key={url} src={url} alt="" className="h-24 w-full rounded-[12px] object-cover" />
      ))}
    </div>
  );
}

export function csvToArray(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function arrayToCsv(items: string[]): string {
  return items.join(', ');
}
