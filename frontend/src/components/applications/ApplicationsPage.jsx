import { useMemo, useRef, useState } from "react";
import { formSchemas } from "../../data/formSchemas";
import { runApplicationAgent, fillPdf } from "../../utils/formFiller";

const applicationForms = [
  { name: "Building Plan Application", link: "https://bbmp.gov.in" },
  { name: "Electricity Connection", link: "https://bescom.karnataka.gov.in" },
  { name: "Water Connection", link: "https://bwssb.karnataka.gov.in" },
];

export default function ApplicationsPage({ uploadedFiles }) {
  const inputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const availableFiles = useMemo(
    () => uploadedFiles.filter((file) => file.status === "success"),
    [uploadedFiles]
  );

  const allFiles = selectedFiles.length > 0 ? selectedFiles : availableFiles;

  const handleFiles = (files) => {
    setSelectedFiles(Array.from(files));
    setIsReady(false);
  };

  const handleAutofill = () => {
    setIsAutofilling(true);

    window.setTimeout(() => {
      setIsAutofilling(false);
      setIsReady(true);
    }, 1200);
  };

  const handleAutoFill = async () => {
    setLoading(true);

    try {
      const userGoal = "build house";

      const extractedData = {
        name: "Krupa G",
        address: "Bangalore",
        dob: "2005-01-01",
        owner_name: "Krupa G",
        location: "Bangalore",
        plot_number: "A21",
      };

      const agentResult = runApplicationAgent(userGoal, extractedData);
      const schema = formSchemas[agentResult.formType];
      const filledUrl = await fillPdf(schema.file, schema, extractedData);

      setDownloadUrl(filledUrl);
      setIsReady(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (formName) => {
    const content = [
      `Application Form: ${formName}`,
      `Auto-fill status: ${isReady ? "Completed" : "Pending"}`,
      `Attached files: ${allFiles.length}`,
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${formName.toLowerCase().replace(/\s+/g, "-")}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-glow backdrop-blur-xl">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          Applications
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          Start application process
        </h2>
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Upload supporting files
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Add files here or reuse successfully uploaded documents.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
            >
              Select Files
            </button>

            <button
              type="button"
              onClick={handleAutofill}
              disabled={allFiles.length === 0 || isAutofilling}
              className="rounded-2xl bg-purple-500/20 px-4 py-2 text-sm text-purple-200 transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAutofilling ? "Auto-filling..." : "Simulate Auto-fill"}
            </button>

            <button
              type="button"
              onClick={handleAutoFill}
              className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200 transition hover:bg-cyan-400/15"
            >
              Auto Fill Using Agent
            </button>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(event) => handleFiles(event.target.files || [])}
        />

        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
          {allFiles.length > 0
            ? `${allFiles.length} file(s) ready for application support`
            : "No files selected yet"}
        </div>

        {loading && (
          <p className="mt-4 text-sm text-slate-300">
            Agent is filling your form...
          </p>
        )}

        {downloadUrl && (
          <a
            href={downloadUrl}
            download
            className="mt-4 inline-block text-sm text-sky-300"
          >
            Download Filled Form -&gt;
          </a>
        )}
      </div>

      <div className="grid gap-4">
        {applicationForms.map((form) => (
          <div
            key={form.name}
            className="rounded-3xl border border-white/10 bg-slate-950/30 p-5"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{form.name}</h3>
                <a
                  href={form.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm text-sky-300"
                >
                  Open website
                </a>
              </div>

              <button
                type="button"
                onClick={() => handleDownload(form.name)}
                disabled={!isReady}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition disabled:cursor-not-allowed disabled:opacity-50 hover:bg-white/10"
              >
                Download Form
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
