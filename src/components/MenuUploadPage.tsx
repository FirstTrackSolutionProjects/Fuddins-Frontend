import { useRef, useState } from 'react';

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
      // TODO: point this at the real backend endpoint for menu uploads,
      // e.g. an addition to ./api.ts such as uploadPartnerMenu(payload).
      const response = await fetch('/api/partner/menu-upload', {
        method: 'POST',
        body: payload,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      setSuccess(true);
      setForm(emptyForm);
      setFile(null);
    } catch (err) {
      console.error('Menu upload failed', err);
      setError('Something went wrong while uploading. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClasses =
    'w-full rounded-sm border border-neutral-300 bg-neutral-200/70 px-3.5 py-3 text-[15px] text-neutral-900 placeholder:text-neutral-500 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20';

  return (
    <section className="mx-auto max-w-3xl px-4 py-6 pb-16">
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="mb-5">
          <label htmlFor="executiveName" className="mb-2 block text-sm font-semibold text-neutral-800">
            Executive name <span className="text-red-600">*</span>
          </label>
          <input
            id="executiveName"
            type="text"
            placeholder="E.g. John Doe"
            value={form.executiveName}
            onChange={(event) => updateField('executiveName', event.target.value)}
            className={inputClasses}
          />
        </div>

        <div className="mb-5">
          <label htmlFor="executiveMobile" className="mb-2 block text-sm font-semibold text-neutral-800">
            Executive Mobile <span className="text-red-600">*</span>
          </label>
          <input
            id="executiveMobile"
            type="tel"
            placeholder="E.g. +1 300 400 5000"
            value={form.executiveMobile}
            onChange={(event) => updateField('executiveMobile', event.target.value)}
            className={inputClasses}
          />
        </div>

        <div className="mb-5">
          <label htmlFor="storeName" className="mb-2 block text-sm font-semibold text-neutral-800">
            Store Name <span className="text-red-600">*</span>
          </label>
          <input
            id="storeName"
            type="text"
            placeholder="E.g. enter store name"
            value={form.storeName}
            onChange={(event) => updateField('storeName', event.target.value)}
            className={inputClasses}
          />
        </div>

        <div className="mb-5">
          <label htmlFor="storeMobile" className="mb-2 block text-sm font-semibold text-neutral-800">
            Store mobile <span className="text-red-600">*</span>
          </label>
          <input
            id="storeMobile"
            type="tel"
            placeholder="E.g. +1 300 400 5000"
            value={form.storeMobile}
            onChange={(event) => updateField('storeMobile', event.target.value)}
            className={inputClasses}
          />
        </div>

        <div className="mb-5">
          <label htmlFor="menuDate" className="mb-2 block text-sm font-semibold text-neutral-800">
            Date <span className="text-red-600">*</span>
          </label>
          <input
            id="menuDate"
            type="date"
            value={form.date}
            onChange={(event) => updateField('date', event.target.value)}
            className={inputClasses}
          />
        </div>

        <div className="mb-5">
          <label className="mb-2 block text-sm font-semibold text-neutral-800">
            Upload Menu <span className="text-red-600">*</span>
          </label>
          <div
            className={`relative rounded-sm border-2 border-dashed px-4 py-12 text-center transition-colors ${
              isDragging ? 'border-green-600 bg-green-50' : 'border-neutral-300 bg-neutral-200/70'
            }`}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <div className="mb-2 text-3xl text-neutral-500">⬆</div>
            <p className="text-[15px] text-neutral-600">
              {file ? (
                file.name
              ) : (
                <>
                  Drag and Drop (or){' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 underline hover:text-blue-700"
                  >
                    Choose Files
                  </button>
                </>
              )}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={(event) => handleFiles(event.target.files)}
              className="hidden"
            />
          </div>
        </div>

        {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
        {success ? <p className="mb-3 text-sm text-green-700">Menu uploaded successfully.</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="self-start rounded-sm bg-green-700 px-7 py-3.5 text-[15px] font-bold tracking-wide text-white transition-colors hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Uploading…' : 'UPLOAD MENU'}
        </button>
      </form>
    </section>
  );
};

export default MenuUploadPage;