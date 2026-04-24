import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, FileText, Inbox } from "lucide-react";
import { useMemo, useRef, useState } from "react";

const acceptedTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function buildUploadItems(files) {
  return files.map((file) => ({
    id: `${file.name}-${file.lastModified}`,
    name: file.name,
    size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    progress: 0,
    status: acceptedTypes.includes(file.type) ? "uploading" : "error",
    error: acceptedTypes.includes(file.type) ? "" : "Only PDF and DOCX files are supported.",
    extractedData: null,
    file,
  }));
}

export function UploadArea({ files, sessionId, setFiles, onOpenSidebar }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const queued = useMemo(
    () => files.filter((file) => file.status !== "success").length,
    [files],
  );

  const updateFile = (fileId, updates) => {
    setFiles((current) =>
      current.map((entry) =>
        entry.id === fileId ? { ...entry, ...updates } : entry,
      ),
    );
  };

  const uploadFile = async (item) => {
    try {
      updateFile(item.id, { progress: 25 });

      const formData = new FormData();
      formData.append("file", item.file);
      formData.append("session_id", sessionId);

      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed.");
      }

      const data = await response.json();

      updateFile(item.id, {
        progress: 100,
        status: "success",
        extractedData: data,
      });
    } catch (error) {
      updateFile(item.id, {
        progress: 0,
        status: "error",
        error: error.message || "Upload failed.",
      });
    }
  };

  const processUploads = (incomingFiles) => {
    const nextItems = buildUploadItems(incomingFiles);
    setFiles((current) => [...current, ...nextItems]);

    nextItems.forEach((item) => {
      if (item.status === "error") {
        return;
      }

      uploadFile(item);
    });
  };

  const renderDetails = (data) => {
    const detailItems = Object.entries(data)
      .filter(([key]) => key !== "type")
      .map(([key, value]) => ({
        label: key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
        value,
      }));

    return (
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
        <div className="mb-3">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
            Type
          </p>
          <p className="mt-1 text-white">
            {data.type.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {detailItems.map((item) => (
          <div key={item.label}>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
              {item.label}
            </p>
            <p className="mt-1 text-white">{item.value}</p>
          </div>
        ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Intake
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Upload documents</h3>
        </div>
        <button
          type="button"
          className="inline-flex rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 lg:hidden"
          onClick={onOpenSidebar}
        >
          Menu
        </button>
      </div>

      <motion.div
        layout
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          processUploads(Array.from(event.dataTransfer.files));
        }}
        className={[
          "relative overflow-hidden rounded-[32px] border border-dashed p-10 text-center shadow-glow backdrop-blur-xl transition",
          isDragging
            ? "border-sky-400/60 bg-sky-400/10"
            : "border-white/10 bg-white/[0.04]",
        ].join(" ")}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-cyan-400/10" />
        <div className="relative">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 text-sky-300"
          >
            <Inbox className="h-7 w-7" />
          </motion.div>
          <h4 className="mt-6 text-xl font-semibold text-white">
            Drop PDF or DOCX files here
          </h4>
          <p className="mt-3 text-sm text-slate-400">
            Drag and drop your document packet, or browse to add files for OCR, extraction, and workflow planning.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => inputRef.current?.click()}
              className="rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-sky-500/30"
            >
              Browse files
            </motion.button>
            <span className="rounded-full border border-white/10 px-3 py-2 text-xs uppercase tracking-[0.25em] text-slate-500">
              {queued} active upload{queued === 1 ? "" : "s"}
            </span>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx"
            multiple
            className="hidden"
            onChange={(event) => processUploads(Array.from(event.target.files || []))}
          />
        </div>
      </motion.div>

      <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-5 shadow-soft backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-white">Upload queue</h4>
            <p className="mt-1 text-sm text-slate-400">
              Every file is validated before it enters the processing pipeline.
            </p>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-500">
            {files.length} file{files.length === 1 ? "" : "s"}
          </span>
        </div>

        {files.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-white/10 bg-slate-950/20 p-10 text-center">
            <FileText className="mx-auto h-10 w-10 text-slate-600" />
            <p className="mt-4 text-sm text-slate-400">
              No documents yet. Upload a packet to see progress, previews, and processing states.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            <AnimatePresence initial={false}>
              {files.map((file) => (
                <motion.div
                  key={file.id}
                  layout
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="rounded-3xl border border-white/[0.08] bg-slate-950/30 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-white/5 p-3 text-sky-300">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{file.name}</p>
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                          {file.size}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {file.status === "success" ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-emerald-300">
                          <CheckCircle2 className="h-4 w-4" />
                          Uploaded
                        </span>
                      ) : null}
                      {file.status === "uploading" ? (
                        <span className="rounded-full bg-sky-400/10 px-3 py-1 text-sky-300">
                          Processing
                        </span>
                      ) : null}
                      {file.status === "error" ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-rose-400/10 px-3 py-1 text-rose-300">
                          <AlertCircle className="h-4 w-4" />
                          Error
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {file.status !== "error" ? (
                    <div className="mt-4">
                      <div className="h-2 overflow-hidden rounded-full bg-white/5">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400"
                          animate={{ width: `${file.progress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-rose-300">{file.error}</p>
                  )}

                  {file.status === "success" && file.extractedData
                    ? renderDetails(file.extractedData)
                    : null}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
