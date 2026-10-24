import { useRef, useState, type ReactNode } from 'react';
import { API_ORIGIN } from '../../config';

interface MenuUploadFormState {
  executiveName: string;
  executiveMobile: string;
  storeName: string;
  storeMobile: string;
  date: string;
}

const emptyForm: MenuUploadFormState = {
  executiveName: '',
  executiveMobile: '',
  storeName: '',
  storeMobile: '',
  date: '',
};

/* ---------- UI-only helpers ---------- */

const Ico = ({ d, className = 'h-5 w-5', stroke = 2.25 }: { d: string; className?: string; stroke?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d={d} />
  </svg>
);

const ICON = {
  upload: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12',
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6',
  x: 'M18 6 6 18 M6 6l12 12',
  check: 'M20 6 9 17l-5-5',
  alert: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 8v4 M12 16h.01',
  user: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  store: 'M3 9l1-5h16l1 5 M3 9v11h18V9 M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0 M9 20v-6h6v6',
  menu: 'M4 6h16 M4 12h16 M4 18h16',
} as const;

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const Section = ({ icon, title, children }: { icon: keyof typeof ICON; title: string; children: ReactNode }) => (
  <fieldset className="m-0 min-w-0 border-0 p-0">
    <legend className="mb-4 flex w-full items-center gap-3 p-0">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-lime-400 to-lime-600 text-white shadow-md shadow-lime-500/30">
        <Ico d={ICON[icon]} className="h-5 w-5" />
      </span>
      <span className="font-serif text-xl font-bold text-neutral-900">{title}</span>
    </legend>
    <div className="grid gap-4 sm:grid-cols-2">{children}</div>
  </fieldset>
);

const MenuUploadPage = () => {
  const [form, setForm] = useState<MenuUploadFormState>(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const updateField = (field: keyof MenuUploadFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleFiles = (fileList: FileList | null) => {
    if (fileList && fileList.length > 0) {
      setFile(fileList[0]);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess(false);

    if (!form.executiveName || !form.executiveMobile || !form.storeName || !form.storeMobile || !form.date || !file) {
      setError('Please fill all required fields and attach a menu file.');
      return;
    }

    const payload = new FormData();
    payload.append('executiveName', form.executiveName);
    payload.append('executiveMobile', form.executiveMobile);
    payload.append('storeName', form.storeName);
    payload.append('storeMobile', form.storeMobile);
    payload.append('date', form.date);
    payload.append('menu', file);

    setSubmitting(true);
    try {
      const response = await fetch(`${API_ORIGIN}/partner/menu-upload`, {
        method: 'POST',
        body: payload,
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Upload failed');

      setSuccess(true);
      setForm(emptyForm);
      setFile(null);
    } catch (err) {
      console.error('Menu upload failed', err);
      setError(err instanceof Error ? err.message : 'Something went wrong while uploading. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClasses =
    'box-border w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-lime-500 focus:bg-white focus:ring-4 focus:ring-lime-500/15';
  const labelClasses = 'mb-1.5 block text-sm font-semibold text-neutral-700';

  return (
    <section className="mx-auto max-w-3xl px-4 py-8 pb-16 sm:py-12">
      <div className="overflow-hidden rounded-3xl bg-white shadow-2xl shadow-neutral-900/10 ring-1 ring-neutral-100">
        {/* header band */}
        <div className="relative overflow-hidden bg-gradient-to-br from-lime-500 via-lime-600 to-lime-800 px-6 py-8 sm:px-10 sm:py-10">
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-white/10" />
          <div className="relative flex items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/20 text-white ring-1 ring-white/30">
              <Ico d={ICON.menu} className="h-7 w-7" />
            </span>
            <div>
              <h1 className="m-0 font-serif text-3xl font-bold text-white sm:text-4xl">Menu Upload</h1>
              <p className="mb-0 mt-1 text-base text-lime-50/95">Upload your store menu as PDF, image or document.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-9 p-6 sm:p-10">
          <Section icon="user" title="Executive details">
            <div>
              <label htmlFor="executiveName" className={labelClasses}>
                Executive name <span className="text-red-500">*</span>
              </label>
              <input
                id="executiveName"
                type="text"
                placeholder="E.g. Amit Verma"
                value={form.executiveName}
                onChange={(event) => updateField('executiveName', event.target.value)}
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="executiveMobile" className={labelClasses}>
                Executive Mobile <span className="text-red-500">*</span>
              </label>
              <input
                id="executiveMobile"
                type="tel"
                placeholder="E.g. +91 98765 43210"
                value={form.executiveMobile}
                onChange={(event) => updateField('executiveMobile', event.target.value)}
                className={inputClasses}
              />
            </div>
          </Section>

          <Section icon="store" title="Store details">
            <div>
              <label htmlFor="storeName" className={labelClasses}>
                Store Name <span className="text-red-500">*</span>
              </label>
              <input
                id="storeName"
                type="text"
                placeholder="E.g. Sharma Sweets"
                value={form.storeName}
                onChange={(event) => updateField('storeName', event.target.value)}
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="storeMobile" className={labelClasses}>
                Store mobile <span className="text-red-500">*</span>
              </label>
              <input
                id="storeMobile"
                type="tel"
                placeholder="E.g. +91 98765 43210"
                value={form.storeMobile}
                onChange={(event) => updateField('storeMobile', event.target.value)}
                className={inputClasses}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="menuDate" className={labelClasses}>
                Date <span className="text-red-500">*</span>
              </label>
              <input
                id="menuDate"
                type="date"
                value={form.date}
                onChange={(event) => updateField('date', event.target.value)}
                className={inputClasses}
              />
            </div>
          </Section>

          <fieldset className="m-0 min-w-0 border-0 p-0">
            <legend className="mb-4 flex w-full items-center gap-3 p-0">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-lime-400 to-lime-600 text-white shadow-md shadow-lime-500/30">
                <Ico d={ICON.upload} className="h-5 w-5" />
              </span>
              <span className="font-serif text-xl font-bold text-neutral-900">
                Upload Menu <span className="text-red-500">*</span>
              </span>
            </legend>

            <div
              role="button"
              tabIndex={0}
              aria-label="Choose a menu file to upload"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              className={`relative cursor-pointer rounded-2xl border-2 border-dashed px-4 py-10 text-center outline-none transition focus-visible:ring-4 focus-visible:ring-lime-500/20 ${
                isDragging ? 'scale-[1.01] border-lime-500 bg-lime-50' : 'border-neutral-300 bg-neutral-50 hover:border-lime-400 hover:bg-lime-50/50'
              }`}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="mx-auto flex max-w-md items-center gap-3 rounded-xl bg-white p-3 text-left shadow-md ring-1 ring-lime-200">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-lime-100 text-lime-700">
                    <Ico d={ICON.file} className="h-6 w-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-neutral-900">{file.name}</span>
                    <span className="block text-xs text-neutral-500">{formatSize(file.size)} · Click to change</span>
                  </span>
                  <button
                    type="button"
                    aria-label="Remove file"
                    onClick={(event) => {
                      event.stopPropagation();
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-neutral-100 text-neutral-500 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Ico d={ICON.x} className="h-4 w-4" stroke={2.5} />
                  </button>
                </div>
              ) : (
                <>
                  <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-lime-400 to-lime-600 text-white shadow-lg shadow-lime-500/30">
                    <Ico d={ICON.upload} className="h-8 w-8" />
                  </span>
                  <p className="mb-0 mt-4 text-base font-semibold text-neutral-800">
                    Drag and Drop (or) <span className="text-lime-700 underline">Choose Files</span>
                  </p>
                  <p className="mb-0 mt-1.5 text-xs text-neutral-500">PDF, JPG, PNG, DOC or DOCX</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(event) => handleFiles(event.target.files)}
                onClick={(event) => event.stopPropagation()}
                className="hidden"
              />
            </div>
          </fieldset>

          {error ? (
            <div role="alert" className="flex items-start gap-2.5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
              <Ico d={ICON.alert} className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="min-w-0 break-words">{error}</span>
            </div>
          ) : null}
          {success ? (
            <div role="status" className="flex items-start gap-2.5 rounded-xl bg-lime-50 px-4 py-3 text-sm font-medium text-lime-800 ring-1 ring-lime-200">
              <Ico d={ICON.check} className="mt-0.5 h-4 w-4 shrink-0" stroke={3} />
              <span>Menu uploaded successfully.</span>
            </div>
          ) : null}

          <div className="border-t border-neutral-100 pt-7">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-lime-500 to-lime-600 px-8 py-3.5 text-[15px] font-bold tracking-wide text-white shadow-lg shadow-lime-500/30 transition hover:from-lime-600 hover:to-lime-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {submitting ? 'Uploading…' : 'UPLOAD MENU'}
              {submitting ? null : <Ico d={ICON.upload} className="h-4 w-4" />}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default MenuUploadPage;